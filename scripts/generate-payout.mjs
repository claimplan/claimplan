import { writeFileSync } from 'node:fs';
import { Account, Asset, Claimant, Networks, Operation, StrKey, TransactionBuilder } from '@stellar/stellar-sdk';

// Synthetic public addresses only; no keys, network access or submission.
const address = byte => StrKey.encodeEd25519PublicKey(Buffer.alloc(32, byte));
const recovery = address(2);
const payouts = [
  { beneficiary: address(1), amount: '125', delay: '604800' },
  { beneficiary: address(4), amount: '80.5', delay: '1209600' },
];
const directory = new URL('../examples/', import.meta.url);
function build(broken) {
  const transaction = new TransactionBuilder(new Account(address(3), '1'), {
    fee: '100', networkPassphrase: Networks.TESTNET,
  });
  for (const [index, payout] of payouts.entries()) {
    const before = Claimant.predicateBeforeRelativeTime(payout.delay);
    transaction.addOperation(Operation.createClaimableBalance({
      asset: Asset.native(), amount: payout.amount,
      claimants: [
        new Claimant(payout.beneficiary, broken && index === 1 ? Claimant.predicateUnconditional() : before),
        new Claimant(recovery, Claimant.predicateNot(before)),
      ],
    }));
  }
  return transaction.setTimebounds(0, 0).build().toXdr();
}
const policy = {
  version: 1, creationTime: '1800000000',
  operations: payouts.map((payout, operation) => ({
    operation, beneficiary: payout.beneficiary, recovery,
    handoverAfter: payout.delay, exclusive: true, continuousCoverage: true,
  })),
};
for (const [name, contents] of Object.entries({
  'payout.xdr': build(false),
  'payout-overlap.xdr': build(true),
  'payout-policy.json': JSON.stringify(policy, null, 2),
})) writeFileSync(new URL(name, directory), `${contents}\n`);
