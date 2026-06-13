import { Command, CommanderCommand, CommandEvent } from '@alarife/commander';
import { generateKeyPairSync } from 'crypto';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

const PRIVATE_KEY_NAME = 'private.pem';

export default (event: CommandEvent, command: CommanderCommand, commandConfig: Command) => {
  const [path] = event.args;
  const { keyType, privateExportType, publicExportType, keyFormat, modulusLength, namedCurve } = event.options;

  const fullPath = resolve(path, PRIVATE_KEY_NAME);

  let pair: { publicKey: any; privateKey: any };

  if (keyType === 'rsa') {
    const bits = Number(modulusLength) || 2048;
    pair = generateKeyPairSync('rsa', { modulusLength: bits });
  } else if (keyType === 'ec' && namedCurve) {
    pair = generateKeyPairSync('ec', { namedCurve });
  } else {
    pair = generateKeyPairSync(keyType as any);
  }

  const { publicKey, privateKey } = pair;

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
