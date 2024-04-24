import { z } from 'zod';

export const activateTotpSchema = z
  .object({
    key: z.string(),
    totp: z.string().min(6).max(6),
  })
  .required();

export type ActivateTotpDto = z.infer<typeof activateTotpSchema>;
