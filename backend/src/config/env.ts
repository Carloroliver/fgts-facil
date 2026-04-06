import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string(),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  EVOLUTION_API_URL: z.string().default('http://localhost:8080'),
  EVOLUTION_API_KEY: z.string(),
  EVOLUTION_INSTANCE_NAME: z.string().default('fgtsfacil'),
  ANTHROPIC_API_KEY: z.string(),
  JWT_SECRET: z.string(),
  META_ACCESS_TOKEN: z.string().optional(),
  META_PIXEL_ID: z.string().optional(),
  META_AD_ACCOUNT_ID: z.string().optional(),
  WHATSAPP_NUMBER: z.string(),
  PORT: z.coerce.number().default(3333),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export const env = envSchema.parse(process.env);
