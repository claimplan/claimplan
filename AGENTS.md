# ClaimPlan project instructions

- Read `docs/SPEC.md`, `docs/PLAN.md` and the README before substantial work.
- Keep the product an offline, read-only CLI and library. No signing, transaction submission, telemetry, hosted API, dashboard or deployed contract.
- Verify current official SDK/Core semantics when changing protocol behavior. Never substitute the local clock for the supplied creation-ledger-time assumption.
- Use exact bigint time arithmetic and half-open intervals. Validate external inputs; unsupported or missing evidence must never produce a pass.
- Separate predicate eligibility from execution guarantees, and protocol facts from policy choices.
- Preserve fixtures as synthetic unsigned data with no secret keys or real customer information.
- Run `npm run check`, appropriate CLI/package checks, and `git diff --check`. Report actual outcomes and remaining verification gaps.
- Stage specific files and use logical conventional commits. Push only within the user's authorized workflow. Do not publish packages, submit to funding programs, or deploy without authorization.
- Update the plan and documentation with implementation changes. Do not claim an audit, Stellar Core execution, adoption or program acceptance without evidence.
