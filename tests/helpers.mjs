import { Account, Asset, Claimant, Networks, Operation, StrKey, TransactionBuilder, xdr } from '@stellar/stellar-sdk';

export const A = StrKey.encodeEd25519PublicKey(Buffer.alloc(32, 1));
export const B = StrKey.encodeEd25519PublicKey(Buffer.alloc(32, 2));
export const C = StrKey.encodeEd25519PublicKey(Buffer.alloc(32, 3));
export const CREATED = 1800000000n;
export const before = seconds => Claimant.predicateBeforeAbsoluteTime(String(seconds));
export const relative = seconds => Claimant.predicateBeforeRelativeTime(String(seconds));
export const not = p => Claimant.predicateNot(p);
export const always = () => Claimant.predicateUnconditional();
export const claim = (destination, predicate) => new Claimant(destination, predicate);
export const handover = () => [claim(A, relative(60)), claim(B, not(relative(60)))];
export const create = (claimants, asset = Asset.native()) => Operation.createClaimableBalance({ asset, amount: '1', claimants });
export const policy = (op = {}) => ({ version: 1, creationTime: String(CREATED), operations: [{ operation: 0, beneficiary: A, recovery: B, handoverAfter: '60', exclusive: true, continuousCoverage: true, ...op }] });
export const giftPolicy = () => ({ version: 1, creationTime: String(CREATED), operations: [{ operation: 0, beneficiary: A, exclusive: true, continuousCoverage: true }] });

export function transaction(operations = [create(handover())]) {
  const builder = new TransactionBuilder(new Account(C, '1'), { fee: '100', networkPassphrase: Networks.TESTNET });
  for (const op of operations) builder.addOperation(op);
  return builder.setTimebounds(0, 0).build();
}

export const encode = env => env.toXdr('base64');
export const envelope = (operations) => transaction(operations).toXdr();

export function legacyEnvelope(operations = [create(handover())]) {
  return xdr.TransactionEnvelope.envelopeTypeTxV0(new xdr.TransactionV0Envelope({
    tx: new xdr.TransactionV0({ sourceAccountEd25519: Buffer.alloc(32, 3), fee: 100, seqNum: 2n,
      timeBounds: null, memo: xdr.Memo.memoNone(), operations, ext: xdr.TransactionV0Ext.v0() }),
    signatures: [],
  }));
}

// Build structurally encodable, semantically invalid operations without SDK builder validation.
export function rawCreate({ predicates = [always()], destinations = [A], amount = 10000000n, asset = xdr.Asset.assetTypeNative() } = {}) {
  return new xdr.Operation({ sourceAccount: null, body: xdr.OperationBody.createClaimableBalance(new xdr.CreateClaimableBalanceOp({
    asset, amount, claimants: predicates.map((predicate, i) => xdr.Claimant.claimantTypeV0(new xdr.ClaimantV0({
      destination: xdr.PublicKey.publicKeyTypeEd25519(StrKey.decodeEd25519PublicKey(destinations[i] ?? A)), predicate,
    }))),
  })) });
}
