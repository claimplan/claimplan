# Source-only v0.1 release preparation

Status: candidate preparation, not a published release. Developer validation remains open. A source-only experimental prerelease may expose that limitation; do not call it validated or production ready. npm publication is outside this candidate path.

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

Contributor issue drafts are in [CONTRIBUTOR-BACKLOG.md](CONTRIBUTOR-BACKLOG.md). Publish only scoped work the maintainer can actually review; no artificial issue count is needed.

## Self-review scope and findings

Reviewed requirement alignment (offline product, policy/report/CLI contract and honest validation claims), integration boundaries (package exports/files and the separate local signing harness), and release risks (malformed inputs, reproducible examples, CI installation checks and disclosure route). Missing private reporting and missing CI verification of the new payout artifacts were addressed. A fresh-cache check also caught and repaired an offline installation assumption: package verification permits registry access during installation by default, with a separate explicit warmed-cache mode. Product semantic code was not changed by this release preparation.

Coverage limits: this is a self-review, not an independent audit. Existing tests cover malformed input and protocol boundaries; there is no exhaustive hostile-input SDK parser audit, maximum-plan benchmark, native macOS/Windows evidence or customer review. The first fresh Core attempt failed its exact timestamp requirement; historical evidence was preserved and the follow-up run passed all 30 boundary cases and five execution controls, and saved-fixture replay confirmed exact intervals/timestamps and an unsigned envelope. The initial scheduling failure remains documented; the timestamp diagnostics do not establish its root cause. Outstanding work is in the contributor backlog and progress tracker.

## Publish sequence and verification

1. Complete or explicitly carry forward the two-reviewer validation gap as an experimental prerelease limitation.
2. Inspect the final diff, candidate checks and exact target commit. Keep local conversation history outside the public repository.
3. Prepare a draft GitHub release targeting that commit with the candidate notes. A draft is not a public release and does not establish installation from a published artifact.
4. Obtain explicit approval for public tag/release creation with the reviewed tag and target. Choose `v0.1.0` only if publishing the version currently embedded in package metadata/CLI; otherwise update version strings/tests/lockfile coherently and rerun checks.
5. Publish the approved source-only prerelease, then clone/download that tag into a clean directory and repeat quick start/demo/package checks. Record the actual release URL and checksum of any separately supplied package artifact.
6. If defective, mark the release as affected, document the correction and issue a new version. Do not force-move an existing public tag. No database or production deployment rollback applies.

No npm owner or package-name availability is assumed. npm publication would need a separate ownership/channel decision and installation verification against the registry.
