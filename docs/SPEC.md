# ClaimPlan v0.1 specification

Status: implementation target. Offline, read-only, local files only. No signing, submission, wallet credentials, hosted services or smart contracts.

## Workflow

`claimplan check transaction.xdr --policy policy.json [--json]`

Read a base64 Stellar transaction envelope and JSON policy. Decode with the official Stellar SDK. Check every native `CreateClaimableBalance` operation against a policy selected by its zero-based operation index. Other operations are reported as outside scope. A transaction with no create operation is not a successful check.

Return exit code 0 for completed checks without errors (warnings may remain), 1 for proven policy/condition errors, 2 for invalid/unsupported input or an inconclusive analysis. JSON goes only to stdout. Diagnostics contain locations and never echo the full input. No network or current-clock reads.

## Policy v1

```json
{
  "version": 1,
  "creationTime": "1800000000",
  "operations": [
    {
      "operation": 0,
      "beneficiary": "G-address of the recipient",
      "recovery": "G-address of the recovery account",
      "handoverAfter": "604800",
      "exclusive": true,
      "continuousCoverage": true
    }
  ]
}
```

Strings shown as G-address explanations above are documentation, not runnable example addresses. Runnable examples use valid synthetic addresses.

All fields are required except `creationTime`, `recovery` and `handoverAfter`. Unknown keys are rejected. Addresses must be valid G-addresses. Operation indices must be distinct integers from 0 through 99. `recovery` and `handoverAfter` must occur together, with a different address from the beneficiary and a positive delay. Boolean flags are explicit. Version must equal 1. Policy operations must cover every create operation exactly; a policy targeting another operation is an input error.

`creationTime`, when supplied, is an explicit assumed creation-ledger close time in Unix seconds (unsigned 64-bit range). `handoverAfter` is a nonnegative signed-64-bit duration, greater than zero. These are canonical decimal strings, never floats or ISO dates. Without a creation-time assumption, the report is inconclusive, even for absolute-only predicates: the tool cannot establish whether a window precedes creation. Do not substitute the workstation clock.

Without recovery, the beneficiary must be predicate-eligible throughout the analysis domain after creation. With recovery, the beneficiary must cover `[creation, handover)` and the designated recovery account must cover `[handover, end)`. A supplied creation time is an assumption, not an observed ledger timestamp. Handover must fit within the unsigned time domain.

`exclusive: true` rejects any overlap between distinct claimants, including third-party claimants. With false, overlaps are warnings. `continuousCoverage: true` rejects intervals when no claimant's predicate holds; with false, gaps remain warnings. These flags do not waive beneficiary/recovery window requirements. An unreachable individual claimant is a warning; no claimant with any eligible time is an error.

## Exact semantics and scope

- Native claim predicate operators: unconditional, before absolute time, before relative time, not, binary and/or. Maximum predicate depth four counting the root as one; one to ten claimants; distinct destination addresses; nonnegative signed-64-bit predicate times.
- Resolve relative time from the declared creation time, saturating at `INT64_MAX` as Stellar Core does.
- Eligibility uses half-open intervals `[start, end)` over integer seconds `0 <= time <= UINT64_MAX`. Report endpoints as decimal strings; end is exclusive and may be `UINT64_MAX + 1` to represent the end of the modeled time domain. Analysis clips all predicates to `[creationTime, UINT64_MAX + 1)`.
- The report states mathematical predicate eligibility only, conditional on an unclaimed balance. It does not guarantee a ledger close within a window, key availability, account existence, trustline capacity, authorization, reserves, signatures, network/protocol acceptance, or asset clawback behavior.
- Decode standard v1, legacy v0 and fee-bump envelopes, preserving inner operation indices. Reject malformed/noncanonical base64 and unsupported envelope variants. Reject unsupported asset forms and invalid create-operation structure. Issued assets receive an explicit issuer-control warning; the tool cannot determine clawback flags offline.
- Other operations may change state or claim the newly created balance. A mixed transaction is marked partial and receives a warning; those effects are never modeled as verified.
- File input has a 1 MiB limit per file. Malformed or unsupported input must fail closed. Library entrypoints validate their own untrusted inputs.

## Report

Versioned JSON includes `rulesVersion`, `status` (`pass`, `fail`, `inconclusive`), `scope`, `creationTime`, checked operation summaries, findings, ignored operation indices, and stated limitations. Findings contain code, severity, operation index, implicated claimant indices and exact intervals where applicable. Stable ordering and no wall-clock timestamps make repeated reports identical. No `safe` or `verified-payment` claim.

## Acceptance and verification

| Requirement | Acceptance check |
| --- | --- |
| Boundary correctness | Independent truth evaluator agrees with interval membership for generated bounded predicates and all transition boundaries. |
| Recovery handover | Recipient before T and recovery at/after T pass; gap/overlap/missing recovery produces located findings. |
| Dead conditions | `before(T) AND NOT(before(T))` has no interval; all expired claimants never produce pass. |
| Exact time arithmetic | Tests above JS safe-integer range and Core relative saturation; no Date or floating-point conversion. |
| Fail closed | Missing creation time, misspelled fields, bad address/index/range, depth five, malformed XDR and no create operations cannot pass. |
| Real input boundary | SDK-built unsigned envelopes round-trip through CLI, including v0 and fee bumps; invalid raw XDR structures are rejected. |
| Whole plan | Multi-operation policy matching, ignored-operation scope and third-party claimant overlaps tested. |
| Offline CLI | Subprocess tests verify JSON, exit codes, help, file errors and byte-identical repeated output. |
| Distribution | Strict typecheck, Node test suite, package dry run and local installed-bin smoke test. |

Sources checked 2026-10-27: [Core creation](https://github.com/stellar/stellar-core/blob/master/src/transactions/CreateClaimableBalanceOpFrame.cpp), [Core claim](https://github.com/stellar/stellar-core/blob/master/src/transactions/ClaimClaimableBalanceOpFrame.cpp), [CAP-23](https://github.com/stellar/stellar-protocol/blob/master/core/cap-0023.md). Model agreement tests do not mean Core itself was executed.
