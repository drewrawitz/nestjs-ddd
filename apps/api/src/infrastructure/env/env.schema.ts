import { z } from 'zod';

export const envSchema = z.object({
  DATABASE_URL: z.string(),
  STRIPE_SECRET_KEY: z.string(),
  PORT: z.coerce.number().optional().default(3000),
});
export type Env = z.infer<typeof envSchema>;
