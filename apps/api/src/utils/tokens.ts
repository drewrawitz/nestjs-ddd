import { randomBytes, createCipheriv } from 'crypto';
import * as speakeasy from 'speakeasy';

export function generateBase64Key() {
  return randomBytes(32).toString('base64');
}

export function generateToken() {
  return randomBytes(32).toString('hex');
}

export function generateTOTPSecret() {
  const secret = speakeasy.generateSecret({
    name: 'DDD',
  });

  return {
    base32: secret.base32,
    otpauth_url: secret.otpauth_url,
  };
}

export const encrypt = (key: string, plaintext: string) => {
  const iv = randomBytes(12).toString('base64');
  const cipher = createCipheriv(
    'aes-256-gcm',
    Buffer.from(key, 'base64'),
    Buffer.from(iv, 'base64'),
  );
  let ciphertext = cipher.update(plaintext, 'utf8', 'base64');
  ciphertext += cipher.final('base64');

  return { ciphertext, iv };
};
