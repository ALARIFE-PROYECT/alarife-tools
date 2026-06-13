import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, existsSync, unlinkSync, mkdirSync } from 'fs';
import { join } from 'path';
import { generateKeyPairSync, privateDecrypt, constants } from 'crypto';
import encryptHandler from '../../src/handlers/encrypt.js';

const MOCK_DIR = join(__dirname, '..', 'mock', 'encrypt');
mkdirSync(MOCK_DIR, { recursive: true });

const PUBLIC_KEY_FILE = join(MOCK_DIR, 'test-public.pem');
const INVALID_KEY_FILE = join(MOCK_DIR, 'test-invalid-public.pem');

let rsaPrivateKeyPem: string;

const createEvent = (value: string, keyPath: string, options: Record<string, any> = {}): any => ({
  args: [value, keyPath],
  options: {
    encoding: 'base64',
    ...options
  }
});

const captureLogs = (fn: () => void): string[] => {
  const logs: string[] = [];
  const originalLog = console.log;
  console.log = (msg: string) => logs.push(msg);
  try {
    fn();
  } finally {
    console.log = originalLog;
  }
  return logs;
};

const stripCipher = (value: string): string => (value.startsWith('{cipher}') ? value.slice(8) : value);

describe('encrypt handler', () => {
  beforeEach(() => {
    const { publicKey, privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });

    const publicKeyPem = publicKey.export({ type: 'spki', format: 'pem' }) as string;
    rsaPrivateKeyPem = privateKey.export({ type: 'pkcs8', format: 'pem' }) as string;

    writeFileSync(PUBLIC_KEY_FILE, publicKeyPem, 'utf8');

    const { publicKey: invalidPublic } = generateKeyPairSync('ed25519');
    const invalidPem = invalidPublic.export({ type: 'spki', format: 'pem' }) as string;
    writeFileSync(INVALID_KEY_FILE, invalidPem, 'utf8');
  });

  afterEach(() => {
    for (const file of [PUBLIC_KEY_FILE, INVALID_KEY_FILE]) {
      if (existsSync(file)) {
        unlinkSync(file);
      }
    }
  });

  it('should encrypt a value, prefix it with {cipher} and output base64 by default', () => {
    const logs = captureLogs(() => {
      encryptHandler(createEvent('hello-world', PUBLIC_KEY_FILE), null as any, null as any);
    });

    assert.equal(logs.length, 1);
    assert.ok(logs[0].startsWith('{cipher}'), 'output should start with {cipher} prefix');

    const cipherText = stripCipher(logs[0]);
    const decrypted = privateDecrypt(
      { key: rsaPrivateKeyPem, padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
      Buffer.from(cipherText, 'base64')
    );
    assert.equal(decrypted.toString('utf-8'), 'hello-world');
  });

  it('should support hex encoding', () => {
    const logs = captureLogs(() => {
      encryptHandler(createEvent('hex-value', PUBLIC_KEY_FILE, { encoding: 'hex' }), null as any, null as any);
    });

    const cipherText = stripCipher(logs[0]);
    const decrypted = privateDecrypt(
      { key: rsaPrivateKeyPem, padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
      Buffer.from(cipherText, 'hex')
    );
    assert.equal(decrypted.toString('utf-8'), 'hex-value');
  });

  it('should support PKCS1 padding when requested', () => {
    const logs = captureLogs(() => {
      encryptHandler(createEvent('pkcs1-value', PUBLIC_KEY_FILE, { padding: 'pkcs1' }), null as any, null as any);
    });

    const cipherText = stripCipher(logs[0]);
    const decrypted = privateDecrypt(
      { key: rsaPrivateKeyPem, padding: constants.RSA_PKCS1_PADDING },
      Buffer.from(cipherText, 'base64')
    );
    assert.equal(decrypted.toString('utf-8'), 'pkcs1-value');
  });

  it('should throw when the key file does not exist', () => {
    assert.throws(
      () => encryptHandler(createEvent('value', join(MOCK_DIR, 'nonexistent.pem')), null as any, null as any),
      { code: 'ENOENT' }
    );
  });

  it('should throw when using an unsupported key type (ed25519)', () => {
    assert.throws(
      () => encryptHandler(createEvent('value', INVALID_KEY_FILE), null as any, null as any),
      /Only RSA public keys are supported/
    );
  });
});
