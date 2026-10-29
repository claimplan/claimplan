# Playbook alignment and technical audit

Audit date: 2026-10-29. Source baseline: remote `main` at `69f315eb427ed025d13cb6ff140d882e6cd1cea9`; initially clean, no unpublished main commits. Runtime: Linux x64, Node 22.23.2, npm 10.9.8, TypeScript 7.0.2, official Stellar SDK 17.4.0. This is an implementation-assisted audit, not independent security certification.

## Assessment basis and readiness decision

The maintainer reviewed PR #28 and the applicable requirements, and explicitly directed this follow-up to use the supplied implementation/audit prompt and completed source-level review. The separate v2.0.0 reference is not a project blocker, a prerequisite for this decision or a request for further input. No claim is made that unavailable external text received a clause-by-clause comparison.

**READY FOR MAINTAINER REVIEW for the experimental offline project and scoped documentation corrections.** No actual project blocker was identified within the supplied requirements and reviewed source. ClaimPlan's offline architecture is valid; contract/hosted infrastructure remains not applicable and dependency-update bots remain an explicit maintainer exclusion. This is not a production-readiness certificate, independent audit, renewed Core verification or Drips approval.

The historical successful Core evidence, failed October 29 rerun, resource-provenance limits and open EPIPE follow-on work remain disclosed below. Incomplete or historical evidence limits the claims that can be made; it does not automatically block this experimental project.

PR #28 was subsequently merged by the maintainer at `7e5d6e5542f80f36e09c7cec88cfb85a207e3600`. This follow-up starts from that commit and remains for maintainer review; the agent does not merge it. No product behavior, new release/npm artifact, documentation deployment, funding submission, issue mutation or reviewer recruitment is authorized by this correction.

## Findings

### A: Actual project blockers

None identified within the supplied requirements and reviewed implementation. The former missing-reference finding is retired as a blocker by the maintainer's explicit assessment-basis decision. Evidence qualifications remain in category C; they are not silently converted into passing verification.

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

**C4. Assessment provenance.** The requirement matrix assesses the supplied prompt and completed source audit. It does not claim a separate external-document comparison. The maintainer explicitly accepts this assessment basis for experimental readiness; no further reference is requested.

### D: Important pre-submission corrections

Architecture, the central evidence index, current-facing status ownership and explicit excluded-issue guidance are corrected in this branch. Do not claim a fresh fully passing Core comparison, an independent clause-by-clause external-reference assessment or an organizer decision without the corresponding evidence. The published issue #23 still needs a maintainer decision before any closure/substantial rewrite; this audit does not perform it. These are separate from the immutable original submission record.

### E: Non-blocking backlog

**E1. Confirmed closed-output-pipe failure, existing #13.** [src/cli.ts:86](../src/cli.ts) writes to stdout without a stream-error boundary; asynchronous EPIPE is outside the surrounding catch. Reproduction uses Node to spawn `dist/cli.js check examples/handover.xdr --policy examples/policy.json`, immediately destroys the parent's child-stdout stream and captures child stderr. Observed exit 1, EPIPE and an unhandled error event; ordinary successful analysis is not the trigger. Impact is broken output-delivery handling/exit interpretation, not a predicate false pass or signing exposure. A minimal separately reviewed fix should handle output stream errors once, terminate with the issue's agreed exit 2 and avoid writing recursively to a broken stream. Required regression: bounded parent/child early-close and normal complete-consumption cases across relevant platforms. No runtime fix or public behavior change is included here.

Other useful unfinished work remains in the [issue-by-issue contributor audit](CONTRIBUTOR-START-HERE.md). CI consumer recipes, report diffs, offline Core replay, saved-corpus auditing, integrity manifests, type-consumer checks and version consistency are not already implemented by similarly named historical evidence. They remain proposed work; no new issues were created. At the original audit baseline PR #27 was open for #14. The maintainer subsequently merged it at `62c8635e4e42840a6227df04c3350d604e24376f`, adding the issued-asset example and one regression test; that later change does not alter the historical audit outcomes.

## Requirement assessment

PASS means the inspected requirement is satisfied within the stated scope; PARTIAL discloses unavailable evidence or unfinished verification. NOT APPLICABLE is product-specific. The assessment basis is the maintainer-supplied requirements and completed source review, not a certificate for unseen external text.

| Requirement | Result | Actual evidence / finding | Required action | Blocks existing experimental release? |
| --- | --- | --- | --- | --- |
| Maintainer-authorized assessment basis | PASS | Supplied requirements and completed source audit accepted by the maintainer; no separate reference requested | Apply the stated scope and exclusions | No |
| Independent comparison of external v2.0.0 text | PARTIAL, non-blocking evidence limit | Not claimed; no substitute document is represented as that reference | No additional reference required for this decision | No |
| Original audit source baseline | PASS | `69f315e` was inspected; later maintainer merges #27/#28 are distinguished from those results | Follow-up starts at `7e5d6e5`; preserve original dates/revisions | No |
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
| Contributor audit at original baseline | PASS | All #1–#3/#6–#25 audited; #14 was in review then, subsequently merged; #23 remains excluded | Maintainer decides any remaining issue changes | No |
| Docs integration and presentation | PASS locally | Existing style, added architecture/evidence links, local build/navigation checks | Publication requires explicit authorization | No |
| Source releases and tag integrity | PASS historical | v0.1.1 `569fca3`, v0.1.0 `76423af`; saved install verification | No release created by this audit | No |
| Original application and current approval | PARTIAL | Submission record exists; last private observation Pending review | Await actual decision; no submission change | No approval claim permitted |
| Independent audit/usefulness sessions | PARTIAL, optional | No completed assessment/session evidence | No recruitment requested | No |
| Automated dependency updates | EXPLICIT MAINTAINER EXCLUSION | **Do not implement Dependabot or another update bot.** No config/service introduced; #23 recommendation documented | Maintainer may authorize closure, not bot implementation | No |
| Soroban contracts/live Testnet contract deployment | NOT APPLICABLE | Product analyzes native predicates locally | Do not add a contract or invent addresses | No |
| Hosted API/app/database/indexer/dashboard/wallet/user accounts | NOT APPLICABLE | No remote/persistent product flow; static reference only | No speculative infrastructure | No |
| Cross-repository parity | NOT APPLICABLE | One CLI/library repository; no separate contract/app repos | No artificial split | No |

## Original audit verification and useful additions retained

All existing source, tests, fixture generators, local Core network/cases/controls/results, bounded resource corpus/results, native/package checks, compatibility/session guides, static site and versioned CLI/JSON behavior are retained. Their purpose and test/limitation links are in architecture and evidence index; none was removed because a generic playbook omitted it.

Baseline before edits: `npm ci --ignore-scripts`, `npm run check` (35 tests), `npm run demo` (0/1/2), `npm run verify:package`, `npm pack --dry-run`, `npm run docs:build`, full and production-only npm audit (zero known vulnerabilities), `npm run test:resources` (55/123) and `git diff --check` passed. The separately isolated Core rerun failed as described above.

Original PR #28 verification results after its scoped edits (before the later PR #27 merge): Product source, tests, dependencies, fixtures, harnesses, datasets and workflow files remain unchanged from the inspected baseline. Only site reference-link/date text changes outside Markdown/instructions; no parser/UI framework/runtime dependency was added.


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

## Readiness-correction follow-up

Starting point: current main `7e5d6e5542f80f36e09c7cec88cfb85a207e3600`, including the maintainer's merges of PRs #27 and #28. The runtime `src/`, package/lockfile and workflows remain identical to the original reviewed baseline. The merged issued-asset example adds one regression case, so the current local `npm run check` passes strict typechecking and 36 tests, with zero failures/skips. The earlier 35-test table remains a record of the original audit, not the current test count.

This correction changes documentation only. Historical Core/resource/native/release artifacts are unchanged. No Core rerun, EPIPE implementation, issue closure, release, deployment or merge is performed. Local link/source consistency and the seven exact required CI contexts are rechecked for the follow-up PR; its check rollup owns the current CI outcomes rather than replacing historical observations.

## Maintainer actions

1. Review this focused readiness correction and all seven required CI checks. The agent will not merge the follow-up PR.
2. Decide separately on #23 closure/scope and any #13 or Core-bootstrap implementation. EPIPE remains genuine open follow-on work; no fix or issue mutation is included.
3. Authorize any later docs publication explicitly. The existing workflow deploys after main pushes, so a maintainer merge must account for that path. This follow-up does not dispatch deployment or publish a release.
