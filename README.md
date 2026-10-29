# ClaimPlan

[![CI](https://github.com/claimplan/claimplan/actions/workflows/ci.yml/badge.svg)](https://github.com/claimplan/claimplan/actions/workflows/ci.yml) [![Native verification](https://github.com/claimplan/claimplan/actions/workflows/native.yml/badge.svg)](https://github.com/claimplan/claimplan/actions/workflows/native.yml) [![Documentation](https://github.com/claimplan/claimplan/actions/workflows/docs.yml/badge.svg)](https://github.com/claimplan/claimplan/actions/workflows/docs.yml)

Offline validation of Stellar claimable-balance payout plans.

ClaimPlan is an experimental TypeScript CLI and ESM library. It decodes transaction-envelope XDR and checks every native CreateClaimableBalance operation against an explicit beneficiary/recovery policy before submission. Reports identify eligibility overlaps, gaps, unreachable claimants and role-window problems. ClaimPlan never signs or submits transactions.

## Status and reference

Latest verified release: [v0.1.1 experimental source-only prerelease](https://github.com/claimplan/claimplan/releases/tag/v0.1.1). No npm package, independent audit, established adoption or program approval is claimed. Main contains later documentation/onboarding changes. Separate review and usefulness sessions are optional and unperformed.

| Reference | Owns |
| --- | --- |
| [Architecture](docs/architecture.md) | Modules, data flow and runtime/development trust boundaries |
| [Specification](docs/SPEC.md) and [compatibility](docs/COMPATIBILITY.md) | Exact policy, API, report and supported-environment contracts |
| [Evidence index](evidence/index.md) | Claims, actual observations, dates, revisions and limitations |
| [Release record](docs/RELEASE.md) | Verified tags, protected workflow and future release procedure |
| [Contributor entry](docs/CONTRIBUTOR-START-HERE.md) | Current opportunities, dependencies and issue recommendations |
| [TODO](docs/TODO.md) / [plan](docs/PLAN.md) | Unfinished work / implementation decisions and history |
| [Submission record](docs/DRIPS-SUBMISSION.md) | Original 2026-10-28 application; last observed Pending review, not a fresh decision |

The [published documentation](https://claimplan.github.io/claimplan/), [payout guide](https://claimplan.github.io/claimplan/payout-guide.html) and [actual CLI demo with text alternative](https://claimplan.github.io/claimplan/demo.html) describe the existing product. The 2026-10-29 audit verifies proposed documentation changes locally; publication is a separate maintainer-authorized action.

## Run locally

Requires Node.js >=22.12.0 and npm. Recorded checks cover Node 22/24 on Linux/Ubuntu, macOS 15 ARM64 and Windows Server 2025 x64; other combinations remain unverified. Dependency installation may use the registry. Installed analysis runs offline.

```sh
git clone https://github.com/claimplan/claimplan.git
cd claimplan
npm ci --ignore-scripts
npm run build
node dist/cli.js check examples/handover.xdr --policy examples/policy.json
```

The unsigned synthetic example passes under assumed creation time `1800000000`: the beneficiary is eligible for 60 seconds, then recovery starts exactly at `1800000060`. Nothing is submitted. Pin a reviewed commit or tag in automation; the immutable v0.1.0 archive predates the Windows development-helper correction included in v0.1.1.

```sh
# Proven overlap: exit 1
node dist/cli.js check examples/overlap.xdr --policy examples/policy.json --json

# Missing creation-time assumption: exit 2
node dist/cli.js check examples/handover.xdr --policy examples/missing-time.json --json
```

`npm link` optionally links this checkout so `claimplan --help` works through the local command name; it does not publish a package. Global PATH setup is environment-specific.

## Behavior and limits

- Supports v0, v1 and fee-bump envelopes through official SDK 17.4.0. Inner zero-based operation indices are preserved.
- Requires exactly one matching policy for every create operation and an explicit creation-ledger assumption for a conclusive result. The workstation clock is not substituted.
- Uses bigint arithmetic and half-open `[start,end)` intervals. JSON times and `amountStroops` are exact decimal strings; classic asset units use 10,000,000 base units.
- CLI inputs are regular UTF-8 files of at most 1 MiB each. Library policy input is already-parsed ordinary JSON and has no serialized-file byte limit; callers must bound inputs before parsing.
- Unsupported/malformed inputs fail closed. Other transaction operations remain outside scope and produce a partial-transaction warning.

| Exit | Meaning |
| --- | --- |
| 0 | Completed predicate-policy analysis without errors; warnings may remain |
| 1 | Proven predicate or declared-policy violations |
| 2 | Invalid/unsupported input or inconclusive analysis |

Known output-delivery exception: an early-closed stdout pipe can currently exit 1 with an unhandled EPIPE ([#13](https://github.com/claimplan/claimplan/issues/13)); that is not a policy finding. Automation should also require a complete valid report.

JSON input failures have an `error` object; completed reports contain `findings`. A pass concerns only the declared policy and assumptions. It does not establish signatures, account/trustline state, issuer controls, funding, reserves, key access, actual ledger time, transaction acceptance or successful claim execution. A balance can be claimed only while it remains unconsumed. Policy v1 reports asset/amount but does not compare a separate business budget.

## ESM library

After building in this checkout:

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

The package entry exports `analyzeEnvelope`, `InputError` and types `Report`, `Finding`, `JsonInterval`. Invalid/unsupported library input throws InputError; ordinary inconclusive analysis returns a report. See the compatibility contract before integrating or upgrading.

## Verify and contribute

```sh
npm run check
npm run demo
npm run verify:package
npm pack --dry-run
npm run docs:build
```

The default suite has 35 offline tests including 1,000 seeded predicate trees; [evidence](evidence/index.md) distinguishes this from actual local Core execution. Linux `npm run test:resources` exercises a bounded corpus. The separate Docker `npm run test:core` harness signs synthetic transactions only on an owned isolated local network, is excluded from the packed product and is not public Testnet verification. Its historical passing observations and the fresh audit startup failure are distinct outcomes.

[Choose a scoped contribution](docs/CONTRIBUTOR-START-HERE.md), check existing PRs and follow [CONTRIBUTING.md](CONTRIBUTING.md). Tasks are not assignments or reward promises. Automated dependency-update bots are intentionally excluded by the maintainer; manual review and scanning remain available.

## Security, maintainer and community

Use [private vulnerability reporting](https://github.com/claimplan/claimplan/security/advisories/new) for sensitive reports and read [SECURITY.md](SECURITY.md) for scope. This is a local analyzer, not a hardened multi-tenant service or security certification.

| Maintainer | Contact |
| --- | --- |
| OTimileyin | [GitHub profile](https://github.com/OTimileyin) |

Use [repository issues](https://github.com/claimplan/claimplan/issues) for ordinary bugs/questions. There is no separate Telegram or Discord channel. The product needs no contract, hosted API, database, indexer, dashboard or wallet connection.

[![Contributors](https://contrib.rocks/image?repo=claimplan/claimplan)](https://github.com/claimplan/claimplan/graphs/contributors)

MIT. See [LICENSE](LICENSE).
