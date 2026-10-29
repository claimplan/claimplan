import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Asset, Claimant, Networks, Operation, TransactionBuilder, xdr } from '@stellar/stellar-sdk';
import { analyzeEnvelope, InputError } from '../dist/index.js';
import { TIME_END, INT64_MAX } from '../dist/types.js';
import { A, B, C, CREATED, always, before, relative, not, claim, create, handover, policy, giftPolicy, envelope, transaction, legacyEnvelope, encode, rawCreate } from './helpers.mjs';

const run = (claimants, p = policy()) => analyzeEnvelope(envelope([create(claimants)]), p);
const codes = report => report.findings.map(f => f.code);

test('exact beneficiary-to-recovery handover passes without gaps or overlaps', () => {
  const r = run(handover());
  assert.equal(r.status, 'pass');
  assert.deepEqual(r.findings, []);
  assert.deepEqual(r.operations[0].claimants[0].intervals, [{ start: String(CREATED), end: String(CREATED + 60n) }]);
  assert.deepEqual(r.operations[0].claimants[1].intervals, [{ start: String(CREATED + 60n), end: String(TIME_END) }]);
  assert.equal(r.operations[0].asset, 'native');
});

test('expired/contradictory claimants fail and locate the unreachable claimant', () => {
  const contradiction = Claimant.predicateAnd(before(CREATED + 60n), not(before(CREATED + 60n)));
  const r = run([claim(A, contradiction), claim(B, before(CREATED))]);
  assert.equal(r.status, 'fail');
  assert.ok(codes(r).includes('NO_ELIGIBLE_CLAIMANT'));
  assert.deepEqual(r.findings.find(f => f.code === 'UNREACHABLE_CLAIMANT').claimants, [0]);
});

test('gap is reported precisely, not misrepresented as permanent loss', () => {
  const r = run([claim(A, relative(60)), claim(B, not(relative(90)))]);
  const gap = r.findings.find(f => f.code === 'UNCOVERED_INTERVAL');
  assert.deepEqual(gap.intervals, [{ start: String(CREATED + 60n), end: String(CREATED + 90n) }]);
  assert.ok(!codes(r).includes('NO_ELIGIBLE_CLAIMANT'));
});

test('unexpected third claimant participates in whole-plan overlap checks', () => {
  const r = run([...handover(), claim(C, always())]);
  assert.equal(r.status, 'fail');
  assert.ok(r.findings.some(f => f.code === 'CLAIMANT_OVERLAP' && f.claimants.includes(2)));
});

test('intentional overlap can warn while required roles still pass', () => {
  const r = run([claim(A, always()), claim(B, not(relative(60)))], policy({ exclusive: false }));
  assert.equal(r.status, 'pass');
  assert.equal(r.findings.find(f => f.code === 'CLAIMANT_OVERLAP').severity, 'warning');
});

test('unconditional gift needs no recovery role', () => {
  assert.equal(run([claim(A, always())], giftPolicy()).status, 'pass');
});

test('missing beneficiary or recovery cannot be silently ignored', () => {
  const r = run([claim(A, always())]);
  assert.equal(r.status, 'fail');
  assert.ok(codes(r).includes('MISSING_ROLE_CLAIMANT'));
  const missingBeneficiary = giftPolicy(); missingBeneficiary.operations[0].beneficiary = C;
  assert.ok(codes(run([claim(A, always())], missingBeneficiary)).includes('MISSING_ROLE_CLAIMANT'));
});

test('missing creationTime is inconclusive even for absolute predicates', () => {
  const p = giftPolicy(); delete p.creationTime;
  const r = run([claim(A, before(CREATED + 10n))], p);
  assert.equal(r.status, 'inconclusive');
  assert.deepEqual(codes(r), ['CREATION_TIME_REQUIRED']);
});

test('issuer-controlled assets are explicitly scoped', () => {
  const r = analyzeEnvelope(envelope([create(handover(), new Asset('USD', C))]), policy());
  assert.equal(r.status, 'pass');
  assert.ok(codes(r).includes('ISSUER_CONTROLS_UNCHECKED'));
  assert.equal(r.operations[0].asset, `USD:${C}`);
});

test('issued-asset walkthrough fixture shows a pass with issuer warning and exact asset metadata', () => {
  const fixture = readFileSync(new URL('../examples/issued-asset.xdr', import.meta.url), 'utf8');
  const policyInput = JSON.parse(readFileSync(new URL('../examples/issued-asset-policy.json', import.meta.url), 'utf8'));
  const report = analyzeEnvelope(fixture, policyInput);
  assert.equal(report.status, 'pass');
  assert.ok(codes(report).includes('ISSUER_CONTROLS_UNCHECKED'));
  assert.equal(report.operations[0].asset, 'USD:GAEQSCIJBEEQSCIJBEEQSCIJBEEQSCIJBEEQSCIJBEEQSCIJBEEQSH7S');
  assert.equal(report.operations[0].amountStroops, '2500000000000000');
});

test('multiple creates use original operation indices and exact policy coverage', () => {
  const tx = envelope([Operation.payment({ destination: A, asset: Asset.native(), amount: '1' }), create(handover()), create(handover())]);
  const p = policy(); p.operations = [1, 2].map(operation => ({ ...p.operations[0], operation }));
  const r = analyzeEnvelope(tx, p);
  assert.deepEqual(r.ignoredOperations, [0]);
  assert.deepEqual(r.operations.map(o => o.operation), [1, 2]);
  assert.equal(r.scope, 'partial-transaction');
  assert.ok(codes(r).includes('PARTIAL_TRANSACTION'));
  assert.throws(() => analyzeEnvelope(tx, policy()), /cover every/);
});

test('legacy v0 and fee-bump envelope parsing preserves results', () => {
  const legacy = analyzeEnvelope(encode(legacyEnvelope()), policy());
  const bumped = TransactionBuilder.buildFeeBumpTransaction(C, '100', transaction(), Networks.TESTNET);
  const fee = analyzeEnvelope(bumped.toXdr(), policy());
  assert.equal(legacy.status, 'pass'); assert.equal(legacy.envelope, 'v0');
  assert.equal(fee.status, 'pass'); assert.equal(fee.envelope, 'feeBump');
});

test('assumed creation time must fit transaction time bounds, including max boundary', () => {
  const tx = transaction();
  const env = xdr.TransactionEnvelope.fromXdr(tx.toXdr(), 'base64');
  const wire = env.toXdrObject();
  wire.v1.tx.cond = { type: 1, timeBounds: { minTime: CREATED, maxTime: CREATED + 10n } };
  const encoded = encode(xdr.TransactionEnvelope.fromXdrObject(wire));
  assert.equal(analyzeEnvelope(encoded, policy()).status, 'pass');
  const p = policy(); p.creationTime = String(CREATED + 10n);
  assert.equal(analyzeEnvelope(encoded, p).status, 'pass');
  p.creationTime = String(CREATED + 11n);
  assert.equal(analyzeEnvelope(encoded, p).status, 'inconclusive');
});

test('v2 precondition time bounds are read without assuming other preconditions pass', () => {
  const wire = xdr.TransactionEnvelope.fromXdr(envelope(), 'base64').toXdrObject();
  wire.v1.tx.cond = { type: 2, v2: { timeBounds: { minTime: CREATED, maxTime: CREATED + 100n }, ledgerBounds: null, minSeqNum: null, minSeqAge: 0n, minSeqLedgerGap: 0, extraSigners: [] } };
  const tx = encode(xdr.TransactionEnvelope.fromXdrObject(wire));
  assert.equal(analyzeEnvelope(tx, policy()).status, 'pass');
  const p = policy(); p.creationTime = String(CREATED - 1n);
  assert.equal(analyzeEnvelope(tx, p).status, 'inconclusive');
});

test('noncanonical credit-asset arm cannot be normalized into an apparent pass', () => {
  const asset = xdr.Asset.assetTypeCreditAlphanum12(new xdr.AlphaNum12({
    assetCode: 'USD', issuer: xdr.PublicKey.publicKeyTypeEd25519(Buffer.alloc(32, 3)),
  }));
  assert.throws(() => analyzeEnvelope(encode(legacyEnvelope([rawCreate({ asset })])), giftPolicy()), InputError);
});

test('huge exact timestamps and relative saturation are represented without rounding', () => {
  const p = policy(); p.creationTime = String(INT64_MAX - 30n); p.operations[0].handoverAfter = '30';
  const r = run([claim(A, relative(60)), claim(B, not(relative(60)))], p);
  assert.equal(r.status, 'pass');
  assert.equal(r.operations[0].claimants[0].intervals[0].end, String(INT64_MAX));
});

test('malformed base64/XDR and transactions with no create never pass', () => {
  const good = envelope();
  for (const bad of ['', 'secret-token', 'AAAA', `${good}!`, good.slice(0, -4), 'A'.repeat(1024 * 1024 + 4)]) {
    assert.throws(() => analyzeEnvelope(bad, policy()), InputError);
  }
  const withTrailing = Buffer.concat([Buffer.from(good, 'base64'), Buffer.alloc(4)]).toString('base64');
  assert.throws(() => analyzeEnvelope(withTrailing, policy()), InputError);
  const noCreate = envelope([Operation.payment({ destination: A, asset: Asset.native(), amount: '1' })]);
  assert.throws(() => analyzeEnvelope(noCreate, policy()), /no CreateClaimableBalance/);
});

test('raw malformed predicate structure fails closed', () => {
  const malformed = [
    xdr.ClaimPredicate.claimPredicateBeforeAbsoluteTime(-1n),
    xdr.ClaimPredicate.claimPredicateBeforeRelativeTime(-1n),
    xdr.ClaimPredicate.claimPredicateNot(null),
    xdr.ClaimPredicate.claimPredicateAnd([always()]),
    not(not(not(not(always())))),
  ];
  for (const p of malformed) {
    assert.throws(() => analyzeEnvelope(encode(legacyEnvelope([rawCreate({ predicates: [p] })])), giftPolicy()), InputError);
  }
});

test('raw invalid create amount, empty claimants and duplicates are rejected', () => {
  for (const op of [rawCreate({ amount: 0n }), rawCreate({ amount: -1n }), rawCreate({ predicates: [], destinations: [] }), rawCreate({ predicates: [always(), always()], destinations: [A, A] })]) {
    assert.throws(() => analyzeEnvelope(encode(legacyEnvelope([op])), giftPolicy()), InputError);
  }
});

test('report is deterministic and does not read the wall clock', () => {
  const tx = envelope();
  const original = Date.now;
  Date.now = () => { throw new Error('clock accessed'); };
  try { assert.equal(JSON.stringify(analyzeEnvelope(tx, policy())), JSON.stringify(analyzeEnvelope(tx, policy()))); }
  finally { Date.now = original; }
});
