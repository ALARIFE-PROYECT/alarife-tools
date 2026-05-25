import { Command, CommanderCommand, CommandEvent } from '@alarife/commander';
import { generateKeyPairSync } from 'crypto';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

const PRIVATE_KEY_NAME = 'private.pem';

export default (event: CommandEvent, command: CommanderCommand, commandConfig: Command) => {
  const [path] = event.args;
  const { keyType, privateExportType, publicExportType, keyFormat } = event.options;

  const fullPath = resolve(path, PRIVATE_KEY_NAME);

  const { publicKey, privateKey } = generateKeyPairSync(keyType);

  const privateKeyPem = privateKey.export({
    type: privateExportType,
    format: keyFormat
  }) as string;

  const publicKeyPem = publicKey.export({
    type: publicExportType,
    format: keyFormat
  }) as string;

  console.log(publicKeyPem);

  writeFileSync(fullPath, privateKeyPem, {
    encoding: 'utf-8',
    mode: 0o600
  });
};
