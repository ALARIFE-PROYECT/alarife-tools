import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, rmSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import generateKeyHandler from '../../src/handlers/generate-key.js';
import encryptHandler from '../../src/handlers/encrypt.js';
import decryptHandler from '../../src/handlers/decrypt.js';

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

const generateKeyEvent = (path: string, options: Record<string, any> = {}): any => ({
  args: [path],
  options: {
    keyType: 'rsa',
    privateExportType: 'pkcs8',
    publicExportType: 'spki',
    keyFormat: 'pem',
    modulusLength: 2048,
    ...options
  }
});

const encryptEvent = (value: string, keyPath: string, options: Record<string, any> = {}): any => ({
  args: [value, keyPath],
  options: {
    encoding: 'base64',
    padding: 'oaep',
    oaepHash: 'sha256',
    ...options
  }
});

const decryptEvent = (value: string, keyPath: string, options: Record<string, any> = {}): any => ({
  args: [value, keyPath],
  options: {
    encoding: 'base64',
    padding: 'oaep',
    oaepHash: 'sha256',
    ...options
  }
});

describe('encrypt/decrypt full cycle (generate-key -> encrypt -> decrypt)', () => {
  let tempDir: string;
  let privateKeyPath: string;
  let publicKeyPath: string;

  before(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'alarife-cycle-'));
    privateKeyPath = join(tempDir, 'private.pem');
    publicKeyPath = join(tempDir, 'public.pem');

    const logs = captureLogs(() => {
      generateKeyHandler(generateKeyEvent(tempDir), null as any, null as any);
    });

    assert.ok(existsSync(privateKeyPath), 'generate-key should write private.pem');
    assert.equal(logs.length, 1, 'generate-key should log the public key');
    assert.ok(logs[0].includes('-----BEGIN PUBLIC KEY-----'), 'logged content should be a public key');

    writeFileSync(publicKeyPath, logs[0], 'utf8');
  });

  after(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('should encrypt and then decrypt the value back to the original (base64 / OAEP-SHA256)', () => {
    const plaintext = 'super-secret-value';

    const encryptLogs = captureLogs(() => {
      encryptHandler(encryptEvent(plaintext, publicKeyPath), null as any, null as any);
    });

    assert.equal(encryptLogs.length, 1);
    const cipherOutput = encryptLogs[0];
    assert.ok(cipherOutput.startsWith('{cipher}'), 'encrypted output should start with {cipher}');

    const decryptLogs = captureLogs(() => {
      decryptHandler(decryptEvent(cipherOutput, privateKeyPath), null as any, null as any);
    });

    assert.equal(decryptLogs.length, 1);
    assert.equal(decryptLogs[0], plaintext);
  });

  it('should complete the cycle with hex encoding', () => {
    const plaintext = 'hex-cycle-value';

    const encryptLogs = captureLogs(() => {
      encryptHandler(encryptEvent(plaintext, publicKeyPath, { encoding: 'hex' }), null as any, null as any);
    });

    const decryptLogs = captureLogs(() => {
      decryptHandler(decryptEvent(encryptLogs[0], privateKeyPath, { encoding: 'hex' }), null as any, null as any);
    });

    assert.equal(decryptLogs[0], plaintext);
  });

  it('should complete the cycle with PKCS1 padding', () => {
    const plaintext = 'pkcs1-cycle-value';

    const encryptLogs = captureLogs(() => {
      encryptHandler(encryptEvent(plaintext, publicKeyPath, { padding: 'pkcs1' }), null as any, null as any);
    });

    const decryptLogs = captureLogs(() => {
      decryptHandler(decryptEvent(encryptLogs[0], privateKeyPath, { padding: 'pkcs1' }), null as any, null as any);
    });

    assert.equal(decryptLogs[0], plaintext);
  });

  it('should fail to decrypt when using a different private key than the one paired with the public key', () => {
    const otherDir = mkdtempSync(join(tmpdir(), 'alarife-cycle-other-'));
    try {
      captureLogs(() => {
        generateKeyHandler(generateKeyEvent(otherDir), null as any, null as any);
      });

      const encryptLogs = captureLogs(() => {
        encryptHandler(encryptEvent('mismatched', publicKeyPath), null as any, null as any);
      });

      const otherPrivate = join(otherDir, 'private.pem');
      assert.throws(() => {
        decryptHandler(decryptEvent(encryptLogs[0], otherPrivate), null as any, null as any);
      });
    } finally {
      rmSync(otherDir, { recursive: true, force: true });
    }
  });
});
