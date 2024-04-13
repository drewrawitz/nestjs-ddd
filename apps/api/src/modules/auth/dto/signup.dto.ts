import { z } from 'zod';

export const signupSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8).max(100),
    firstName: z.string(),
    lastName: z.string(),
  })
  .required();

export type SignupDto = z.infer<typeof signupSchema>;
