export const INT64_MAX = (1n << 63n) - 1n;
export const TIME_END = 1n << 64n;

export class InputError extends Error {
  override name = 'InputError';
}

export type Predicate =
  | { type: 'unconditional' }
  | { type: 'beforeAbsolute'; seconds: bigint }
  | { type: 'beforeRelative'; seconds: bigint }
  | { type: 'not'; child: Predicate }
  | { type: 'and' | 'or'; left: Predicate; right: Predicate };

export interface Interval { start: bigint; end: bigint }
export interface JsonInterval { start: string; end: string }

export interface OperationPolicy {
  operation: number;
  beneficiary: string;
  recovery?: string;
  handoverAfter?: bigint;
  exclusive: boolean;
  continuousCoverage: boolean;
}

export interface Policy {
  version: 1;
  creationTime?: bigint;
  operations: OperationPolicy[];
}

export interface Claimant { destination: string; predicate: Predicate }
export interface BalanceOperation {
  operation: number;
  asset: string;
  amountStroops: string;
  claimants: Claimant[];
}

export interface DecodedPlan {
  envelope: 'v0' | 'v1' | 'feeBump';
  balances: BalanceOperation[];
  ignoredOperations: number[];
  timeBounds: { minTime: bigint; maxTime: bigint } | null;
}

export interface Finding {
  code: string;
  severity: 'error' | 'warning' | 'inconclusive';
  operation: number | null;
  claimants: number[];
  message: string;
  intervals: JsonInterval[];
}

export interface Report {
  rulesVersion: '1';
  status: 'pass' | 'fail' | 'inconclusive';
  scope: 'claim-predicates-only' | 'partial-transaction';
  creationTime: string | null;
  timeDomainEndExclusive: string;
  envelope: DecodedPlan['envelope'];
  operations: {
    operation: number;
    asset: string;
    amountStroops: string;
    claimants: { destination: string; intervals: JsonInterval[] }[];
  }[];
  findings: Finding[];
  ignoredOperations: number[];
  limitations: string[];
}
