# Contributor backlog history and maintenance

[CONTRIBUTOR-START-HERE.md](CONTRIBUTOR-START-HERE.md) is the authoritative current opportunity/issue-audit entry. This file preserves why the backlog exists and how its metadata is maintained; it is not another open-work checklist.

## Historical verification tasks

- [#1](https://github.com/claimplan/claimplan/issues/1): optional independent semantic review, still unperformed. The [review packet](SEMANTIC-REVIEW.md) is implementation-assisted preparation, not a completed external audit.
- [#2](https://github.com/claimplan/claimplan/issues/2): completed resource/malformed-input verification. Keep the actual [runner and saved measurements](RESOURCE-VERIFICATION.md), rather than advertising its original problem as still missing.
- [#3](https://github.com/claimplan/claimplan/issues/3): completed scoped native verification and Windows helper repair. Exact [platform evidence/limits](NATIVE-VERIFICATION.md) remain authoritative.

On 2026-10-29, twenty follow-on issues (#6–#25) were published across ten tracks, with context, acceptance checks, validation, coordination and rough effort estimates. They do not reopen the completed MVP or establish adoption. Current classifications, open-PR coordination and the maintainer exclusion affecting #23 are in the contributor entry. No rewards, points or assignments are promised.

## Canonical batch utility

`checks/backlog/issues.json` retains all 23 published specifications/identifiers, including completed and now-excluded historical requests. `node scripts/sync-issues.mjs` previews; `--apply` deliberately creates/updates managed issues and labels. It preserves state, so an old checked-off body does not itself reopen an issue. The utility currently reads only the first 100 issues/labels and patches existing entries even when unchanged; #24 remains useful work.

A preview is not an authorization to publish, revive excluded scope or rewrite an issue. Do not run bulk apply during this cleanup. In particular, the retained #23 body is not an invitation to configure automation contrary to AGENTS.md. Any closure/substantial issue rewrite needs explicit maintainer authorization; this audit made no GitHub issue changes.
