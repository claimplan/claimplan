import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
// Invoke npm's JavaScript entrypoint directly; Windows cannot exec npm.cmd.
const npmCli = [
  process.env.npm_execpath,
  join(dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js'),
  join(dirname(process.execPath), '..', 'lib', 'node_modules', 'npm', 'bin', 'npm-cli.js'),
].find(path => path && /npm-cli\.js$/i.test(path) && existsSync(path));
assert.ok(npmCli, 'npm CLI not found; run npm run verify:package');
const offline = process.argv.includes('--offline');
assert.ok(process.argv.slice(2).every(argument => argument === '--offline'), 'Only --offline is supported');
const temporary = mkdtempSync(join(tmpdir(), 'claimplan package Ω-'));
function run(command, args, cwd, timeoutMs = 120000) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', timeout: timeoutMs });
  assert.ifError(result.error);
  assert.equal(result.status, 0, `${command} failed:\n${result.stderr}\n${result.stdout}`);
  return result.stdout;
}
try {
  const packed = JSON.parse(run(process.execPath, [npmCli, 'pack', '--ignore-scripts', '--json', '--pack-destination', temporary], root))[0];
  const files = packed.files.map(file => file.path);
  assert.ok(files.includes('dist/cli.js'));
  assert.ok(files.includes('dist/index.js'));
  assert.ok(files.includes('docs/COMPATIBILITY.md'));
  assert.ok(files.includes('SECURITY.md'));
  assert.ok(!files.some(path => path.startsWith('integration/') || path.startsWith('checks/') || /(^|\/)\.env($|\.)/.test(path)));
  const consumer = join(temporary, 'consumer');
  mkdirSync(consumer);
  // Registry installation pulls the pinned SDK, so its budget is wider than the
  // local pack step; hosted Windows runners measured above 120 s on 2026-10-30.
  const installBudgetMs = offline ? 120000 : 300000;
  run(process.execPath, [npmCli, 'install', '--prefix', consumer, ...(offline ? ['--offline'] : []), '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false', join(temporary, packed.filename)], consumer, installBudgetMs);
  const installed = join(consumer, 'node_modules', '@claimplan', 'cli');
  const bin = join(consumer, 'node_modules', '.bin', process.platform === 'win32' ? 'claimplan.cmd' : 'claimplan');
  assert.ok(existsSync(bin));
  for (const [transaction, policy, status] of [
    ['payout.xdr', 'payout-policy.json', 0],
    ['payout-overlap.xdr', 'payout-policy.json', 1],
    ['handover.xdr', 'missing-time.json', 2],
  ]) {
    const transactionPath = join(installed, 'examples', transaction);
    const policyPath = join(installed, 'examples', policy);
    const options = { cwd: consumer, encoding: 'utf8', timeout: 15000 };
    // Fixed command grammar; controlled paths are supplied via quoted environment
    // variables, never interpolated as shell code. Delayed expansion stays off.
    const result = process.platform === 'win32'
      ? spawnSync(process.env.ComSpec ?? 'cmd.exe', ['/d', '/v:off', '/s', '/c', '\"\"%CLAIMPLAN_SMOKE_BIN%\" check \"%CLAIMPLAN_SMOKE_XDR%\" --policy \"%CLAIMPLAN_SMOKE_POLICY%\" --json\"'], {
        ...options, windowsVerbatimArguments: true,
        env: { ...process.env, CLAIMPLAN_SMOKE_BIN: bin, CLAIMPLAN_SMOKE_XDR: transactionPath, CLAIMPLAN_SMOKE_POLICY: policyPath },
      })
      : spawnSync(bin, ['check', transactionPath, '--policy', policyPath, '--json'], options);
    assert.ifError(result.error);
    assert.equal(result.status, status, result.stderr);
    assert.equal(result.stderr, '');
    const report = JSON.parse(result.stdout);
    assert.equal(report.status, ['pass', 'fail', 'inconclusive'][status]);
    if (status === 1) {
      const overlap = report.findings.find(finding => finding.code === 'CLAIMANT_OVERLAP');
      assert.ok(overlap);
      assert.equal(overlap.operation, 1);
      assert.deepEqual(overlap.claimants, [0, 1]);
      assert.deepEqual(overlap.intervals, [{ start: '1801209600', end: '18446744073709551616' }]);
    }
    if (status === 2) assert.ok(report.findings.some(finding => finding.code === 'CREATION_TIME_REQUIRED'));
  }
  // Import by package name from inside the isolated consumer, exercising exports.
  const library = run(process.execPath, ['--input-type=module', '-e',
    "import { analyzeEnvelope, InputError } from '@claimplan/cli'; console.log(typeof analyzeEnvelope, typeof InputError);"], consumer);
  assert.equal(library.trim(), 'function function');
  const api = await import(pathToFileURL(join(installed, 'dist', 'index.js')).href);
  const report = api.analyzeEnvelope(readFileSync(join(installed, 'examples', 'payout.xdr'), 'utf8'), JSON.parse(readFileSync(join(installed, 'examples', 'payout-policy.json'), 'utf8')));
  assert.equal(report.status, 'pass');
  assert.deepEqual(report.operations.map(op => op.amountStroops), ['1250000000', '805000000']);
  console.log('Package verified: isolated install, installed command exits 0/1/2 (spaces/Unicode paths), ESM exports, payout amounts, and development-harness exclusion.');
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
