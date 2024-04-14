import { z } from 'zod';

export const envSchema = z.object({
  DATABASE_URL: z.string(),
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),
  STRIPE_SUBSCRIPTION_PRODUCT_ID: z.string().startsWith('prod_'),
  SESSION_SECRET: z.string().min(32),
  COOKIE_SECRET: z.string().min(32),
  REDIS_HOST: z.string().optional().default('0.0.0.0'),
  REDIS_PORT: z.coerce.number().optional().default(6379),
  PORT: z.coerce.number().optional().default(3000),
});
export type Env = z.infer<typeof envSchema>;
