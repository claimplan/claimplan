import { readFileSync } from 'node:fs';
import { analyzeEnvelope, InputError } from '../../dist/index.js';

try {
  const report = analyzeEnvelope(readFileSync(process.argv[2], 'utf8'), JSON.parse(readFileSync(process.argv[3], 'utf8')));
  process.stdout.write(`${JSON.stringify(report)}\n`);
  process.exitCode = report.status === 'pass' ? 0 : report.status === 'fail' ? 1 : 2;
} catch (error) {
  if (!(error instanceof InputError)) throw error;
  process.stdout.write(`${JSON.stringify({ rulesVersion: '1', status: 'inconclusive', error: { code: 'INPUT_ERROR', message: error.message } })}\n`);
  process.exitCode = 2;
}
