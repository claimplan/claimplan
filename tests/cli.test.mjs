import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync, spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { StrKey } from '@stellar/stellar-sdk';
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
  assert.equal(cli('--version').stdout, '0.1.1\n');
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

// Twenty overlapping operations keep the report above the 64 KiB operating-system
// pipe buffer, so a reader that stops consuming cannot be served entirely from it.
const address = (index) => StrKey.encodeEd25519PublicKey(Buffer.alloc(32, 4 + (index % 251)));
const widePath = join(dir, 'wide.xdr');
const widePolicyPath = join(dir, 'wide-policy.json');
{
  const operations = [];
  for (let index = 0; index < 20; index += 1) {
    operations.push(create(Array.from({ length: 10 }, (_, claimant) => claim(address(index * 10 + claimant), relative(String(60 + claimant))))));
  }
  writeFileSync(widePath, envelope(operations));
  writeFileSync(widePolicyPath, JSON.stringify({
    version: 1,
    creationTime: '1800000000',
    operations: operations.map((_, index) => ({
      operation: index,
      beneficiary: address(index * 10),
      recovery: address(index * 10 + 1),
      handoverAfter: '60',
      exclusive: true,
      continuousCoverage: true,
    })),
  }));
}

// close 'before-start' destroys the named parent read end before the child can write;
// 'first-chunk' destroys it once the first block arrives; 'none' drains the report.
function streamCase(args, stream, close) {
  return new Promise((resolveCase) => {
    const child = spawn(process.execPath, [resolve('dist/cli.js'), ...args], { stdio: ['ignore', 'pipe', 'pipe'] });
    const chunks = [], errors = [];
    const observed = { delivered: 0, errorBytes: 0, timedOut: false };
    const closeReader = (which) => { if (which === stream) child[which].destroy(); };
    child.stdout.on('data', (chunk) => {
      observed.delivered += chunk.length;
      if (close === 'none') chunks.push(chunk); else closeReader('stdout');
    });
    child.stderr.on('data', (chunk) => { observed.errorBytes += chunk.length; errors.push(chunk); if (close === 'first-chunk') closeReader('stderr'); });
    if (close === 'before-start') { closeReader('stdout'); closeReader('stderr'); }
    const watchdog = setTimeout(() => { observed.timedOut = true; child.kill('SIGKILL'); }, 10000);
    child.on('exit', (code, signal) => {
      clearTimeout(watchdog);
      resolveCase({ ...observed, code, signal, text: Buffer.concat(chunks).toString('utf8'), stderrText: Buffer.concat(errors).toString('utf8') });
    });
  });
}

const wide = ['check', widePath, '--policy', widePolicyPath];
const stackMarkers = /EPIPE|ERR_STREAM|Unhandled|node:internal|node:events|at .*\(node:/;

test('a report larger than the pipe buffer is delivered complete with its normal exit', async () => {
  const human = await streamCase(wide, 'stdout', 'none');
  const json = await streamCase([...wide, '--json'], 'stdout', 'none');
  assert.equal(human.timedOut, false);
  assert.ok(human.delivered > 64 * 1024, `expected a report above the pipe buffer, got ${human.delivered} bytes`);
  assert.equal(human.delivered, Buffer.byteLength(human.text), 'every byte must arrive before exit');
  assert.equal(human.stderrText, '');
  assert.equal(human.code, 1, 'the overlapping wide fixture must report a policy failure');
  assert.match(human.text, /Scope: mathematical predicate eligibility only/);
  assert.equal(json.code, 1);
  assert.ok(json.delivered > 64 * 1024);
  const report = JSON.parse(json.text);
  assert.equal(report.status, 'fail');
  assert.equal(report.operations.length, 20);
  const repeat = await streamCase([...wide, '--json'], 'stdout', 'none');
  assert.equal(repeat.text, json.text, 'repeated full delivery must be byte-identical');
  const pass = await streamCase(['check', txPath, '--policy', policyPath, '--json'], 'stdout', 'none');
  assert.equal(pass.code, 0);
  assert.equal(JSON.parse(pass.text).status, 'pass');
});

test('a reader that closes after the first chunk yields exit 2 and no stack leak', async () => {
  for (const args of [wide, [...wide, '--json']]) {
    const result = await streamCase(args, 'stdout', 'first-chunk');
    assert.equal(result.timedOut, false, 'the CLI must exit promptly, not hang on a dead pipe');
    assert.equal(result.signal, null);
    assert.equal(result.code, 2, 'failed report delivery is exit 2, never the report status code');
    assert.ok(result.delivered > 0 && result.delivered <= 64 * 1024, `expected a truncated report, got ${result.delivered} bytes`);
    assert.ok(!stackMarkers.test(result.stderrText), `unexpected diagnostic leaked: ${result.stderrText}`);
    assert.equal(result.stderrText, '', 'a broken output stream must not gain a replacement write');
  }
});

test('output closed before the CLI writes still exits 2 for help, version and reports', async () => {
  const cases = [['--help'], ['--version'], wide, [...wide, '--json'], ['check', join(dir, 'absent'), '--policy', policyPath]];
  for (const args of cases) {
    const result = await streamCase(args, 'stdout', 'before-start');
    assert.equal(result.timedOut, false);
    assert.equal(result.code, 2);
    assert.ok(!stackMarkers.test(result.stderrText), `unexpected diagnostic leaked: ${result.stderrText}`);
  }
});

test('a closed stderr keeps the inconclusive exit 2 and produces no crash output', async () => {
  const result = await streamCase(['check', join(dir, 'absent'), '--policy', policyPath], 'stderr', 'before-start');
  assert.equal(result.timedOut, false);
  assert.equal(result.code, 2);
  assert.equal(result.delivered, 0);
});
