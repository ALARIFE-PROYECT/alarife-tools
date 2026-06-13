import { Command, CommanderCommand, CommandEvent } from '@alarife/commander';
import { publicEncrypt, createPublicKey, constants } from 'crypto';
import { readFileSync } from 'fs';
import { resolve } from 'path';

export default (event: CommandEvent, command: CommanderCommand, commandConfig: Command) => {
  const [value, keyPath] = event.args;
  const { encoding, padding = 'oaep', oaepHash = 'sha256' } = event.options;

  const publicKeyPem = readFileSync(resolve(keyPath), { encoding: 'utf-8' });

  const keyObject = createPublicKey(publicKeyPem);

  if (keyObject.asymmetricKeyType !== 'rsa') {
    throw new Error(`Only RSA public keys are supported for encryption. Found: ${keyObject.asymmetricKeyType}`);
  }

  const padConst = padding === 'pkcs1' ? constants.RSA_PKCS1_PADDING : constants.RSA_PKCS1_OAEP_PADDING;

  const encrypted = publicEncrypt({ key: keyObject, padding: padConst, oaepHash }, Buffer.from(value, 'utf-8'));

  console.log(`{cipher}${encrypted.toString(encoding)}`);
};
