# Security policy

ClaimPlan is experimental and has not received an independent security audit. A passing policy report is not a guarantee that funds can be recovered or that a transaction will execute.

## Report privately

Use GitHub's [private vulnerability reporting form](https://github.com/claimplan/claimplan/security/advisories/new). Private reporting is enabled for this repository. Include the affected commit/version, runtime, a minimal synthetic unsigned reproduction, expected behavior and observed impact. Do not send secrets, customer transaction data or funded accounts. Public issues are appropriate for ordinary bugs without sensitive details.

The maintainer reviews reports on a best-effort basis; there is no guaranteed response time, paid support contract or bug bounty. Coordinate disclosure in the private report before publishing exploitable details.

## Supported scope

During the pre-release phase, fixes target the current main branch and the next release candidate. There are no maintained historical release lines. Use the latest reviewed source revision; no npm publication is currently available.

The CLI reads bounded local files; the library accepts caller-provided values. Both analyze predicate eligibility offline. Neither checks signatures, network acceptance, funding, authorization, reserves or key custody. The separate integration harness is development-only and signs exclusively on its owned ephemeral local network; it is excluded from the distributable package.

Do not process arbitrary untrusted JavaScript objects in a privileged service. The library validates ordinary parsed JSON policy data; callers running it in a service must also bound request sizes, execution time and concurrency. See [compatibility and input limits](docs/COMPATIBILITY.md).
