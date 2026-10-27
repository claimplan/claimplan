# ClaimPlan

Offline validation of Stellar claimable-balance payout plans.

ClaimPlan is a command-line tool and TypeScript library that checks whether a payout's claimant conditions match its intended beneficiary and recovery rules before the transaction is submitted.

## Status

Early implementation, not audited. Source installation and offline examples work; no npm package has been published. Customer validation and Stellar Core integration testing remain pending.

Follow the [progress tracker and finish checklist](docs/TODO.md) for completed work, current stage and next steps.

## Run locally

Requires Node.js **22.12.0 or newer** and npm.

```sh
git clone https://github.com/claimplan/claimplan.git
cd claimplan
npm ci
npm run build

node dist/cli.js check examples/handover.xdr --policy examples/policy.json
```

The example passes: the beneficiary has the first 60 seconds, then the recovery claimant takes over. Fixtures contain synthetic public addresses and unsigned envelopes. Nothing is submitted.

```sh
# Prove an unintended overlap; exits 1
node dist/cli.js check examples/overlap.xdr --policy examples/policy.json --json

# Missing creation-time assumption; exits 2
node dist/cli.js check examples/handover.xdr --policy examples/missing-time.json --json
```

To use the command name locally, `npm link` installs a link to this checkout; then run `claimplan --help`. This does not publish a package.

## What it checks

- Reads v0, v1 and fee-bump transaction-envelope XDR with the official Stellar SDK.
- Checks all claimants in each native `CreateClaimableBalance` operation together.
- Identifies contradictory conditions, uncovered claim windows, unexpected overlap, and beneficiary/recovery-policy violations.
- Reports exact intervals in the terminal and deterministic JSON for CI.
- Requires an explicit creation-ledger-time assumption; never reads the current clock.

See [the specification](docs/SPEC.md) for every policy field, report semantics and acceptance criteria. Use [the example policy](examples/policy.json) as a runnable starting point. Amounts in reports use integer `amountStroops` (10,000,000 base units per classic asset unit); interval endpoints are decimal Unix-second strings, with an exclusive end.

| Exit | Meaning |
| --- | --- |
| 0 | No errors under the supplied policy and assumptions; warnings can remain. |
| 1 | Proven predicate or policy violations. |
| 2 | Invalid/unsupported input or an inconclusive analysis. |

Malformed input has an `error` object in JSON output; completed analyses have a `findings` array. Neither raw input contents nor secret values are included in error messages.

The product runs locally or in the user's CI. It requires no website, hosted API, database, or deployed smart contract.

## Limits

Predicate eligibility does not establish that an account can execute a claim. Keys, trustlines, issuer authorization, account state and actual ledger close times need separate consideration. Overlap and the absence of a recovery claimant can be intentional; findings must distinguish protocol facts from declared application policy.

ClaimPlan is not an audit or a guarantee of recovery. It does not sign or submit transactions. If other operation types are present, the report explicitly marks the transaction partially analyzed. Exact policy matching prevents silently skipping create operations. Both input files are limited to 1 MiB.

## Library

After building, import the local ESM entrypoint:

```js
import { readFileSync } from 'node:fs';
import { analyzeEnvelope, InputError } from './dist/index.js';

try {
  const xdr = readFileSync('examples/handover.xdr', 'utf8');
  const policy = JSON.parse(readFileSync('examples/policy.json', 'utf8'));
  const report = analyzeEnvelope(xdr, policy);
  console.log(report.status, report.findings);
} catch (error) {
  if (error instanceof InputError) console.error(error.message);
  else throw error;
}
```

## Verify and contribute

```sh
npm run check
npm pack --dry-run
```

Tests include an independent Boolean evaluator, 1,000 seeded predicate trees, boundary and malformed-input cases, real SDK envelope decoding, and CLI subprocess tests. They do not execute Stellar Core or prove production correctness. CI checks Node 22 and 24. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Prior art

Predicate evaluation already exists in [Stellar Expert's claimable-balance utilities](https://github.com/stellar-expert/claimable-balance-utils) and [stellar-resolve-claimant-predicates](https://github.com/hanseartic/stellar-resolve-claimant-predicates). ClaimPlan's proposed scope is whole-plan policy checking and a local CLI workflow.

Protocol behavior is grounded in [Stellar's claimable-balance guide](https://developers.stellar.org/docs/build/guides/transactions/claimable-balances), [CAP-23](https://github.com/stellar/stellar-protocol/blob/master/core/cap-0023.md), and Stellar Core. Implementation must be tested against their exact semantics.

## Next validation

Cross-check fixtures on a local Stellar Core network, review semantics independently and validate the workflow with developers who create claimable balances. The tool has not been submitted to Drips Wave or awarded funding.

## License

MIT. See [LICENSE](LICENSE).
