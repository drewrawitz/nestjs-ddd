import { z } from 'zod';

export const createUserRequestSchema = z
  .object({
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
  })
  .required();

export type CreateUserRequestDto = z.infer<typeof createUserRequestSchema>;
