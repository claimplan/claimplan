import { Claimant } from '@stellar/stellar-sdk';

// Expected truth tables are declared independently of ClaimPlan's interval engine.
export function boundaryCases(creation, beneficiary, recovery) {
  const abs = offset => Claimant.predicateBeforeAbsoluteTime(String(creation + offset));
  const rel = offset => Claimant.predicateBeforeRelativeTime(String(offset));
  const not = Claimant.predicateNot;
  const and = Claimant.predicateAnd;
  const or = Claimant.predicateOr;
  const single = predicate => [new Claimant(beneficiary, predicate)];
  return [
    { name: 'unconditional', claimants: single(Claimant.predicateUnconditional()), truth: [true, true, true] },
    { name: 'absolute-before', claimants: single(abs(60)), truth: [true, false, false] },
    { name: 'relative-before', claimants: single(rel(60)), truth: [true, false, false] },
    { name: 'not-relative', claimants: single(not(rel(60))), truth: [false, true, true] },
    { name: 'and-window', claimants: single(and(not(abs(30)), rel(60))), truth: [true, false, false] },
    { name: 'or-gap', claimants: single(or(rel(60), not(abs(90)))), truth: [true, false, false] },
    { name: 'or-complement', claimants: single(or(abs(60), not(rel(60)))), truth: [true, true, true] },
    { name: 'contradiction', claimants: single(and(abs(60), not(abs(60)))), truth: [false, false, false] },
    { name: 'handover-beneficiary', claimants: [new Claimant(beneficiary, rel(60)), new Claimant(recovery, not(rel(60)))], claimant: 0, truth: [true, false, false] },
    { name: 'handover-recovery', claimants: [new Claimant(beneficiary, rel(60)), new Claimant(recovery, not(rel(60)))], claimant: 1, truth: [false, true, true] },
  ];
}
