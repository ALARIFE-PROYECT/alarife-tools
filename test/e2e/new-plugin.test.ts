import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import newPlugin from '../../src/handlers/new-plugin.js';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const child_process = require('child_process');

/**
 * Rules:
 *
 * target: ../mock/new-plugin
 * Options:
 * *  - author-name: Jose Eduardo Soria Garcia
 * *  - author-email: alarifeproyect@gmail.com
 * *  - library-name: alarife-http-server
 * *  - package-name: @alarife/http-server
 * *  - package-description: HTTP server plugin for Alarife
 * *  - plugin-resume: This is a simple HTTP server plugin for Alarife that allows you to create a server with custom routes and middlewares.
 */

const MOCK_DIR = join(__dirname, '..', 'mock', 'new-plugin');
mkdirSync(MOCK_DIR, { recursive: true });

const SKELETON_PACKAGE_JSON = JSON.stringify({
  name: '{PACKAGE_NAME}',
  version: '0.1.0',
  description: '{PACKAGE_DESCRIPTION}',
  author: '{AUTHOR_NAME} <{AUTHOR_EMAIL}>',
  main: './lib/index.js',
  scripts: {
    build: 'tsc'
  },
  dependencies: {
    '{LIBRARY_NAME}': '^0.1.0'
  }
}, null, 2);

const SKELETON_README = `# {PACKAGE_NAME}

{PACKAGE_DESCRIPTION}

{PLUGIN_RESUME}

## Author

 [{AUTHOR_NAME}](mailto:{AUTHOR_EMAIL})
`;

const SKELETON_LICENSE = `Apache License 2.0

Copyright 2026 {AUTHOR_NAME} <{AUTHOR_EMAIL}>
`;

const OPTIONS = {
  authorName: 'Jose Eduardo Soria Garcia',
  authorEmail: 'alarifeproyect@gmail.com',
  libraryName: 'alarife-http-server',
  packageName: '@alarife/http-server',
  packageDescription: 'HTTP server plugin for Alarife',
  pluginResume:
    'This is a simple HTTP server plugin for Alarife that allows you to create a server with custom routes and middlewares.'
};

const createEvent = (target: string, options: Record<string, any> = {}): any => ({
  args: [target],
  options: { ...OPTIONS, ...options }
});

const writeSkeleton = () => {
  writeFileSync(join(MOCK_DIR, 'package.json'), SKELETON_PACKAGE_JSON, 'utf8');
  writeFileSync(join(MOCK_DIR, 'README.md'), SKELETON_README, 'utf8');
  writeFileSync(join(MOCK_DIR, 'LICENSE'), SKELETON_LICENSE, 'utf8');
};

describe('new-plugin handler', () => {
  beforeEach(() => {
    mock.method(child_process, 'execSync', (command: string) => {
      if (typeof command === 'string' && command.startsWith('git clone')) {
        const match = command.match(/"([^"]+)"$/);
        if (match) {
          const pluginDir = join(match[1], 'plugin');
          mkdirSync(pluginDir, { recursive: true });
          writeFileSync(join(pluginDir, 'package.json'), SKELETON_PACKAGE_JSON, 'utf8');
          writeFileSync(join(pluginDir, 'README.md'), SKELETON_README, 'utf8');
          writeFileSync(join(pluginDir, 'LICENSE'), SKELETON_LICENSE, 'utf8');
        }
      }
    });
  });

  afterEach(() => {
    mock.restoreAll();
  });

  it('should replace all placeholders in package.json', () => {
    newPlugin(createEvent(MOCK_DIR), null as any, null as any);

    const content = readFileSync(join(MOCK_DIR, 'package.json'), 'utf8');

    assert.ok(content.includes(`"${OPTIONS.packageName}"`));
    assert.ok(content.includes(`"${OPTIONS.packageDescription}"`));
    assert.ok(content.includes(`${OPTIONS.authorName} <${OPTIONS.authorEmail}>`));
    assert.ok(content.includes(OPTIONS.libraryName));

    const match = content.match(/\{([^}\r\n]+)\}/);
    assert.strictEqual(match, null, match ? `It was found: ${match[0]}` : undefined);
  });

  it('should replace all placeholders in README.md', () => {
    newPlugin(createEvent(MOCK_DIR), null as any, null as any);

    const content = readFileSync(join(MOCK_DIR, 'README.md'), 'utf8');
    assert.ok(content.includes(OPTIONS.packageName));
    assert.ok(content.includes(OPTIONS.packageDescription));
    assert.ok(content.includes(OPTIONS.pluginResume));
    assert.ok(content.includes(` [${OPTIONS.authorName}](mailto:${OPTIONS.authorEmail})`));

    const match = content.match(/\{([^}\r\n]+)\}/);
    assert.strictEqual(match, null, match ? `It was found: ${match[0]}` : undefined);
  });

  it('should replace all placeholders in LICENSE', () => {
    newPlugin(createEvent(MOCK_DIR), null as any, null as any);

    const content = readFileSync(join(MOCK_DIR, 'LICENSE'), 'utf8');
    assert.ok(content.includes(`${OPTIONS.authorName} <${OPTIONS.authorEmail}>`));

    const match = content.match(/\{([^}\r\n]+)\}/);
    assert.strictEqual(match, null, match ? `It was found: ${match[0]}` : undefined);
  });
});
