import { z } from 'zod';

export const verifyResetTokenSchema = z
  .object({
    token: z.string(),
  })
  .required();

export type VerifyResetTokenDto = z.infer<typeof verifyResetTokenSchema>;
