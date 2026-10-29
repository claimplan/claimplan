# Start contributing to ClaimPlan

## Current opportunities and audit snapshot

Issue state checked on 2026-10-29 against main `69f315eb427ed025d13cb6ff140d882e6cd1cea9`. Proposed work in an open PR is not implemented functionality on main. This page owns current opportunities and recommendations; [backlog history](CONTRIBUTOR-BACKLOG.md) and GitHub retain original task descriptions.

Of the twenty published follow-on issues (#6–#25), nineteen remain compatible proposed improvements. #14 already has PR #27 in review; avoid a duplicate. #23 is excluded from implementation and recommended for maintainer closure, but its GitHub state/body have not been changed. Optional #1 is separate; #2/#3 are already closed. No task was closed or rewritten through this audit.

## Choose one bounded task

Read the linked issue, inspect current main and existing PRs, and comment with intended scope before duplicating work. Start with one issue rather than reserving a track. The original ten-track grouping is an organizing aid, not a promise of ten contributors, ownership or payment.

The published 2–6-hour estimates assume familiarity with Node/TypeScript and focused tests/docs; they are rough planning estimates, not deadlines. Package/platform/schema or CLI-interface work can exceed them. Raise a blocker or scope mismatch early instead of spending unbounded time. No useful task currently needs an unmerged prerequisite; coordination notes below identify shared surfaces.

| Issue / GitHub state | Audit classification | Source evidence and actual gap | Coordination / recommended action |
| --- | --- | --- | --- |
| [#1](https://github.com/claimplan/claimplan/issues/1) OPEN | KEEP | [docs/SEMANTIC-REVIEW.md](../docs/SEMANTIC-REVIEW.md): Optional review remains unperformed; the source packet is preparation, not an independent assessment. | No recruitment; only pursue if later requested. |
| [#2](https://github.com/claimplan/claimplan/issues/2) CLOSED | CLOSE AS COMPLETED (already closed) | [checks/resources/run.mjs](../checks/resources/run.mjs): Saved 55-fixture/123-check records, bounded runner and current passing local corpus establish the finite task outcome. | Keep closed; retain historical observations/limits. |
| [#3](https://github.com/claimplan/claimplan/issues/3) CLOSED | CLOSE AS COMPLETED (already closed) | [checks/native/results.json](../checks/native/results.json): Recorded four-job native run and current protected native CI cover the scoped platform task. | Keep closed; do not generalize to every OS/architecture. |
| [#6](https://github.com/claimplan/claimplan/issues/6) OPEN | KEEP | [src/policy.ts](../src/policy.ts): No policy schema file or editor contract exists; runtime parsePolicy remains the validation authority. | Schema work must distinguish structural checks from checksum/range/relationship validation. |
| [#7](https://github.com/claimplan/claimplan/issues/7) OPEN | KEEP | [src/types.ts](../src/types.ts): No report/error JSON Schema exists; current public types and generated examples are not schemas. | Coordinate additive error fields with #12; no implementation dependency. |
| [#8](https://github.com/claimplan/claimplan/issues/8) OPEN | KEEP | [src/index.ts](../src/index.ts): Public entry exports no raw PolicyInput type; internal parsed Policy uses bigint. | Additive public-type work needs its own reviewed PR; not part of this cleanup. |
| [#9](https://github.com/claimplan/claimplan/issues/9) OPEN | KEEP | [scripts/verify-package.mjs](../scripts/verify-package.mjs): Package smoke checks execute JS/ESM but do not compile an installed TypeScript consumer. | Start with existing type exports; cover #8 after it lands. |
| [#10](https://github.com/claimplan/claimplan/issues/10) OPEN | KEEP | [src/cli.ts](../src/cli.ts): Human pass output is a summary; no detailed operation/claimant-window option exists. | Coordinate renderer edits with #11; preserve default/JSON contracts. |
| [#11](https://github.com/claimplan/claimplan/issues/11) OPEN | KEEP | [src/cli.ts](../src/cli.ts): Human output has exact Unix seconds only; no opt-in UTC formatting exists. | Keep extreme integers/sentinel exact; display conversion must not enter analysis. |
| [#12](https://github.com/claimplan/claimplan/issues/12) OPEN | KEEP | [src/types.ts](../src/types.ts): InputError has only a message and all CLI input errors use INPUT_ERROR; structured detail fields are absent. | Coordinate schema metadata with #7; any interface change is a separate reviewed task. |
| [#13](https://github.com/claimplan/claimplan/issues/13) OPEN | UPDATE | [src/cli.ts](../src/cli.ts): Audit reproduced unhandled EPIPE and exit 1 when a Node parent closes the child stdout pipe. | Recommend adding this exact reproduction and failure location to the issue; published body/state unchanged. |
| [#14](https://github.com/claimplan/claimplan/issues/14) OPEN | KEEP (in review) | [tests/analyze.test.mjs](../tests/analyze.test.mjs): Main lacks the issued-asset walkthrough. Open PR #27 proposes it but is not merged or independently accepted here. | Review PR #27 against the issue; do not start a duplicate implementation. |
| [#15](https://github.com/claimplan/claimplan/issues/15) OPEN | KEEP | [tests/analyze.test.mjs](../tests/analyze.test.mjs): Fee-bump and mixed-operation unit cases exist, but no combined runnable fixture/guide demonstrates inner-index partial scope. | Use a separate generator/output to avoid conflicting with PR #27. |
| [#16](https://github.com/claimplan/claimplan/issues/16) OPEN | KEEP | [.github/workflows/ci.yml](../.github/workflows/ci.yml): Project CI checks itself; a downstream executable policy-gate recipe covering warnings/partial scope is missing. | Keep it a consumer example, not a hosted service or a new product policy rule. |
| [#17](https://github.com/claimplan/claimplan/issues/17) OPEN | KEEP | [src/types.ts](../src/types.ts): There is no saved-report comparison utility; deterministic JSON is input for one, not an implementation. | Can start from current Report contract; schema tasks are optional reuse, not blockers. |
| [#18](https://github.com/claimplan/claimplan/issues/18) OPEN | KEEP | [src/analyze.ts](../src/analyze.ts): Site explains report fields but lacks a complete executable code-by-code finding/remedy catalog. | Use actual analyzer examples; distinguish policy choices from protocol facts. |
| [#19](https://github.com/claimplan/claimplan/issues/19) OPEN | KEEP | [.github/workflows/docs.yml](../.github/workflows/docs.yml): Docs CI builds/examples/checks local destinations but has no automated browser keyboard/mobile regression suite. | Development-only testing; preserve styling and do not claim a full accessibility audit. |
| [#20](https://github.com/claimplan/claimplan/issues/20) OPEN | KEEP | [integration/core-results.json](../integration/core-results.json): Historical Core replay was ad hoc; no checked-in dedicated offline replay command exists. | Offline replay does not depend on live RPC startup and must not be called new Core execution. |
| [#21](https://github.com/claimplan/claimplan/issues/21) OPEN | KEEP | [checks/resources/run.mjs](../checks/resources/run.mjs): Resource runner validates new cases but no standalone cross-record historical consistency auditor exists. | Expected guard-probe failures are not analyzer failures; retain source-hash provenance limits. |
| [#22](https://github.com/claimplan/claimplan/issues/22) OPEN | KEEP | [checks/release/results-v0.1.1.json](../checks/release/results-v0.1.1.json): Release record contains command outcomes/video hash, not a generated source-artifact integrity manifest/verifier. | Manual local tooling only; no publishing, key introduction or attestation claim. |
| [#23](https://github.com/claimplan/claimplan/issues/23) OPEN | CLOSE AS NOT PLANNED (recommendation) | [AGENTS.md](../AGENTS.md): The published automated-update proposal conflicts with the explicit maintainer exclusion. No updater is configured. | Not available for implementation. Maintainer authorization is required to close or substantially rewrite the published issue. |
| [#24](https://github.com/claimplan/claimplan/issues/24) OPEN | KEEP | [scripts/sync-issues.mjs](../scripts/sync-issues.mjs): Batch utility reads only 100 issues/labels and patches every match; pagination/no-op safeguards remain missing. | Use stubbed API tests; no live issue mutations needed to develop the fix. |
| [#25](https://github.com/claimplan/claimplan/issues/25) OPEN | KEEP | [tests/cli.test.mjs](../tests/cli.test.mjs): Version literals are duplicated; source CLI test hard-codes another copy instead of using package metadata. | Coordinate package-helper edits with #9; no release publication or version bump is required. |

No issue is classified BLOCKED or DUPLICATE on the inspected main. KEEP means a real unfinished opportunity, not mandatory work for the current experimental release. UPDATE is a recommendation, not a claim that GitHub was edited. CLOSE AS COMPLETED for #2/#3 describes their verified existing state; no repeat closure is requested.

## Contribution boundaries

- Keep product analysis offline/read-only and arithmetic exact. Use synthetic unsigned fixtures.
- Preserve policy/report/CLI compatibility unless the separately scoped issue and maintainer review authorize a documented change.
- Include one issue-linked outcome, acceptance checks, commands actually run, documentation and any limitations.
- Run `npm run check` and the issue-specific checks. Static docs use `npm run docs:build`; package changes use `npm run verify:package`.
- No signing/submission, wallet integration, telemetry, backend or speculative infrastructure. No dependency-update bots.

Use [CONTRIBUTING.md](../CONTRIBUTING.md) and [AGENTS.md](../AGENTS.md). Required CI and maintainer review govern merge readiness. These are ordinary contribution opportunities, not funded Wave assignments; no organizer approval, points, reward, assignment or response deadline is promised. Do not recruit external reviewers/developers through this audit.

The [canonical manifest](../checks/backlog/issues.json) preserves published bodies and identifiers, including the now-excluded #23 proposal. It is historical synchronization data, not permission to implement excluded work. Do not run bulk `--apply` as documentation cleanup; published scope/state corrections require explicit authorization. #24 addresses safer reconciliation/pagination without granting that authorization.
