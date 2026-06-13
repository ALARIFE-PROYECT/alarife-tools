import { Command, CommanderCommand, CommandEvent } from '@alarife/commander';
import { privateDecrypt, createPrivateKey, constants } from 'crypto';
import { readFileSync } from 'fs';
import { resolve } from 'path';

export default (event: CommandEvent, command: CommanderCommand, commandConfig: Command) => {
  const [value, keyPath] = event.args;
  const { encoding, padding = 'oaep', oaepHash = 'sha256' } = event.options;

  const privateKeyPem = readFileSync(resolve(keyPath), { encoding: 'utf-8' });

  const keyObject = createPrivateKey(privateKeyPem);

  if (keyObject.asymmetricKeyType !== 'rsa') {
    throw new Error(`Only RSA private keys are supported for decryption. Found: ${keyObject.asymmetricKeyType}`);
  }

  const encryptedValue = value.startsWith('{cipher}') ? value.slice(8) : value;

  const padConst = padding === 'pkcs1' ? constants.RSA_PKCS1_PADDING : constants.RSA_PKCS1_OAEP_PADDING;

  const decrypted = privateDecrypt({ key: keyObject, padding: padConst, oaepHash }, Buffer.from(encryptedValue, encoding));

  console.log(decrypted.toString('utf-8'));
};
