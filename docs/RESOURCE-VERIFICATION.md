# Maximum-plan and malformed-input verification

On 2026-10-28, **55 deterministic fixtures and 123 bounded library/CLI checks passed on each of Node 22.23.2 and Node 24.21.0** (246 checks total), Linux/x64, SDK 17.4.0. No analyzer defect, uncontrolled crash, timeout, output-budget breach or memory-budget breach was observed in the completed input corpus. Product source is unchanged from published v0.1.0 commit `76423af`; this adds development verification rather than a protocol change or installed runtime sandbox.

Saved observations for [Node 22](../checks/resources/results.json) and [Node 24](../checks/resources/results-node24.json) contain per-run outcomes, wall/CPU time, peak RSS, report/input hashes, guard probes, environment and source hashes. Corpus and report-byte hashes matched across both runtimes. `sourceRevision` identifies the Git base of the measured working tree; `sourceHashes` identifies actual tested analyzer/harness content. These are not an independent audit, exhaustive fuzzing, mainnet execution or service-level guarantees.

## Reproduce

Requires the source checkout, Node >=22.12.0, installed dependencies, Linux, GNU `/usr/bin/time`, and `prlimit` from util-linux. The dedicated suite fails explicitly on unsupported platforms. No Docker, network requests, credentials, funding, signing or submission are used after dependency installation.

```sh
npm ci --ignore-scripts
npm run test:resources
```

Default observations go to ignored `artifacts/resource-results.json`. Run under the desired Node executable; children use that same `process.execPath`. To deliberately refresh the checked-in evidence after reviewing a run:

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
| V8 old space | 128 MiB; semi-space 4 MiB |
| CPU | Five seconds per child |
| Wall time | 15 seconds; parent kills the owned process group |
| Combined stdout/stderr | 16 MiB; excess kills the owned group |
| Resident memory | 256 MiB watchdog, sampled every 20 ms; exceeding it kills the owned group |
| Peak RSS check | At most 256 MiB, independently asserted after exit |
| Core dumps | Disabled |

These controls apply to the development harness, not normal installed CLI execution. GNU time measures each fresh child, including Node/SDK startup, file I/O, analysis and report serialization. OS page-cache state and other host workloads are not controlled. Wall time includes scheduling delays; CPU time is recorded separately. GNU time forks the measured process from its small launcher, avoiding inherited parent-process RSS peaks dominating the observation. The parent samples the measured child through Linux `/proc`, while GNU time supplies the independent post-exit peak RSS check. Sampling can miss brief peaks or allow a brief overshoot before termination; it is not a hard cgroup RSS ceiling. The kernel address-space cap remains an absolute virtual-memory bound, alongside the V8 heap cap. `--disable-wasm-trap-handler` is part of the recorded invocation.

Separate guard probes deliberately exceed time, output and RSS budgets, and must be terminated for the corresponding reason. The RSS probe holds a 300 MiB external buffer; its observed RSS must exceed the threshold before the watchdog kills it. These probes are separate from the 123 analyzer-input checks. The hang probe writes a synchronous ready marker and starts its 400 ms activity timer after receipt; the unchanged 15-second outer deadline also bounds startup. Only spawned process groups and owned temporary directories are killed/removed.

Calibration was necessary rather than evidence of an analyzer defect:

1. A 1 GiB address-space cap aborted even the existing tiny Node 22 CLI example at roughly 81 MiB RSS; an asynchronous-file-read baseline reproduced it. A 2 GiB virtual-address cap accommodates that runtime setup.
2. Initial Node 24 CI attempts failed before analyzer cases. A 400 ms launch-to-ready assumption obscured the startup failure; an explicit ready handshake and child diagnostics separated startup from deliberate hanging. Matrix jobs now finish independently.
3. A SHA-256-verified official Node 24.21.0 binary reproduced `Failed to reserve virtual memory for CodeRange` under the 512 MiB `RLIMIT_DATA` cap, even with ample address space. The same baseline starts with the 2 GiB address-space cap alone at about 40 MiB RSS: a sparse writable JIT reservation was being counted as data. The final harness replaces the incompatible data cap with the tested live RSS watchdog and post-exit peak check. Address-space, heap, CPU, wall and output limits remain enforced. Both exact runtimes then passed all guard probes and all input cases locally.

Failed preliminary runs were not counted as successful input-corpus verification. The watchdog correction changes development supervision, not the analyzer's protocol/policy rules.

## Recorded observations

Host: Intel(R) Core(TM) i5-8265U CPU @ 1.60GHz; 8 logical CPUs; 7782 MiB total RAM; kernel 7.0.0-38-generic. Per-child maxima are observations, not throughput or worst-case guarantees.

| Runtime | Checks | Maximum wall ms | Maximum RSS MiB | Largest JSON bytes |
| --- | ---: | ---: | ---: | ---: |
| v22.23.2 | 123 | 2,051.57 | 99.82 | 3,053,746 |
| v24.21.0 | 123 | 6,192.98 | 98.53 | 3,053,746 |

Node 22 maximum-plan details:

| Fixture | Envelope bytes | Maximum wall ms | Maximum RSS MiB |
| --- | ---: | ---: | ---: |
| max-handover-v0 | 146,224 | 2,051.57 | 91.74 |
| max-handover-v1 | 146,252 | 612.31 | 91.71 |
| max-handover-feeBump | 146,328 | 634.08 | 91.19 |
| max-overlap-warning | 61,984 | 635.90 | 95.65 |
| max-overlap-error | 61,984 | 659.81 | 94.55 |
| max-depth-four-branching | 259,320 | 722.47 | 97.24 |
| max-fragmented-windows | 173,984 | 701.26 | 99.82 |
| exact-one-MiB-files | 1,048,576 | 621.40 | 96.68 |

These are one-host observations under explicit limits; they are not worst-case bounds for all malformed input, hardware or SDK versions.

Remaining work: independent semantic/security review, native macOS/Windows verification, and two actual developer usefulness sessions. Keep these separate from this completed local corpus. The public prerelease/tag is unchanged.

Method references: [Linux resource limits](https://man7.org/linux/man-pages/man2/getrlimit.2.html), [Node resource usage and KiB units](https://nodejs.org/docs/latest-v22.x/api/process.html#processresourceusage). See the installed GNU time `--help` for the `%M`, `%U` and `%S` fields used by the runner.
