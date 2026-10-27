# ClaimPlan progress tracker

Current stage: **Stellar Core verification in progress**.

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

## 2. Verify against Stellar Core — IN PROGRESS

- [ ] Inspect local Docker/Core availability and select a verified compatible local network version.
- [ ] Create a reproducible local-only test harness with synthetic accounts and assets.
- [ ] Compare predicted eligibility with actual claim outcomes immediately before, at and after deadlines.
- [ ] Cover absolute and relative predicates, AND/OR/NOT, contradictions and multi-claimant handovers.
- [ ] Separate intentional claim failure from trustline, funding, reserve and authorization failures.
- [ ] Record Core version, fixtures, commands, expected outcomes and actual outcomes.
- [ ] Fix any discrepancy and keep a regression fixture for each discovered defect.

Done when: a documented, repeatable local Core run agrees with the supported semantic cases. Keep the offline suite for extreme integer cases that cannot be practically scheduled on a local ledger. Do not represent one finite test set as proof of all protocol behavior. No mainnet deployment or funds needed.

## 3. Validate usefulness — pending

- [ ] Prepare a short terminal demo and example reports for review.
- [ ] Get feedback from two developers who create claimable balances.
- [ ] Test one realistic, permissioned or synthetic payout workflow against a declared policy.
- [ ] Establish whether existing libraries or scripts already solve their whole-plan policy problem.
- [ ] Document confusing output, missing rules and false-positive reports; fix observed problems.
- [ ] Decide whether ClaimPlan should remain standalone or be contributed upstream.

Done when: actual feedback supports the workflow and the scope addresses a concrete need. No adoption claims before evidence. Contacting people requires the user's authorization; no outreach has occurred.

## 4. Prepare a reviewable v0.1 release — pending

- [ ] Review the public policy/API/report compatibility contract and document intended changes.
- [ ] Improve diagnostics and validation only where tests or user feedback justify a change.
- [ ] Add a security disclosure policy with a working private reporting route and explicit unaudited status.
- [ ] Review resource limits and hostile/malformed input cases; resolve actionable findings.
- [ ] Document supported runtime/platform coverage and untested environments accurately.
- [ ] Add release notes, a reproducible terminal demo and a complete quick-start verification.
- [ ] Draft scoped contributor issues with acceptance criteria and dependencies; avoid artificial issue volume.
- [ ] Check repository topics, issue templates and suitable branch rules against actual CI names and maintainer capacity.
- [ ] Re-run typecheck, tests, Core checks, example regeneration, clean package installation and dependency review for the release candidate.

Done when: a new contributor can follow the documented quick start, reproduce the supported results and understand the remaining limitations. An external audit is not claimed or treated as completed by a self-review.

## 5. Release/distribution — pending authorization

- [ ] Confirm package naming/ownership and whether npm publication is wanted.
- [ ] Prepare the final release tag, notes and package artifacts.
- [ ] Obtain authorization for package publication and release creation.
- [ ] Publish only the approved artifacts and verify installation from the chosen distribution channel.

Done when: the approved v0.1 artifact is obtainable and its documented installation works. A source-only release is an option; npm publication is not mandatory. No website, dashboard, hosted API or deployed smart contract is required.

## 6. Drips Wave submission — separate program milestone

- [ ] Recheck current Wave rules, application limits and the approved list before applying.
- [ ] Verify the repository is not already approved and that the submission accurately describes the CLI.
- [ ] Assemble repository, docs, terminal-demo and verification links; use only artifacts that exist.
- [ ] Prepare the contributor backlog and submission description around actual implemented functionality.
- [ ] Obtain authorization before submitting the application or changing program settings.
- [ ] Submit and record the organizer's decision; address any substantive feedback.

Done when: the application has a recorded decision. Acceptance belongs to the organizers and cannot be promised. SCF funding is a different program and is outside this finish checklist.

## Reporting convention

Include this compact tracker in progress updates and handoffs:

| Stage | State |
| --- | --- |
| Offline MVP | Complete |
| Stellar Core verification | In progress |
| Developer validation | Pending |
| Release preparation | Pending |
| Release/distribution | Pending authorization |
| Drips submission | Pending readiness and authorization |

Always identify the current task, actual verification evidence, blockers and next action. Mark only work actually completed; update this file when stage status changes.
