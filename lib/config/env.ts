import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_NAME: z.string().default("Sangil-dong Station Dashboard"),
  APP_BASE_URL: z.string().url().default("http://localhost:3000"),
  APP_DATA_MODE: z.enum(["local", "postgres"]).default("local"),
  APP_SOURCE_MODE: z.enum(["sample", "live"]).default("sample"),
  DATABASE_URL: z.string().optional(),
  DIRECT_DATABASE_URL: z.string().optional(),
  SEOUL_OPEN_DATA_API_KEY: z.string().optional(),
  DATA_GO_KR_SERVICE_KEY: z.string().optional(),
  ADMIN_CRON_SECRET: z.string().default("change-me")
});

let cachedEnv: z.infer<typeof envSchema> | null = null;

export function getEnv() {
  if (!cachedEnv) {
    cachedEnv = envSchema.parse({
      NODE_ENV: process.env.NODE_ENV,
      APP_NAME: process.env.APP_NAME,
      APP_BASE_URL: process.env.APP_BASE_URL,
      APP_DATA_MODE: process.env.APP_DATA_MODE,
      APP_SOURCE_MODE: process.env.APP_SOURCE_MODE,
      DATABASE_URL: process.env.DATABASE_URL,
      DIRECT_DATABASE_URL: process.env.DIRECT_DATABASE_URL,
      SEOUL_OPEN_DATA_API_KEY: process.env.SEOUL_OPEN_DATA_API_KEY,
      DATA_GO_KR_SERVICE_KEY: process.env.DATA_GO_KR_SERVICE_KEY,
      ADMIN_CRON_SECRET: process.env.ADMIN_CRON_SECRET
    });
  }

  return cachedEnv;
}
