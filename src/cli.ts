#!/usr/bin/env node
import { open } from 'node:fs/promises';
import { constants } from 'node:fs';
import { parseArgs } from 'node:util';
import type { Writable } from 'node:stream';
import { analyzeEnvelope } from './analyze.js';
import { MAX_INPUT_BYTES } from './decode.js';
import { InputError, type Report } from './types.js';

const help = `ClaimPlan 0.1.2 — offline Stellar payout-policy checks

Usage:
  claimplan check transaction.xdr --policy policy.json [--json]
  claimplan --help
  claimplan --version

Inputs: base64 transaction-envelope XDR and policy v1 JSON (maximum 1 MiB each).
creationTime must explicitly state the assumed creation-ledger Unix time.
No signing, submission, network calls or wall-clock assumptions.

Exit codes: 0 completed without errors (warnings may remain); 1 policy/condition
failure; 2 invalid, unsupported or inconclusive input.
`;

// A consumer that closes a pipe makes output delivery fail asynchronously. Without
// these listeners the EPIPE becomes an unhandled 'error' event and an exit-1 crash.
let outputBroken = false;
function markOutputBroken(): void {
  outputBroken = true;
  process.exitCode = 2;
}
process.stdout.on('error', markOutputBroken);
process.stderr.on('error', markOutputBroken);

async function write(stream: Writable, text: string): Promise<void> {
  if (outputBroken) return;
  try {
    await new Promise<void>((resolveDelivery) => {
      stream.write(text, (error) => { if (error) markOutputBroken(); resolveDelivery(); });
    });
  } catch { markOutputBroken(); }
}

async function readBounded(path: string, label: string): Promise<string> {
  let handle;
  try {
    // Avoid blocking on a FIFO before stat can reject non-regular inputs.
    handle = await open(path, constants.O_RDONLY | constants.O_NONBLOCK);
    const stat = await handle.stat();
    if (!stat.isFile() || stat.size > MAX_INPUT_BYTES) throw new InputError(`${label}: expected a regular file of at most 1 MiB`);
    const buffer = Buffer.alloc(MAX_INPUT_BYTES + 1);
    let offset = 0;
    while (offset < buffer.length) {
      const { bytesRead } = await handle.read(buffer, offset, buffer.length - offset, null);
      if (bytesRead === 0) break;
      offset += bytesRead;
    }
    if (offset > MAX_INPUT_BYTES) throw new InputError(`${label}: input exceeds 1 MiB`);
    try { return new TextDecoder('utf-8', { fatal: true }).decode(buffer.subarray(0, offset)); }
    catch { throw new InputError(`${label}: expected UTF-8 text`); }
  } catch (error) {
    if (error instanceof InputError) throw error;
    throw new InputError(`${label}: could not read file`);
  } finally { await handle?.close(); }
}

function render(report: Report): string {
  const lines = [
    `ClaimPlan: ${report.status.toUpperCase()} (${report.scope})`,
    `Assumed creation time: ${report.creationTime ?? 'not supplied'} Unix seconds`,
    `Checked create operations: ${report.operations.length}`,
  ];
  for (const finding of report.findings) {
    const location = finding.operation === null ? 'transaction' : `operation ${finding.operation}${finding.claimants.length ? `, claimant ${finding.claimants.join(', ')}` : ''}`;
    lines.push(`${finding.severity.toUpperCase()} ${finding.code} [${location}]: ${finding.message}`);
    for (const interval of finding.intervals) lines.push(`  [${interval.start}, ${interval.end}) Unix seconds`);
  }
  lines.push('Scope: mathematical predicate eligibility only; no guarantee that a claim will execute.');
  return `${lines.join('\n')}\n`;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  let json = args.includes('--json');
  try {
    let parsed;
    try {
      parsed = parseArgs({ args, options: { policy: { type: 'string' }, json: { type: 'boolean' }, help: { type: 'boolean' }, version: { type: 'boolean' } }, allowPositionals: true, strict: true, tokens: true });
    } catch { throw new InputError('invalid arguments; use --help for usage'); }
    const { values, positionals, tokens } = parsed;
    json = values.json ?? false;
    const names = tokens.filter(t => t.kind === 'option').map(t => t.name);
    if (new Set(names).size !== names.length) throw new InputError('duplicate command option');
    if (args.length === 0 || values.help) { await write(process.stdout, help); return; }
    if (values.version && positionals.length === 0 && names.length === 1) { await write(process.stdout, '0.1.2\n'); return; }
    if (values.version || positionals.length !== 2 || positionals[0] !== 'check' || !values.policy) {
      throw new InputError('expected: claimplan check transaction.xdr --policy policy.json [--json]');
    }
    const path = positionals[1];
    if (!path) throw new InputError('transaction file required');
    const [encoded, policyText] = await Promise.all([readBounded(path, 'transaction'), readBounded(values.policy, 'policy')]);
    let policyInput: unknown;
    try { policyInput = JSON.parse(policyText); }
    catch { throw new InputError('policy: invalid JSON'); }
    const report = analyzeEnvelope(encoded, policyInput);
    await write(process.stdout, json ? `${JSON.stringify(report, null, 2)}\n` : render(report));
    if (!outputBroken) process.exitCode = report.status === 'pass' ? 0 : report.status === 'fail' ? 1 : 2;
  } catch (error) {
    process.exitCode = 2;
    if (outputBroken) return;
    const message = error instanceof InputError ? error.message : 'unexpected internal error';
    if (json) await write(process.stdout, `${JSON.stringify({ rulesVersion: '1', status: 'inconclusive', error: { code: 'INPUT_ERROR', message } }, null, 2)}\n`);
    else await write(process.stderr, `ClaimPlan: ${message}\n`);
  }
}

await main();
