import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { generateKeyPairSync, privateDecrypt } from 'crypto';
import encryptHandler from '../../src/handlers/encrypt.js';
import { mkdirSync } from 'node:fs';

const dir = join(__dirname, '..', 'mock', 'encrypt');
mkdirSync(dir, { recursive: true });

const MOCK_DIR = join(__dirname, '..', 'mock', 'encrypt');
const PUBLIC_KEY_FILE = join(MOCK_DIR, 'test-public.pem');
const INVALID_KEY_FILE = join(MOCK_DIR, 'test-key.pem'); // ed25519, not valid for publicEncrypt

let rsaPrivateKey: string;

const createEvent = (value: string, keyPath: string, options: Record<string, any> = {}): any => ({
  args: [value, keyPath],
  options: {
    encoding: 'base64',
    ...options
  }
});

describe('encrypt handler', () => {
  beforeEach(() => {
    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048
    });

    const publicKeyPem = publicKey.export({ type: 'spki', format: 'pem' }) as string;
    rsaPrivateKey = privateKey.export({ type: 'pkcs8', format: 'pem' }) as string;

    writeFileSync(PUBLIC_KEY_FILE, publicKeyPem, 'utf8');
  });

  afterEach(() => {
    if (existsSync(PUBLIC_KEY_FILE)) {
      unlinkSync(PUBLIC_KEY_FILE);
    }
  });

  it('should encrypt a value and output base64 by default', () => {
    const logs: string[] = [];
    const originalLog = console.log;
    console.log = (msg: string) => logs.push(msg);

    try {
      encryptHandler(createEvent('hello-world', PUBLIC_KEY_FILE), null as any, null as any);
    } finally {
      console.log = originalLog;
    }

    assert.equal(logs.length, 1);
    assert.doesNotThrow(() => Buffer.from(logs[0], 'base64'));
  });

  it('should throw when the key file does not exist', () => {
    assert.throws(
      () => encryptHandler(createEvent('value', join(MOCK_DIR, 'nonexistent.pem')), null as any, null as any),
      { code: 'ENOENT' }
    );
  });

  it('should throw when using an unsupported key type (ed25519)', () => {
    assert.throws(
      () => encryptHandler(createEvent('value', INVALID_KEY_FILE), null as any, null as any)
    );
  });
});