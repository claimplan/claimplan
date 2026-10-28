# Compatibility and support

## v0.1 candidate contract

This is a pre-release contract, pending developer feedback. Policy `version: 1` and report `rulesVersion: "1"` describe the current rules, not a promise that all future v0.x releases are drop-in replacements. Release notes must identify changes to policy meaning, required fields, report structure, finding codes and exit behavior. Pin a source commit or exact package version in automated consumers and review upgrades.

| Surface | Current behavior |
| --- | --- |
| CLI | `check <xdr-file> --policy <json-file> [--json]`; `--help`, `--version` |
| Exit 0 | Completed analysis without errors; warnings may remain |
| Exit 1 | Proven predicate/policy violations |
| Exit 2 | Invalid/unsupported input or inconclusive analysis |
| ESM library | `analyzeEnvelope(envelope, policyInput)` returns `Report`; invalid input throws `InputError` |
| Type exports | `Report`, `Finding`, `JsonInterval` |
| JSON | Decimal strings for exact time/amount fields; half-open intervals; deterministic ordering; no wall-clock timestamps |
| Errors | JSON `error` object for invalid CLI input; normal `findings` for completed analyses |

Consumers should branch on status, severity and finding codes, rather than matching English prose. Human messages may improve without a rules-version change. Warning-only reports can pass. A partially analyzed transaction is explicitly marked, and remains partial even if its predicate checks pass. See [SPEC.md](SPEC.md) for schema and semantics.

## Runtime/platform evidence

Requires Node >=22.12.0 and ESM. Local checks use Node 22.23.2 on Linux; GitHub CI is configured for Node 22 and 24 on Ubuntu. Treat a specific CI run as evidence only once it succeeds. Native Windows, macOS, alternative JS runtimes, browsers and CommonJS have not been verified. The FIFO regression is POSIX-specific and skipped on Windows. No cross-platform support claim is inferred from TypeScript compilation.

SDK 17.4.0 is pinned. Local integration evidence covers Core/RPC v30.0.0, protocol 28 and the image digest in `integration/network.json`; other combinations are unverified. The local Core harness requires Docker and is not part of CLI installation.

## Input and resource boundaries

The CLI accepts regular UTF-8 files of at most 1 MiB each and rejects FIFOs/directories. The envelope decoder also caps its input at 1 MiB. It requires canonical base64/XDR, 1–100 operations, 1–10 unique claimants per create operation and predicate depth at most four. Every create operation needs exactly one matching policy; unsupported/malformed evidence cannot pass.

The library's policy input is an already-parsed object, so it has no file-byte limit. The supported data boundary is ordinary JSON data; callers must bound serialized requests before parsing and isolate hostile application code/proxies. Policy operations are limited to 100. Exact integer strings are limited in length and range. No throughput or memory-service-level guarantee has been measured. The tool is a local analyzer, not a hardened multi-tenant service.

## Distribution

Source installation is currently available. No npm package is published. The candidate release path is source-only; npm ownership and publication remain a separate decision. Developer examples and fixture generators live in the source checkout. `npm run verify:package` builds, packs and installs into an isolated temporary consumer with lifecycle scripts disabled, verifies installed CLI exits and imports the ESM API, then removes only its own temporary directory. Installation may fetch dependencies and registry metadata even after `npm ci`; the installed analyzer runs offline. For an explicitly warmed metadata/tarball cache, run `node scripts/verify-package.mjs --offline` after building. A cache populated solely by `npm ci` is insufficient for that optional mode.
