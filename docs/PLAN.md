# Implementation plan

For the remaining project milestones and user-facing status, use [the progress tracker](TODO.md). The implementation slices below are complete; protocol verification is next.

## Scope and decisions

First offline CLI/library version, under `docs/SPEC.md`. Single package; separate parsing, interval analysis, policy validation, analysis and CLI modules. Exact bigint arithmetic. Official SDK 17.4.0 verified against npm and GitHub release 2026-10-27; requires Node >=22.12.0. No custom XDR codec.

## Ordered slices

1. [x] Specify policy, report and acceptance behavior.
2. [x] Implement validated policy and interval model with independent truth/boundary tests.
3. [x] Implement SDK XDR adapter and multi-claimant analysis.
4. [x] Implement CLI and runnable examples, including failing and inconclusive reports.
5. [x] Run strict build, tests, package/installed-bin checks; document actual results and limitations.
6. [x] Commit and push final CLI/CI slice; inspect remote CI.

## Risks and follow-up

Core verification: strict TypeScript check and 23 Node tests passed locally before CLI work. Includes 1,000 deterministic generated predicate trees compared with an independent Boolean evaluator. Core itself has not been executed.

Final local verification: Node 22.23.2, strict typecheck and 31 tests passed. `npm pack --dry-run` verified CLI/library artifacts; packed tarball installed in an isolated temporary consumer using cached dependencies and the installed binary returned pass/0, fail/1 and inconclusive/2 for the three documented examples. Production dependency audit reported zero known vulnerabilities at this check. Input review added FIFO rejection and invalid 12-byte credit asset encoding rejection. This is not an independent audit.

CI configured for Node 22 and 24; action versions resolved to exact official commit hashes on 2026-10-27. [Implementation CI run 40515788768](https://github.com/claimplan/claimplan/actions/runs/40515788768) completed successfully for implementation commit `8e07258`; both Node jobs completed their typecheck/tests, fixture regeneration, package dry run and example-status checks. No npm package publication or network transaction performed.

## Next scoped work

Independently compare boundary fixtures against a local Stellar Core network, then validate whole-plan policy reports with two developers who create claimable balances. Package publication and Drips submission remain separate future actions.

- Creation time remains a supplied assumption; real submission time can differ.
- Offline eligibility cannot prove a claim will execute.
- Customer validation remains pending; no adoption or audit claims.
- Relative/absolute boundaries and input validation are the highest-risk areas.
- No npm publication, deployment, grant application or Wave submission authorized by this implementation task.
