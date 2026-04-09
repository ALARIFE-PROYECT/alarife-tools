import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { generateKeyPairSync, publicEncrypt } from 'crypto';
import decryptHandler from '../../src/handlers/decrypt.js';
import { mkdirSync } from 'node:fs';

const MOCK_DIR = join(__dirname, '..', 'mock', 'decrypt');
mkdirSync(MOCK_DIR, { recursive: true });

const PRIVATE_KEY_FILE = join(MOCK_DIR, 'test-rsa-private.pem');
const INVALID_KEY_FILE = join(MOCK_DIR, 'test-private.pem'); // ed25519, not valid for privateDecrypt

let rsaPublicKeyPem: string;

const createEvent = (value: string, keyPath: string, options: Record<string, any> = {}): any => ({
  args: [value, keyPath],
  options: {
    encoding: 'base64',
    ...options
  }
});

const encryptValue = (plaintext: string, encoding: BufferEncoding = 'base64'): string => {
  const encrypted = publicEncrypt(rsaPublicKeyPem, Buffer.from(plaintext, 'utf-8'));
  return `{cipher}${encrypted.toString(encoding)}`;
};

describe('decrypt handler', () => {
  beforeEach(() => {
    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048
    });

    rsaPublicKeyPem = publicKey.export({ type: 'spki', format: 'pem' }) as string;
    const privateKeyPem = privateKey.export({ type: 'pkcs8', format: 'pem' }) as string;

    writeFileSync(PRIVATE_KEY_FILE, privateKeyPem, 'utf8');
  });

  afterEach(() => {
    if (existsSync(PRIVATE_KEY_FILE)) {
      unlinkSync(PRIVATE_KEY_FILE);
    }
  });

  it('should decrypt a {cipher} prefixed value', () => {
    const encrypted = encryptValue('hello-world');
    const logs: string[] = [];
    const originalLog = console.log;
    console.log = (msg: string) => logs.push(msg);

    try {
      decryptHandler(createEvent(encrypted, PRIVATE_KEY_FILE), null as any, null as any);
    } finally {
      console.log = originalLog;
    }

    assert.equal(logs.length, 1);
    assert.equal(logs[0], 'hello-world');
  });

  it('should decrypt a value without {cipher} prefix', () => {
    const encrypted = publicEncrypt(rsaPublicKeyPem, Buffer.from('raw-value', 'utf-8'));
    const base64 = encrypted.toString('base64');
    const logs: string[] = [];
    const originalLog = console.log;
    console.log = (msg: string) => logs.push(msg);

    try {
      decryptHandler(createEvent(base64, PRIVATE_KEY_FILE), null as any, null as any);
    } finally {
      console.log = originalLog;
    }

    assert.equal(logs[0], 'raw-value');
  });

  it('should support hex encoding', () => {
    const encrypted = encryptValue('hex-test', 'hex');
    const logs: string[] = [];
    const originalLog = console.log;
    console.log = (msg: string) => logs.push(msg);

    try {
      decryptHandler(createEvent(encrypted, PRIVATE_KEY_FILE, { encoding: 'hex' }), null as any, null as any);
    } finally {
      console.log = originalLog;
    }

    assert.equal(logs[0], 'hex-test');
  });

  it('should throw when the key file does not exist', () => {
    assert.throws(
      () => decryptHandler(createEvent('value', join(MOCK_DIR, 'nonexistent.pem')), null as any, null as any),
      { code: 'ENOENT' }
    );
  });

  it('should throw when using an unsupported key type (ed25519)', () => {
    assert.throws(
      () => decryptHandler(createEvent('somedata', INVALID_KEY_FILE), null as any, null as any)
    );
  });

  it('should throw when the encrypted value is corrupted', () => {
    assert.throws(
      () => decryptHandler(createEvent('{cipher}invalidbase64data==', PRIVATE_KEY_FILE), null as any, null as any)
    );
  });
});