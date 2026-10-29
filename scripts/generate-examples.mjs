import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Account, Asset, Claimant, Networks, Operation, StrKey, TransactionBuilder } from '@stellar/stellar-sdk';

// Fixed synthetic public addresses only. No secret keys, funding or submission.
const address = byte => StrKey.encodeEd25519PublicKey(Buffer.alloc(32, byte));
const beneficiary = address(1);
const recovery = address(2);
const source = address(3);
const issuer = address(9);
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
function buildIssuedAsset() {
  const claimants = [
    new Claimant(beneficiary, before()),
    new Claimant(recovery, Claimant.predicateNot(before())),
  ];
  return new TransactionBuilder(new Account(source, '1'), { fee: '100', networkPassphrase: Networks.TESTNET })
    .addOperation(Operation.createClaimableBalance({
      asset: new Asset('USD', issuer),
      amount: '250000000',
      claimants,
    }))
    .setTimebounds(0, 0).build().toXdr();
}
const directory = fileURLToPath(new URL('../examples/', import.meta.url));
const policy = { version: 1, creationTime: '1800000000', operations: [{ operation: 0, beneficiary, recovery, handoverAfter: '60', exclusive: true, continuousCoverage: true }] };
writeFileSync(`${directory}handover.xdr`, `${build(false)}\n`);
writeFileSync(`${directory}overlap.xdr`, `${build(true)}\n`);
writeFileSync(`${directory}policy.json`, `${JSON.stringify(policy, null, 2)}\n`);
writeFileSync(`${directory}issued-asset.xdr`, `${buildIssuedAsset()}\n`);
writeFileSync(`${directory}issued-asset-policy.json`, `${JSON.stringify(policy, null, 2)}\n`);
delete policy.creationTime;
writeFileSync(`${directory}missing-time.json`, `${JSON.stringify(policy, null, 2)}\n`);
