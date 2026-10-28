# Contributing

Use Node >=22.12.0. Run `npm ci` and `npm run check`. The default test suite runs offline after dependencies are installed. The separate package-installation smoke check may fetch dependencies and registry metadata; installed analysis stays offline. Do not use mainnet funds, secret keys, real customer data or production transaction dumps as fixtures.

Open an issue describing the behavior, expected outcome and a minimal synthetic reproduction. For predicate changes, cite current Stellar Core or protocol semantics and add a boundary test. Propose new policy behavior before expanding the schema.

Keep the CLI and public library read-only. No HTTP client, transaction signing, submission, wallet connection or telemetry belongs in the current scope. Do not add a website or backend.

Use one focused change per pull request, with tests and documentation. Check `git diff --check` and `npm pack --dry-run`. Stage specific files. Never commit `.env`, tokens, authentication state or private data.

Regenerate synthetic examples with `node scripts/generate-examples.mjs` and `node scripts/generate-payout.mjs`. Run `npm run demo` and `npm run verify:package` to check the walkthrough and installed artifact. They should remain byte-identical unless their input rules change. Existing predicate utilities are prior art: explain reuse or differences without claiming their functionality is novel.

Report private security details through [GitHub private vulnerability reporting](https://github.com/claimplan/claimplan/security/advisories/new), following [SECURITY.md](SECURITY.md). Public issues should not contain credentials, sensitive transactions or exploit details requiring private disclosure. No independent security audit has been performed.

On Linux with GNU time and util-linux `prlimit`, run `npm run test:resources` for the bounded maximum-plan/malformed-input corpus. See [resource verification](docs/RESOURCE-VERIFICATION.md) for test budgets, saved observations and unsupported environments. This development harness is excluded from the package.

Native CI covers macOS 15 ARM64 and Windows Server 2025 x64 on Node 22/24. See [native verification](docs/NATIVE-VERIFICATION.md) for actual versions, the Windows npm.cmd helper repair, path coverage and the Windows FIFO skip. Use current main for development checks.
