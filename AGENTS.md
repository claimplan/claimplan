# ClaimPlan project instructions

- Read the README, docs/architecture.md, docs/SPEC.md and relevant plan/evidence before substantial work. TODO owns unfinished actions; PLAN owns decisions/history; evidence/index.md owns verification claims.
- Keep the product an offline, read-only CLI/library. No runtime signing, submission, private-key custody, telemetry, wallet connection, hosted API, database, indexer or dashboard. Static reference documentation is separate.
- Preserve exact bigint arithmetic, half-open intervals, explicit creation-ledger assumptions and the protocol/policy distinction. Verify pinned primary sources before changing protocol behavior.
- Invalid/unsupported inputs and missing required assumptions must fail closed. Preserve explicit partial-transaction scope for unmodeled operations; a scoped pass is not full transaction verification.
- Preserve existing code, tests, harnesses and datasets. Use only synthetic unsigned fixtures; never commit credentials, customer transactions, .env or browser state.
- The separate Core harness may sign synthetic transactions only in its owned ephemeral standalone network after loopback/passphrase/protocol checks. Never use public networks, real assets, user keys or unrelated Docker cleanup. Preserve historical result files when running an audit.
- Run npm run check and relevant demo/package/resource/docs checks plus git diff --check. Report actual commands, failures and unrun checks. Historical results do not certify later changes automatically.
- Do not add Dependabot or another dependency-update bot, configuration or automated dependency PR service. This is an explicit maintainer exclusion.
- Independent review/usefulness sessions are optional and unperformed unless evidence establishes otherwise. Do not recruit reviewers/developers through an audit or imply Drips review is a technical audit.
- Use a feature branch and normal protected PR workflow. Keep genuine logical commits, stage specific files and batch pushes. Never use git add ., bypass protection, force-push main or add AI/Claude co-author trailers.
- Prepare the PR for maintainer review; do not merge it. New releases, npm publication, documentation deployment and funding submissions require explicit authorization for that action.
- Published issue state or substantial scope changes are separate authorized actions, not automatic audit cleanup. Document recommended corrections without silently rewriting GitHub issues.
- Keep documentation owners distinct and links accurate. Preserve dated history while correcting current statements. Report evidence limits honestly; no fabricated audit, deployment, approval, adoption, contributor or funding claims.
- At handoff summarize completed/current/next work, actual verification, remaining risks and any maintainer decisions. Keep the local conversation log outside the public repository.
