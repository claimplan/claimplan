# Implementation plan

For the remaining project milestones and user-facing status, use [the progress tracker](TODO.md). The initial implementation slices below are complete; local protocol verification is complete for the recorded finite cases. Developer validation awaits actual feedback; release and final-stage submission materials have been prepared in parallel.

## Completed stage: local Stellar Core verification

- Docker daemon and Stellar CLI are available. Existing unrelated containers must remain untouched.
- Use an isolated ephemeral Quickstart network bound only to loopback. Pin the tested image by digest and close real-time ledgers manually to test exact time boundaries.
- Keep signing/submission in a separate explicitly invoked development harness, never in the product/library.
- Ordered units: environment manifest/launcher; local RPC/manual-close helper; boundary fixtures; actual claim-outcome comparisons; regression fixes if any; recorded evidence and documentation. Commit/push each logical unit immediately and wait for completion.
- Observed Core/RPC v30.0.0, selected ledger protocol 28, pinned image digest in `integration/network.json`. Thirty real boundary comparisons and five execution controls passed. Saved evidence is in `integration/core-results.json` and reproduction instructions in `docs/CORE-VERIFICATION.md`.
- RPC v30 uses `ledgerCloseTime`, which SDK 17 does not preserve in its transaction parser. The harness reads the public wire response with strict timestamp validation; regression tests cover both response formats.
- Keep deadline ledgers separate from RPC ingestion waits. Control scheduling must start from the current time after ingestion, not a stale previous-ledger deadline.

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

Core verification: strict TypeScript check and 23 Node tests passed locally before CLI work. Includes 1,000 deterministic generated predicate trees compared with an independent Boolean evaluator. Those initial tests did not execute Core; the later local integration run below does.

Final local verification: Node 22.23.2, strict typecheck and 31 tests passed. `npm pack --dry-run` verified CLI/library artifacts; packed tarball installed in an isolated temporary consumer using cached dependencies and the installed binary returned pass/0, fail/1 and inconclusive/2 for the three documented examples. Production dependency audit reported zero known vulnerabilities at this check. Input review added FIFO rejection and invalid 12-byte credit asset encoding rejection. This is not an independent audit.

CI configured for Node 22 and 24; action versions resolved to exact official commit hashes on 2026-10-27. [Implementation CI run 40515788768](https://github.com/claimplan/claimplan/actions/runs/40515788768) completed successfully for implementation commit `8e07258`; both Node jobs completed their typecheck/tests, fixture regeneration, package dry run and example-status checks. That CI run performed no network transactions; the later isolated local Core harness uses synthetic transactions. No npm package publication has occurred.

## Next scoped work

Prepare a terminal demo and validate whole-plan policy reports with two developers who create claimable balances. Local Core verification is complete: 30 boundary checks, five execution controls, unsigned-fixture evidence replay, and cleanup of the owned container all passed. Offline typecheck/35 tests and package isolation passed. No product predicate discrepancy was observed. Package publication and Drips submission remain separate future actions.

- Creation time remains a supplied assumption; real submission time can differ.
- Offline eligibility cannot prove a claim will execute.
- Customer validation remains pending; no adoption or audit claims.
- Relative/absolute boundaries and input validation are the highest-risk areas.
- No npm publication, deployment, grant application or Wave submission authorized by this implementation task.

## Developer validation preparation — 2026-10-28

Prepared a two-recipient synthetic payout with seven/fourteen-day handovers and a broken second-operation overlap, deterministic fixture generator, terminal demo checking exit codes 0/1/2, and `docs/DEVELOPER-VALIDATION.md` with expected reports and a feedback checklist. External sessions remain pending; no outreach performed. Next: collect two authorized developer reviews and address observed issues before deciding standalone/upstream direction.

Verification: `npm run check` passed strict typecheck and all 35 tests; the terminal demo returned expected 0/1/2 outcomes; direct analyzer assertions confirmed both amounts, operation coverage and the exact second-operation overlap. Payout regeneration was byte-identical, `npm pack --dry-run` passed, and `git diff --check` passed. Core was not rerun because product semantics and the integration harness were unchanged. Changes remain local; no commit, push, publication or outreach performed.

## Release and submission preparation — 2026-10-28

User requested work through the last stage and batched Git pushes; this supersedes the earlier immediate-push instruction for this work. Prepare logical commits locally, then push them together. Added compatibility/security policies, issue/PR templates, contributor drafts, release notes/checklist and a sourced Drips application packet. Private vulnerability reporting, secret scanning/push protection and six repository topics were enabled and read back. Branch protection is absent; a suitable CI-based recommendation is recorded rather than silently locking the maintainer workflow. No outreach, published issues, release publication, app installation or application performed.

Fresh source install, strict typecheck/35 tests, demo, isolated packed install/CLI exits/ESM import and npm pack dry run passed. Production audit reported zero known vulnerabilities. First fresh Core attempt failed its exact transaction-ledger timestamp check after ten valid before-boundary probes; owned-container cleanup succeeded and historical evidence was preserved. Added expected/actual timestamp diagnostics and reran without concurrent install/build work; result pending. Do not infer a product predicate defect or a completed fresh Core pass from this failed attempt.

Clean-cache release check found that npm ci caches tarballs without the full registry metadata needed by a separate npm install --offline. The default package verification now permits dependency/metadata fetching during installation, with explicit --offline mode only for warmed caches. Runtime analysis remains offline. This avoids a false CI failure masked by a warm local npm cache. Fresh-cache verification of the repair is required before push.

Final local release-preparation verification: the follow-up Core run passed 30 exact boundary comparisons and all five execution controls and removed its owned container. Public-analyzer replay reproduced saved intervals/timestamps; creation envelope has zero signatures. Both fixture generators were byte-identical, strict check/35 tests and targeted harness safety tests passed, package verification passed with a fresh cache and then explicit warmed-cache offline mode, and production audit found zero known vulnerabilities. Documentation links resolve and git diff --check passed. Developer feedback is still absent. Next: push the logical commits in one batch, inspect the new CI run, and prepare a source-only draft release; publication and program application remain explicit final actions.
