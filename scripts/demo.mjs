import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const cases = [
  ['Two-recipient payout: seven-day and fourteen-day recovery', 'examples/payout.xdr', 'examples/payout-policy.json', 0],
  ['Mistake: second recipient stays eligible after recovery starts', 'examples/payout-overlap.xdr', 'examples/payout-policy.json', 1],
  ['Missing creation-time assumption', 'examples/handover.xdr', 'examples/missing-time.json', 2],
];
for (const [title, transaction, policy, expected] of cases) {
  const args = ['dist/cli.js', 'check', transaction, '--policy', policy];
  console.log(`\n${title}\n$ node ${args.join(' ')}`);
  const result = spawnSync(process.execPath, args, { cwd: root, encoding: 'utf8' });
  process.stdout.write(result.stdout ?? '');
  process.stderr.write(result.stderr ?? '');
  console.log(`Exit: ${result.status} (expected ${expected})`);
  if (result.error || result.status !== expected) {
    console.error('Demo stopped: command did not return the expected exit code. Run npm run build first.');
    process.exit(1);
  }
}
console.log('\nDemo complete. Synthetic unsigned data; no transactions submitted.');
