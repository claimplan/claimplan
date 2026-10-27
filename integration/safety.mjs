// The development harness never accepts remote hosts, redirects or user credentials.
export function localEndpoint(value) {
  const url = new URL(value);
  if (url.protocol !== 'http:' || url.hostname !== '127.0.0.1' ||
      url.username || url.password || !url.port || url.search || url.hash) {
    throw new Error('Core verification requires an explicit HTTP IPv4 loopback port');
  }
  return url;
}

export function assertStandalone(coreInfo, rpcNetwork, config) {
  if (coreInfo.info?.network !== config.networkPassphrase ||
      rpcNetwork.passphrase !== config.networkPassphrase ||
      Number(rpcNetwork.protocolVersion) !== config.protocolVersion ||
      coreInfo.info?.ledger?.version !== config.protocolVersion) {
    throw new Error('Refusing to sign: standalone network identity/protocol mismatch');
  }
}
