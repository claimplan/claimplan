import { Asset, StrKey, xdr } from '@stellar/stellar-sdk';
import { address, decimal } from './policy.js';
import { InputError, INT64_MAX, type DecodedPlan, type Predicate } from './types.js';

export const MAX_INPUT_BYTES = 1024 * 1024;

function predicate(raw: xdr.ClaimPredicate, depth = 1): Predicate {
  if (depth > 4) throw new InputError('claim predicate exceeds maximum depth four');
  switch (raw.type) {
    case 'claimPredicateUnconditional': return { type: 'unconditional' };
    case 'claimPredicateBeforeAbsoluteTime': return { type: 'beforeAbsolute', seconds: decimal(raw.absBefore.toString(), INT64_MAX, 'absolute predicate') };
    case 'claimPredicateBeforeRelativeTime': return { type: 'beforeRelative', seconds: decimal(raw.relBefore.toString(), INT64_MAX, 'relative predicate') };
    case 'claimPredicateNot': {
      const child = raw.notPredicate;
      if (!child) throw new InputError('not predicate requires a child');
      return { type: 'not', child: predicate(child, depth + 1) };
    }
    case 'claimPredicateAnd':
    case 'claimPredicateOr': {
      const children = raw.type === 'claimPredicateAnd' ? raw.andPredicates : raw.orPredicates;
      const [left, right] = children;
      if (children.length !== 2 || !left || !right) throw new InputError('and/or predicates require exactly two children');
      return { type: raw.type === 'claimPredicateAnd' ? 'and' : 'or', left: predicate(left, depth + 1), right: predicate(right, depth + 1) };
    }
    default: throw new InputError('unsupported claim predicate');
  }
}

/** Decode only; signatures, funding and transaction acceptance are not verified. */
export function decodeEnvelope(input: string): DecodedPlan {
  if (typeof input !== 'string' || Buffer.byteLength(input, 'utf8') > MAX_INPUT_BYTES) throw new InputError('XDR input must be a string of at most 1 MiB');
  const encoded = input.trim();
  if (!encoded || encoded.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) {
    throw new InputError('expected canonical base64 transaction-envelope XDR');
  }
  const bytes = Buffer.from(encoded, 'base64');
  if (bytes.toString('base64') !== encoded) throw new InputError('noncanonical base64 XDR');
  try {
    const envelope = xdr.TransactionEnvelope.fromXdr(bytes);
    if (!Buffer.from(envelope.toXdr()).equals(bytes)) throw new InputError('noncanonical or trailing XDR data');
    let tx: xdr.Transaction | xdr.TransactionV0;
    let kind: DecodedPlan['envelope'];
    switch (envelope.type) {
      case 'envelopeTypeTx': tx = envelope.v1.tx; kind = 'v1'; break;
      case 'envelopeTypeTxV0': tx = envelope.v0.tx; kind = 'v0'; break;
      case 'envelopeTypeTxFeeBump': tx = envelope.feeBump.tx.innerTx.v1.tx; kind = 'feeBump'; break;
      default: throw new InputError('unsupported transaction envelope');
    }
    let bounds: xdr.TimeBounds | null = null;
    if (kind === 'v0') bounds = (tx as xdr.TransactionV0).timeBounds;
    else {
      const cond = (tx as xdr.Transaction).cond;
      if (cond.type === 'precondTime') bounds = cond.timeBounds;
      else if (cond.type === 'precondV2') bounds = cond.v2.timeBounds;
      else if (cond.type !== 'precondNone') throw new InputError('unsupported transaction preconditions');
    }
    const result: DecodedPlan = {
      envelope: kind, balances: [], ignoredOperations: [],
      timeBounds: bounds ? { minTime: bounds.minTime, maxTime: bounds.maxTime } : null,
    };
    const operations = tx.operations;
    if (operations.length < 1 || operations.length > 100) throw new InputError('expected 1 through 100 transaction operations');
    for (const [index, op] of operations.entries()) {
      if (op.body.type !== 'createClaimableBalance') {
        result.ignoredOperations.push(index);
        continue;
      }
      const create = op.body.createClaimableBalanceOp;
      const amount = create.amount.toString();
      if (decimal(amount, INT64_MAX, `operation ${index} amount`) === 0n) throw new InputError(`operation ${index}: amount must be positive`);
      const rawClaimants = create.claimants;
      if (rawClaimants.length < 1 || rawClaimants.length > 10) throw new InputError(`operation ${index}: expected 1 through 10 claimants`);
      const seen = new Set<string>();
      const claimants = rawClaimants.map((claimant, claimantIndex) => {
        if (claimant.type !== 'claimantTypeV0') throw new InputError(`operation ${index}: unsupported claimant`);
        const data = claimant.v0;
        if (data.destination.type !== 'publicKeyTypeEd25519') throw new InputError(`operation ${index}: unsupported destination`);
        const destination = address(StrKey.encodeEd25519PublicKey(data.destination.ed25519.toBytes()), `operation ${index} claimant ${claimantIndex}`);
        if (seen.has(destination)) throw new InputError(`operation ${index}: duplicate claimant address`);
        seen.add(destination);
        try {
          return { destination, predicate: predicate(data.predicate) };
        } catch (error) {
          if (error instanceof InputError) throw new InputError(`operation ${index} claimant ${claimantIndex}: ${error.message}`);
          throw error;
        }
      });
      const parsedAsset = Asset.fromOperation(create.asset);
      if (!Buffer.from(parsedAsset.toXdrObject().toXdr()).equals(Buffer.from(create.asset.toXdr()))) {
        throw new InputError(`operation ${index}: noncanonical asset representation`);
      }
      const asset = parsedAsset.toString();
      result.balances.push({ operation: index, asset, amountStroops: amount, claimants });
    }
    if (result.balances.length === 0) throw new InputError('no CreateClaimableBalance operations found');
    return result;
  } catch (error) {
    if (error instanceof InputError) throw error;
    throw new InputError('malformed or unsupported transaction-envelope XDR');
  }
}
