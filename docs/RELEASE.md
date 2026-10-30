# Source release history and procedure

## Latest verified release

[v0.1.1 experimental source-only prerelease](https://github.com/claimplan/claimplan/releases/tag/v0.1.1) targets `569fca37683e9ae4720f7293d61df718e6204639`, published on 2026-10-28. [Saved verification](../checks/release/results-v0.1.1.json) records a fresh public-tag clone on Node 22.23.2 passing install, typecheck/35 tests, demo, installed CLI/ESM and docs build. The Windows helper repair is included; product predicate/policy semantics are unchanged. Later main-branch documentation does not create a new release.

A v0.1.2 candidate is prepared: package/CLI version text and the changelog entry cover the output-delivery fix merged at `f7db8e2`. Publication, the exact tag target and fresh public-tag install verification are recorded in this document and in `checks/release/` only after they actually happen; nothing here pre-claims them.

## Earlier release and failures retained

[v0.1.0](https://github.com/claimplan/claimplan/releases/tag/v0.1.0) targets `76423af793bccc9cb0c6b83b522a887f2d7af3e6`, published on 2026-10-28. Its clean Linux checkout passed the recorded source/package checks; it predates the Windows development-helper repair. [Candidate CI](https://github.com/claimplan/claimplan/actions/runs/40652655946) and [native failure/repair](NATIVE-VERIFICATION.md) preserve the distinction. Neither tag was moved.

The first Core release-preparation run missed an exact timestamp; a later historical run passed without weakening boundaries. Resource startup/calibration failures were also excluded from passing observations. Details and datasets remain in [Core](CORE-VERIFICATION.md) and [resource](RESOURCE-VERIFICATION.md) records. The 2026-10-29 audit's failed fresh RPC-startup run is a separate outcome, not a replacement for those historical results.

No npm package has been published. No contract or hosted product was deployed. Optional independent/usefulness review remains unperformed; experimental releases are not security audits, adoption evidence or execution guarantees.

## Artifact boundaries

The explicit package file list ships dist, selected reference/security documents and examples. It excludes development Core/resource/recording/site tooling. GitHub source archives include those development sources and are not npm tarballs. Installation can fetch dependencies and registry metadata; analysis runs offline. See [compatibility](COMPATIBILITY.md) and [architecture](architecture.md).

## Current protected workflow

Read-only GitHub inspection on 2026-10-29 confirmed strict required checks, GitHub Actions app 15368, administrators included, PRs and conversation resolution required, force pushes/deletion disabled, and zero required approving reviews for the sole-maintainer/optional-review policy. Exact check names:

- `Check (Node 22)`
- `Check (Node 24)`
- `Native (macos-15, Node 22)`
- `Native (macos-15, Node 24)`
- `Native (windows-2025, Node 22)`
- `Native (windows-2025, Node 24)`
- `Build documentation`

Main was initially unprotected earlier on 2026-10-28, then protection was enabled that day. That earlier absence is not current policy. Never disable protection or bypass checks to deliver. Prepare a feature branch/PR; the maintainer reviews and merges.

## Procedure for a future authorized release

1. Obtain explicit scope/authorization for publication. This cleanup authorizes a branch and PR, not a release, npm publication, docs deployment or funding submission.
2. Inspect the target diff, compatibility changes and known limitations. Use a new unused tag and coherent package/lockfile/CLI version; do not move existing public tags.
3. Run `npm ci --ignore-scripts`, `npm run check`, both existing fixture generators, `git diff --exit-code -- examples`, `npm run demo`, `npm run verify:package`, `npm pack --dry-run`, `npm run docs:build`, relevant vulnerability/resource checks and `git diff --check`. Run Core only when isolation/runtime prerequisites are verified; preserve previous evidence and record failures honestly.
4. Review required CI at the exact target. Installation checks may need the registry. Review package contents, secrets, error contracts and intentional omissions; do not infer independent signoff.
5. Prepare accurate release notes and publish only within the authorized action. Verify a fresh public-tag checkout and the actual URL/commit; record commands and limitations. A draft alone is not public artifact verification.
6. If affected, document the limitation and publish a new version when authorized. No history rewrite, forced tag move or database rollback applies.

The existing Pages workflow deploys after a main push. This audit branch/PR only builds; the maintainer must account for publication when deciding to merge and authorize a docs deployment. The agent does not merge or dispatch that deployment.
