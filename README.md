# ClaimPlan

[![CI](https://github.com/claimplan/claimplan/actions/workflows/ci.yml/badge.svg)](https://github.com/claimplan/claimplan/actions/workflows/ci.yml) [![Native verification](https://github.com/claimplan/claimplan/actions/workflows/native.yml/badge.svg)](https://github.com/claimplan/claimplan/actions/workflows/native.yml) [![Documentation](https://github.com/claimplan/claimplan/actions/workflows/docs.yml/badge.svg)](https://github.com/claimplan/claimplan/actions/workflows/docs.yml)

Offline validation of Stellar claimable-balance payout plans.

ClaimPlan is a command-line tool and TypeScript library that checks whether a payout's claimant conditions match its intended beneficiary and recovery rules before the transaction is submitted.

## Status

Experimental [source-only releases](https://github.com/claimplan/claimplan/releases) are available. The [v0.1.1 public tag](https://github.com/claimplan/claimplan/releases/tag/v0.1.1) passed fresh installation, tests, demo, installed CLI/library and docs checks. Not independently audited; no npm package has been published. Local Stellar Core checks passed 30 predicate-boundary cases and five execution controls on Core/RPC v30.0.0, ledger protocol 28. Separate customer/independent review is optional and unperformed.

Read the [documentation site](https://claimplan.github.io/claimplan/), follow the [payout guide](https://claimplan.github.io/claimplan/payout-guide.html), or watch the [actual CLI demo](https://claimplan.github.io/claimplan/demo.html).

See the [compatibility contract](docs/COMPATIBILITY.md), [security policy](SECURITY.md) and [release notes](CHANGELOG.md).

Follow the [progress tracker and finish checklist](docs/TODO.md) for completed work, current stage and next steps.

## Run locally

Requires Node.js **22.12.0 or newer** and npm. Current main has [verified macOS/Windows source and installed-command checks](docs/NATIVE-VERIFICATION.md); the published v0.1.0 archive predates a Windows development-helper fix.

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
npm run demo
npm run verify:package
npm pack --dry-run
```

Tests include an independent Boolean evaluator, 1,000 seeded predicate trees, boundary and malformed-input cases, real SDK envelope decoding, and CLI subprocess tests. The default suite does not execute Stellar Core. On Linux, `npm run test:resources` adds maximum-plan and malformed-input checks in bounded subprocesses; see [resource verification and measured limits](docs/RESOURCE-VERIFICATION.md). The separate `npm run test:core` command requires Docker and runs the local-only harness described in [Core verification](docs/CORE-VERIFICATION.md), with [saved results](integration/core-results.json). These finite checks do not prove production correctness. CI checks Node 22 and 24. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Prior art

Predicate evaluation already exists in [Stellar Expert's claimable-balance utilities](https://github.com/stellar-expert/claimable-balance-utils) and [stellar-resolve-claimant-predicates](https://github.com/hanseartic/stellar-resolve-claimant-predicates). ClaimPlan's proposed scope is whole-plan policy checking and a local CLI workflow.

Protocol behavior is grounded in [Stellar's claimable-balance guide](https://developers.stellar.org/docs/build/guides/transactions/claimable-balances), [CAP-23](https://github.com/stellar/stellar-protocol/blob/master/core/cap-0023.md), and Stellar Core. Implementation must be tested against their exact semantics.

## Next validation

Run `node scripts/demo.mjs` after building for the synthetic two-recipient payout walkthrough. The [developer review guide](docs/DEVELOPER-VALIDATION.md) explains the reports and feedback checklist.

Validate the workflow with developers who create claimable balances, review semantics independently and resolve findings from the published contributor backlog. Local Core boundary and execution controls have passed; developer usefulness has not been established. ClaimPlan was submitted to the Stellar Wave Program on 2026-10-28; its dashboard status is **Pending review**. No approval or funding is claimed.

Release and program materials: [source-only release record/checklist](docs/RELEASE.md), [contributor backlog](docs/CONTRIBUTOR-BACKLOG.md), and [Drips submission record](docs/DRIPS-SUBMISSION.md). The source prerelease is published and the Drips application is submitted; organizer approval remains pending.

## License

MIT. See [LICENSE](LICENSE).

## Maintainer and community

| Maintainer | Contact |
| --- | --- |
| OTimileyin | [GitHub profile](https://github.com/OTimileyin) |

Use [repository issues](https://github.com/claimplan/claimplan/issues) for public questions and reproducible bugs; use private reporting for vulnerabilities. There is no separate Telegram or Discord channel. Separate reviewer recruitment and usefulness sessions are optional, not delivery gates. No independent audit or adoption is claimed.

## Contributors

[![Contributors](https://contrib.rocks/image?repo=claimplan/claimplan)](https://github.com/claimplan/claimplan/graphs/contributors)
