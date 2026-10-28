import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync, readdirSync, mkdirSync } from 'node:fs';
import { tmpdir, cpus, release, totalmem } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';
import { corpus, SEED, CREATION, END, INT64 } from './corpus.mjs';

assert.equal(process.platform, 'linux', 'This measured resource harness requires Linux, GNU time and prlimit; other platforms are not verified.');
const root = fileURLToPath(new URL('../../', import.meta.url));
const output = process.argv[2] ?? join(root, 'artifacts/resource-results.json');
const temporary = mkdtempSync(join(tmpdir(), 'claimplan-resources-'));
const budgets = { addressSpaceBytes: 2 * 1024 ** 3, oldSpaceMiB: 128, cpuSeconds: 5, timeoutMs: 15000, outputBytes: 16 * 1024 ** 2, peakRssKiB: 256 * 1024, rssPollMs: 20 };
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
let serial = 0;

function bounded(args, { timeoutMs = budgets.timeoutMs, outputBytes = budgets.outputBytes, readyTimeoutMs = null } = {}) {
  const metrics = join(temporary, `metrics-${serial++}.txt`);
  const command = ['--quiet', '--format=%M %U %S', '--output', metrics,
    'prlimit', `--as=${budgets.addressSpaceBytes}`, `--cpu=${budgets.cpuSeconds}`, '--core=0', '--',
    process.execPath, `--max-old-space-size=${budgets.oldSpaceMiB}`, '--max-semi-space-size=4', '--disable-wasm-trap-handler', ...args];
  return new Promise((resolve, reject) => {
    const started = performance.now();
    const child = spawn('/usr/bin/time', command, { cwd: root, detached: true, stdio: ['ignore', 'pipe', 'pipe'] });
    const stdout = [], stderr = [];
    let bytes = 0, reason = null, sampledPeakRssKiB = 0;
    const kill = why => {
      reason ??= why;
      try { process.kill(-child.pid, 'SIGKILL'); } catch (error) { if (error.code !== 'ESRCH') reject(error); }
    };
    const timer = setTimeout(() => kill('timeout'), timeoutMs);
    let readyTimer = null;
    const rssTimer = setInterval(() => {
      try {
        // GNU time has exactly one measured child; prlimit execs Node in place.
        const children = readFileSync(`/proc/${child.pid}/task/${child.pid}/children`, 'utf8').trim().split(/\s+/).filter(Boolean);
        for (const pid of children) {
          const status = readFileSync(`/proc/${pid}/status`, 'utf8');
          const rss = Number(status.match(/^VmRSS:\s+(\d+) kB$/m)?.[1] ?? 0);
          sampledPeakRssKiB = Math.max(sampledPeakRssKiB, rss);
          if (rss > budgets.peakRssKiB) kill('rss-limit');
        }
      } catch (error) {
        if (!['ENOENT', 'ESRCH'].includes(error.code)) { kill('monitor-error'); reject(error); }
      }
    }, budgets.rssPollMs);
    for (const [stream, chunks] of [[child.stdout, stdout], [child.stderr, stderr]]) stream.on('data', chunk => {
      bytes += chunk.length;
      if (bytes > outputBytes) kill('output-limit');
      else chunks.push(chunk);
      if (readyTimeoutMs !== null && readyTimer === null && stream === child.stdout && Buffer.concat(stdout).includes(Buffer.from('ready\n'))) readyTimer = setTimeout(() => kill('timeout'), readyTimeoutMs);
    });
    child.on('error', error => { clearTimeout(timer); clearTimeout(readyTimer); clearInterval(rssTimer); reject(error); });
    child.on('close', (status, signal) => {
      clearTimeout(timer);
      clearTimeout(readyTimer);
      clearInterval(rssTimer);
      let usage = null;
      if (!reason) {
        try {
          const values = readFileSync(metrics, 'utf8').trim().split(/\s+/).map(Number);
          assert.equal(values.length, 3);
          assert.ok(values.every(Number.isFinite));
          usage = { peakRssKiB: values[0], cpuMs: Math.round((values[1] + values[2]) * 1000) };
        } catch (error) { reject(error); return; }
      }
      resolve({ status, signal, reason, sampledPeakRssKiB, stdout: Buffer.concat(stdout), stderr: Buffer.concat(stderr).toString(), wallMs: Math.round((performance.now() - started) * 100) / 100, ...usage });
    });
  });
}
function check(report, expected) {
  if (expected === 'reject') {
    assert.equal(report.status, 'inconclusive');
    assert.equal(report.error?.code, 'INPUT_ERROR');
    assert.ok(report.error.message.length > 0 && report.error.message.length < 240);
    assert.equal(report.operations, undefined);
    return;
  }
  assert.equal(report.operations.length, 100);
  assert.deepEqual(report.operations.map(op => op.operation), Array.from({ length: 100 }, (_, i) => i));
  assert.ok(report.operations.every(op => op.claimants.length === 10 && op.amountStroops === '10000000' && op.asset === 'native'));
  assert.equal(report.ignoredOperations.length, 0);
  assert.equal(report.scope, 'claim-predicates-only');
  const interval = (start, end) => [{ start: String(start), end: String(end) }];
  if (expected === 'handover') {
    assert.equal(report.status, 'pass');
    assert.equal(report.findings.length, 800);
    assert.ok(report.findings.every(f => f.code === 'UNREACHABLE_CLAIMANT' && f.severity === 'warning' && f.claimants[0] >= 2));
    for (const op of report.operations) {
      assert.deepEqual(op.claimants[0].intervals, interval(CREATION, CREATION + 60n));
      assert.deepEqual(op.claimants[1].intervals, interval(CREATION + 60n, END));
      for (const claimant of op.claimants.slice(2)) assert.deepEqual(claimant.intervals, []);
    }
    return;
  }
  const branching = expected === 'branching';
  const fragmented = expected === 'fragmented';
  const severity = expected === 'overlap-warning' ? 'warning' : 'error';
  assert.equal(report.status, severity === 'warning' ? 'pass' : 'fail');
  assert.equal(report.findings.length, branching || fragmented ? 4700 : 4500);
  const end = branching ? INT64 : END;
  const windows = fragmented ? [...interval(CREATION, CREATION + 10n), ...interval(CREATION + 20n, CREATION + 30n), ...interval(CREATION + 50n, END)] : interval(CREATION, end);
  const gaps = fragmented ? [...interval(CREATION + 10n, CREATION + 20n), ...interval(CREATION + 30n, CREATION + 50n)] : interval(INT64, END);
  for (const op of report.operations) {
    for (const claimant of op.claimants) assert.deepEqual(claimant.intervals, windows);
    const findings = report.findings.filter(f => f.operation === op.operation);
    const overlaps = findings.filter(f => f.code === 'CLAIMANT_OVERLAP');
    assert.equal(overlaps.length, 45);
    const pairs = new Set();
    for (const finding of overlaps) {
      assert.equal(finding.severity, severity);
      assert.deepEqual(finding.intervals, windows);
      const [a, b] = finding.claimants;
      assert.ok(a >= 0 && a < b && b < 10);
      pairs.add(`${a},${b}`);
    }
    assert.equal(pairs.size, 45);
    if (branching || fragmented) {
      assert.deepEqual(findings.find(f => f.code === 'UNCOVERED_INTERVAL').intervals, gaps);
      assert.deepEqual(findings.find(f => f.code === 'ROLE_WINDOW_VIOLATION').intervals, gaps);
    }
  }
}

try {
  const timeout = await bounded(['--input-type=commonjs', '-e', "require('node:fs').writeFileSync(1, 'ready\\n'); while (true) {}"], { readyTimeoutMs: 400 });
  assert.equal(timeout.reason, 'timeout', JSON.stringify({ status: timeout.status, signal: timeout.signal, stderr: timeout.stderr, stdout: timeout.stdout.toString() }));
  assert.match(timeout.stdout.toString(), /ready/);
  const overflow = await bounded(['-e', "process.stdout.write('x'.repeat(65536))"], { outputBytes: 1024 });
  assert.equal(overflow.reason, 'output-limit');
  const rss = await bounded(['--input-type=commonjs', '-e', "globalThis.keep = Buffer.alloc(300 * 1024 ** 2, 1); setInterval(() => {}, 1000)"]);
  assert.equal(rss.reason, 'rss-limit', JSON.stringify({ status: rss.status, signal: rss.signal, stderr: rss.stderr }));
  assert.ok(rss.sampledPeakRssKiB > budgets.peakRssKiB);
  console.log('Harness guards passed: timeout, excessive output and live RSS process-group limits.');
  const fixtures = corpus();
  const results = [];
  for (const fixture of fixtures) {
    const envelopePath = join(temporary, 'transaction.xdr'), policyPath = join(temporary, 'policy.json');
    writeFileSync(envelopePath, fixture.envelope); writeFileSync(policyPath, fixture.policy);
    const runs = [];
    let reference;
    for (const mode of fixture.modes) {
      let first;
      for (let iteration = 0; iteration < fixture.repeats; iteration++) {
        const args = mode === 'cli' ? [join(root, 'dist/cli.js'), 'check', envelopePath, '--policy', policyPath, '--json'] : [fileURLToPath(new URL('./library-worker.mjs', import.meta.url)), envelopePath, policyPath];
        const run = await bounded(args);
        assert.equal(run.reason, null, `${fixture.name}/${mode}: ${run.reason}`);
        assert.equal(run.signal, null, `${fixture.name}/${mode}: ${run.signal}`);
        assert.equal(run.stderr, '', `${fixture.name}/${mode}: ${run.stderr.slice(0, 1000)}`);
        assert.ok(run.peakRssKiB <= budgets.peakRssKiB, `${fixture.name}/${mode}: peak RSS ${run.peakRssKiB} KiB exceeds budget`);
        const expectedStatus = fixture.expected === 'reject' ? 2 : ['handover', 'overlap-warning'].includes(fixture.expected) ? 0 : 1;
        assert.equal(run.status, expectedStatus, `${fixture.name}/${mode}: unexpected process result ${JSON.stringify({status:run.status,signal:run.signal,wallMs:run.wallMs,peakRssKiB:run.peakRssKiB})}`);
        assert.ok(run.stdout.length, `${fixture.name}/${mode}: no JSON output`);
        const report = JSON.parse(run.stdout.toString());
        check(report, fixture.expected);
        assert.equal(run.status, fixture.expected === 'reject' ? 2 : report.status === 'pass' ? 0 : 1, fixture.name);
        const normalized = fixture.expected === 'reject' ? JSON.stringify({ status: report.status, code: report.error.code }) : JSON.stringify(report);
        if (reference !== undefined) assert.equal(normalized, reference, `${fixture.name}: library/CLI differ`);
        else reference = normalized;
        if (first !== undefined) assert.equal(sha(run.stdout), first, `${fixture.name}/${mode}: nondeterministic bytes`);
        else first = sha(run.stdout);
        runs.push({ mode, iteration, status: run.status, wallMs: run.wallMs, peakRssKiB: run.peakRssKiB, cpuMs: run.cpuMs, outputBytes: run.stdout.length, outputSha256: first });
      }
    }
    results.push({ name: fixture.name, expected: fixture.expected, envelopeBytes: fixture.envelope.length, envelopeSha256: sha(fixture.envelope), policyBytes: fixture.policy.length, policySha256: sha(fixture.policy), runs });
    console.log(`${fixture.name}: ${runs.length} checks passed; max ${Math.max(...runs.map(r => r.wallMs))} ms, ${Math.max(...runs.map(r => r.peakRssKiB))} KiB RSS`);
  }
  const sourceHashes = {};
  for (const file of [...readdirSync(join(root, 'src')).filter(f => f.endsWith('.ts')).map(f => `src/${f}`), 'checks/resources/corpus.mjs', 'checks/resources/run.mjs', 'checks/resources/library-worker.mjs']) sourceHashes[file] = sha(readFileSync(join(root, file)));
  const evidence = { schemaVersion: 1, recordedOn: new Date().toISOString(), sourceRevision: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(), sourceHashes, guardProbes: { timeout: timeout.reason, output: overflow.reason, rss: rss.reason, rssObservedKiB: rss.sampledPeakRssKiB }, seed: SEED, sdk: JSON.parse(readFileSync(join(root, 'node_modules/@stellar/stellar-sdk/package.json'))).version, environment: { node: process.version, platform: process.platform, arch: process.arch, kernel: release(), cpu: cpus()[0].model, logicalCpus: cpus().length, totalMemoryMiB: Math.round(totalmem() / 1024 ** 2) }, budgets, fixtures: results };
  // Write evidence only after every expected outcome, budget and determinism check passes.
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(`PASS: ${results.length} fixtures, ${results.reduce((n, r) => n + r.runs.length, 0)} bounded API/CLI checks; ${output}`);
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
