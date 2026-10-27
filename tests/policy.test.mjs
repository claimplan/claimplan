import { test } from 'node:test';
import assert from 'node:assert/strict';
import { StrKey } from '@stellar/stellar-sdk';
import { parsePolicy } from '../dist/policy.js';

const beneficiary = StrKey.encodeEd25519PublicKey(Buffer.alloc(32, 1));
const recovery = StrKey.encodeEd25519PublicKey(Buffer.alloc(32, 2));
const valid = () => ({ version: 1, creationTime: '1800000000', operations: [{ operation: 0, beneficiary, recovery, handoverAfter: '60', exclusive: true, continuousCoverage: true }] });

test('parses canonical policy and exact time values', () => {
  assert.equal(parsePolicy(valid()).creationTime, 1800000000n);
  const p = valid(); p.creationTime = '9007199254740993';
  assert.equal(parsePolicy(p).creationTime, 9007199254740993n);
});

test('rejects unknown/missing fields, invalid ranges, roles and duplicate indices', () => {
  const mutations = [
    p => { p.typo = true; }, p => { p.operations[0].typo = true; },
    p => { p.creationTime = 1800000000; }, p => { p.creationTime = '-1'; },
    p => { p.creationTime = '01'; }, p => { p.creationTime = '18446744073709551616'; },
    p => { p.operations[0].operation = 0.5; }, p => { p.operations[0].operation = 100; },
    p => { p.operations[0].beneficiary = 'wrong'; }, p => { p.operations[0].recovery = beneficiary; },
    p => { p.operations[0].handoverAfter = '0'; }, p => { delete p.operations[0].handoverAfter; },
    p => { p.creationTime = '18446744073709551615'; },
    p => { delete p.operations[0].exclusive; }, p => { p.operations.push({ ...p.operations[0] }); },
    p => { p.operations = []; }, p => { p.version = 2; },
  ];
  for (const mutate of mutations) { const p = valid(); mutate(p); assert.throws(() => parsePolicy(p)); }
  for (const input of [null, [], '', 1]) assert.throws(() => parsePolicy(input));
});
