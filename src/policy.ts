import { StrKey } from '@stellar/stellar-sdk';
import { InputError, INT64_MAX, TIME_END, type Policy, type OperationPolicy } from './types.js';

export function object(value: unknown, path: string): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) throw new InputError(`${path}: expected an object`);
  return value as Record<string, unknown>;
}

export function keys(value: Record<string, unknown>, allowed: readonly string[], path: string): void {
  if (Object.keys(value).some(k => !allowed.includes(k))) throw new InputError(`${path}: unknown field`);
}

export function decimal(value: unknown, max: bigint, path: string): bigint {
  if (typeof value !== 'string' || value.length > 20 || !/^(0|[1-9][0-9]*)$/.test(value)) {
    throw new InputError(`${path}: expected a canonical nonnegative decimal string`);
  }
  const number = BigInt(value);
  if (number > max) throw new InputError(`${path}: value out of range`);
  return number;
}

export function address(value: unknown, path: string): string {
  if (typeof value !== 'string' || !StrKey.isValidEd25519PublicKey(value)) throw new InputError(`${path}: expected a valid G-address`);
  return value;
}

export function operationIndex(value: unknown, path: string): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value > 99) throw new InputError(`${path}: expected an integer from 0 through 99`);
  return value;
}

export function parsePolicy(input: unknown): Policy {
  const root = object(input, 'policy');
  keys(root, ['version', 'creationTime', 'operations'], 'policy');
  if (root.version !== 1) throw new InputError('policy.version: expected 1');
  if (!Array.isArray(root.operations) || root.operations.length < 1 || root.operations.length > 100) {
    throw new InputError('policy.operations: expected 1 through 100 policies');
  }
  const policy: Policy = { version: 1, operations: [] };
  if ('creationTime' in root) policy.creationTime = decimal(root.creationTime, TIME_END - 1n, 'policy.creationTime');
  const seen = new Set<number>();
  for (const [index, entry] of root.operations.entries()) {
    const path = `policy.operations[${index}]`;
    const op = object(entry, path);
    keys(op, ['operation', 'beneficiary', 'recovery', 'handoverAfter', 'exclusive', 'continuousCoverage'], path);
    const operation = operationIndex(op.operation, `${path}.operation`);
    if (seen.has(operation)) throw new InputError(`${path}.operation: duplicate policy`);
    seen.add(operation);
    if (typeof op.exclusive !== 'boolean' || typeof op.continuousCoverage !== 'boolean') {
      throw new InputError(`${path}: exclusive and continuousCoverage must be explicit booleans`);
    }
    const parsed: OperationPolicy = {
      operation, beneficiary: address(op.beneficiary, `${path}.beneficiary`),
      exclusive: op.exclusive, continuousCoverage: op.continuousCoverage,
    };
    if (('recovery' in op) !== ('handoverAfter' in op)) throw new InputError(`${path}: recovery and handoverAfter must occur together`);
    if ('recovery' in op) {
      parsed.recovery = address(op.recovery, `${path}.recovery`);
      if (parsed.recovery === parsed.beneficiary) throw new InputError(`${path}: recovery must differ from beneficiary`);
      parsed.handoverAfter = decimal(op.handoverAfter, INT64_MAX, `${path}.handoverAfter`);
      if (parsed.handoverAfter === 0n) throw new InputError(`${path}.handoverAfter: must be positive`);
      if (policy.creationTime !== undefined && policy.creationTime + parsed.handoverAfter >= TIME_END) {
        throw new InputError(`${path}.handoverAfter: handover exceeds time domain`);
      }
    }
    policy.operations.push(parsed);
  }
  return policy;
}
