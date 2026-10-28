# Native macOS and Windows verification

On 2026-10-28, [native run 40669003448](https://github.com/claimplan/claimplan/actions/runs/40669003448) passed all four macOS/Windows jobs at commit `5bc2c8cf2e7051734c6e655edb3c912a65ef757f`. The [recorded evidence](../checks/native/results.json) is extracted from actual job status, command logs and recorded runtime/OS versions. Configuration alone is not counted as verification.

| OS/build | Architecture | Node | npm | Offline suite |
| --- | --- | --- | --- | --- |
| macOS 15.7.9 (24G830) | arm64 | v22.23.2 | 10.9.8 | 35 passed, 0 skipped |
| macOS 15.7.9 (24G830) | arm64 | v24.20.0 | 11.19.0 | 35 passed, 0 skipped |
| Windows Server 2025 (10.0.26100) | x64 | v22.23.4 | 10.9.9 | 34 passed, 1 skipped |
| Windows Server 2025 (10.0.26100) | x64 | v24.22.1 | 11.19.1 | 34 passed, 1 skipped |

Each job also passed strict typecheck, source dependency installation, fixture regeneration with no tracked-content difference, demo exits 0/1/2, isolated packed installation, the actual installed command and ESM import, and package dry run. Installed-command checks use a temporary directory containing spaces and Unicode (`Ω`) and verify exact overlap diagnostics and missing-time behavior. The POSIX FIFO regression is deliberately skipped on Windows, not counted as a pass there. This does not establish Windows named-pipe behavior.

## Failure found and repair

[Initial native run 40668297880](https://github.com/claimplan/claimplan/actions/runs/40668297880) passed both macOS jobs. Windows passed source tests, deterministic fixtures and demo, but both Node versions failed in the package-check helper with `spawnSync npm.cmd EINVAL`. Windows batch files cannot be executed directly by that subprocess API. See [Node's batch-file subprocess guidance](https://raw.githubusercontent.com/nodejs/node/v22.23.2/doc/api/child_process.md).

The helper now locates npm-cli.js and invokes it through the current Node executable with an argument array. It checks the installed Unix executable or Windows `.cmd` shim itself, rather than bypassing the shim by invoking dist/cli.js. On Windows it uses cmd.exe with fixed command grammar and quoted environment variables for controlled paths; delayed expansion is disabled. The default install may fetch dependencies/registry metadata. Installed analysis stays offline. The second full native run passed all four jobs without suppressing failures.

## Reproduce and continuing coverage

Use a current main checkout for development verification:

```sh
git clone https://github.com/claimplan/claimplan.git
cd claimplan
npm ci --ignore-scripts
npm run check
npm run demo
npm run verify:package
npm pack --dry-run
```

The [native workflow](../.github/workflows/native.yml) records Node/npm and OS/architecture, then runs these checks on standard `macos-15` and `windows-2025` runners with Node 22/24. It was first run manually to reproduce the setup and defect; continuing push/pull-request coverage is enabled only after the successful four-job reproduction. Patch versions can differ between runner caches; the table records what actually ran rather than assuming every job used the same version.

## Scope and remaining gaps

- Evidence covers macOS 15.7.9 ARM64 and Windows Server 2025 x64 at the recorded versions. Other macOS versions/Intel Macs, Windows desktop releases/ARM64, alternative runtimes, browser use, unusual filesystem/network mounts and managed endpoint policies remain unverified.
- Source tests and packed CLI/library installation were verified; user-specific global npm-link/PATH configuration and every shell/profile were not. Windows job commands run in the runner's PowerShell environment; installed `.cmd` checks execute via cmd.exe.
- The Linux-only resource harness and Docker/Core harness are not run on these native jobs. Their finite Linux results remain separate evidence.
- Product `src` is unchanged from published v0.1.0. The Windows package-verification helper fix is on main after that tag. The immutable v0.1.0 source archive still contains the older helper; use main for these development checks until a later release includes it. No tag was moved and no new release was published for this development-only fix.
- This does not replace independent semantic/security review or the two real developer usefulness sessions. No adoption, funding or audit claim is made.
