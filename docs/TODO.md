# Current unfinished work

The experimental v0.1.1 implementation and published artifacts are recorded in [RELEASE.md](RELEASE.md) and the [evidence index](../evidence/index.md). This file lists unfinished actions only; it does not repeat completed delivery gates.

## Maintainer decisions and review

- [ ] Review the audit feature-branch PR and its actual checks. The agent must not merge it or deploy the documentation changes.
- [ ] Supply/confirm the authoritative Stellar Project Approval Playbook v2.0.0 reference if still unavailable; do not infer full compliance from the older Wave prompt.
- [ ] Decide on the contributor issue recommendations, especially closing #23 as not planned. No published issue state/scope is changed by this cleanup.
- [ ] Review [PR #27](https://github.com/claimplan/claimplan/pull/27) against #14; an open PR is not completed functionality on main.

## Technical follow-up

- [ ] Review and merge the closed-output-stream fix on `fix/cli-output-stream-lifecycle` (`2454ed7`). The reproduced [#13](https://github.com/claimplan/claimplan/issues/13) crash now exits 2 with regression coverage, but issue state and release inclusion remain maintainer decisions.
- [ ] Read the actual macOS/Windows stream-test result from that pull request's native matrix before claiming cross-platform delivery behavior; only Linux x64/Node 22.23.2 was measured locally.
- [ ] Investigate the fresh local Core run's RPC catch-up timeout before claiming a renewed successful Core execution. Preserve the historical passing dataset and exact identity/timestamp guards.
- [ ] Select optional follow-on work from [CONTRIBUTOR-START-HERE.md](CONTRIBUTOR-START-HERE.md); those proposed enhancements are not retroactive requirements for v0.1.1.

## External and optional validation

- [ ] Record an actual organizer decision when available. The last authenticated observation was Pending review on 2026-10-28; no current approval is established.
- [ ] Independent semantic review and two developer usefulness sessions are optional and unperformed. Do not recruit reviewers/developers as part of this audit. Use the existing guides only if the maintainer later requests those activities.

Do not publish a release/npm artifact, deploy documentation, change funding submissions or introduce dependency-update bots through this task. Maintainer review and an explicit later authorization determine further external actions.
