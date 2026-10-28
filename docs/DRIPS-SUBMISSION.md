# Stellar Wave submission packet

Prepared 2026-10-28. Status: draft, not submitted or approved. Developer validation is pending, and there is no public release yet. Program membership and a particular Wave sprint are separate concepts.

## Live program check

The [official Stellar program page](https://www.drips.network/wave/stellar) currently lists Wave 10 (October 15–22) among past Waves and reports no active/upcoming Waves. Do not promise participation in Wave 10 or assume a future date.

[Maintainer onboarding](https://docs.drips.network/wave/maintainers/participating-in-a-wave/) requires GitHub sign-in, installing the Drips Wave app for the organization, selecting public repositories, and explicitly applying to the relevant program; organizers decide admission. The [application-limit guide](https://docs.drips.network/wave/maintainers/repo-application-limits/) says allowances may be configured for both people and organizations. Check the authenticated application flow for remaining slots; no numeric allowance has been verified here.

The [terms](https://docs.drips.network/wave/terms-and-rules/) make repository selection discretionary and prohibit reward manipulation and low-quality/untested LLM contributions. The maintainer must review applicable terms and supply any personal eligibility/verification information directly. This packet makes no eligibility representation for the user and accepts no terms on their behalf.

On 2026-10-28 the public directory API was fetched across all nine pages (100 records per page maximum): 842 unique repositories, all with approved status, and no exact `claimplan/claimplan` match. Source: [program repository API](https://wave-api.drips.network/api/wave-programs/fdc01c95-806f-4b6a-998b-a6ed37e0d81b/repos). Counts and uniqueness were checked before accepting the result; applicant identity/contact fields were not retained. This is a point-in-time public approval check, not ClaimPlan's private application history. Before applying, search the authenticated organization/repository dashboard for pending applications or rejection; use the documented appeal process for a rejected repository rather than reapplying. The historical 2026-10-27 landscape review remains context, not a guarantee of uniqueness or demand.

## Proposed description

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
- [Contributor issue drafts](https://github.com/claimplan/claimplan/blob/main/docs/CONTRIBUTOR-BACKLOG.md)

Links to newly prepared files become public only after the authorized push; verify them before submitting. The demo is runnable source, not a hosted video. No release URL is supplied because none has been published.

## Final application steps

- Finish developer feedback, or explicitly retain its absence in the application; never invent reviewer quotes.
- Verify the pushed commit, successful CI, actual evidence links, and intended release status.
- Review the application text and authorize submission and required app permissions. No app installation or application has been performed by this packet.
- In Maintainers → Orgs and Repos check existing state, current limits and app access restricted to the intended repository where available.
- Submit only if the authenticated program accepts applications, then record the actual state/identifier and organizer decision. An application cannot guarantee admission or rewards.
- After approval, publish/navigate only genuine contributor tasks and choose complexity from actual scope. No Wave labels, reward points or contributor assignments have been created here.
