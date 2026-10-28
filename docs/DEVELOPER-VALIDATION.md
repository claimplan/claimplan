# Developer validation

Status: review material prepared; no external feedback collected. These synthetic examples demonstrate behavior, not adoption or an independent review.

## Three-minute terminal demo

From a source checkout with Node >=22.12.0:

```sh
npm ci
npm run build
node scripts/demo.mjs
```

The runner prints each command and checks expected exit codes 0, 1 and 2. It stops with a nonzero exit if a command behaves unexpectedly. It needs no Docker, credentials, funded accounts or network after dependencies are installed. To inspect deterministic report details:

```sh
node dist/cli.js check examples/payout.xdr --policy examples/payout-policy.json --json
node dist/cli.js check examples/payout-overlap.xdr --policy examples/payout-policy.json --json
```

The second command intentionally exits 1. Shell scripts using `set -e` must handle that expected failure explicitly.

## Synthetic payout workflow

A fictional payout operator prepares two native-asset balances in one unsigned transaction. The declared policy requires exclusive, continuous beneficiary/recovery coverage for every create operation.

| Operation index | Amount (XLM) | Beneficiary window | Recovery begins |
| --- | --- | --- | --- |
| 0 | 125 | First 604800 seconds (7 days) | 1800604800 |
| 1 | 80.5 | First 1209600 seconds (14 days) | 1801209600 |

Both windows start at the explicit assumed creation time `1800000000`. Each beneficiary is eligible before its deadline; the shared recovery address becomes eligible exactly at that deadline. Claiming consumes the balance; these intervals are conditional on it remaining unclaimed. Amounts in JSON are `1250000000` and `805000000` stroops.

`payout.xdr` passes. In `payout-overlap.xdr`, operation 1 accidentally gives its beneficiary an unconditional predicate. The analyzer reports `CLAIMANT_OVERLAP` at operation 1, claimants 0 and 1, over `[1801209600, 18446744073709551616)`. The final endpoint represents the exclusive end of the modeled unsigned-64-bit time domain. Operation 0 retains its correct handover; a whole-plan check locates the mistake in the second payment.

The third demo command omits creation time and must be inconclusive (exit 2). The tool never substitutes today's clock. A pass establishes predicate/policy agreement under the stated assumption; it cannot establish account funding, reserves, key access, or eventual claim execution. Creation time must be reassessed against the intended ledger context before relying on a real plan.

Regenerate the payout fixtures with `node scripts/generate-payout.mjs`. All addresses are fixed synthetic public bytes; the envelopes are unsigned, use an arbitrary sequence, and are not submission-ready. Do not put customer data or keys in feedback.

## Feedback session checklist

Use the same session with two developers who actually create claimable balances. Project outreach is covered by maintainer standing authorization; no direct invitations or sessions have occurred yet. Ask permission before retaining their comments or naming them publicly.

1. Ask how they currently check beneficiary/recovery conditions. Record the concrete workflow and existing tools before explaining ClaimPlan.
2. Give them the quick start and ask them to identify the affected payment, failure interval and corrective action from the broken report without prompting.
3. Ask them to explain what a pass does and does not guarantee, and what creation time means. Record misunderstandings rather than treating command success as comprehension.
4. Ask whether their existing libraries/scripts already perform the same whole-plan check. Record tool names and the precise missing behavior, if any.
5. If permitted, try a synthetic version of one actual workflow. Write its expected policy first, then compare the report with that expectation. Record false positives, missing rules and confusing wording.
6. Ask whether they would use the CLI, library, an upstream integration or none; record why and the smallest change that would make it useful.

For each session record locally: date, anonymous reviewer label, relevant experience, workflow, commands/version, expected and observed result, exact confusing output, existing alternatives, permission to quote, and follow-up. Keep private notes outside the public repository. No reviewer names or feedback are supplied by this template.

## Decision gate

Developer validation remains incomplete until two actual sessions and one realistic workflow review produce evidence. Then document supported conclusions and unresolved objections, fix observed problems with regression checks where needed, and decide whether to continue standalone, narrow scope, or propose an upstream contribution. Two reviews do not establish broad demand or an audit. The experimental source prerelease is published and the Stellar Wave application is submitted under maintainer authorization. Both retain this developer-validation gap; neither establishes usefulness.
