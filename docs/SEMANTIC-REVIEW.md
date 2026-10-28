# Semantic review packet

Status: prepared on 2026-10-28; independent review remains open in [issue #1](https://github.com/claimplan/claimplan/issues/1). The source comparison below was performed by the implementation assistant. It is not an independent assessment or formal audit. No reviewer has signed off.

## Reproduce the target

Review baseline: `e84c8e8f58f6592472a60844bb646449455467ad`. Its product `src/` matches the immutable v0.1.0 release commit `76423af793bccc9cb0c6b83b522a887f2d7af3e6`; subsequent packaging and verification work is described in the native guide. SDK dependency: 17.4.0. Record the exact commit you actually review.

```sh
npm ci
npm run check
npm run demo
npm run verify:package
```

The [Core verification guide](CORE-VERIFICATION.md) describes the optional Docker integration run, its 30 time-boundary comparisons and five execution controls. The [resource](RESOURCE-VERIFICATION.md) and [native](NATIVE-VERIFICATION.md) guides record separate finite checks. Passing these checks does not establish complete protocol equivalence.

## Pinned primary sources

The Core target is v30.0.0, protocol 28, source commit `0e49751aa9ddf892302cca02cea7f3f5d97df9f1`, matching the integration image metadata. These are the inspected files, with SHA-256 hashes of their raw contents:

- [Creation and predicate conversion](https://github.com/stellar/stellar-core/blob/0e49751aa9ddf892302cca02cea7f3f5d97df9f1/src/transactions/CreateClaimableBalanceOpFrame.cpp): `55491d3de603c3a8547d78c657d27f8adf9aabc5c55ef4f4d7b31f95e3f52063`.
- [Claim predicate evaluation and execution](https://github.com/stellar/stellar-core/blob/0e49751aa9ddf892302cca02cea7f3f5d97df9f1/src/transactions/ClaimClaimableBalanceOpFrame.cpp): `88dabbc8648bbea177e2b18fe37db0435e214323f8fca496861c5e508e8b392a`.
- [CAP-0023](https://github.com/stellar/stellar-protocol/blob/4c55f7cc290c776791c0922c2afa72f6af095a62/core/cap-0023.md): design rationale and predicate definition. Later proposals changed ledger details; use the pinned Core implementation for execution behavior.

## Source mapping to inspect

| Rule | Core location | ClaimPlan location | Existing evidence |
| --- | --- | --- | --- |
| Absolute predicate is true strictly before its timestamp | Claim `validatePredicate` | `src/intervals.ts` `predicateIntervals` | Unit boundaries and Core before/at/after probes |
| Relative duration becomes creation-ledger time plus duration, capped at INT64_MAX | Creation `relativeToAbsolute`, `updatePredicatesForApply` | `src/intervals.ts` relative branch | Bigint saturation tests; finite Core relative cases |
| AND, OR and NOT use Boolean semantics | Claim `validatePredicate` | Interval intersection, union and complement | 1,000 seeded predicates compared with a direct Boolean evaluator; selected Core cases |
| Predicate depth starts at one, maximum four; AND/OR have two children; NOT has a child; times are nonnegative | Creation `validatePredicate`, `doCheckValid` | `src/decode.ts` | SDK/XDR malformed-input and resource fixtures |
| Claimants are unique and amount is positive | Creation `doCheckValid` | `src/decode.ts` | Decoder tests; no live funding guarantee |

The direct Boolean evaluator is another implementation maintained in this repository, not an external reviewer. Core probes cover selected fixtures, not every legal predicate or protocol version.

Useful independently derived boundary expectations for a reviewer: for absolute threshold 60, times 59/60/61 give true/false/false; NOT reverses these. A relative duration 20 created at INT64_MAX−10 resolves to INT64_MAX, so it is false at INT64_MAX. Creation above INT64_MAX also saturates a relative predicate to INT64_MAX, making it false throughout that later analysis domain. The unsigned time domain ends exclusively at 2^64; this sentinel is not an executable ledger timestamp. These extreme cases need separate assessment of mathematical behavior versus physically reachable ledger histories.

## Application policy versus protocol

The beneficiary/recovery handover is a ClaimPlan policy requirement, not a Stellar Core rule. Review [SPEC.md](SPEC.md), `src/policy.ts` and `src/analyze.ts` together:

- Required role windows are minimum coverage requirements. Allowing overlap does not remove them.
- Disabling continuous-coverage enforcement does not waive the individual role requirements; a gap can still violate those requirements.
- Mixed transactions may pass with a partial-transaction warning. Other operations are outside the predicate-policy conclusion.
- Creation time is an explicit assumption. ClaimPlan does not establish future ledger time, signatures, reserves, fees, account/trustline authorization, liquidity or execution success.
- Asset and amount are reported; policy v1 does not verify a separate business budget or expected payout amount.

Please assess whether these distinctions and exit codes are clear enough for callers, as well as whether the implementation matches them. Suggested changes to these semantics should identify the intended policy change separately from a protocol mismatch.

## Independent review acceptance

1. Record the reviewed commit, source versions, scope and any relationship to the implementation.
2. Trace each operator, saturation and boundary rule from primary sources to the implementation. Check decoding constraints and creation-domain clipping.
3. Derive before/at/after examples independently, including nested NOT/AND/OR, zero duration, saturation and values beyond JavaScript safe integers. State which were executed against Core.
4. Exercise whole-plan role coverage, missing policy entries, mixed transactions and inconclusive inputs. Check CLI exits and report limitations.
5. For a mismatch, provide a minimal unsigned fixture, expected/actual behavior and severity. Add a regression only after agreeing on the expected rule.
6. Report findings and unreviewed areas in issue #1. Explicitly state whether the scoped assessment is complete; do not describe it as a formal audit unless an actual audit was performed.

Review report template:

```text
Reviewed commit / Core source / SDK:
Reviewer relationship to implementation:
Scope and commands actually run:
Independent examples and expected results:
Findings with reproduction and severity:
Unreviewed areas and limitations:
Scoped assessment complete? Remaining work:
Permission to quote feedback publicly:
```

Two developer usefulness sessions remain a separate milestone; use [DEVELOPER-VALIDATION.md](DEVELOPER-VALIDATION.md). Neither Drips submission nor organizer acceptance supplies a semantic signoff or usefulness result.
