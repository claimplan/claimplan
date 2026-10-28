# ClaimPlan progress tracker

Current stage: **Release preparation and submission draft prepared; developer feedback remains pending**.

The initial implementation is complete. It is not yet a validated v0.1 release or a Drips-approved project. This tracker distinguishes implementation, independent evidence, release preparation and external approval. No percentage is assigned because the remaining work is not equal in size.

## 1. Working offline MVP — complete

- [x] Create GitHub organization and public repository.
- [x] Define policy v1, report format, scope and exit codes.
- [x] Implement exact bigint predicate/interval analysis.
- [x] Decode v0, v1 and fee-bump XDR using the official SDK.
- [x] Check beneficiary/recovery windows, gaps, overlaps and unreachable claimants.
- [x] Reject malformed inputs and report missing assumptions as inconclusive.
- [x] Provide CLI, library API and three reproducible offline examples.
- [x] Add README, specification, contribution guide and project instructions.
- [x] Pass strict typecheck and 31 tests, including 1,000 generated predicate trees.
- [x] Verify packed installation and exit codes 0/1/2.
- [x] Pass GitHub CI on Node 22 and 24.

Evidence: [latest verified documentation-head CI](https://github.com/claimplan/claimplan/actions/runs/40516015206), [implementation CI](https://github.com/claimplan/claimplan/actions/runs/40515788768). These are model/SDK/CLI tests, not execution against Stellar Core.

## 2. Verify against Stellar Core — complete

- [x] Inspect local Docker/Core availability and select a verified compatible local network version (Quickstart image digest pinned; Core/RPC v30.0.0, ledger protocol 28).
- [x] Create a local-only test harness with synthetic accounts and assets (`npm run test:core`); a full run including controls passed.
- [x] Compare predicted eligibility with actual claim outcomes immediately before, at and after deadlines: 30 actual Core comparisons passed.
- [x] Cover absolute and relative predicates, AND/OR/NOT, contradictions and multi-claimant handovers.
- [x] Separate intentional claim failure from trustline, funding, reserve and authorization failures: all five controls passed.
- [x] Record Core version, fixtures, commands, expected outcomes and actual outcomes in `integration/core-results.json` and `docs/CORE-VERIFICATION.md`.
- [x] Review discrepancies: no product predicate mismatch observed; harness RPC timestamp compatibility has regression coverage.

Evidence: `npm run test:core` completed successfully with 30 boundary comparisons and five execution controls on Core/RPC v30.0.0, ledger protocol 28. The [saved evidence](../integration/core-results.json) replays through the public analyzer; the creation fixture is unsigned. The owned container was removed. Offline typecheck/35 tests and package exclusion of the integration harness passed. [Node 22/24 CI](https://github.com/claimplan/claimplan/actions/runs/40523032332) passed for the RPC compatibility change. See [reproduction and limits](CORE-VERIFICATION.md).

Done when: a documented, repeatable local Core run agrees with the supported semantic cases. Keep the offline suite for extreme integer cases that cannot be practically scheduled on a local ledger. Do not represent one finite test set as proof of all protocol behavior. No mainnet deployment or funds needed.

## 3. Validate usefulness — pending

- [x] Prepare a short terminal demo and example reports for review (`node scripts/demo.mjs`; see `docs/DEVELOPER-VALIDATION.md`).
- [ ] Get feedback from two developers who create claimable balances.
- [x] Test one realistic, permissioned or synthetic payout workflow against a declared policy: two synthetic recipients, seven/fourteen-day recovery, and an intentional second-operation overlap.
- [ ] Establish whether existing libraries or scripts already solve their whole-plan policy problem.
- [ ] Document confusing output, missing rules and false-positive reports; fix observed problems.
- [ ] Decide whether ClaimPlan should remain standalone or be contributed upstream.

Done when: actual feedback supports the workflow and the scope addresses a concrete need. No adoption claims before evidence. Contacting people requires the user's authorization; no outreach has occurred.

## 4. Prepare a reviewable v0.1 release — materials and local checks prepared

- [x] Review the public policy/API/report compatibility contract (`docs/COMPATIBILITY.md`; pre-release compatibility remains explicit).
- [x] Review diagnostics/validation: product behavior unchanged; integration timestamp mismatch errors now include expected/observed times. No developer feedback has been received.
- [x] Add `SECURITY.md`; enable and verify GitHub private vulnerability reporting, secret scanning and push protection. No independent audit claimed.
- [x] Review structural/file limits and existing malformed-input regressions; document the parsed-JSON library boundary. Maximum-plan/adversarial resource characterization remains a scoped contributor task, not a performance guarantee.
- [x] Document Linux/Ubuntu Node evidence and unverified macOS/Windows/alternative runtimes in `docs/COMPATIBILITY.md`.
- [x] Add `CHANGELOG.md`, a reproducible demo, and isolated packed installation/CLI/ESM checks (`npm run verify:package`).
- [x] Draft three substantive tasks in `docs/CONTRIBUTOR-BACKLOG.md` with scope, acceptance checks, dependencies and effort. No issues or Wave nominations published.
- [x] Set repository topics, add issue/PR templates, and review branch protection against `Check (Node 22)` / `Check (Node 24)`. No protection exists; recommendation and maintainer decision recorded in `docs/RELEASE.md`.
- [x] Re-run strict typecheck/35 tests, Core (30 boundary comparisons/five controls; saved unsigned-fixture replay), both example generators, isolated installation/ESM/CLI checks including a fresh npm cache, and dependency audit (zero known vulnerabilities). First Core attempt failed a timestamp assertion; passing follow-up is recorded in `docs/CORE-VERIFICATION.md`.

Done when: a new contributor can follow the documented quick start, reproduce the supported results and understand the remaining limitations. An external audit is not claimed or treated as completed by a self-review.

## 5. Release/distribution — pending authorization

- [x] Choose source-only candidate preparation; no npm ownership/name claim. npm publication remains a separate decision.
- [ ] Prepare the final release tag, notes and package artifacts.
- [ ] Obtain authorization for package publication and release creation.
- [ ] Publish only the approved artifacts and verify installation from the chosen distribution channel.

Done when: the approved v0.1 artifact is obtainable and its documented installation works. A source-only release is an option; npm publication is not mandatory. No website, dashboard, hosted API or deployed smart contract is required.

## 6. Drips Wave submission — separate program milestone

- [ ] Official rules/limits and all 842 unique approved repositories inspected on 2026-10-28 (nine API pages; ClaimPlan absent). Authenticated remaining allowance and existing application state still need verification before applying.
- [ ] Verify the repository is not already approved and that the submission accurately describes the CLI.
- [x] Assemble evidence links and runnable demo in `docs/DRIPS-SUBMISSION.md`; verify new public file links after push. No release/video link invented.
- [x] Prepare contributor backlog and candid application description in `docs/DRIPS-SUBMISSION.md`.
- [ ] Obtain authorization before submitting the application or changing program settings.
- [ ] Submit and record the organizer's decision; address any substantive feedback.

Done when: the application has a recorded decision. Acceptance belongs to the organizers and cannot be promised. SCF funding is a different program and is outside this finish checklist.

## Reporting convention

Include this compact tracker in progress updates and handoffs:

| Stage | State |
| --- | --- |
| Offline MVP | Complete |
| Stellar Core verification | Complete |
| Developer validation | Demo prepared; two developer reviews pending |
| Release preparation | Materials and local checks prepared; developer review pending |
| Release/distribution | Pending authorization |
| Drips submission | Draft prepared; application-state verification and authorization pending |

Always identify the current task, actual verification evidence, blockers and next action. Mark only work actually completed; update this file when stage status changes.
