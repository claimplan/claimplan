# Stellar Wave submission packet

Submitted 2026-10-28. Status: **Pending review**, verified in the signed-in maintainer dashboard after a successful submission screen. No approval is claimed. Developer validation is pending. The [experimental source-only v0.1.0 release](https://github.com/claimplan/claimplan/releases/tag/v0.1.0) is published and public-tag installation is verified. Program membership and a particular Wave sprint are separate concepts.

## Live program check

The [official Stellar program page](https://www.drips.network/wave/stellar) currently lists Wave 10 (October 15–22) among past Waves and reports no active/upcoming Waves. Do not promise participation in Wave 10 or assume a future date.

[Maintainer onboarding](https://docs.drips.network/wave/maintainers/participating-in-a-wave/) requires GitHub sign-in, installing the Drips Wave app for the organization, selecting public repositories, and explicitly applying to the relevant program; organizers decide admission. The [application-limit guide](https://docs.drips.network/wave/maintainers/repo-application-limits/) says allowances may be configured for both people and organizations. Authenticated onboarding confirmed sufficient allowance for this single repository before submission. Account-wide quota details are not retained in this public record.

The [terms](https://docs.drips.network/wave/terms-and-rules/) make repository selection discretionary and prohibit reward manipulation and low-quality/untested LLM contributions. The maintainer must review applicable terms and supply any personal eligibility/verification information directly. This packet makes no eligibility representation for the user and accepts no terms on their behalf.

On 2026-10-28 the public directory API was fetched across all nine pages (100 records per page maximum): 842 unique repositories, all with approved status, and no exact `claimplan/claimplan` match. Source: [program repository API](https://wave-api.drips.network/api/wave-programs/fdc01c95-806f-4b6a-998b-a6ed37e0d81b/repos). Counts and uniqueness were checked before accepting the result; applicant identity/contact fields were not retained. This is a point-in-time public approval check, not ClaimPlan's private application history. Before submission, signed-in onboarding confirmed ClaimPlan was selectable without an existing application. After submission the maintainer dashboard listed `claimplan/claimplan → Stellar`, dated October 28, with **Pending review** status. Use the documented appeal process if a rejection is later recorded; do not submit duplicates. The historical 2026-10-27 landscape review remains context, not a guarantee of uniqueness or demand.

## Project description

ClaimPlan is an offline TypeScript CLI/library for reviewing Stellar claimable-balance payout plans before submission. It decodes unsigned transaction-envelope XDR and compares every create operation with an explicit beneficiary/recovery policy. Reports locate overlaps, gaps and unreachable conditions using exact integer time intervals, with deterministic JSON and CI exit codes.

The project needs no dashboard, hosted API or deployed smart contract. It does not sign or submit transactions. A pass concerns mathematical predicate eligibility under a supplied creation-time assumption, not account funding, signatures or eventual claim execution.

Predicate utilities already exist; ClaimPlan's proposed contribution is a whole-plan policy-checking workflow. The implementation has 35 offline tests and finite local Core evidence covering 30 boundary comparisons and five execution controls on the pinned version. It has not received an independent audit, two-developer usefulness validation, demonstrated adoption or program approval. Contributor work is scoped around independent semantic review, input/resource boundaries and unverified native platforms.

## Evidence links

- [Repository and quick start](https://github.com/claimplan/claimplan)
- [Specification](https://github.com/claimplan/claimplan/blob/main/docs/SPEC.md)
- [Terminal demo and reviewer guide](https://github.com/claimplan/claimplan/blob/main/docs/DEVELOPER-VALIDATION.md)
- [Demo runner](https://github.com/claimplan/claimplan/blob/main/scripts/demo.mjs)
- [Core verification and limits](https://github.com/claimplan/claimplan/blob/main/docs/CORE-VERIFICATION.md)
- [Saved local results](https://github.com/claimplan/claimplan/blob/main/integration/core-results.json)
- [CI history](https://github.com/claimplan/claimplan/actions/workflows/ci.yml)
- [Contributor backlog](https://github.com/claimplan/claimplan/blob/main/docs/CONTRIBUTOR-BACKLOG.md) and published issues [#1](https://github.com/claimplan/claimplan/issues/1), [#2](https://github.com/claimplan/claimplan/issues/2), [#3](https://github.com/claimplan/claimplan/issues/3)
- [Source-only prerelease](https://github.com/claimplan/claimplan/releases/tag/v0.1.0)

The packet and implementation links are public. The release is published; the demo is runnable source, not a hosted video. Check these links and current authenticated application state before submitting.

## Submitted form and follow-up

The user completed browser sign-in. Installed the Drips Wave GitHub app on the ClaimPlan organization with **Only select repositories → claimplan/claimplan**. Selected only that repository for the Stellar program; no unrelated repository or installation was changed. Permissions shown were read access to members/metadata and read/write access to issues/pull requests. Individual-user permissions were handled in the user's sign-in flow.

The application form accepted the planned-issues text below and nine supporting links: published release, README, specification, developer review guide, Core verification, candidate CI, and issues #1–#3. No optional prior-program participation options were selected; the text explicitly makes no previous ClaimPlan participation claim. No adoption, independent audit or guaranteed recovery claim was submitted.

The UI displayed “You successfully applied the selected repo(s) to the Stellar Wave Program.” The [maintainer dashboard](https://www.drips.network/wave/maintainers/repos) then showed **Pending review** for `claimplan/claimplan → Stellar`. This dashboard requires the maintainer's sign-in. No application-specific public URL or organizer decision was provided by the UI, so none is invented here.

### Planned issues text submitted

ClaimPlan is an experimental offline TypeScript CLI/library for whole-plan Stellar claimable-balance policy checks. It decodes unsigned transaction-envelope XDR and checks every create operation against explicit beneficiary/recovery rules, reporting exact overlaps, gaps and unreachable conditions. Source-only v0.1.0 is published; there is no hosted service, dashboard or deployed contract. The product never signs or submits transactions.

We have published three scoped contributor issues with acceptance checks and dependencies:
1. Independent review of predicate intervals and policy semantics (#1): map the supported operators, half-open boundaries, relative-time saturation and beneficiary/recovery policy checks to pinned Core/CAP-23 sources; supply synthetic reproductions and regression checks for any discrepancies. This is not presented as a formal security audit.
2. Maximum-size plans and malformed XDR resource behavior (#2): build a deterministic synthetic corpus up to the documented operation/claimant limits, test rejection cases in bounded subprocesses, and record time/memory evidence with runtime details. Fix demonstrated defects rather than claiming universal performance bounds.
3. Native macOS/Windows installation and CLI verification (#3): reproduce source installation, ESM import and exit codes 0/1/2 on actual target systems, fix observed portability defects, and document only verified coverage.

Current self-verification includes strict typecheck/35 offline tests (including 1,000 seeded predicate trees), successful Node 22/24 CI, and a separately invoked local Core harness with 30 exact boundary comparisons and five execution controls on Core/RPC v30.0.0, protocol 28. A clean clone of the published tag passed installation, tests, demo and installed CLI/library checks.

Two-developer usefulness validation and an independent audit remain pending. Existing predicate utilities are acknowledged; we make no claim of uniqueness, adoption or guaranteed recovery. A passing report concerns predicate eligibility under an assumed creation time, not actual claim execution. No previous ClaimPlan participation in ecosystem programs is claimed. No Wave rewards or assignments are promised by these backlog issues.

### Remaining work

- Collect the two real developer usefulness reviews; the application explicitly discloses their absence.
- Await and record the organizer decision; respond to substantive feedback. Do not reapply while the current application is pending.
- After approval, nominate only genuine contributor tasks and set complexity from actual scope. No Wave labels, reward points, assignments or funding claims have been created.
