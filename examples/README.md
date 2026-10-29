# Offline examples

These unsigned XDR envelopes use fixed synthetic public addresses and an arbitrary testnet sequence. They are analysis fixtures, not funded accounts or submission-ready transactions.

From the repository root after `npm ci` and `npm run build`:

```sh
node dist/cli.js check examples/handover.xdr --policy examples/policy.json
# exit 0: recipient eligible for 60 seconds, then recovery claimant eligible

node dist/cli.js check examples/overlap.xdr --policy examples/policy.json --json
# exit 1: both remain eligible after the handover

node dist/cli.js check examples/handover.xdr --policy examples/missing-time.json --json
# exit 2: no creation-time assumption supplied

node dist/cli.js check examples/issued-asset.xdr --policy examples/issued-asset-policy.json --json
# exit 0: the intended windows pass, but `ISSUER_CONTROLS_UNCHECKED` warns that trustline, authorization and clawback/freeze state are not checked offline
```

The supplied creation time is an explicit assumption, not the current time. The issued-asset example uses a synthetic `USD` code and issuer address; ClaimPlan cannot inspect live issuer state, trustlines or on-ledger authorization offline. Regenerate fixtures with `node scripts/generate-examples.mjs`. Generation uses no secret keys and makes no network requests.

## Two-recipient payout review

`payout.xdr` and `payout-policy.json` model 125 XLM with seven-day recovery and 80.5 XLM with fourteen-day recovery in one transaction. `payout-overlap.xdr` intentionally leaves the second beneficiary eligible after recovery begins. Regenerate these with `node scripts/generate-payout.mjs`.

Run `node scripts/demo.mjs` after building for a terminal walkthrough that checks all three exit codes. See [developer validation](../docs/DEVELOPER-VALIDATION.md) for expected intervals, JSON commands and a feedback-session checklist.
