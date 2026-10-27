import { test } from 'node:test';
import assert from 'node:assert/strict';
import { predicateIntervals, intersect, union, complement } from '../dist/intervals.js';
import { INT64_MAX, TIME_END } from '../dist/types.js';

const before = seconds => ({ type: 'beforeAbsolute', seconds });
const not = child => ({ type: 'not', child });
const has = (intervals, time) => intervals.some(i => i.start <= time && time < i.end);

// Independent direct Boolean evaluator: does not call interval algebra.
function truth(p, time, created) {
  switch (p.type) {
    case 'unconditional': return true;
    case 'beforeAbsolute': return time < p.seconds;
    case 'beforeRelative': return time < (created + p.seconds > INT64_MAX ? INT64_MAX : created + p.seconds);
    case 'not': return !truth(p.child, time, created);
    case 'and': return truth(p.left, time, created) && truth(p.right, time, created);
    case 'or': return truth(p.left, time, created) || truth(p.right, time, created);
    default: throw new Error('bad generator');
  }
}

test('half-open boundaries, contradiction, union and complement', () => {
  const a = predicateIntervals(before(10n), 0n);
  const b = predicateIntervals(not(before(10n)), 0n);
  assert.equal(has(a, 9n), true);
  assert.equal(has(a, 10n), false);
  assert.equal(has(b, 10n), true);
  assert.deepEqual(intersect(a, b), []);
  assert.deepEqual(union([...a, ...b]), [{ start: 0n, end: TIME_END }]);
  assert.deepEqual(complement([{ start: 5n, end: 7n }], { start: 3n, end: 10n }), [{ start: 3n, end: 5n }, { start: 7n, end: 10n }]);
});

test('nested disjoint windows survive Boolean operations', () => {
  const predicate = { type: 'and', left: { type: 'or', left: before(3n), right: not(before(8n)) }, right: not(before(1n)) };
  assert.deepEqual(predicateIntervals(predicate, 0n), [{ start: 1n, end: 3n }, { start: 8n, end: TIME_END }]);
});

test('exact integer arithmetic above Number.MAX_SAFE_INTEGER and relative saturation', () => {
  const large = 9007199254740993n;
  assert.deepEqual(predicateIntervals(before(large), 0n), [{ start: 0n, end: large }]);
  assert.deepEqual(predicateIntervals({ type: 'beforeRelative', seconds: 20n }, INT64_MAX - 10n), [{ start: 0n, end: INT64_MAX }]);
  assert.deepEqual(predicateIntervals({ type: 'beforeRelative', seconds: 0n }, 0n), []);
});

test('1,000 seeded predicate trees agree with independent evaluator at all small times and large boundaries', () => {
  let state = 7357;
  const next = n => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state % n; };
  const constants = [0n, 1n, 3n, 7n, 15n, 9007199254740993n, INT64_MAX];
  function tree(depth) {
    const kind = next(depth ? 6 : 3);
    if (kind === 0) return { type: 'unconditional' };
    if (kind === 1 || kind === 2) return { type: kind === 1 ? 'beforeAbsolute' : 'beforeRelative', seconds: constants[next(constants.length)] };
    if (kind === 3) return not(tree(depth - 1));
    return { type: kind === 4 ? 'and' : 'or', left: tree(depth - 1), right: tree(depth - 1) };
  }
  for (let i = 0; i < 1000; i++) {
    const p = tree(3), created = [0n, 5n, INT64_MAX - 2n][next(3)];
    const result = predicateIntervals(p, created);
    const times = [...Array.from({ length: 32 }, (_, n) => BigInt(n)), ...constants.flatMap(n => [n > 0n ? n - 1n : 0n, n, n + 1n]), TIME_END - 1n];
    for (const time of times) assert.equal(has(result, time), truth(p, time, created), `case ${i} at ${time}`);
  }
});
