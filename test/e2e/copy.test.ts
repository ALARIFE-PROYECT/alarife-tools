import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, existsSync, rmSync, mkdirSync } from 'fs';
import { join } from 'path';
import copyHandler from '../../src/handlers/copy.js';

const MOCK_DIR = join(__dirname, '..', 'mock', 'copy');
const SOURCE_DIR = join(MOCK_DIR, 'source');
const TARGET_DIR = join(MOCK_DIR, 'target');
const SOURCE_INDEX = join(SOURCE_DIR, 'index.js');
const SOURCE_UTIL = join(SOURCE_DIR, 'src', 'util.js');

const createEvent = (source: string, target: string, options: Record<string, any> = {}): any => ({
  args: [source, target],
  options: {
    deep: false,
    ...options
  }
});

describe('copy handler', () => {
  beforeEach(() => {
    writeFileSync(SOURCE_INDEX, 'export const index = true;\n', 'utf8');
    writeFileSync(SOURCE_UTIL, 'export const util = true;\n', 'utf8');

    rmSync(TARGET_DIR, { recursive: true, force: true });
    mkdirSync(TARGET_DIR, { recursive: true });
  });

  afterEach(() => {
    writeFileSync(SOURCE_INDEX, '', 'utf8');
    writeFileSync(SOURCE_UTIL, '', 'utf8');

    rmSync(TARGET_DIR, { recursive: true, force: true });
    mkdirSync(TARGET_DIR, { recursive: true });
  });

  describe('shallow copy (default)', () => {
    it('should copy a single file to the target directory', () => {
      copyHandler(createEvent(SOURCE_INDEX, TARGET_DIR), null as any, null as any);

      const copiedFile = join(TARGET_DIR, 'index.js');
      assert.ok(existsSync(copiedFile));
      assert.equal(readFileSync(copiedFile, 'utf8'), 'export const index = true;\n');
    });

    it('should copy a single file to an explicit target path', () => {
      const targetFile = join(TARGET_DIR, 'renamed.js');

      copyHandler(createEvent(SOURCE_INDEX, targetFile), null as any, null as any);

      assert.ok(existsSync(targetFile));
      assert.equal(readFileSync(targetFile, 'utf8'), 'export const index = true;\n');
    });

    it('should not copy subdirectories in shallow mode', () => {
      copyHandler(createEvent(SOURCE_INDEX, TARGET_DIR), null as any, null as any);

      assert.ok(!existsSync(join(TARGET_DIR, 'src')));
    });
  });

  describe('deep copy (--deep)', () => {
    it('should recursively copy all files and directories', () => {
      copyHandler(createEvent(SOURCE_DIR, TARGET_DIR, { deep: true }), null as any, null as any);

      assert.ok(existsSync(join(TARGET_DIR, 'index.js')));
      assert.ok(existsSync(join(TARGET_DIR, 'src', 'util.js')));
    });

    it('should preserve file contents in deep copy', () => {
      copyHandler(createEvent(SOURCE_DIR, TARGET_DIR, { deep: true }), null as any, null as any);

      assert.equal(readFileSync(join(TARGET_DIR, 'index.js'), 'utf8'), 'export const index = true;\n');
      assert.equal(readFileSync(join(TARGET_DIR, 'src', 'util.js'), 'utf8'), 'export const util = true;\n');
    });

    it('should create target directory if it does not exist', () => {
      const newTarget = join(TARGET_DIR, 'nested', 'output');

      copyHandler(createEvent(SOURCE_DIR, newTarget, { deep: true }), null as any, null as any);

      assert.ok(existsSync(join(newTarget, 'index.js')));
      assert.ok(existsSync(join(newTarget, 'src', 'util.js')));
    });
  });
});
