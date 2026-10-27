import { INT64_MAX, TIME_END, type Interval, type Predicate } from './types.js';

export function union(intervals: readonly Interval[]): Interval[] {
  const sorted = intervals.filter(i => i.start < i.end)
    .map(i => ({ ...i })).sort((a, b) => a.start < b.start ? -1 : a.start > b.start ? 1 : 0);
  const result: Interval[] = [];
  for (const interval of sorted) {
    const last = result.at(-1);
    if (last && interval.start <= last.end) {
      if (interval.end > last.end) last.end = interval.end;
    } else result.push(interval);
  }
  return result;
}

export function intersect(a: readonly Interval[], b: readonly Interval[]): Interval[] {
  const result: Interval[] = [];
  for (const x of a) for (const y of b) {
    const start = x.start > y.start ? x.start : y.start;
    const end = x.end < y.end ? x.end : y.end;
    if (start < end) result.push({ start, end });
  }
  return union(result);
}

export function complement(intervals: readonly Interval[], domain: Interval): Interval[] {
  const result: Interval[] = [];
  let cursor = domain.start;
  for (const interval of intersect(union(intervals), [domain])) {
    if (cursor < interval.start) result.push({ start: cursor, end: interval.start });
    cursor = interval.end;
  }
  if (cursor < domain.end) result.push({ start: cursor, end: domain.end });
  return result;
}

/** Input predicates are validated by analyzePlan/decodeEnvelope before reaching this module. */
export function predicateIntervals(predicate: Predicate, creationTime: bigint): Interval[] {
  const domain = { start: 0n, end: TIME_END };
  switch (predicate.type) {
    case 'unconditional': return [domain];
    case 'beforeAbsolute': return predicate.seconds === 0n ? [] : [{ start: 0n, end: predicate.seconds }];
    case 'beforeRelative': {
      const sum = creationTime + predicate.seconds;
      const end = sum > INT64_MAX ? INT64_MAX : sum;
      return end === 0n ? [] : [{ start: 0n, end }];
    }
    case 'not': return complement(predicateIntervals(predicate.child, creationTime), domain);
    case 'and': return intersect(predicateIntervals(predicate.left, creationTime), predicateIntervals(predicate.right, creationTime));
    case 'or': return union([...predicateIntervals(predicate.left, creationTime), ...predicateIntervals(predicate.right, creationTime)]);
  }
}
