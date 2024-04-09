import { z } from 'zod';

export const envSchema = z.object({
  DATABASE_URL: z.string(),
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),
  REDIS_HOST: z.string().optional().default('0.0.0.0'),
  REDIS_PORT: z.coerce.number().optional().default(6379),
  PORT: z.coerce.number().optional().default(3000),
});
export type Env = z.infer<typeof envSchema>;
