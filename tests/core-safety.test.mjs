import { test } from 'node:test';
import assert from 'node:assert/strict';
import { localEndpoint, assertStandalone } from '../integration/safety.mjs';
import { operationResults, decodeTransactionResult } from '../integration/client.mjs';
import { xdr } from '@stellar/stellar-sdk';

test('Core harness accepts only explicit loopback HTTP ports', () => {
  assert.equal(localEndpoint('http://127.0.0.1:18000/rpc').pathname, '/rpc');
  for (const url of ['https://127.0.0.1:8000', 'http://localhost:8000',
    'http://stellar.org:8000', 'http://127.0.0.1', 'http://u:p@127.0.0.1:8000',
    'http://127.0.0.1:8000/?redirect=1', 'http://127.0.0.1:8000/#hash']) {
    assert.throws(() => localEndpoint(url));
  }
});

test('Core harness checks both network identities and protocol before signing', () => {
  const config = { networkPassphrase: 'Standalone Network ; February 2017', protocolVersion: 28 };
  const core = { info: { network: config.networkPassphrase, ledger: { version: 28 } } };
  const rpc = { passphrase: config.networkPassphrase, protocolVersion: '28' };
  assert.doesNotThrow(() => assertStandalone(core, rpc, config));
  assert.throws(() => assertStandalone(core, { ...rpc, passphrase: 'Test SDF Network ; September 2015' }, config));
  assert.throws(() => assertStandalone({ info: { ...core.info, network: 'public' } }, rpc, config));
  assert.throws(() => assertStandalone(core, { ...rpc, protocolVersion: '27' }, config));
  assert.throws(() => assertStandalone({ info: { ...core.info, ledger: { version: 27 } } }, rpc, config));
});

test('Core outcome decoding preserves predicate and transfer failures distinctly', () => {
  for (const code of ['claimClaimableBalanceSuccess', 'claimClaimableBalanceCannotClaim',
    'claimClaimableBalanceNoTrust', 'claimClaimableBalanceLineFull', 'claimClaimableBalanceNotAuthorized']) {
    const inner = xdr.OperationResultTr.claimClaimableBalance(xdr.ClaimClaimableBalanceResult[code]());
    const outcome = code.endsWith('Success') ? 'txSuccess' : 'txFailed';
    const result = { resultXdr: { result: xdr.TransactionResultResult[outcome]([xdr.OperationResult.opInner(inner)]) } };
    assert.deepEqual(operationResults(result), { transaction: outcome, operations: [code] });
  }
  assert.throws(() => operationResults({}), /no transaction-result XDR/);
});

test('Core harness requires exact timestamps across old and new RPC wire formats', () => {
  const resultXdr = new xdr.TransactionResult({ feeCharged: 100n,
    result: xdr.TransactionResultResult.txSuccess([]), ext: xdr.TransactionResultExt.v0() }).toXdr('base64');
  const raw = { status: 'SUCCESS', ledger: 65, resultXdr };
  assert.equal(decodeTransactionResult({ ...raw, createdAt: 1800000000 }).createdAt, 1800000000);
  assert.equal(decodeTransactionResult({ ...raw, ledgerCloseTime: '1800000000' }).createdAt, 1800000000);
  assert.throws(() => decodeTransactionResult(raw), /timestamp/);
  assert.throws(() => decodeTransactionResult({ ...raw, ledgerCloseTime: '1.5' }), /timestamp/);
});
