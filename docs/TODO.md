# Current unfinished work

The experimental v0.1.1 implementation and published artifacts are recorded in [RELEASE.md](RELEASE.md) and the [evidence index](../evidence/index.md). This file lists unfinished actions only; it does not repeat completed delivery gates.

## Maintainer decisions and review

- [ ] Review the focused readiness-correction follow-up and its actual checks. PR #28 was merged by the maintainer; the agent must not merge the follow-up or deploy documentation.
- [ ] Decide on the contributor issue recommendations, especially closing #23 as not planned. No published issue state/scope is changed by this cleanup.

## Technical follow-up

- [ ] Resolve the known output-pipe failure in [#13](https://github.com/claimplan/claimplan/issues/13) through a separately reviewed change; this cleanup preserves runtime behavior.
- [ ] Investigate the fresh local Core run's RPC catch-up timeout before claiming a renewed successful Core execution. Preserve the historical passing dataset and exact identity/timestamp guards.
- [ ] Select optional follow-on work from [CONTRIBUTOR-START-HERE.md](CONTRIBUTOR-START-HERE.md); those proposed enhancements are not retroactive requirements for v0.1.1.

## External and optional validation

- [ ] Record an actual organizer decision when available. The last authenticated observation was Pending review on 2026-10-28; no current approval is established.
- [ ] Independent semantic review and two developer usefulness sessions are optional and unperformed. Do not recruit reviewers/developers as part of this audit. Use the existing guides only if the maintainer later requests those activities.

Do not publish a release/npm artifact, deploy documentation, change funding submissions or introduce dependency-update bots through this task. Maintainer review and an explicit later authorization determine further external actions.
