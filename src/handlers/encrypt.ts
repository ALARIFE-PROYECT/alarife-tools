import { Command, CommanderCommand, CommandEvent } from '@alarife/commander';
import { publicEncrypt } from 'crypto';
import { readFileSync } from 'fs';
import { resolve } from 'path';

export default (event: CommandEvent, command: CommanderCommand, commandConfig: Command) => {
  const [value, keyPath] = event.args;
  const { encoding } = event.options;

  const publicKeyPem = readFileSync(resolve(keyPath), { encoding: 'utf-8' });

  const encrypted = publicEncrypt(publicKeyPem, Buffer.from(value, 'utf-8'));

  console.log(`{cipher}${encrypted.toString(encoding)}`);
};
