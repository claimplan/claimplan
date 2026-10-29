# Start contributing to ClaimPlan

Twenty scoped follow-on improvements are open. The experimental offline MVP is already delivered; these tasks improve usability, integration and maintenance rather than reopen completed work. Separate reviewer recruitment remains optional.

The backlog follows the [Drips meaningful-issue guide](https://www.drips.network/blog/posts/creating-meaningful-issues): product value, concrete context, bounded scope, implementation pointers and observable acceptance checks. Each issue contains its own validation and limits.

## Pick one task

There are ten tracks with two tasks each. Ten contributors could each begin in a different track, but this is an organizing option, not a promise of ten participants or reserved ownership. Choose one issue that matches your experience, check for an existing PR, and comment with your intended scope before duplicating work. Do not claim both tasks in advance. Shared-file coordination is documented in the issues.

Estimates are roughly 2–6 focused hours for a contributor familiar with the stack, including tests/docs. They are not deadlines, guaranteed completion times or payment rates. If the scope grows, explain the blocker early rather than spending unbounded time.

| Track | First task | Second task |
| --- | --- | --- |
| Schemas | [#6 — publish an editor-friendly policy v1 JSON Schema](https://github.com/claimplan/claimplan/issues/6) | [#7 — define JSON schemas for reports and CLI input errors](https://github.com/claimplan/claimplan/issues/7) |
| TypeScript consumers | [#8 — export typed raw policy inputs for ESM consumers](https://github.com/claimplan/claimplan/issues/8) | [#9 — compile a TypeScript consumer against the packed package](https://github.com/claimplan/claimplan/issues/9) |
| CLI presentation | [#10 — show claimant windows in an opt-in detailed text report](https://github.com/claimplan/claimplan/issues/10) | [#11 — add exact opt-in UTC formatting for human interval output](https://github.com/claimplan/claimplan/issues/11) |
| CLI reliability | [#12 — add safe machine-readable input diagnostic details](https://github.com/claimplan/claimplan/issues/12) | [#13 — handle closed output streams without an unhandled exception](https://github.com/claimplan/claimplan/issues/13) |
| Runnable examples | [#14 — add a reproducible issued-asset payout walkthrough](https://github.com/claimplan/claimplan/issues/14) | [#15 — demonstrate fee-bump inner indices with a mixed transaction](https://github.com/claimplan/claimplan/issues/15) |
| Automation workflows | [#16 — provide an executable GitHub Actions policy-gate example](https://github.com/claimplan/claimplan/issues/16) | [#17 — compare two saved reports by findings and eligibility windows](https://github.com/claimplan/claimplan/issues/17) |
| Documentation | [#18 — document every finding with a minimal reproduction and remedy](https://github.com/claimplan/claimplan/issues/18) | [#19 — automate keyboard and mobile documentation regressions](https://github.com/claimplan/claimplan/issues/19) |
| Verification evidence | [#20 — make saved unsigned Core evidence replayable without Docker](https://github.com/claimplan/claimplan/issues/20) | [#21 — validate saved corpus evidence and cross-runtime consistency](https://github.com/claimplan/claimplan/issues/21) |
| Supply-chain maintenance | [#22 — generate and verify an integrity manifest for source artifacts](https://github.com/claimplan/claimplan/issues/22) | [#23 — add reviewed grouped dependency and action update proposals](https://github.com/claimplan/claimplan/issues/23) |
| Contributor tooling | [#24 — paginate and safely reconcile the canonical issue batch](https://github.com/claimplan/claimplan/issues/24) | [#25 — enforce package lock and installed CLI version consistency](https://github.com/claimplan/claimplan/issues/25) |

## What a useful PR includes

- One issue-linked outcome, with before/after behavior and the acceptance checklist addressed.
- Focused tests or an executable example that exercises the actual boundary being improved.
- Commands actually run, documentation updates and any remaining limitations.
- Synthetic unsigned inputs, exact time/amount arithmetic and no signing/submission/network calls in the product.

Use Node >=22.12.0. Start with `npm ci` and `npm run check`; follow the issue’s additional validation command. Static documentation uses `npm run docs:build`. Required CI and the maintainer’s review determine whether a PR is ready to merge. Do not remove checks simply to get a pass.

## Scope and status

These are ordinary project contribution issues, not funded Wave assignments. Complexity labels are local scope estimates. No program approval, points, payment, assignment or review deadline is promised. The last private Drips observation was Pending review; this backlog does not assert an updated organizer decision.

The twenty new issues are #6–#25. Existing #1 is optional independent semantic review; #2 resource verification and #3 native-platform verification are already completed and are not counted among these new tasks. No direct invitations were sent.

The canonical issue specifications and actual issue numbers are in `checks/backlog/issues.json`. Preview synchronization with `node scripts/sync-issues.mjs`; use `--apply` only for deliberate managed updates. The current utility reads up to 100 issues/labels; #24 addresses pagination and safer no-op reconciliation before the backlog grows beyond that size.
