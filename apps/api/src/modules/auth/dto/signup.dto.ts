import { z } from 'zod';

export const signupSchema = z
  .object({
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
  })
  .required();

export type SignupDto = z.infer<typeof signupSchema>;
