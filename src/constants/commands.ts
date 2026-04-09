import { Command } from '@alarife/commander';
import { join } from 'path';

export const ADD_LICENSE_COMMAND: Command = {
  name: 'add-license',
  description: 'Add the license paragraph to the beginning of each file.',
  path: join(__dirname, '../handlers/add-license.js'),
  arguments: [
    {
      description: 'Path to add license',
      required: true,
      descriptiveType: 'path'
    }
  ],
  options: [
    {
      name: 'extensions',
      description: 'Extensions to add license',
      descriptiveType: 'extensions',
      variadic: true,
      defaultValue: ['js']
    },
    {
      name: 'project-name',
      description: 'Project name',
      required: true
    },
    {
      name: 'project-author',
      description: 'Project author',
      descriptiveType: 'author',
      required: true
    },
    {
      name: 'project-license',
      description: 'Project license',
      descriptiveType: 'license',
      defaultValue: 'Apache-2.0'
    }
  ]
};

export const COPY_COMMAND: Command = {
  name: 'copy',
  description: 'Copy files from source to target.',
  path: join(__dirname, '../handlers/copy.js'),
  arguments: [
    {
      description: 'Path to source file',
      required: true,
      descriptiveType: 'source'
    },
    {
      description: 'Path to target file',
      required: true,
      descriptiveType: 'target'
    }
  ],
  options: [
    {
      name: 'deep',
      shortName: 'd',
      description: 'Copy files deeply',
      descriptiveType: 'boolean',
      defaultValue: false
    }
  ]
};

export const GENERATE_KEY_COMMAND: Command = {
  name: 'generate-key',
  description: 'Generate a random key.',
  path: join(__dirname, '../handlers/generate-key.js'),
  arguments: [
    {
      description: 'Path to save the generated key',
      required: true,
      descriptiveType: 'target'
    }
  ],
  options: [
    {
      name: 'key-type',
      description: 'Type of key to generate',
      descriptiveType: 'key-type',
      defaultValue: 'ed25519',
      required: false
    },
    {
      name: 'private-export-type',
      description: 'Private key export type',
      descriptiveType: 'type',
      defaultValue: 'pkcs8',
      required: false
    },
    {
      name: 'public-export-type',
      description: 'Public key export type',
      descriptiveType: 'type',
      defaultValue: 'spki',
      required: false
    },
    {
      name: 'key-format',
      description: 'Key export format',
      descriptiveType: 'format',
      defaultValue: 'pem',
      required: false
    }
  ]
};

export const ENCRYPT_COMMAND: Command = {
  name: 'encrypt',
  description: 'Encrypt a variable with a key.',
  path: join(__dirname, '../handlers/encrypt.js'),
  arguments: [
    {
      descriptiveType: 'value',
      description: 'Value to encrypt',
      required: true
    },
    {
      descriptiveType: 'key-path',
      description: 'Path to the public key',
      required: true
    }
  ],
  options: [
    {
      name: 'encoding',
      description: 'Encoding for the encrypted value',
      descriptiveType: 'encoding',
      defaultValue: 'base64',
      required: false
    }
  ]
};

export const DECRYPT_COMMAND: Command = {
  name: 'decrypt',
  description: 'Decrypt a variable with a key.',
  path: join(__dirname, '../handlers/decrypt.js'),
  arguments: [
    {
      description: 'Encrypted value to decrypt',
      required: true,
      descriptiveType: 'value'
    },
    {
      description: 'Path to the private key file',
      required: true,
      descriptiveType: 'key-path'
    }
  ],
  options: [
    {
      name: 'encoding',
      description: 'Input encoding of the encrypted value',
      descriptiveType: 'encoding',
      defaultValue: 'base64',
      required: false
    }
  ]
};

export const NEW_PLUGIN_COMMAND: Command = {
  name: 'new-plugin',
  description: 'Generate a new plugin.',
  path: join(__dirname, '../handlers/new-plugin.js'),
  arguments: [
    {
      description: 'Path to generate the plugin',
      descriptiveType: 'target',
      required: true
    }
  ],
  options: [
    {
      name: 'author-name',
      description: 'Plugin author name',
      descriptiveType: 'author',
      required: true
    },
    {
      name: 'author-email',
      description: 'Plugin author email',
      descriptiveType: 'email',
      required: true
    },
    {
      name: 'library-name',
      description: 'alarife-skeleton',
      required: true,
      descriptiveType: 'string'
    },
    {
      name: 'package-name',
      description: '@alarife/skeleton',
      required: true,
      descriptiveType: 'string'
    },
    {
      name: 'package-description',
      description: 'Plugin skeleton for Alarife',
      descriptiveType: 'string',
      required: true
    },
    {
      name: 'plugin-resume',
      description: 'simple plugin resume',
      descriptiveType: 'string',
      required: true
    }
  ]
};
