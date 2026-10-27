import { Keypair, TransactionBuilder, rpc } from '@stellar/stellar-sdk';
import { config, coreRequest, pause } from './network.mjs';
import { assertStandalone, localEndpoint } from './safety.mjs';

export async function connectLocal(network) {
  localEndpoint(network.core.href);
  const server = new rpc.Server(localEndpoint(network.rpc.href).href, {
    allowHttp: true, timeout: config.requestTimeoutMs,
  });
  server.httpClient.defaults.maxRedirects = 0;
  const deadline = Date.now() + config.startupTimeoutMs;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const identity = await server.getNetwork();
      const info = await coreRequest(network.core, 'info');
      assertStandalone(info, identity, config);
      const ledger = await server.getLatestLedger();
      if (ledger.sequence < info.info.ledger.num) throw new Error('RPC catching up');
      // Derive only the well-known standalone genesis key, after identity checks.
      return { server, root: Keypair.master(config.networkPassphrase), identity, info };
    } catch (error) { lastError = error; }
    await pause(500);
  }
  throw new Error(`Local RPC startup timed out: ${lastError?.message}`);
}

export async function buildTransaction(client, signer, operations) {
  const account = await client.server.getAccount(signer.publicKey());
  let builder = new TransactionBuilder(account, { fee: '100', networkPassphrase: config.networkPassphrase });
  for (const operation of operations) builder = builder.addOperation(operation);
  return builder.setTimebounds(0, 0).build();
}

export function operationResults(result) {
  const outcome = result.resultXdr?.result;
  if (!outcome) throw new Error('Core result has no transaction-result XDR');
  return { transaction: outcome.type, operations: (outcome.results ?? []).map(op => {
    if (op.type !== 'opInner') return op.type;
    const inner = op.tr;
    const arm = Object.keys(inner).find(key => key !== 'type');
    return inner[arm]?.type ?? inner.type;
  }) };
}

export async function submitAt(network, client, transaction, signer, closeTime) {
  // Recheck both identities immediately before signing every synthetic transaction.
  assertStandalone(await coreRequest(network.core, 'info'), await client.server.getNetwork(), config);
  transaction.sign(signer);
  const sent = await client.server.sendTransaction(transaction);
  if (sent.status !== 'PENDING') {
    throw new Error(`Core admission failed: ${sent.status} ${sent.errorResult?.result?.type ?? ''}`);
  }
  const closed = await coreRequest(network.core, `manualclose?closeTime=${closeTime}`);
  if (typeof closed !== 'string' || !closed.includes('Manually closed')) {
    throw new Error(`Unexpected manual-close result: ${JSON.stringify(closed)}`);
  }
  const hash = Buffer.from(transaction.hash()).toString('hex');
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    const result = await client.server.getTransaction(hash);
    if (result.status !== 'NOT_FOUND') {
      if (result.createdAt !== closeTime) throw new Error('Actual ledger time differs from requested boundary');
      return { hash, ledger: result.ledger, closeTime: result.createdAt, status: result.status,
        ...operationResults(result) };
    }
    await pause(200);
  }
  throw new Error(`RPC did not ingest synthetic transaction ${hash}`);
}
