import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'fs';
import { join } from 'path';
import newPlugin from '../../src/handlers/new-plugin.js';

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

describe('new-plugin handler', () => {
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
