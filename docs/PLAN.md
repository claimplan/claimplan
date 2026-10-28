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
