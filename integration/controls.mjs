import assert from 'node:assert/strict';
import { Asset, AuthRequiredFlag, Claimant, Keypair, Operation } from '@stellar/stellar-sdk';
import { analyzeEnvelope } from '../dist/index.js';
import { buildTransaction, submitAt } from './client.mjs';

export async function executionControls(network, client, initialTime, recipient) {
  let time = initialTime;
  const rows = [];
  const nextTime = () => Math.max(time + 3, Math.ceil(Date.now() / 1000) + 3);
  const send = async (signer, operations) => {
    time = nextTime();
    return submitAt(network, client, await buildTransaction(client, signer, operations), signer, time);
  };
  const setup = async (signer, operations) => {
    const result = await send(signer, operations);
    assert.equal(result.status, 'SUCCESS', `Control setup failed: ${JSON.stringify(result)}`);
  };
  const issuer = Keypair.random();
  const poor = Keypair.random();
  const reserve = Keypair.random();
  await setup(client.root, [
    Operation.createAccount({ destination: issuer.publicKey(), startingBalance: '1000' }),
    ...[poor, reserve].map(key => Operation.createAccount({ destination: key.publicKey(), startingBalance: '1.50001' })),
  ]);
  const create = (asset, amount) => Operation.createClaimableBalance({ asset, amount,
    claimants: [new Claimant(recipient.publicKey(), Claimant.predicateUnconditional())] });
  const claimControl = async (name, asset, expected) => {
    time = nextTime();
    const transaction = await buildTransaction(client, issuer, [create(asset, '2')]);
    const report = analyzeEnvelope(transaction.toXdr(), { version: 1, creationTime: String(time),
      operations: [{ operation: 0, beneficiary: recipient.publicKey(), exclusive: true, continuousCoverage: true }] });
    assert.equal(report.status, 'pass');
    const creation = await submitAt(network, client, transaction, issuer, time);
    assert.equal(creation.status, 'SUCCESS');
    const actual = await send(recipient, [Operation.claimClaimableBalance({ balanceId: transaction.getClaimableBalanceId(0) })]);
    assert.deepEqual(actual.operations, [expected]);
    assert.equal(actual.status, 'FAILED');
    rows.push({ name, predictedPredicateEligible: true, expected, actual });
  };
  const credit = new Asset('CTRL', issuer.publicKey());
  await claimControl('missing-trustline', credit, 'claimClaimableBalanceNoTrust');
  await setup(recipient, [Operation.changeTrust({ asset: credit, limit: '1' })]);
  await claimControl('trustline-capacity', credit, 'claimClaimableBalanceLineFull');
  await setup(issuer, [Operation.setOptions({ setFlags: AuthRequiredFlag })]);
  const restricted = new Asset('AUTH', issuer.publicKey());
  await setup(recipient, [Operation.changeTrust({ asset: restricted, limit: '10' })]);
  await claimControl('issuer-authorization', restricted, 'claimClaimableBalanceNotAuthorized');
  for (const [name, source, amount, expected] of [
    ['source-underfunded', poor, '2', 'createClaimableBalanceUnderfunded'],
    ['source-low-reserve', reserve, '0.5', 'createClaimableBalanceLowReserve'],
  ]) {
    const actual = await send(source, [create(Asset.native(), amount)]);
    assert.deepEqual(actual.operations, [expected]);
    assert.equal(actual.status, 'FAILED');
    rows.push({ name, expected, actual });
  }
  return { rows, time };
}
