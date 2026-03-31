import { Pool } from "pg";
import { getEnv } from "@/lib/config/env";

let pool: Pool | null = null;

export function getDbPool() {
  if (pool) {
    return pool;
  }

  const env = getEnv();
  if (!env.DATABASE_URL) {
    return null;
  }

  pool = new Pool({
    connectionString: env.DATABASE_URL
  });

  return pool;
}
