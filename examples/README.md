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
```

The supplied creation time is an explicit assumption, not the current time. Regenerate fixtures with `node scripts/generate-examples.mjs`. Generation uses no secret keys and makes no network requests.
