# Implementation decisions and development history

This document owns significant decisions and historical sequence. [TODO.md](TODO.md) owns unfinished work, the [evidence index](../evidence/index.md) owns verification claims, [RELEASE.md](RELEASE.md) owns release history/procedure, and [DRIPS-SUBMISSION.md](DRIPS-SUBMISSION.md) owns the actual application record. It is not another current acceptance checklist.

## Product and architecture

ClaimPlan analyzes native Stellar claimable-balance predicates locally using the official SDK and exact bigint intervals. Policy v1 requires explicit creation assumptions and exact operation-index matching. Beneficiary/recovery requirements are application policy; mathematical eligibility does not establish execution success. The [architecture](architecture.md), [specification](SPEC.md) and [compatibility contract](COMPATIBILITY.md) own the details.

No contract, hosted analysis API, database, indexer, wallet integration, telemetry or transaction submission is needed. Static reference hosting is separate from the CLI/library. ESM and source-only experimental distribution were chosen; npm publication was not part of delivery.

## 2026-10-27: model and verification approach

The model uses half-open intervals and relative-time saturation matching pinned Core behavior. Policy/report versioning, malformed-input rejection, SDK-built fixtures and a separate Boolean truth evaluator were introduced before interpreting local checks as evidence. Prior single-predicate tools were acknowledged; uniqueness and adoption were never established.

The Core harness was isolated from product imports/distribution. It owns an ephemeral Docker network, checks loopback identity before signing synthetic transactions and compares exact ledger boundaries. Virtual-clock experiments and RPC wire-timestamp differences required harness work; [CORE-VERIFICATION.md](CORE-VERIFICATION.md) preserves those decisions and limitations.

## 2026-10-28: experimental delivery

The original source-only v0.1.0 was published before independent/usefulness validation. The application was submitted with that limitation disclosed. This order did not establish validation or organizer approval. Original supporting links and submitted wording remain in the application record; later documentation/video/release artifacts were not retroactively part of that form.

The resource harness needed runtime calibration. A one-GiB address-space cap prevented Node startup; a data-segment cap conflicted with Node 24's CodeRange reservation. The final development runner uses the recorded address-space/heap/CPU/wall/output limits plus live RSS supervision. Failed preliminary runs were not counted as successful corpus results. [RESOURCE-VERIFICATION.md](RESOURCE-VERIFICATION.md) retains exact observations and saved hashes.

Native verification reproduced a Windows `npm.cmd` subprocess failure in the development package checker. Invoking npm-cli.js through Node and testing the actual installed launchers repaired it. The source-only v0.1.1 includes that helper change, resource/native tooling, documentation and demo; CLI version text changed but predicate/policy semantics did not. The original tag was not moved. Exact release and native records remain authoritative.

Main was initially unprotected, then PR/status-check protection was enabled on 2026-10-28. Current settings are documented in RELEASE.md; earlier absence is history, not current policy. The user chose focused commits and batched pushes.

Separate reviewer recruitment and developer usefulness sessions became optional and remain unperformed. Implementation-assisted checks are not an independent audit; Drips program review cannot substitute for one.

## 2026-10-29: contributor opportunities and audit

Twenty follow-on issues (#6–#25) were published after inspecting the implementation. They are proposed improvements, not evidence that their behavior already exists. The [contributor entry](CONTRIBUTOR-START-HERE.md) now owns current issue states, dependencies and audit recommendations; completed #2/#3 are retained through GitHub history rather than repeated as unfinished tasks. PR #27 proposes the issued-asset example and was open at the audit baseline.

The maintainer explicitly excludes automated dependency-update bots and requests an audit/cleanup PR without release, deployment, submission, reviewer recruitment or merge. Published issue scope/state changes need separate authorization. Existing verification datasets, source, tests and harnesses are retained.

Architecture and a lightweight evidence index were added from actual source and records. Repeated delivery checklists were replaced by clear document ownership. The older Wave applicability map remains as historical context, not proof of compliance with a newer reference. Current audit outcomes and any reference-version limitation belong in FINAL-AUDIT.md once the audit record is complete.

## Historical research and presentation references

The 2026-10-27 landscape work acknowledged [stellar-expert/claimable-balance-utils](https://github.com/stellar-expert/claimable-balance-utils) and [hanseartic/stellar-resolve-claimant-predicates](https://github.com/hanseartic/stellar-resolve-claimant-predicates) as prior art; it did not establish adoption or uniqueness. The 2026-10-28 presentation comparison used the then-live [approved directory](https://www.drips.network/wave/stellar/repos), [KindFi](https://github.com/kindfi-org/kindfi) and [Trustless Work](https://github.com/Trustless-Work/trustlesswork-smart-contract-stellar). Their repository links remain available; historical comparison is not a current admission criterion or endorsement.
