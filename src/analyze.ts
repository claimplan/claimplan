import { decodeEnvelope } from './decode.js';
import { complement, intersect, predicateIntervals, union } from './intervals.js';
import { parsePolicy } from './policy.js';
import { InputError, TIME_END, type Finding, type Interval, type JsonInterval, type Report } from './types.js';

const limitations = [
  'Predicate eligibility only, conditional on the balance remaining unclaimed.',
  'Creation time is a supplied assumption, not an observed ledger close.',
  'No signature, account, key, trustline, authorization, funding, reserve or issuer-control verification.',
  'Nonempty time intervals do not guarantee an actual ledger close or a successful claim.',
  'Other operation effects and transaction/network acceptance are not verified.',
];

function jsonIntervals(intervals: readonly Interval[]): JsonInterval[] {
  return intervals.map(i => ({ start: i.start.toString(), end: i.end.toString() }));
}

/** Untrusted file contents in; deterministic, offline report out. */
export function analyzeEnvelope(envelope: string, policyInput: unknown): Report {
  const policy = parsePolicy(policyInput);
  const plan = decodeEnvelope(envelope);
  const actualIndices = new Set(plan.balances.map(b => b.operation));
  if (policy.operations.length !== plan.balances.length || policy.operations.some(p => !actualIndices.has(p.operation))) {
    throw new InputError('policy must cover every CreateClaimableBalance operation exactly, using zero-based indices');
  }
  const report: Report = {
    rulesVersion: '1', status: 'pass', scope: plan.ignoredOperations.length ? 'partial-transaction' : 'claim-predicates-only',
    creationTime: policy.creationTime?.toString() ?? null, timeDomainEndExclusive: TIME_END.toString(),
    envelope: plan.envelope, operations: [], findings: [], ignoredOperations: plan.ignoredOperations, limitations: [...limitations],
  };
  function add(code: string, severity: Finding['severity'], operation: number | null, claimants: number[], message: string, intervals: readonly Interval[] = []): void {
    report.findings.push({ code, severity, operation, claimants, message, intervals: jsonIntervals(intervals) });
  }
  if (plan.ignoredOperations.length) {
    add('PARTIAL_TRANSACTION', 'warning', null, [], 'Other operations were not analyzed; their effects may change the claimable balances or invalidate the transaction.');
  }
  const creation = policy.creationTime;
  if (creation === undefined) {
    add('CREATION_TIME_REQUIRED', 'inconclusive', null, [], 'Supply creationTime as an explicit assumed creation-ledger Unix timestamp. No local-clock assumption was made.');
    report.status = 'inconclusive';
    return report;
  }
  if (plan.timeBounds && (creation < plan.timeBounds.minTime || (plan.timeBounds.maxTime !== 0n && creation > plan.timeBounds.maxTime))) {
    add('CREATION_OUTSIDE_TIME_BOUNDS', 'inconclusive', null, [], 'Assumed creationTime is outside the transaction time bounds.');
    report.status = 'inconclusive';
    return report;
  }
  const domain = { start: creation, end: TIME_END };
  for (const balance of plan.balances) {
    const opPolicy = policy.operations.find(p => p.operation === balance.operation);
    if (!opPolicy) throw new InputError('missing operation policy');
    const windows = balance.claimants.map(c => intersect(predicateIntervals(c.predicate, creation), [domain]));
    report.operations.push({ operation: balance.operation, asset: balance.asset, amountStroops: balance.amountStroops,
      claimants: balance.claimants.map((c, i) => ({ destination: c.destination, intervals: jsonIntervals(windows[i] ?? []) })) });
    const allWindows = union(windows.flat());
    if (allWindows.length === 0) add('NO_ELIGIBLE_CLAIMANT', 'error', balance.operation, [], 'No claimant predicate can be satisfied after assumed creation.', [domain]);
    for (const [index, window] of windows.entries()) {
      if (!window.length) add('UNREACHABLE_CLAIMANT', 'warning', balance.operation, [index], 'This claimant has no eligible time after assumed creation.');
    }
    if (balance.asset !== 'native') {
      add('ISSUER_CONTROLS_UNCHECKED', 'warning', balance.operation, [], 'Issued-asset trustlines, authorization and issuer clawback/freeze controls are not checked offline.');
    }
    const gaps = complement(allWindows, domain);
    if (gaps.length) add('UNCOVERED_INTERVAL', opPolicy.continuousCoverage ? 'error' : 'warning', balance.operation, [], 'No claimant is predicate-eligible during these intervals, if the balance remains unclaimed.', gaps);
    for (let i = 0; i < windows.length; i++) for (let j = i + 1; j < windows.length; j++) {
      const overlap = intersect(windows[i] ?? [], windows[j] ?? []);
      if (overlap.length) add('CLAIMANT_OVERLAP', opPolicy.exclusive ? 'error' : 'warning', balance.operation, [i, j], 'Both claimants are eligible; the first successful claimant receives the entire remaining balance.', overlap);
    }
    const handover = opPolicy.handoverAfter === undefined ? TIME_END : creation + opPolicy.handoverAfter;
    const requirements = [
      { address: opPolicy.beneficiary, role: 'beneficiary', required: { start: creation, end: handover } },
      ...(opPolicy.recovery === undefined ? [] : [{ address: opPolicy.recovery, role: 'recovery', required: { start: handover, end: TIME_END } }]),
    ];
    for (const requirement of requirements) {
      const index = balance.claimants.findIndex(c => c.destination === requirement.address);
      if (index < 0) {
        add('MISSING_ROLE_CLAIMANT', 'error', balance.operation, [], `The designated ${requirement.role} is not listed as a claimant.`);
      } else {
        const missing = complement(windows[index] ?? [], requirement.required);
        if (missing.length) add('ROLE_WINDOW_VIOLATION', 'error', balance.operation, [index], `The designated ${requirement.role} cannot cover its required predicate-eligibility window.`, missing);
      }
    }
  }
  report.status = report.findings.some(f => f.severity === 'inconclusive') ? 'inconclusive'
    : report.findings.some(f => f.severity === 'error') ? 'fail' : 'pass';
  return report;
}
