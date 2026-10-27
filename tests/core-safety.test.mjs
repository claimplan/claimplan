import { test } from 'node:test';
import assert from 'node:assert/strict';
import { localEndpoint, assertStandalone } from '../integration/safety.mjs';

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
