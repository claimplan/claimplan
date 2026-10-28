# Source-only v0.1 release

Status: [v0.1.0 experimental source-only prerelease](https://github.com/claimplan/claimplan/releases/tag/v0.1.0) published on 2026-10-28 at `76423af793bccc9cb0c6b83b522a887f2d7af3e6`. The public tag resolves to that exact commit. A new temporary clone of the public tag passed `npm ci --ignore-scripts`, strict typecheck/35 tests, the demo (exits 0/1/2) and installed-package CLI/ESM checks. [Candidate CI](https://github.com/claimplan/claimplan/actions/runs/40652655946) passed on Node 22 and 24.

Independent review and developer sessions are optional and unperformed; this is an experimental release. npm publication is outside this source-only release. The tag is immutable; subsequent main-branch documentation records the publication outcome.

## Candidate contents and compatibility

Use the reviewed main-branch commit after required CI succeeds. Include the offline CLI/library, reproducible examples, documentation, license and local-verification source. The npm tarball excludes the signing integration harness; GitHub source archives include development source and are not the npm package. See [CHANGELOG](../CHANGELOG.md) and [compatibility contract](COMPATIBILITY.md).

## Candidate checks

```sh
npm ci --ignore-scripts
npm run check
node scripts/generate-examples.mjs
node scripts/generate-payout.mjs
git diff --exit-code -- examples
npm run demo
npm run verify:package
npm pack --dry-run
npm audit --omit=dev
npm run test:core
git diff --check
```

The Core harness writes new finite evidence and cleans up its owned container. Inspect the new evidence before including it; hashes, synthetic public addresses and ledger times change between runs. Never retain runtime secrets. Record the exact Node/SDK/Core/protocol versions and command outcomes in the progress log. A failed check stays failed until a new run establishes otherwise.

## Repository hygiene review

Private vulnerability reporting, secret scanning and secret-scanning push protection are enabled and verified, with reporting instructions in `SECURITY.md`. Repository topics now identify Stellar, claimable balances, TypeScript, CLI, offline operation and policy validation. Issue and PR templates request synthetic reproductions and actual validation. Workflow actions are pinned. CI job display names are `Check (Node 22)` and `Check (Node 24)`; inspect a successful new run before using them as required contexts.

At inspection on 2026-10-28 main had no branch protection or rulesets. Recommended collaborative policy: require both successful CI checks on pull requests, block force pushes/deletions, and keep a documented maintainer emergency path. Do not require unavailable independent approvals for a sole-maintainer repository. Protection remains a maintainer decision; applying a rule without checking its effect on the authorized push workflow can lock out delivery. No rule has been silently enabled by this preparation.

The three scoped contributor issues are linked in [CONTRIBUTOR-BACKLOG.md](CONTRIBUTOR-BACKLOG.md). They have no Wave labels, reward points or assignments.

## Self-review scope and findings

Reviewed requirement alignment (offline product, policy/report/CLI contract and honest validation claims), integration boundaries (package exports/files and the separate local signing harness), and release risks (malformed inputs, reproducible examples, CI installation checks and disclosure route). Missing private reporting and missing CI verification of the new payout artifacts were addressed. A fresh-cache check also caught and repaired an offline installation assumption: package verification permits registry access during installation by default, with a separate explicit warmed-cache mode. Product semantic code was not changed by this release preparation.

Coverage limits: this is a self-review, not an independent audit. Existing tests cover malformed input and protocol boundaries; there is no exhaustive hostile-input SDK parser audit or customer review. Subsequent finite maximum-plan/resource and native macOS/Windows checks are recorded in RESOURCE-VERIFICATION.md and NATIVE-VERIFICATION.md. The first fresh Core attempt failed its exact timestamp requirement; historical evidence was preserved and the follow-up run passed all 30 boundary cases and five execution controls, and saved-fixture replay confirmed exact intervals/timestamps and an unsigned envelope. The initial scheduling failure remains documented; the timestamp diagnostics do not establish its root cause. Outstanding work is in the contributor backlog and progress tracker.

## Procedure for subsequent releases

1. Carry forward unperformed optional independent review and usefulness sessions as evidence limitations, without making recruitment a release gate.
2. Inspect the final diff, candidate checks and exact target commit. Keep local conversation history outside the public repository.
3. Prepare a draft GitHub release targeting that commit with the candidate notes. A draft is not a public release and does not establish installation from a published artifact.
4. Confirm maintainer authorization covers public tag/release creation with the reviewed tag and target; use existing standing authorization without asking again. Choose a new unused tag matching the intended package/CLI version; update version strings/tests/lockfile coherently and rerun checks. Never reuse the published `v0.1.0` tag.
5. Publish the approved source-only prerelease, then clone/download that tag into a clean directory and repeat quick start/demo/package checks. Record the actual release URL and checksum of any separately supplied package artifact.
6. If defective, mark the release as affected, document the correction and issue a new version. Do not force-move an existing public tag. No database or production deployment rollback applies.

No npm owner or package-name availability is assumed. npm publication would need a separate ownership/channel decision and installation verification against the registry.

## Current delivery additions — 2026-10-28

Published static documentation through the pinned GitHub Pages workflow; source is `site/`, builder is `scripts/build-docs.mjs`, generated output is ignored at `artifacts/site/`. `npm run docs:build` verifies actual analyzer examples and every relative destination. Desktop/mobile navigation, skip link and overflow checks passed locally. Source code remains offline; the site collects no transactions or wallet credentials.

Presentation comparison: the live [approved list](https://www.drips.network/wave/stellar/repos) included [KindFi](https://github.com/kindfi-org/kindfi) and [Trustless Work](https://github.com/Trustless-Work/trustlesswork-smart-contract-stellar) on 2026-10-28. Their actual READMEs showed project/setup guidance and community links; Trustless Work also showed maintainers and contributor credits. ClaimPlan adopts working docs/demo links, CI badges, a verified maintainer GitHub contact and real contributor history. It does not invent social channels, deployments or endorsements. These observations are presentation evidence, not proof of program admission criteria.

## Enforced main-branch policy — 2026-10-28

Verified by GitHub REST readback: main requires pull requests, up-to-date status checks from GitHub Actions (app ID 15368), conversation resolution, and all seven actual check names: Check (Node 22), Check (Node 24), Native (macos-15, Node 22), Native (macos-15, Node 24), Native (windows-2025, Node 22), Native (windows-2025, Node 24), Build documentation. Administrators are included; force pushes and branch deletion are disabled. Required approving reviews is zero because separate review is optional and the repository has one verified maintainer. New changes go through branches and PRs; do not bypass or disable protection to deliver. The earlier absence-of-protection paragraph is historical and superseded.
