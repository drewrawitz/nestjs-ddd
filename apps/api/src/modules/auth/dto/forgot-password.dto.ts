import { z } from 'zod';

export const forgotPasswordSchema = z
  .object({
    email: z.string().email(),
  })
  .required();

export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;
