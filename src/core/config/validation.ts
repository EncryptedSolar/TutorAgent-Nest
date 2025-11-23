import { z } from 'zod';

export function validateEnv(config: Record<string, unknown>) {
  const schema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']),
    PORT: z.string().default('3000'),
    // OPENAI_API_KEY: z.string(),
    JWT_ACCESS_SECRET: z.string(),
    JWT_REFRESH_SECRET: z.string(),
  });

  const parsed = schema.safeParse(config);
  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
    process.exit(1);
  }

  return parsed.data;
}
