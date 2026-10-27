# Implementation plan

## Scope and decisions

First offline CLI/library version, under `docs/SPEC.md`. Single package; separate parsing, interval analysis, policy validation, analysis and CLI modules. Exact bigint arithmetic. Official SDK 17.4.0 verified against npm and GitHub release 2026-10-27; requires Node >=22.12.0. No custom XDR codec.

## Ordered slices

1. [x] Specify policy, report and acceptance behavior.
2. [x] Implement validated policy and interval model with independent truth/boundary tests.
3. [x] Implement SDK XDR adapter and multi-claimant analysis.
4. [ ] Implement CLI and runnable examples, including failing and inconclusive reports.
5. [ ] Run strict build, tests, package/installed-bin checks; document actual results and limitations.
6. [ ] Commit and push verified logical slices; inspect remote CI.

## Risks and follow-up

Core verification: strict TypeScript check and 23 Node tests passed locally before CLI work. Includes 1,000 deterministic generated predicate trees compared with an independent Boolean evaluator. Core itself has not been executed.

- Creation time remains a supplied assumption; real submission time can differ.
- Offline eligibility cannot prove a claim will execute.
- Customer validation remains pending; no adoption or audit claims.
- Relative/absolute boundaries and input validation are the highest-risk areas.
- No npm publication, deployment, grant application or Wave submission authorized by this implementation task.
