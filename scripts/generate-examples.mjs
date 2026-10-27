import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Account, Asset, Claimant, Networks, Operation, StrKey, TransactionBuilder } from '@stellar/stellar-sdk';

// Fixed synthetic public addresses only. No secret keys, funding or submission.
const beneficiary = StrKey.encodeEd25519PublicKey(Buffer.alloc(32, 1));
const recovery = StrKey.encodeEd25519PublicKey(Buffer.alloc(32, 2));
const source = StrKey.encodeEd25519PublicKey(Buffer.alloc(32, 3));
const before = () => Claimant.predicateBeforeRelativeTime('60');
function build(overlap) {
  const claimants = [
    new Claimant(beneficiary, overlap ? Claimant.predicateUnconditional() : before()),
    new Claimant(recovery, Claimant.predicateNot(before())),
  ];
  return new TransactionBuilder(new Account(source, '1'), { fee: '100', networkPassphrase: Networks.TESTNET })
    .addOperation(Operation.createClaimableBalance({ asset: Asset.native(), amount: '1', claimants }))
    .setTimebounds(0, 0).build().toXdr();
}
const directory = fileURLToPath(new URL('../examples/', import.meta.url));
const policy = { version: 1, creationTime: '1800000000', operations: [{ operation: 0, beneficiary, recovery, handoverAfter: '60', exclusive: true, continuousCoverage: true }] };
writeFileSync(`${directory}handover.xdr`, `${build(false)}\n`);
writeFileSync(`${directory}overlap.xdr`, `${build(true)}\n`);
writeFileSync(`${directory}policy.json`, `${JSON.stringify(policy, null, 2)}\n`);
delete policy.creationTime;
writeFileSync(`${directory}missing-time.json`, `${JSON.stringify(policy, null, 2)}\n`);
