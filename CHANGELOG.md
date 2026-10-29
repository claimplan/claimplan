# Changelog

## 0.1.1 — 2026-10-28 (experimental source-only)

- Added published static documentation and an actual CLI demo with a full text alternative. Documentation builds verify live analyzer examples and local destinations.
- Made separate reviewer recruitment optional and non-blocking; no review completion or audit is claimed.
- Added a repeatable issue batch utility and enforced PR/status-check protection on main.
- CLI version identifies 0.1.1; predicate and policy semantics are unchanged.

- Verified macOS 15 ARM64 and Windows Server 2025 x64 source/installed-command behavior on Node 22/24. Fixed the Windows development package-check helper by invoking npm-cli.js through Node and testing actual installed launchers under spaces/Unicode paths. Predicate/policy analysis source and the published v0.1.0 tag are unchanged; the CLI version text identifies 0.1.1.

- Added a development-only Linux resource corpus: 55 deterministic fixtures and 123 bounded CLI/library checks, covering maximum supported plan structures, fragmented windows, malformed XDR/JSON and exact file-size limits. CI runs it on Node 22/24; recorded measurements and limits are in `docs/RESOURCE-VERIFICATION.md`. The published v0.1.0 analyzer source is unchanged.

## 0.1.0 — 2026-10-28 (experimental prerelease)

Published as a [source-only GitHub prerelease](https://github.com/claimplan/claimplan/releases/tag/v0.1.0) at commit `76423af`. Public tag installation, strict typecheck/35 tests, demo and installed CLI/library checks passed. No npm package is published.

Initial experimental offline CLI and ESM library for whole-plan Stellar claimable-balance policy checks.

- Decode legacy v0, v1 and fee-bump envelopes through the pinned official SDK.
- Check beneficiary/recovery handovers, overlap, gaps and unreachable claimants using exact bigint intervals.
- Require explicit creation-time assumptions and exact policy coverage of create operations.
- Return deterministic JSON and CLI exits 0/1/2 for pass, fail and inconclusive/invalid input.
- Include unsigned single- and multi-recipient examples, a terminal demo and developer review guide.
- Keep signing and submission out of the product; the separately invoked local Core harness is excluded from the package.

Evidence: 35 offline tests, including 1,000 seeded predicate trees, and recorded local Core checks covering 30 boundary comparisons and five execution controls on Core/RPC v30.0.0, protocol 28. These are finite self-verification results, not an independent audit.

Known limits: no validation of signatures, real account state, trustlines, funding, actual creation times or claim execution. Two-developer usefulness validation remains pending. No npm publication, program acceptance or adoption is claimed. See `docs/COMPATIBILITY.md`, `docs/CORE-VERIFICATION.md` and `docs/TODO.md`.
