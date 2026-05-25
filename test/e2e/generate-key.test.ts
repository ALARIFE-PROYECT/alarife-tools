import { describe, it, afterEach, before } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, unlinkSync, statSync } from 'fs';
import { join } from 'path';
import generateKey from '../../src/handlers/generate-key.js';
import { mkdirSync } from 'node:fs';

const dir = join(__dirname, '..', 'mock', 'generate-key');
mkdirSync(dir, { recursive: true });

const TARGET_PATH = join(__dirname, '..', 'mock', 'generate-key');
const OUTPUT_FILE = join(TARGET_PATH, 'private.pem');

const createEvent = (path: string, options: Record<string, any> = {}): any => ({
  args: [path],
  options: {
    keyType: 'ed25519',
    privateExportType: 'pkcs8',
    publicExportType: 'spki',
    keyFormat: 'pem',
    ...options
  }
});

describe('generate-key handler', () => {
  afterEach(() => {
    if (existsSync(OUTPUT_FILE)) {
      unlinkSync(OUTPUT_FILE);
    }
  });

  it('should generate an RSA private key file in PEM format', () => {
    generateKey(createEvent(TARGET_PATH), null as any, null as any);

    assert.ok(existsSync(OUTPUT_FILE));
    const content = readFileSync(OUTPUT_FILE, 'utf8');
    assert.ok(content.startsWith('-----BEGIN PRIVATE KEY-----'));
    assert.ok(content.includes('-----END PRIVATE KEY-----'));
  });

  it('should generate an Ed25519 key pair', () => {
    generateKey(createEvent(TARGET_PATH, { keyType: 'ed25519' }), null as any, null as any);

    assert.ok(existsSync(OUTPUT_FILE));
    const content = readFileSync(OUTPUT_FILE, 'utf8');
    assert.ok(content.startsWith('-----BEGIN PRIVATE KEY-----'));
  });

  it('should write the file with restrictive permissions (0o600)', () => {
    generateKey(createEvent(TARGET_PATH), null as any, null as any);

    const stats = statSync(OUTPUT_FILE);
    const mode = stats.mode & 0o777;
    assert.ok(existsSync(OUTPUT_FILE));
    assert.equal(mode & 0o600, 0o600);
  });

  it('should write only the private key to the file, not the public key', () => {
    generateKey(createEvent(TARGET_PATH), null as any, null as any);

    const content = readFileSync(OUTPUT_FILE, 'utf8');
    assert.ok(!content.includes('-----BEGIN PUBLIC KEY-----'));
  });
});
