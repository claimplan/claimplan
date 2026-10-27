# ClaimPlan project instructions

- Read `docs/SPEC.md`, `docs/PLAN.md` and the README before substantial work.
- Keep the product an offline, read-only CLI and library. No signing, transaction submission, telemetry, hosted API, dashboard or deployed contract.
- Verify current official SDK/Core semantics when changing protocol behavior. Never substitute the local clock for the supplied creation-ledger-time assumption.
- Use exact bigint time arithmetic and half-open intervals. Validate external inputs; unsupported or missing evidence must never produce a pass.
- Separate predicate eligibility from execution guarantees, and protocol facts from policy choices.
- Preserve fixtures as synthetic unsigned data with no secret keys or real customer information.
- Run `npm run check`, appropriate CLI/package checks, and `git diff --check`. Report actual outcomes and remaining verification gaps.
- Stage specific files and use logical conventional commits. Push only within the user's authorized workflow. Do not publish packages, submit to funding programs, or deploy without authorization.
- For the authorized implementation workflow, never batch commits: commit one logical unit (a function, type module, test block, or documentation change), stage its exact files, and push it immediately. Wait for that push to finish before starting the next commit.
- The product remains offline and never signs/submits. The separate, explicitly invoked Core-verification harness may sign synthetic transactions only inside its own ephemeral local network after verifying loopback endpoints and the standalone network identity. Never use mainnet/testnet, real assets, stored user keys, or unrelated containers for that harness.
- Update the plan and documentation with implementation changes. Do not claim an audit, Stellar Core execution, adoption or program acceptance without evidence.
- Maintain `docs/TODO.md` as the finish checklist. Always include a concise completed/current/next progress tracker in user-facing progress updates and handoffs, with actual evidence and blockers. Do not invent percentage completion.
