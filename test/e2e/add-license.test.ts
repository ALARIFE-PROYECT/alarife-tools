import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import addLicense from '../../src/handlers/add-license.js';

const MOCK_DIR = join(__dirname, '..', 'mock', 'add-license');
const FILE_TEST = join(MOCK_DIR, 'file_test.js');

const createEvent = (path: string, options: Record<string, any> = {}): any => ({
  args: [path],
  options: {
    projectName: '@alarife',
    projectAuthor: 'Soria Garcia Jose Eduardo',
    projectLicense: 'Apache-2.0',
    ...options
  }
});

describe('add-license handler', () => {
  let originalContent: string;

  beforeEach(() => {
    originalContent = readFileSync(FILE_TEST, 'utf8');
  });

  afterEach(() => {
    writeFileSync(FILE_TEST, originalContent, 'utf8');
  });

  it('should add license header to an empty file', () => {
    writeFileSync(FILE_TEST, 'const x = 1;\n', 'utf8');

    addLicense(createEvent(MOCK_DIR, { extensions: ['js'] }), null as any, null as any);

    const content = readFileSync(FILE_TEST, 'utf8');
    assert.ok(content.includes('Copyright (c) 2026 Soria Garcia Jose Eduardo'));
    assert.ok(content.includes('This file is part of @alarife'));
    assert.ok(content.includes('Licensed under the Apache-2.0'));
    assert.ok(content.includes('const x = 1;'));
  });

  it('should not duplicate license if already present', () => {
    writeFileSync(FILE_TEST, 'const x = 1;\n', 'utf8');

    addLicense(createEvent(MOCK_DIR, { extensions: ['js'] }), null as any, null as any);
    addLicense(createEvent(MOCK_DIR, { extensions: ['js'] }), null as any, null as any);

    const content = readFileSync(FILE_TEST, 'utf8');
    const matches = content.match(/Copyright \(c\)/g);
    assert.equal(matches?.length, 1);
  });

  it('should preserve shebang line at the top', () => {
    writeFileSync(FILE_TEST, '#!/usr/bin/env node\nconsole.log("hello");\n', 'utf8');

    addLicense(createEvent(MOCK_DIR, { extensions: ['js'] }), null as any, null as any);

    const content = readFileSync(FILE_TEST, 'utf8');
    assert.ok(content.startsWith('#!/usr/bin/env node\n'));
    assert.ok(content.includes('Copyright (c)'));
    assert.ok(content.includes('console.log("hello");'));
  });

  it('should preserve "use strict" at the top', () => {
    writeFileSync(FILE_TEST, 'use strict\nconst a = 2;\n', 'utf8');

    addLicense(createEvent(MOCK_DIR), null as any, null as any);

    const content = readFileSync(FILE_TEST, 'utf8');
    assert.ok(content.startsWith('use strict\n'));
    assert.ok(content.includes('Copyright (c)'));
  });

  it('should skip files with non-matching extensions', () => {
    writeFileSync(FILE_TEST, 'const x = 1;\n', 'utf8');

    addLicense(createEvent(MOCK_DIR, { extensions: ['ts'] }), null as any, null as any);

    const content = readFileSync(FILE_TEST, 'utf8');
    assert.ok(!content.includes('Copyright (c)'));
  });

  it('should default to js extension when extensions option is not provided', () => {
    writeFileSync(FILE_TEST, 'const x = 1;\n', 'utf8');

    addLicense(createEvent(MOCK_DIR, { extensions: undefined }), null as any, null as any);

    const content = readFileSync(FILE_TEST, 'utf8');
    assert.ok(content.includes('Copyright (c)'));
  });

  it('should throw when project-name is missing', () => {
    assert.throws(() => addLicense(createEvent(MOCK_DIR, { projectName: undefined }), null as any, null as any), {
      message: 'You must specify --project-name and --project-author.'
    });
  });

  it('should throw when project-author is missing', () => {
    assert.throws(() => addLicense(createEvent(MOCK_DIR, { projectAuthor: undefined }), null as any, null as any), {
      message: 'You must specify --project-name and --project-author.'
    });
  });
});
