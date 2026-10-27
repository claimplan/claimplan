import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { Asset, Keypair, Operation } from '@stellar/stellar-sdk';
import { analyzeEnvelope } from '../dist/index.js';
import { startNetwork, config } from './network.mjs';
import { connectLocal, buildTransaction, submitAt } from './client.mjs';
import { boundaryCases } from './cases.mjs';
import { executionControls } from './controls.mjs';

const network = await startNetwork();
try {
  console.log('Local Core started; waiting for RPC ingestion');
  const client = await connectLocal(network);
  const beneficiary = Keypair.random();
  const recovery = Keypair.random();
  let time = Number((await client.server.getLatestLedger()).closeTime) + 10;
  const fund = await buildTransaction(client, client.root, [beneficiary, recovery].map(key =>
    Operation.createAccount({ destination: key.publicKey(), startingBalance: '1000' })));
  assert.equal((await submitAt(network, client, fund, client.root, time)).status, 'SUCCESS');
  const evidence = { image: config.image, imageId: network.imageId,
    coreBuild: client.info.info.build, protocol: config.protocolVersion,
    network: config.networkPassphrase, sdk: '17.4.0', cases: [] };
  for (let index = 0; index < 10; index++) {
    for (let boundary = 0; boundary < 3; boundary++) {
      const creation = time + 10;
      const fixture = boundaryCases(creation, beneficiary.publicKey(), recovery.publicKey())[index];
      const signer = fixture.claimant === 1 ? recovery : beneficiary;
      const closeTime = creation + [59, 60, 61][boundary];
      const create = await buildTransaction(client, client.root, [Operation.createClaimableBalance({
        asset: Asset.native(), amount: '1', claimants: fixture.claimants,
      })]);
      const policy = { version: 1, creationTime: String(creation), operations: [{ operation: 0,
        beneficiary: beneficiary.publicKey(), exclusive: false, continuousCoverage: false }] };
      const report = analyzeEnvelope(create.toXdr(), policy);
      const intervals = report.operations[0].claimants[fixture.claimant ?? 0].intervals;
      const predicted = intervals.some(interval => BigInt(interval.start) <= BigInt(closeTime) &&
        BigInt(closeTime) < BigInt(interval.end));
      assert.equal(predicted, fixture.truth[boundary], `${fixture.name}: independent expectation differs`);
      const created = await submitAt(network, client, create, client.root, creation);
      assert.equal(created.status, 'SUCCESS', `${fixture.name}: create failed`);
      const balanceId = create.getClaimableBalanceId(0);
      const claim = await buildTransaction(client, signer, [Operation.claimClaimableBalance({ balanceId })]);
      const actual = await submitAt(network, client, claim, signer, closeTime);
      const expected = predicted ? 'claimClaimableBalanceSuccess' : 'claimClaimableBalanceCannotClaim';
      assert.deepEqual(actual.operations, [expected], `${fixture.name} at offset ${closeTime - creation}`);
      assert.equal(actual.status, predicted ? 'SUCCESS' : 'FAILED');
      evidence.cases.push({ name: fixture.name, offset: closeTime - creation,
        creation, balanceId, predicted, intervals, expected, actual });
      console.log(`${fixture.name} +${closeTime - creation}s: ${actual.operations[0]}`);
      time = closeTime;
    }
  }
  const controls = await executionControls(network, client, time, beneficiary);
  evidence.controls = controls.rows;
  await writeFile(new URL('./core-results.json', import.meta.url), `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(`PASS: ${evidence.cases.length} local Core boundary comparisons; evidence integration/core-results.json`);
} finally {
  await network.stop();
}
