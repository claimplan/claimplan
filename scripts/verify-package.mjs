import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const offline = process.argv.includes('--offline');
assert.ok(process.argv.slice(2).every(argument => argument === '--offline'), 'Only --offline is supported');
const temporary = mkdtempSync(join(tmpdir(), 'claimplan-package-'));
function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', timeout: 120000 });
  assert.ifError(result.error);
  assert.equal(result.status, 0, `${command} failed:\n${result.stderr}\n${result.stdout}`);
  return result.stdout;
}
try {
  const packed = JSON.parse(run(npm, ['pack', '--ignore-scripts', '--json', '--pack-destination', temporary], root))[0];
  const files = packed.files.map(file => file.path);
  assert.ok(files.includes('dist/cli.js'));
  assert.ok(files.includes('dist/index.js'));
  assert.ok(files.includes('docs/COMPATIBILITY.md'));
  assert.ok(files.includes('SECURITY.md'));
  assert.ok(!files.some(path => path.startsWith('integration/') || path.startsWith('checks/') || /(^|\/)\.env($|\.)/.test(path)));
  const consumer = join(temporary, 'consumer');
  mkdirSync(consumer);
  run(npm, ['install', '--prefix', consumer, ...(offline ? ['--offline'] : []), '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false', join(temporary, packed.filename)], consumer);
  const installed = join(consumer, 'node_modules', '@claimplan', 'cli');
  const bin = process.platform === 'win32' ? join(installed, 'dist', 'cli.js') : join(consumer, 'node_modules', '.bin', 'claimplan');
  assert.ok(existsSync(bin));
  for (const [transaction, policy, status] of [
    ['payout.xdr', 'payout-policy.json', 0],
    ['payout-overlap.xdr', 'payout-policy.json', 1],
    ['handover.xdr', 'missing-time.json', 2],
  ]) {
    const args = [bin, 'check', join(installed, 'examples', transaction), '--policy', join(installed, 'examples', policy), '--json'];
    const result = spawnSync(process.execPath, args, { cwd: consumer, encoding: 'utf8', timeout: 15000 });
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
  console.log('Package verified: isolated install, installed CLI exits 0/1/2, ESM exports, payout amounts, and development-harness exclusion.');
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
