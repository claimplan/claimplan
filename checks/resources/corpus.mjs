import assert from 'node:assert/strict';
import { Account, Claimant, Networks, StrKey, TransactionBuilder, xdr } from '@stellar/stellar-sdk';

export const SEED = 0x434c4149;
export const MAX_BYTES = 1024 * 1024;
export const CREATION = 1800000000n;
export const END = 1n << 64n;
export const INT64 = (1n << 63n) - 1n;
const addresses = Array.from({ length: 10 }, (_, i) => StrKey.encodeEd25519PublicKey(Buffer.alloc(32, i + 10)));
const source = StrKey.encodeEd25519PublicKey(Buffer.alloc(32, 3));
const always = () => Claimant.predicateUnconditional();
const before = seconds => Claimant.predicateBeforeRelativeTime(String(seconds));
const not = Claimant.predicateNot;
const and = Claimant.predicateAnd;
const or = Claimant.predicateOr;
const word = n => { const bytes = Buffer.alloc(4); bytes.writeUInt32BE(n >>> 0); return bytes; };
const json = value => Buffer.from(JSON.stringify(value));
const encode = bytes => Buffer.from(Buffer.from(bytes).toString('base64'));
const policy = (count, recovery = false, exclusive = true) => ({ version: 1, creationTime: String(CREATION), operations: Array.from({ length: count }, (_, operation) => ({ operation, beneficiary: addresses[0], ...(recovery ? { recovery: addresses[1], handoverAfter: '60' } : {}), exclusive, continuousCoverage: true })) });
function rawClaimant(destination, predicate) {
  return xdr.Claimant.claimantTypeV0(new xdr.ClaimantV0({ destination: xdr.PublicKey.publicKeyTypeEd25519(StrKey.decodeEd25519PublicKey(destination)), predicate }));
}
function rawOperation(predicates = [always()]) {
  return new xdr.Operation({ sourceAccount: null, body: xdr.OperationBody.createClaimableBalance(new xdr.CreateClaimableBalanceOp({ asset: xdr.Asset.assetTypeNative(), amount: 10000000n, claimants: predicates.map((p, i) => rawClaimant(addresses[i], p)) })) });
}
function legacy(operations) {
  return xdr.TransactionEnvelope.envelopeTypeTxV0(new xdr.TransactionV0Envelope({ tx: new xdr.TransactionV0({ sourceAccountEd25519: Buffer.alloc(32, 3), fee: 100, seqNum: 2n, timeBounds: null, memo: xdr.Memo.memoNone(), operations, ext: xdr.TransactionV0Ext.v0() }), signatures: [] })).toXdr();
}
function build(operations, kind = 'v1') {
  if (kind === 'v0') return encode(legacy(operations));
  const builder = new TransactionBuilder(new Account(source, '1'), { fee: '100', networkPassphrase: Networks.TESTNET });
  for (const operation of operations) builder.addOperation(operation);
  const tx = builder.setTimebounds(0, 0).build();
  return Buffer.from(kind === 'feeBump' ? TransactionBuilder.buildFeeBumpTransaction(source, '100', tx, Networks.TESTNET).toXdr() : tx.toXdr());
}
function fullTree(depth = 1) {
  if (depth === 4) return Claimant.predicateBeforeAbsoluteTime(String(INT64));
  return (depth % 2 ? or : and)(fullTree(depth + 1), fullTree(depth + 1));
}

export function corpus() {
  const cases = [];
  const add = (name, envelope, p, expected, extra = {}) => cases.push({ name, envelope, policy: json(p), expected, modes: ['library', 'cli'], repeats: 1, ...extra });
  const empty = () => and(and(before(10), before(20)), and(not(before(10)), before(30)));
  const handover = () => Array.from({ length: 10 }, (_, i) => i === 0 ? before(60) : i === 1 ? not(before(60)) : empty());
  const handoverOperations = Array.from({ length: 100 }, () => rawOperation(handover()));
  for (const kind of ['v0', 'v1', 'feeBump']) add(`max-handover-${kind}`, build(handoverOperations, kind), policy(100, true), 'handover', { repeats: 2 });
  const overlapOperations = Array.from({ length: 100 }, () => rawOperation(Array.from({ length: 10 }, always)));
  const overlap = build(overlapOperations);
  add('max-overlap-warning', overlap, policy(100, false, false), 'overlap-warning', { repeats: 2 });
  add('max-overlap-error', overlap, policy(100), 'overlap-error', { repeats: 2 });
  add('max-depth-four-branching', build(Array.from({ length: 100 }, () => rawOperation(Array.from({ length: 10 }, () => fullTree())))), policy(100), 'branching', { repeats: 2 });
  const fragmented = () => or(or(before(10), not(before(50))), and(not(before(20)), before(30)));
  add('max-fragmented-windows', build(Array.from({ length: 100 }, () => rawOperation(Array.from({ length: 10 }, fragmented)))), policy(100), 'fragmented', { repeats: 2 });
  const exact = Buffer.concat([overlap, Buffer.alloc(MAX_BYTES - overlap.length, 0x20)]);
  const exactPolicy = json(policy(100, false, false));
  add('exact-one-MiB-files', exact, policy(100, false, false), 'overlap-warning', { policy: Buffer.concat([exactPolicy, Buffer.alloc(MAX_BYTES - exactPolicy.length, 0x20)]), repeats: 2 });
  add('oversized-envelope', Buffer.concat([exact, Buffer.from(' ')]), policy(100), 'reject');
  add('max-size-garbage', Buffer.alloc(MAX_BYTES, 0x41), policy(1), 'reject');
  const hugeDecimal = policy(1); hugeDecimal.creationTime = '9'.repeat(500000);
  add('huge-decimal-time', build([rawOperation()]), hugeDecimal, 'reject');
  add('deep-policy-array-16384', build([rawOperation()]), policy(1), 'reject', { policy: Buffer.from('{"version":1,"creationTime":"1800000000","operations":[' + '['.repeat(16384) + ']'.repeat(16384) + ']}') });
  add('oversized-policy-file', overlap, policy(100), 'reject', { policy: Buffer.concat([exactPolicy, Buffer.alloc(MAX_BYTES + 1 - exactPolicy.length, 0x20)]), modes: ['cli'] });
  add('malformed-policy-json', overlap, policy(100), 'reject', { policy: Buffer.from('{'), modes: ['cli'] });
  add('non-UTF8-policy', overlap, policy(100), 'reject', { policy: Buffer.from([0xff]), modes: ['cli'] });
  add('policy-operation-limit', overlap, policy(101), 'reject');
  const unknown = policy(100); unknown.unrecognized = true;
  add('unknown-policy-field', overlap, unknown, 'reject');
  const base = Buffer.from(legacy([rawOperation()]));
  // Controlled v0 layout: no timebounds, memo, source overrides or signatures.
  // These offsets are ONLY for adversarial fixture generation, never production decoding.
  assert.equal(base.length, 136);
  for (const [offset, value] of [[0, 0], [56, 1], [64, 14], [80, 1], [124, 0], [128, 0], [132, 0]]) assert.equal(base.readUInt32BE(offset), value);
  const patched = (offset, value) => { const bytes = Buffer.from(base); bytes.writeUInt32BE(value >>> 0, offset); return encode(bytes); };
  for (const [name, offset, value] of [
    ['unknown-envelope', 0, 0x7fffffff], ['operations-count-bomb', 56, 0xffffffff],
    ['claimants-count-bomb', 80, 0xffffffff], ['signatures-count-bomb', 132, 0xffffffff],
    ['zero-claimants', 80, 0], ['unknown-operation', 64, 0x7fffffff],
    ['unknown-asset', 68, 0x7fffffff], ['negative-amount', 72, 0xffffffff],
    ['unknown-claimant', 84, 0x7fffffff], ['unknown-destination', 88, 0x7fffffff],
    ['unknown-predicate', 124, 0x7fffffff], ['unknown-extension', 128, 0x7fffffff],
  ]) add(name, patched(offset, value), policy(1), 'reject');
  const predicateBytes = bytes => encode(Buffer.concat([base.subarray(0, 124), bytes, base.subarray(128)]));
  for (const depth of [5, 2048, 90000]) {
    const prefix = Buffer.alloc((depth - 1) * 8);
    for (let i = 0; i < depth - 1; i++) { prefix.writeUInt32BE(3, i * 8); prefix.writeUInt32BE(1, i * 8 + 4); }
    const input = predicateBytes(Buffer.concat([prefix, word(0)]));
    assert.ok(input.length <= MAX_BYTES);
    add(`nested-NOT-depth-${depth}`, input, policy(1), 'reject');
  }
  add('NOT-null-pointer', predicateBytes(Buffer.concat([word(3), word(0)])), policy(1), 'reject');
  add('NOT-noncanonical-bool', predicateBytes(Buffer.concat([word(3), word(2), word(0)])), policy(1), 'reject');
  add('AND-one-child', predicateBytes(Buffer.concat([word(1), word(1), word(0)])), policy(1), 'reject');
  add('AND-count-bomb', predicateBytes(Buffer.concat([word(1), word(0xffffffff)])), policy(1), 'reject');
  add('OR-count-bomb', predicateBytes(Buffer.concat([word(2), word(0xffffffff)])), policy(1), 'reject');
  const memoBomb = Buffer.from(base); memoBomb.writeUInt32BE(1, 52); memoBomb.writeUInt32BE(0xffffffff, 56);
  add('memo-text-length-bomb', encode(memoBomb), policy(1), 'reject');
  add('negative-relative-time', predicateBytes(Buffer.concat([word(5), Buffer.alloc(8, 0xff)])), policy(1), 'reject');
  const operations = Array.from({ length: 101 }, () => Buffer.from(rawOperation().toXdr()));
  add('101-operation-vector', encode(Buffer.concat([base.subarray(0, 56), word(101), ...operations, base.subarray(128)])), policy(100), 'reject');
  const eleven = Array.from({ length: 11 }, (_, i) => Buffer.from(rawClaimant(StrKey.encodeEd25519PublicKey(Buffer.alloc(32, i + 30)), always()).toXdr()));
  add('11-claimant-vector', encode(Buffer.concat([base.subarray(0, 80), word(11), ...eleven, base.subarray(128)])), policy(1), 'reject');
  // Construct the duplicate without trusting builder validation of distinct destinations.
  const duplicate = Buffer.from(rawClaimant(addresses[0], always()).toXdr());
  add('duplicate-claimants', encode(Buffer.concat([base.subarray(0, 80), word(2), duplicate, duplicate, base.subarray(128)])), policy(1), 'reject');
  add('truncated-header', encode(base.subarray(0, 12)), policy(1), 'reject');
  add('truncated-predicate', encode(base.subarray(0, 126)), policy(1), 'reject');
  add('trailing-XDR-data', encode(Buffer.concat([base, word(0)])), policy(1), 'reject');
  const canonical = base.toString('base64');
  assert.ok(canonical.endsWith('=='));
  const noncanonical = canonical.slice(0, -3) + 'B==';
  assert.ok(Buffer.from(noncanonical, 'base64').equals(base));
  add('noncanonical-base64-pad-bits', Buffer.from(noncanonical), policy(1), 'reject');
  add('internal-base64-whitespace', Buffer.from(canonical.slice(0, 8) + '\n' + canonical.slice(8)), policy(1), 'reject');
  // Seeded invalid union tags; all chosen fields have known finite discriminants.
  let seed = SEED;
  for (let i = 0; i < 8; i++) {
    seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
    const offsets = [0, 52, 64, 68, 84, 88, 124, 128];
    add(`seeded-invalid-union-${i}`, patched(offsets[i], (seed | 0x80000000) >>> 0), policy(1), 'reject');
  }
  return cases;
}
