# ClaimPlan architecture

ClaimPlan is an experimental offline TypeScript CLI and ESM library for authors and reviewers of Stellar claimable-balance payout plans. It checks whether transaction claimant predicates agree with a separately declared beneficiary/recovery policy before submission. It does not create an execution guarantee or submit the transaction.

Native claimable balances make eligibility conditional on a claimant's address and predicate. Individually plausible predicates can combine into an overlap, gap or unreachable role. ClaimPlan models those windows across every create operation, conditional on the balance still being unclaimed.

[Specification](SPEC.md) owns exact semantics; [compatibility](COMPATIBILITY.md) owns supported interfaces; the [verification records](CORE-VERIFICATION.md) distinguishes observed results from limitations. This document describes the implementation, not proposed contributor features.

## Runtime flow

```text
CLI: transaction file + policy file
       |
       +-- bounded regular-file read / fatal UTF-8 decoding
       +-- JSON.parse(policy text)
       |
       v
ESM: analyzeEnvelope(envelope string, already-parsed policy value)
       |
       +-- parsePolicy: shape, roles, exact integer strings, limits
       +-- decodeEnvelope: official SDK XDR decode / canonical round-trip
       |       +-- v0, v1 or fee-bump inner transaction
       |       +-- create operations with original operation indices
       |       +-- other operation indices retained as outside scope
       +-- require exact policy-to-create-operation coverage
       +-- missing/out-of-bounds creation assumption -> inconclusive report
       +-- predicateIntervals -> intersect with post-creation domain
       +-- role coverage, gaps, overlaps and warning/error findings
       |
       v
Deterministic Report object
       +-- library caller receives Report (or InputError for invalid input)
       +-- CLI serializes text / JSON and selects exit 0, 1 or 2
```

The CLI reads both files concurrently, parses JSON and calls the same analysis function used by library consumers. Policy validation precedes envelope decoding inside that function. An inconclusive early return can have no checked operation summaries even though the envelope was decoded.

## Modules and boundaries

Only `analyzeEnvelope`, `InputError`, and the `Report`, `Finding`, `JsonInterval` types are exported from the public package entry. Other exports below are internal module interfaces, not additional supported package APIs.

| Module | Responsibility and interfaces | Inputs, outputs and dependencies | Errors and tests |
| --- | --- | --- | --- |
| [src/index.ts](../src/index.ts) | Public ESM/type re-exports | Exposes analysis and public report/error types | Installed-name ESM import in [package verification](../scripts/verify-package.mjs) |
| [src/cli.ts](../src/cli.ts) | Arguments, bounded files, text/JSON presentation, exit selection | Local files to `analyzeEnvelope`; Node fs/util; no RPC | Argument/file/JSON failures become exit 2; known output-stream limitation is recorded in [issue #13](https://github.com/claimplan/claimplan/issues/13). [CLI tests](../tests/cli.test.mjs) |
| [src/policy.ts](../src/policy.ts) | `parsePolicy`; validation helpers `object`, `keys`, `decimal`, `address`, `operationIndex` | Unknown ordinary JSON data to internal `Policy`; SDK StrKey and bigint limits | Invalid shapes/keys/roles/ranges throw `InputError`. [Policy tests](../tests/policy.test.mjs) |
| [src/decode.ts](../src/decode.ts) | `decodeEnvelope`, `MAX_INPUT_BYTES`; validates create operations and predicate tree | Base64 envelope string to internal `DecodedPlan`; SDK xdr, Asset and StrKey | Unsupported/malformed/noncanonical input throws sanitized `InputError`. [Analyzer/decoder tests](../tests/analyze.test.mjs), [resource corpus](../checks/resources/corpus.mjs) |
| [src/intervals.ts](../src/intervals.ts) | `predicateIntervals`, `union`, `intersect`, `complement` | Validated internal predicates and bigint creation time to exact intervals | Assumes validated input from decoder/analyzer; not a public untrusted-input entrypoint. [Interval tests](../tests/intervals.test.mjs) |
| [src/analyze.ts](../src/analyze.ts) | `analyzeEnvelope`; whole-plan matching and findings | Validated policy + decoded operations to `Report`; composes policy/decoder/interval modules | Invalid input throws; missing assumptions return inconclusive; proven policy violations return fail. [Analyzer tests](../tests/analyze.test.mjs) |
| [src/types.ts](../src/types.ts) | `InputError`, integer limits and internal/public data types | Shared types, `INT64_MAX`, `TIME_END`; no I/O | Typechecked by the strict [compiler configuration](../tsconfig.json); runtime boundaries tested through callers |

`npm run build` compiles `src/` into `dist/` with declarations. [package.json](../package.json) exposes `dist/index.js` and `dist/index.d.ts`, and installs the `dist/cli.js` command. Its explicit file list excludes integration, resource tooling, static-site source and browser/recording tools from the packed product. GitHub source archives include development sources; they are a different artifact from the npm tarball.

## Policy model

Policy `version: 1` and report `rulesVersion: "1"` identify the current rules. The package remains pre-release; upgrades must be reviewed against the compatibility contract.

- Each create operation requires exactly one policy matched by its original zero-based transaction index. Fee-bump policies use inner indices. Extra, duplicate or missing matches are invalid input.
- A beneficiary is mandatory. Recovery and a positive `handoverAfter` are supplied together, and recovery must be a different valid G-address.
- Creation time is an explicit assumed creation-ledger Unix second, never a workstation-clock guess. Its absence, or a value outside decoded transaction time bounds, yields inconclusive rather than pass. Other transaction preconditions are not established by the analysis.
- With recovery, handover is `creationTime + handoverAfter`. Beneficiary eligibility must cover `[creation, handover)` and recovery `[handover, TIME_END)`. Without recovery the beneficiary must cover the whole post-creation domain.
- `exclusive` controls whether overlaps between any distinct claimant pair are errors or warnings. `continuousCoverage` similarly controls uncovered intervals. Neither flag waives the required role windows.
- Unknown keys, invalid addresses, invalid integer forms/ranges and inconsistent role fields fail validation. All role/predicate checks use exact values.

Beneficiary/recovery roles and these coverage requirements are ClaimPlan application policy, not extra Stellar protocol requirements. No independent expected business amount or asset budget is compared in policy v1.

## Predicate model

Supported predicates are unconditional, before absolute time, before relative time, NOT, binary AND and binary OR. The decoder enforces nonnegative signed-64-bit predicate times, depth at most four counting the root as one, exactly two AND/OR children and a non-null NOT child. Create operations have positive signed-64-bit amounts and one to ten distinct claimant destinations; transactions have one to 100 operations.

The interval engine uses bigint throughout. Absolute `before(T)` produces `[0,T)`, with equality excluded. Relative thresholds resolve to `min(creation + duration, INT64_MAX)`, following the pinned Core conversion. NOT takes the complement, AND intersects and OR unions. The analyzer clips results to `[creation,TIME_END)`, where `TIME_END = 2^64` is an exclusive mathematical sentinel, not a valid ledger timestamp.

Unioned claimant windows expose gaps; pairwise intersections expose overlaps; an empty claimant window produces an unreachable warning. Empty coverage for all claimants is an error. Role-window differences identify exactly which required intervals are missing. See the [pinned source comparison](SEMANTIC-REVIEW.md) and specification for boundary evidence and limits.

## Trust and security

XDR and policy data are untrusted. The CLI accepts regular UTF-8 files up to 1 MiB each, checks sizes while reading, and rejects directories/FIFOs. The envelope API independently caps UTF-8 input bytes at 1 MiB. Surrounding base64 whitespace is trimmed; internal whitespace, noncanonical padding, trailing XDR and malformed structures are rejected. Official SDK decoding is followed by round-trip and semantic validation; using an SDK does not constitute a parser security audit.

The library policy is already-parsed ordinary JSON. It has operation/range limits but no serialized-byte limit. Callers must bound requests before parsing and isolate arbitrary JavaScript objects/getters/proxies. The resource harness's process budgets are development controls, not limits automatically applied by the installed product.

Runtime analysis has no private-key access, signing, submission, wallet/account custody, telemetry, remote API or current-clock lookup. Dependency installation can use the registry; that is separate from offline analysis. Normal JSON reports have deterministic ordering and exact decimal strings; CLI text is presentation rather than a machine contract. Input failures have an error object instead of a normal findings report.

A pass can contain warnings, and mixed-operation transactions remain `partial-transaction` even if their predicate policy passes. Reports do not prove signatures, account existence, trustline capacity, issuer authorization/clawback behavior, reserves, funding, fees, actual ledger close time, network acceptance or successful execution. Claiming consumes a balance; eligibility windows assume it has not already been consumed. Signed envelopes can be decoded, but signatures are neither verified nor used by the policy model. The included fixtures are unsigned and synthetic.

## Development verification, separate from the product

The [local Core harness](CORE-VERIFICATION.md) is not imported by `src/index.ts` or `src/cli.ts` and is excluded from packed distribution. [integration/network.mjs](../integration/network.mjs) creates one UUID-named Docker container from a pinned image, with dynamic IPv4-loopback RPC/Core bindings and no user-provided keys/endpoints. [integration/safety.mjs](../integration/safety.mjs) rejects remote/credentialed/redirect-style endpoints and checks standalone passphrase/protocol identity.

[integration/client.mjs](../integration/client.mjs) checks both Core and RPC identities before deriving the well-known standalone genesis key and rechecks before each synthetic transaction is signed. Random accounts and assets exist only in that isolated network. Manual closes require exact transaction-ledger timestamps. [integration/run.mjs](../integration/run.mjs), [cases](../integration/cases.mjs) and [controls](../integration/controls.mjs) compare selected predicate outcomes and five non-predicate execution failures. Normal completion/failure removes only the owned container; hard termination or daemon failure may need manual owned-container recovery, never a global prune.

This is local standalone execution, not public Stellar Testnet/mainnet verification. SDK fixture builders naming `Networks.TESTNET` do not contact or execute on Testnet. The shipped analyzer does not sign merely because development tooling does.

## Tests, evidence and static documentation

- `npm run check`: strict typecheck and [offline tests](../tests), including a separate Boolean evaluator for 1,000 seeded predicate trees, SDK-built/malformed XDR, policy/CLI behavior and harness safety guards. The evaluator is maintained in this repository, not an independent reviewer.
- [Core results](../integration/core-results.json), [resource records](RESOURCE-VERIFICATION.md), [native records](NATIVE-VERIFICATION.md) and [release checks](RELEASE.md) each state tested versions and finite coverage. Historical results do not automatically certify later commits.
- [CI](../.github/workflows/ci.yml) runs Ubuntu Node 22/24 checks; [native CI](../.github/workflows/native.yml) runs recorded macOS/Windows families; [documentation CI](../.github/workflows/docs.yml) builds static output. Current required check names and audit outcomes are recorded in [release procedure](RELEASE.md).
- [scripts/build-docs.mjs](../scripts/build-docs.mjs) combines static content from [site/pages.mjs](../site/pages.mjs) with actual analyzer examples and a recorded demo. It writes ignored `artifacts/site/`, validates local destinations and supplies the GitHub Pages artifact. It is not a runtime frontend, analysis service or upload endpoint. Publishing requires separate authorization.

## Intentional exclusions

ClaimPlan reads files and returns a report. Native Stellar predicates already exist, so it needs no Soroban contract or deployed contract address. There is no persistent application state, indexing workload, user account, wallet session or remote analysis request to justify a database, indexer, hosted API, dashboard or user-management service. Signing/submission belongs to the caller's separate tooling. Static reference hosting does not change these product boundaries.
