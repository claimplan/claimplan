import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { localEndpoint } from './safety.mjs';

const exec = promisify(execFile);
export const config = JSON.parse(await readFile(new URL('./network.json', import.meta.url), 'utf8'));
export const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

export async function coreRequest(base, path) {
  const url = localEndpoint(new URL(path, base).href);
  const response = await fetch(url, {
    redirect: 'error', signal: AbortSignal.timeout(config.requestTimeoutMs),
  });
  if (!response.ok) throw new Error(`Local Core returned HTTP ${response.status}`);
  const body = await response.text();
  try { return JSON.parse(body); } catch { return body; }
}

// Own precisely one ephemeral container; no volumes, user-provided endpoints or keys.
export async function startNetwork() {
  const name = `claimplan-core-${randomUUID()}`;
  let started = false;
  const stop = async () => {
    if (started) {
      await exec('docker', ['rm', '--force', name]);
      started = false;
    }
  };
  try {
    await exec('docker', ['run', '--detach', '--name', name,
      '--label', 'org.claimplan.integration=true', '--memory', config.memoryLimit,
      '--cpus', '2', '--publish', '127.0.0.1::8000', '--publish', '127.0.0.1::11626',
      config.image, '--local', '--enable', config.services, '--limits', 'default',
      '--protocol-version', String(config.protocolVersion), '--enable-core-manual-close',
      '--core-log-level', 'ERROR'], { timeout: config.startupTimeoutMs });
    started = true;
    const { stdout } = await exec('docker', ['inspect', name]);
    const info = JSON.parse(stdout)[0];
    const port = key => {
      const bindings = info.NetworkSettings.Ports[key];
      if (bindings?.length !== 1 || bindings[0].HostIp !== '127.0.0.1') {
        throw new Error('Unexpected Docker port binding');
      }
      return bindings[0].HostPort;
    };
    const core = localEndpoint(`http://127.0.0.1:${port('11626/tcp')}/`);
    const rpc = localEndpoint(`http://127.0.0.1:${port('8000/tcp')}/rpc`);
    const deadline = Date.now() + config.startupTimeoutMs;
    let lastError;
    while (Date.now() < deadline) {
      try {
        const status = await coreRequest(core, 'info');
        if (status.info?.network !== config.networkPassphrase) throw new Error('Unexpected Core network');
        if (status.info?.ledger?.version === config.protocolVersion) {
          return { core, rpc, stop, container: name, imageId: info.Image, info: status };
        }
        await coreRequest(core, 'manualclose');
      } catch (error) { lastError = error; }
      await pause(1000);
    }
    const logs = await exec('docker', ['logs', '--tail', '40', name]);
    throw new Error(`Local Core startup timed out: ${lastError?.message ?? 'upgrade pending'}\n${logs.stdout}${logs.stderr}`);
  } catch (error) {
    await stop();
    throw error;
  }
}
