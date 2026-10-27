import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync, execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { envelope, policy, always, not, relative, claim, create, A, B } from './helpers.mjs';

const dir = mkdtempSync(join(tmpdir(), 'claimplan-cli-test-'));
after(() => rmSync(dir, { recursive: true, force: true }));
const txPath = join(dir, 'transaction.xdr');
const policyPath = join(dir, 'policy.json');
writeFileSync(txPath, envelope());
writeFileSync(policyPath, JSON.stringify(policy()));
const cli = (...args) => spawnSync(process.execPath, [resolve('dist/cli.js'), ...args], { encoding: 'utf8', timeout: 15000 });
const check = (...args) => cli('check', txPath, '--policy', policyPath, ...args);

test('CLI checks real SDK envelope and emits deterministic JSON without stderr', () => {
  const a = check('--json'), b = check('--json');
  assert.equal(a.status, 0); assert.equal(a.stderr, '');
  assert.equal(JSON.parse(a.stdout).status, 'pass');
  assert.equal(a.stdout, b.stdout);
});

test('policy errors return 1 and human output explains a located finding', () => {
  const path = join(dir, 'overlap.xdr');
  writeFileSync(path, envelope([create([claim(A, always()), claim(B, not(relative(60)))])]));
  const result = cli('check', path, '--policy', policyPath);
  assert.equal(result.status, 1);
  assert.match(result.stdout, /CLAIMANT_OVERLAP \[operation 0, claimant 0, 1\]/);
});

test('missing creation assumption returns 2 with a normal inconclusive report', () => {
  const path = join(dir, 'missing-time.json');
  const p = policy(); delete p.creationTime;
  writeFileSync(path, JSON.stringify(p));
  const result = cli('check', txPath, '--policy', path, '--json');
  assert.equal(result.status, 2);
  assert.equal(JSON.parse(result.stdout).findings[0].code, 'CREATION_TIME_REQUIRED');
});

test('help/version are available without input files', () => {
  assert.equal(cli('--help').status, 0);
  assert.match(cli().stdout, /Usage:/);
  assert.equal(cli('--version').stdout, '0.1.0\n');
});

test('a FIFO input is rejected rather than blocking before file validation', { skip: process.platform === 'win32' }, () => {
  const path = join(dir, 'pipe.xdr');
  execFileSync('mkfifo', [path]);
  const result = cli('check', path, '--policy', policyPath, '--json');
  assert.equal(result.status, 2);
  assert.match(JSON.parse(result.stdout).error.message, /regular file/);
});

test('CLI rejects missing files, malformed JSON, oversized input and duplicate/unknown flags', () => {
  const bad = join(dir, 'bad.json'), huge = join(dir, 'huge.xdr'), utf8 = join(dir, 'bad-utf8.json');
  writeFileSync(bad, '{"secret-value":');
  writeFileSync(huge, 'A'.repeat(1024 * 1024 + 1));
  writeFileSync(utf8, Buffer.from([0xff]));
  const cases = [
    ['check', join(dir, 'absent'), '--policy', policyPath],
    ['check', dir, '--policy', policyPath],
    ['check', txPath, '--policy', bad],
    ['check', txPath, '--policy', utf8],
    ['check', huge, '--policy', policyPath],
    ['check', txPath, '--policy', policyPath, '--policy', policyPath],
    ['check', txPath, '--policy', policyPath, '--unknown'],
    ['check', txPath],
  ];
  for (const args of cases) {
    const result = cli(...args, '--json');
    assert.equal(result.status, 2);
    assert.equal(result.stderr, '');
    const parsed = JSON.parse(result.stdout);
    assert.equal(parsed.status, 'inconclusive');
    assert.equal(parsed.error.code, 'INPUT_ERROR');
    assert.ok(!result.stdout.includes('secret-value'));
  }
});
