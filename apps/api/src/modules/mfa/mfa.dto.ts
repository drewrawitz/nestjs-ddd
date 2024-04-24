import { z } from 'zod';

const totp = z.string().min(6).max(6);

export const activateTotpSchema = z
  .object({
    key: z.string(),
    totp,
  })
  .required();

export type ActivateTotpDto = z.infer<typeof activateTotpSchema>;

export const verifyMfaSchema = z
  .object({
    totp,
  })
  .required();

export type VerifyMfaDto = z.infer<typeof verifyMfaSchema>;
