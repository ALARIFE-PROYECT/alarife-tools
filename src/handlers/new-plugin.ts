import { Command, CommanderCommand, CommandEvent } from '@alarife/commander';
import { execSync } from 'child_process';

import { mkdtempSync, cpSync, rmSync, readFileSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

interface ReplaceInstruction {
  file: string;
  actions: Array<{
    key: string;
    optKey: string;
  }>;
}

const SKELETON_REPO = '/ALARIFE-PROYECT/alarife-skeleton';
const SKELETON_BRANCH = 'main';

const cloneSkeleton = (target: string): void => {
  const tempDir = mkdtempSync(join(tmpdir(), 'alarife-skeleton-'));

  try {
    execSync(`git clone --depth 1 --branch ${SKELETON_BRANCH} https://github.com${SKELETON_REPO}.git "${tempDir}"`, {
      stdio: 'ignore'
    });

    cpSync(join(tempDir, 'plugin'), target, { recursive: true });
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
};

const CHANGES: ReplaceInstruction[] = [
  {
    file: 'package.json',
    actions: [
      { key: 'PACKAGE_NAME', optKey: 'packageName' },
      { key: 'PACKAGE_DESCRIPTION', optKey: 'packageDescription' },
      { key: 'AUTHOR_NAME', optKey: 'authorName' },
      { key: 'AUTHOR_EMAIL', optKey: 'authorEmail' },
      { key: 'LIBRARY_NAME', optKey: 'libraryName' }
    ]
  },
  {
    file: 'README.md',
    actions: [
      { key: 'PACKAGE_NAME', optKey: 'packageName' },
      { key: 'PACKAGE_DESCRIPTION', optKey: 'packageDescription' },
      { key: 'PLUGIN_RESUME', optKey: 'pluginResume' },
      { key: 'AUTHOR_NAME', optKey: 'authorName' },
      { key: 'AUTHOR_EMAIL', optKey: 'authorEmail' }
    ]
  },
  {
    file: 'LICENSE',
    actions: [
      { key: 'AUTHOR_NAME', optKey: 'authorName' },
      { key: 'AUTHOR_EMAIL', optKey: 'authorEmail' }
    ]
  },
  {
    file: '.github/workflows/build-and-publish.yml',
    actions: [
      { key: 'PACKAGE_NAME', optKey: 'packageName' }
    ]
  }
];

const replacer = (target: string, options: Record<string, any>): void => {
  CHANGES.forEach(({ file, actions }) => {
    const filePath = join(target, file);
    let content = readFileSync(filePath, 'utf-8');

    actions.forEach(({ key, optKey }) => {
      if (options[optKey] !== undefined) {
        content = content.replaceAll(`{${key}}`, options[optKey]);
      }
    });

    writeFileSync(filePath, content, 'utf-8');
  });
};

export default (event: CommandEvent, command: CommanderCommand, commandConfig: Command) => {
  const [target] = event.args;
  const options = event.options;

  cloneSkeleton(target);

  replacer(target, options);

  execSync('npm install', { cwd: target, stdio: 'inherit' });
};
