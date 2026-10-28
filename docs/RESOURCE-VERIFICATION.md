# Maximum-plan and malformed-input verification

On 2026-10-28, **55 deterministic fixtures and 123 bounded library/CLI checks passed** on v22.23.2, Linux/x64, SDK 17.4.0. No analyzer defect, uncontrolled crash, timeout, output-budget breach or memory-budget breach was observed in the completed corpus. Product source is unchanged from the published v0.1.0 commit `76423af`; this adds development verification rather than a new protocol rule or runtime sandbox.

The [saved observations](../checks/resources/results.json) contain per-run outcomes, wall/CPU time, peak RSS, report hashes, corpus hashes, environment and source hashes. `sourceRevision` identifies the Git base of the measured working tree; `sourceHashes` identifies the actual tested analyzer/harness files. These measurements are not an independent audit, exhaustive fuzzing, mainnet execution or a service-level guarantee.

## Reproduce

Requires the source checkout, Node >=22.12.0, installed dependencies, Linux, GNU `/usr/bin/time`, and `prlimit` from util-linux. The dedicated suite fails explicitly on unsupported platforms. No Docker, network requests, credentials, funding, signing or submission are used after dependency installation.

```sh
npm ci --ignore-scripts
npm run test:resources
```

Default observations go to ignored `artifacts/resource-results.json`. To deliberately refresh the checked-in evidence after reviewing a run:

```sh
npm run test:resources -- checks/resources/results.json
```

CI is configured to run the same suite on Ubuntu/Node 22 and 24. Do not infer native macOS/Windows coverage from that configuration. Results are written only after every assertion passes; a failure leaves any prior checked-in evidence intact and returns nonzero.

## Coverage and expected outcomes

- 100 create operations, each with ten unique claimant addresses, and exact coverage of all 100 operation indices. v0, v1 and fee-bump handovers pass, including exact beneficiary/recovery intervals; eight contradictory auxiliary claimants per operation produce 800 located warnings.
- Every claimant pair overlapping produces exactly 45 pair findings per operation: 4,500 total. Intentional overlap passes with warnings under the declared nonexclusive policy; exclusive policy fails. Every pair, location, severity and interval is checked.
- Fully branching depth-four predicates (15 nodes/eight time leaves per claimant) across all 1,000 claimants produce the independently expected intervals and 4,700 findings, including gaps/role violations at `INT64_MAX`. These far-future intervals are checked offline; no Core ledgers are scheduled there.
- Three eligible windows per claimant across all 1,000 claimants exercise fragmented intersections, exact pairwise intervals and two gaps/role-window violations per operation, with 4,700 findings and a larger report.
- Both files exactly 1 MiB pass when their content is valid; either file exceeding its CLI byte limit is rejected. The library's policy argument is already-parsed JSON, so the policy-file byte limit is tested at the CLI boundary rather than invented for the library.
- Oversized policy operation lists, huge decimal strings, 16,384-level JSON arrays, invalid UTF-8/JSON, duplicate/zero/eleven claimants, and 101-operation vectors fail closed at their appropriate boundaries.
- Unknown discriminants, enormous vector/text counts, null/noncanonical NOT pointers, malformed AND/OR vectors, negative times/amounts, truncated XDR, trailing bytes, internal base64 whitespace and noncanonical pad bits return controlled `InputError`/exit 2 results.
- NOT predicates encoded to depths 5, 2,048 and 90,000 are rejected. The pinned SDK decoder has its own recursion guard before ClaimPlan's depth-four semantic validation. This does not mean the analyzer recursively traverses all 90,000 levels.
- Eight seeded invalid union mutations use fixed seed `0x434c4149`. All malformed cases must produce controlled errors, not just any nonzero exit. Completed reports agree between API and CLI; eight maximum/boundary fixtures run twice per interface with byte-identical reports.

These are synthetic unsigned analysis inputs; this suite does not establish fees, funding, reserves, network acceptance or compliance with all ledger resource limits at once.

The fixture generator uses asserted offsets in one known synthetic v0 envelope to create invalid wire structures that an SDK builder would refuse. This byte construction is test-only; production decoding still uses the official SDK.

## Process boundaries and measurement

| Control | Test setting |
| --- | --- |
| Address space | 2 GiB, kernel `RLIMIT_AS` |
| Data allocations | 512 MiB, kernel `RLIMIT_DATA` |
| V8 old space | 128 MiB; semi-space 4 MiB |
| CPU | Five seconds per child |
| Wall time | 15 seconds; parent kills the owned process group |
| Combined stdout/stderr | 16 MiB; excess kills the owned group |
| Peak RSS check | At most 256 MiB, asserted after exit |
| Core dumps | Disabled |

These controls apply to the development harness, not to normal installed CLI execution. GNU time measures each cold child, including Node/SDK startup, file I/O, analysis and report serialization. Wall time includes scheduling delays; CPU time is recorded separately. GNU time forks the measured process from its small launcher, avoiding inherited parent-process RSS peaks dominating the observation. Peak RSS is an observation/assertion, not a live cgroup RSS ceiling. Kernel allocation/address-space limits and the V8 heap cap provide separate bounds. `--disable-wasm-trap-handler` is part of the recorded Node invocation.

The harness also verifies timeout and output-limit termination against deliberately misbehaving children. The hang probe writes a synchronous ready marker before entering its loop; its 400 ms activity timer starts only after that marker, while the unchanged 15-second outer deadline bounds startup. An initial Node 24 CI run failed a self-test that incorrectly included cold startup in the 400 ms window, before analyzer cases ran. The readiness handshake repairs that test assumption without widening analyzer-case budgets. CI matrix jobs finish independently so one failure does not cancel the other runtime. It kills only the process group it spawned and cleans only its own temporary directory.

An initial 1 GiB address-space setting aborted even the existing tiny CLI example at about 81 MiB RSS. An SDK-plus-asynchronous-file-read baseline reproduced that setup failure; the library's synchronous path worked. The calibrated 2 GiB address-space/512 MiB data limits allow both normal baselines and the full corpus. This was a harness resource-setting issue, not evidence of an analyzer defect; failed preliminary runs were not counted as passes.

## Recorded observations

Host: Intel(R) Core(TM) i5-8265U CPU @ 1.60GHz; 8 logical CPUs; 7782 MiB total RAM; kernel 7.0.0-38-generic. Per-child maxima are shown, not throughput or averages.

| Fixture | Envelope bytes | Maximum wall ms | Maximum RSS MiB |
| --- | ---: | ---: | ---: |
| max-handover-v0 | 146,224 | 4,591.74 | 92.10 |
| max-handover-v1 | 146,252 | 2,030.10 | 91.52 |
| max-handover-feeBump | 146,328 | 680.18 | 90.53 |
| max-overlap-warning | 61,984 | 659.03 | 95.59 |
| max-overlap-error | 61,984 | 641.45 | 94.70 |
| max-depth-four-branching | 259,320 | 983.34 | 98.99 |
| max-fragmented-windows | 173,984 | 1,275.02 | 99.52 |
| exact-one-MiB-files | 1,048,576 | 1,333.58 | 96.11 |

Across all 123 checks, the observed maximum wall time was **4,591.74 ms**, maximum RSS **99.52 MiB**, and largest JSON output **3,053,746 bytes**. These are results from one host/run under explicit limits; they are not worst-case bounds for all malformed input, hardware or SDK versions.

Remaining work: independent semantic/security review, native macOS/Windows verification, and two actual developer usefulness sessions. Keep these separate from this completed local corpus. The public prerelease/tag is unchanged.

Method references: [Linux resource limits](https://man7.org/linux/man-pages/man2/getrlimit.2.html), [Node resource usage and KiB units](https://nodejs.org/docs/latest-v22.x/api/process.html#processresourceusage). See the installed GNU time `--help` for the `%M`, `%U` and `%S` fields used by the runner.
