# Playbook alignment and technical audit

Audit date: 2026-10-29. Source baseline: remote `main` at `69f315eb427ed025d13cb6ff140d882e6cd1cea9`; initially clean, no unpublished main commits. Runtime: Linux x64, Node 22.23.2, npm 10.9.8, TypeScript 7.0.2, official Stellar SDK 17.4.0. This is an implementation-assisted audit, not independent security certification.

## Reference and decision boundary

The requested reference is **Stellar Project Approval Playbook v2.0.0**. Its authoritative text/file/link was not supplied or located. The available older Wave Builder prompt and unrelated Rust Build v2 document are not substituted for that version. A request for the exact reference is pending. The requirement matrix below assesses the maintainer's detailed audit instructions and actual repository evidence, not unseen v2 clauses.

**NOT READY FOR MAINTAINER REVIEW as a completed v2.0.0 compliance assessment.** The scoped documentation corrections can be inspected in the draft PR, but the named reference must be supplied and checked before claiming the requested full alignment. This is an audit-input blocker, not evidence that the existing experimental CLI has a policy defect. A failed fresh Core startup and known output-stream failure are separately disclosed below; neither is hidden behind historical green results.

No new release/npm artifact, docs deployment, funding submission, issue mutation, reviewer recruitment, branch-protection change or merge was performed. The current experimental release remains v0.1.1. The maintainer controls any later approval, issue changes or publication.

## Findings

### A: Blocker

**A1. Exact playbook reference unavailable.** The version/title is named but its content cannot be verified. Supply the authoritative v2.0.0 source and assess any additional applicable requirements. This blocks closing the full requested compliance audit, not ordinary use of the unchanged source release. Do not silently replace the reference with the older historical checklist.

### B: Stale/cosmetic records corrected

- Conflicting current release and branch-protection prose: RELEASE now identifies v0.1.1 and all seven live required contexts, while preserving the initial unprotected/v0.1.0 history.
- PLAN/TODO/Wave map duplicated full delivery reports: PLAN now owns decisions/history, TODO unfinished actions, the older map only historical applicability, and the evidence index observations.
- Completed #2/#3 were repeated with their original missing-work problem statements: the contributor entry now shows actual closed state and evidence, retaining original task history on GitHub.
- Current-sounding submission/video/program wording: original submitted text is preserved, surrounding prose is date-labeled and later docs/video artifacts are not retroactively added to the form.
- Unpinned semantic references and ambiguous source-unchanged statements: SPEC links exact Core/CAP revisions; release text distinguishes unchanged predicate/policy source from the 0.1.1 CLI-version change.

These corrections do not alter policy meaning, exports, exit selection or supported features.

### C: Known limitations and unresolved observations

**C1. Fresh Core startup did not reach comparisons.** Running the existing `npm run test:core` from an isolated temporary copy of baseline exited 1 after 304.39 seconds: `Local RPC startup timed out: RPC catching up` at [integration/client.mjs:30](../integration/client.mjs). The pinned image/Docker/loopback requirements were checked first. No boundary or execution-control outcome was obtained. The owned container was removed, and the original dataset's hash is unchanged. The historical 30 comparisons/five controls remain dated 2026-10-28; they are not a passing rerun today. Exact catch-up cause is not established. Investigate Core/RPC sequence/ingestion diagnostics before proposing a bounded bootstrap correction; never weaken network identity or ledger-time assertions to make it pass. A correction needs bounded catch-up/timeout regression coverage and a successful isolated 30-comparison/five-control run. Not a shipped runtime dependency, but renewed Core-verification claims require a successful run.

**C2. Historical resource revision is insufficient alone.** Both saved resource records declare `b91520441f62bc211e0d078f494746fe0ec1e277`, but the recorded `checks/resources/run.mjs` hash differs from that Git revision. All recorded source hashes match content at later commit `ad0443575e3b0e57406a150201e23905721c8061`; that is a reconstruction of matching file content, not proof that later commit was the run's HEAD. Keep original records and their hashes; future provenance should explicitly state worktree changes or freeze the exact source snapshot. The fresh baseline resource run passed and writes only ignored output.

**C3. Finite scope.** No independent review, usefulness sessions, exhaustive hostile-SDK-parser audit, all-platform verification or current organizer decision is established. The library accepts ordinary parsed JSON, not arbitrary hostile JavaScript proxies/getters. Resource watchdog limits apply to the development runner, not automatically to installed analysis. Local standalone Core is not public Testnet or mainnet execution.

### D: Important pre-submission corrections

Architecture, the central evidence index, current-facing status ownership and explicit excluded-issue guidance are corrected in this branch. Do not claim a fresh fully passing Core comparison, full v2.0.0 compliance or an organizer decision without the missing evidence. The published issue #23 still needs a maintainer decision before any closure/substantial rewrite; this audit does not perform it. These are separate from the immutable original submission record.

### E: Non-blocking backlog

**E1. Confirmed closed-output-pipe failure, existing #13.** [src/cli.ts:86](../src/cli.ts) writes to stdout without a stream-error boundary; asynchronous EPIPE is outside the surrounding catch. Reproduction uses Node to spawn `dist/cli.js check examples/handover.xdr --policy examples/policy.json`, immediately destroys the parent's child-stdout stream and captures child stderr. Observed exit 1, EPIPE and an unhandled error event; ordinary successful analysis is not the trigger. Impact is broken output-delivery handling/exit interpretation, not a predicate false pass or signing exposure. A minimal separately reviewed fix should handle output stream errors once, terminate with the issue's agreed exit 2 and avoid writing recursively to a broken stream. Required regression: bounded parent/child early-close and normal complete-consumption cases across relevant platforms. No runtime fix or public behavior change is included here.

Other useful unfinished work remains in the [issue-by-issue contributor audit](CONTRIBUTOR-START-HERE.md). CI consumer recipes, report diffs, offline Core replay, saved-corpus auditing, integrity manifests, type-consumer checks and version consistency are not already implemented by similarly named historical evidence. They remain proposed work; no new issues were created. PR #27 is open for #14 and is not treated as accepted or merged.

## Requirement assessment

PASS means the inspected requirement is satisfied within the stated scope; PARTIAL discloses unavailable evidence or unfinished verification. NOT APPLICABLE is product-specific. This is not a certificate for unseen reference text.

| Requirement | Result | Actual evidence / finding | Required action | Blocks existing experimental release? |
| --- | --- | --- | --- | --- |
| Exact v2.0.0 reference comparison | PARTIAL | Reference unavailable; older prompts are not substituted | Supply source and finish actual clause mapping | Blocks full audit assertion, not the unchanged CLI artifact |
| Current remote/source baseline | PASS | Fetched main at `69f315e`; current issues, open PR #27, tags/workflows/protection inspected | Recheck if main changes before review | No |
| Authoritative implementation architecture | PASS | [architecture.md](architecture.md), actual seven src modules and entry exports | Maintainer review | No |
| Claim-to-evidence ledger | PASS | [index](../evidence/index.md), dated datasets/CI/source references | Preserve explicit historical limits | No |
| Current status and historical integrity | PASS | README/PLAN/TODO/RELEASE ownership; unchanged original submitted text | Keep owners distinct | No |
| Offline runtime and fail-closed validation | PASS | Source inspection, 35 baseline tests, malformed/resource cases | No semantic change proposed | No |
| Exact predicate/policy behavior | PASS | Bigint interval tests and pinned Core source hash comparison | Preserve finite evidence qualification | No |
| Runtime private keys/signing/network boundary | PASS | No runtime path in src; harness imports separate; package exclusions checked | Caller must respect ordinary-JSON boundary | No |
| Fresh local Core comparisons | PARTIAL | Bootstrap failed before any comparison; historical pass retained | Diagnose/reverify before renewed claim | No product-runtime block; no fresh Core-pass claim |
| Resource verification and provenance | PARTIAL | Current corpus passes; old sourceRevision/hash mismatch disclosed | Retain datasets; improve future snapshot provenance | No |
| Native and installed package evidence | PASS | Exact saved native run, current baseline CI, local installed CLI/ESM checks | Other OS/architectures remain unverified | No |
| Security review and dependency scanning | PASS within scoped review | Source/workflow/package inspection; zero known advisories in both scans | Not independent audit; known #13 remains disclosed | No |
| Protected PR workflow | PASS | Seven exact contexts, Actions app 15368, admins/strict checks, no force/deletion | Do not weaken; maintainer merges | No |
| Current contributor opportunities | PASS | All #1–#3/#6–#25 audited; #14 in review; #23 unavailable | Maintainer decides recommended issue changes | No |
| Docs integration and presentation | PASS locally | Existing style, added architecture/evidence links, local build/navigation checks | Publication requires explicit authorization | No |
| Source releases and tag integrity | PASS historical | v0.1.1 `569fca3`, v0.1.0 `76423af`; saved install verification | No release created by this audit | No |
| Original application and current approval | PARTIAL | Submission record exists; last private observation Pending review | Await actual decision; no submission change | No approval claim permitted |
| Independent audit/usefulness sessions | PARTIAL, optional | No completed assessment/session evidence | No recruitment requested | No |
| Automated dependency updates | EXPLICIT MAINTAINER EXCLUSION | **Do not implement Dependabot or another update bot.** No config/service introduced; #23 recommendation documented | Maintainer may authorize closure, not bot implementation | No |
| Soroban contracts/live Testnet contract deployment | NOT APPLICABLE | Product analyzes native predicates locally | Do not add a contract or invent addresses | No |
| Hosted API/app/database/indexer/dashboard/wallet/user accounts | NOT APPLICABLE | No remote/persistent product flow; static reference only | No speculative infrastructure | No |
| Cross-repository parity | NOT APPLICABLE | One CLI/library repository; no separate contract/app repos | No artificial split | No |

## Verification and useful additions retained

All existing source, tests, fixture generators, local Core network/cases/controls/results, bounded resource corpus/results, native/package checks, compatibility/session guides, static site and versioned CLI/JSON behavior are retained. Their purpose and test/limitation links are in architecture and evidence index; none was removed because a generic playbook omitted it.

Baseline before edits: `npm ci --ignore-scripts`, `npm run check` (35 tests), `npm run demo` (0/1/2), `npm run verify:package`, `npm pack --dry-run`, `npm run docs:build`, full and production-only npm audit (zero known vulnerabilities), `npm run test:resources` (55/123) and `git diff --check` passed. The separately isolated Core rerun failed as described above.

Final verification results after scoped edits: Product source, tests, dependencies, fixtures, harnesses, datasets and workflow files remain unchanged from the inspected baseline. Only site reference-link/date text changes outside Markdown/instructions; no parser/UI framework/runtime dependency was added.


| Command / check | Final result |
| --- | --- |
| `npm run build` | PASS (exit 0) |
| `npm run check` | PASS (exit 0); strict typecheck, 35 tests passed, none skipped |
| `npm run demo` | PASS (exit 0); observed expected exits 0/1/2 |
| `npm run verify:package` | PASS (exit 0); installed command/ESM, spaces/Unicode, development exclusions |
| `npm pack --dry-run` | PASS (exit 0) |
| `node scripts/generate-examples.mjs` | PASS (exit 0) |
| `node scripts/generate-payout.mjs` | PASS (exit 0) |
| `git diff --exit-code -- examples` | PASS (exit 0); deterministic fixtures unchanged |
| `npm run docs:build` | PASS (exit 0) |
| `npm run test:resources` | PASS (exit 0); 55 fixtures/123 checks, 123.74 s |
| `npm audit --json` | PASS (exit 0); zero known vulnerabilities |
| `npm audit --omit=dev --json` | PASS (exit 0); zero known vulnerabilities |
| `git diff --check` | PASS (exit 0) |
| Local Core rerun | FAILED before comparisons: RPC startup timeout; not rerun or counted as passing |

Baseline CI at the exact reviewed main passed: [Ubuntu 40859321944](https://github.com/claimplan/claimplan/actions/runs/40859321944), [native 40859322047](https://github.com/claimplan/claimplan/actions/runs/40859322047), [docs 40859322068](https://github.com/claimplan/claimplan/actions/runs/40859322068). Inspect the [audit-branch runs](https://github.com/claimplan/claimplan/actions?query=branch%3Adocs%2Fplaybook-alignment-audit) and PR check rollup for later branch CI; this document does not infer that a not-yet-run check passed.

All eight existing public docs pages returned HTTP 200 on 2026-10-29. Local browser checks of introduction/verification at 390px and 1365px found the new evidence links, no document overflow or page errors, and a working keyboard skip-to-main link. This is limited navigation verification, not a full accessibility audit. New architecture/evidence main-branch URLs in proposed site links become available only after maintainer merge; site publication is not performed here.

## Maintainer actions

1. Provide the actual v2.0.0 reference so the compliance audit can be completed; do not treat the draft as full signoff.
2. Review findings, local verification and required PR checks; keep the PR unmerged until satisfied.
3. Decide separately on #23 closure/scope and any #13 or Core-bootstrap implementation. No published issue was edited by this audit.
4. Authorize any later docs publication explicitly. The existing workflow deploys after main pushes; merging this PR would trigger that path. No such deployment was dispatched from the audit branch.

## Follow-up outcomes (2026-10-30)

These are later, dated results against the audit's own open items. The 2026-10-29 findings above are preserved unchanged; nothing here re-runs the full audit or supplies the still-missing v2.0.0 reference text (A1 remains open).

- **C1 fresh Core startup: superseded as the current observation.** The same harness rerun on 2026-10-30 from an isolated copy of `main` at `4dc7088` reached and passed all 30 boundary comparisons and five execution controls on the pinned image digest, Core/RPC v30.0.0, protocol 28 and SDK 17.4.0 ([saved evidence](../checks/core/results-2026-10-30.json)). The 2026-10-29 `RPC catching up` timeout therefore is not reproducible on this host under the existing bounded bootstrap, and no timeout, ledger-time or boundary assertion was widened to obtain the pass. The exact cause of the earlier failure is still undiagnosed, so the requested bounded catch-up diagnostics and regression coverage remain open work; the historical `integration/core-results.json` was left untouched.
- **E1 / issue #13 output-stream failure: fixed, tested and released.** The minimal fix landed at `2454ed7`, merged as pull request #30 (`f7db8e2`) after all seven required contexts passed on Ubuntu, macOS 15 and Windows Server 2025, and was released in [v0.1.2](https://github.com/claimplan/claimplan/releases/tag/v0.1.2). Four new cross-platform tests cover complete delivery above the 64 KiB pipe buffer, first-chunk close, close-before-write and a closed stderr; the suite is now 40 tests. `v0.1.0` and `v0.1.1` keep the original crash.
- **Releases: v0.1.2 is the current experimental source-only prerelease** at `d0353e153b7f0246f737ec55401bccdd5937e32a`, published after a fresh public-tag clone passed install, strict typecheck with 40 tests, demo, `verify:package` and `docs:build` ([record](../checks/release/results-v0.1.2.json)). The documentation workflow on `main` redeployed the static site from that commit; the live verification and reference pages now state the delivered-output contract and 40 tests.
- **Drips organizer decision: still unknown.** The 2026-10-30 recheck could not add evidence: the maintainer route redirected to sign-in (which rendered a server error page) and the public program page exposes only aggregate counts, not a per-repository list. Sign-in is a user-only action and was not attempted, so the last authenticated observation remains 2026-10-28 "Pending review".
- **Unchanged audit constraints.** Independent review/usefulness sessions (C3) remain unperformed, npm publication and any hosted/contract deployment remain absent, and the Dependabot exclusion stands. The issue #23 decision was not taken by this work.
