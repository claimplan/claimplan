# Implementation and delivery plan

Current state: **experimental source release published and verified; Stellar Wave application submitted and Pending review; developer usefulness validation remains open**. Use [TODO.md](TODO.md) for the full checklist.

## Completed implementation

1. Policy v1, exact bigint interval model and independent truth/boundary checks.
2. Official-SDK XDR decoding for v0/v1/fee-bump envelopes and whole-plan policy coverage.
3. Beneficiary/recovery handovers, overlaps, gaps and unreachable-claimant diagnostics.
4. Offline CLI/library, deterministic JSON and exits 0/1/2.
5. Synthetic examples, terminal demo and reviewer checklist.
6. Strict typecheck/35 offline tests, packed CLI/ESM installation, reproducible fixtures and Node 22/24 CI.

## Completed finite Core verification

Pinned Quickstart image; Core/RPC v30.0.0, protocol 28, SDK 17.4.0. Thirty exact before/at/after comparisons and five execution controls passed on 2026-10-28. Saved unsigned-fixture replay reproduced intervals/timestamps and zero signatures. The owned container was removed; unrelated containers were untouched. See [Core evidence and limitations](CORE-VERIFICATION.md).

The first release-preparation run failed an exact transaction-ledger timestamp assertion after ten before-boundary probes. It cleaned up and preserved prior evidence. A follow-up passed without widening the boundaries. Errors now report expected/actual timestamps; this diagnostic change does not establish the cause of the initial scheduling failure.

## Published source release

[v0.1.0 experimental source-only prerelease](https://github.com/claimplan/claimplan/releases/tag/v0.1.0), commit `76423af793bccc9cb0c6b83b522a887f2d7af3e6`, published on 2026-10-28. [Candidate CI](https://github.com/claimplan/claimplan/actions/runs/40652655946) passed on Node 22 and 24. A new clone of the public tag resolved to that exact commit and passed dependency installation, strict typecheck/35 tests, demo exits 0/1/2 and packed CLI/ESM checks. No npm package was published and no service/contract deployed. Public tags are immutable; subsequent documentation commits record delivery status.

Security reporting, compatibility contract, release notes and issue/PR templates exist. GitHub private vulnerability reporting, secret scanning and push protection are enabled. Six repository topics were set. Branch protection is absent; the reviewed CI-based recommendation is in [RELEASE.md](RELEASE.md). No independent audit is claimed.

A fresh-cache check found that npm ci caches tarballs without all metadata needed for a separate npm install --offline. The package smoke check now permits installation-time registry access by default, with optional --offline for a warmed cache. Both modes were verified after a fresh-cache install; runtime analysis stays offline.

## Contributor work and developer validation

Three substantive issues are published: [independent semantic review #1](https://github.com/claimplan/claimplan/issues/1), [maximum-plan/malformed-input resource checks #2](https://github.com/claimplan/claimplan/issues/2), and [native macOS/Windows verification #3](https://github.com/claimplan/claimplan/issues/3). See [scope and acceptance criteria](CONTRIBUTOR-BACKLOG.md). They have no Wave labels, reward points or assignments.

Two actual developer usefulness sessions remain pending. Use [the demo/session guide](DEVELOPER-VALIDATION.md), record permitted feedback, fix observed problems, and decide standalone versus upstream direction from evidence. Published self-tests and an issue requesting independent review do not count as customer feedback or an independent audit.

## Stellar Wave application — submitted

On 2026-10-28 the user completed browser sign-in. Installed the Drips Wave app with access restricted to claimplan/claimplan, confirmed the repository was selectable and sufficient application allowance existed, and submitted only that repository to the Stellar Wave Program. Submitted a candid planned-issues description and nine supporting links. The success screen confirmed submission; the maintainer dashboard showed **Pending review**. See [submission record](DRIPS-SUBMISSION.md).

The public program page lists Wave 10 among past Waves and no active/upcoming Wave at the time checked. Applying to the program does not guarantee admission, a sprint place, rewards or funding. Do not submit duplicates while review is pending.

## Next actions and working rules

- Await and record the organizer decision; address substantive feedback.
- Collect two real developer reviews and resolve observed workflow issues.
- Review contributor work against acceptance checks; only nominate issues after program approval.
- Maintain the offline/read-only boundary, exact arithmetic, synthetic fixtures and honest evidence limits.
- The maintainer has granted standing project authorization in the local workspace instructions. Do not repeatedly ask for it; user-only authentication/attestations still require their participation.
- Keep commits focused and push them in batches, following the latest user preference. Keep local conversation history outside the public repository.

## Maximum-plan/malformed-input verification — 2026-10-28

Added a deterministic 55-fixture corpus, bounded API/CLI runner and saved per-run observations with source/input/report hashes. All 123 checks passed locally, including 100 operations/1,000 claimants, fully branching depth-four predicates, 4,500/4,700-finding reports including three-window intersections, exact 1 MiB boundaries, excessive vector lengths, 90,000-level encoded NOT nesting, deep JSON and seeded invalid unions. Kernel address-space/CPU limits, V8 heap caps, a live RSS watchdog, process-group wall/output guards and post-exit peak-RSS assertions bound the test processes. Initial Node 22 calibration replaced a failing one-GiB address-space setting with two GiB; the exact Node 24 diagnosis below replaced an incompatible data cap with live RSS supervision. No analyzer defect was observed, and product source remains identical to v0.1.0.

`npm run check` passed strict typecheck/35 tests. `npm run test:resources` now builds/runs the corpus, and CI is configured to execute it on Ubuntu/Node 22 and 24. See RESOURCE-VERIFICATION.md and checks/resources/results.json for exact local observations and limits. Review invitations remain on hold per the user's priority; native-platform verification is recorded below; independent/usefulness reviews remain open. No repeat Core run or release/tag mutation is needed for this development-only coverage.

Remote harness correction: first Node 24 CI attempt (40662752284) failed the watchdog self-test before analyzer cases because it assumed a ready marker within 400 ms of process launch; default fail-fast cancelled Node 22. Changed the deliberately hanging probe to emit readiness synchronously and start its 400 ms activity timer after that signal, retaining the 15-second startup deadline and all analyzer budgets. Disabled matrix fail-fast to obtain both runtime results. The corrected harness passed the full 55-fixture/123-check local rerun and saved fresh matching source hashes; remote checks are being repeated.

Final supervisor diagnosis: exact official Node 24.21.0 reproduced a startup CodeRange reservation failure from RLIMIT_DATA=512 MiB; address-space-only baseline passed at roughly 40 MiB RSS. Replaced that virtual-data constraint with a 256 MiB live /proc RSS watchdog (20 ms polling), retained 2 GiB address-space/128 MiB old-space/five CPU seconds/15-second wall/output caps, and added a deliberate external-buffer memory probe. Both exact local Node 22.23.2 and Node 24.21.0 now pass all guard probes and 55 fixtures/123 checks each. Source/input/report hashes were verified across both saved evidence files. Previous failed CI attempts are not counted as remote input validation; corrected CI is being checked.

## Native macOS/Windows verification — complete for the recorded matrix

Reproduce source install, typecheck/offline suite, deterministic fixture regeneration, demo and packed CLI/ESM installation on standard hosted macOS 15 and Windows Server 2025 with Node 22/24. A manual native verification workflow records actual OS/architecture/Node/npm versions. Do not claim support from configuration alone; diagnose real failures before fixes and enable continuing CI coverage after a successful baseline. The Linux-specific resource harness and local Core harness are outside this native-platform slice. Preserve existing Ubuntu check names and public release tag. Reviewer invitations remain on hold while the technical gap is addressed.

Native baseline run 40668297880: both macOS jobs passed. Both Windows jobs passed source typecheck/tests, deterministic fixtures and demo, then failed the package-check helper with spawnSync npm.cmd EINVAL. Repaired the helper to invoke npm-cli.js with Node instead of trying to exec a Windows batch file. Expanded packed-install verification to execute the actual installed Unix shim/Windows .cmd command under paths containing spaces and Unicode. The Windows command grammar is fixed and paths are passed in quoted environment variables; npm itself is invoked without a shell. Local Linux installed-command checks passed. Second native run 40669003448 passed all four jobs at 5bc2c8c: macOS 15.7.9 ARM64 (35 tests) and Windows Server 2025 x64 (34 tests plus the intentional FIFO skip) on Node 22/24; installed command/ESM/fixture/demo/package checks passed on each. Native CI push/PR coverage is now enabled after that actual reproduction. See NATIVE-VERIFICATION.md and checks/native/results.json for versions and limits. The public tag predates the Windows development-helper fix; main contains it. Product src and public tag remain unchanged.
