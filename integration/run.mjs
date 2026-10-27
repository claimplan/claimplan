import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { Asset, Keypair, Operation } from '@stellar/stellar-sdk';
import { analyzeEnvelope } from '../dist/index.js';
import { startNetwork, config } from './network.mjs';
import { connectLocal, buildTransaction, submitAt, queueTransaction, closeAt, transactionResult } from './client.mjs';
import { boundaryCases } from './cases.mjs';
import { executionControls } from './controls.mjs';

const network = await startNetwork();
try {
  console.log('Local Core started; waiting for RPC ingestion');
  const client = await connectLocal(network);
  const probes = Array.from({ length: 30 }, (_, i) => ({
    index: Math.floor(i / 3), boundary: i % 3, beneficiary: Keypair.random(), recovery: Keypair.random(),
  }));
  let time = Math.max(Number((await client.server.getLatestLedger()).closeTime) + 10, Math.ceil(Date.now() / 1000) + 10);
  const fund = await buildTransaction(client, client.root, probes.flatMap(probe =>
    [probe.beneficiary, probe.recovery].map(key => Operation.createAccount({
      destination: key.publicKey(), startingBalance: '1000',
    }))));
  assert.equal((await submitAt(network, client, fund, client.root, time)).status, 'SUCCESS');
  console.log('Synthetic probe accounts funded on local Core');
  const creation = Math.max(time + 10, Math.ceil(Date.now() / 1000) + 10);
  for (const probe of probes) probe.fixture = boundaryCases(creation,
    probe.beneficiary.publicKey(), probe.recovery.publicKey())[probe.index];
  const create = await buildTransaction(client, client.root, probes.map(probe =>
    Operation.createClaimableBalance({ asset: Asset.native(), amount: '1', claimants: probe.fixture.claimants })));
  const policy = { version: 1, creationTime: String(creation), operations: probes.map((probe, operation) => ({
    operation, beneficiary: probe.beneficiary.publicKey(), exclusive: false, continuousCoverage: false,
  })) };
  const creationEnvelope = create.toXdr();
  const report = analyzeEnvelope(creationEnvelope, policy);
  assert.equal((await submitAt(network, client, create, client.root, creation)).status, 'SUCCESS');
  console.log(`Thirty balances created at ${creation}; waiting for deadline ledgers`);
  const evidence = { image: config.image, imageId: network.imageId,
    coreBuild: client.info.info.build, protocol: config.protocolVersion,
    network: config.networkPassphrase, sdk: '17.4.0', creationEnvelope, policy, cases: [] };
  const completed = [];
  for (let boundary = 0; boundary < 3; boundary++) {
    const closeTime = creation + [59, 60, 61][boundary];
    const batch = probes.map((probe, operation) => ({ ...probe, operation })).filter(probe => probe.boundary === boundary);
    for (const probe of batch) {
      const signer = probe.fixture.claimant === 1 ? probe.recovery : probe.beneficiary;
      probe.balanceId = create.getClaimableBalanceId(probe.operation);
      const claim = await buildTransaction(client, signer, [Operation.claimClaimableBalance({ balanceId: probe.balanceId })]);
      probe.hash = await queueTransaction(network, client, claim, signer);
    }
    await closeAt(network, closeTime);
    completed.push({ batch, closeTime, boundary });
    time = closeTime;
  }
  for (const { batch, closeTime, boundary } of completed) {
    for (const probe of batch) {
      const intervals = report.operations[probe.operation].claimants[probe.fixture.claimant ?? 0].intervals;
      const predicted = intervals.some(interval => BigInt(interval.start) <= BigInt(closeTime) && BigInt(closeTime) < BigInt(interval.end));
      assert.equal(predicted, probe.fixture.truth[boundary], `${probe.fixture.name}: independent expectation differs`);
      const actual = await transactionResult(client, probe.hash, closeTime);
      const expected = predicted ? 'claimClaimableBalanceSuccess' : 'claimClaimableBalanceCannotClaim';
      assert.deepEqual(actual.operations, [expected], `${probe.fixture.name} +${closeTime - creation}`);
      assert.equal(actual.status, predicted ? 'SUCCESS' : 'FAILED');
      evidence.cases.push({ name: probe.fixture.name, operation: probe.operation, offset: closeTime - creation,
        creation, balanceId: probe.balanceId, predicted, intervals, expected, actual });
      console.log(`${probe.fixture.name} +${closeTime - creation}s: ${actual.operations[0]}`);
    }
  }
  const controls = await executionControls(network, client, time, probes[0].beneficiary);
  evidence.controls = controls.rows;
  for (const control of controls.rows) console.log(`${control.name}: ${control.actual.operations[0]}`);
  await writeFile(new URL('./core-results.json', import.meta.url), `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(`PASS: ${evidence.cases.length} local Core boundary comparisons; evidence integration/core-results.json`);
} finally {
  await network.stop();
}
