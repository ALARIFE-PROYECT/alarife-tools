import { Command, CommanderCommand, CommandEvent } from '@alarife/commander';
import { privateDecrypt } from 'crypto';
import { readFileSync } from 'fs';
import { resolve } from 'path';

export default (event: CommandEvent, command: CommanderCommand, commandConfig: Command) => {
  const [value, keyPath] = event.args;
  const { encoding } = event.options;

  const privateKeyPem = readFileSync(resolve(keyPath), { encoding: 'utf-8' });

  const encryptedValue = value.startsWith('{cipher}') ? value.slice(8) : value;

  const decrypted = privateDecrypt(privateKeyPem, Buffer.from(encryptedValue, encoding));

  console.log(decrypted.toString('utf-8'));
};
