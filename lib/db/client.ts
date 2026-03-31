import dns from "node:dns";
import { Pool, type PoolConfig } from "pg";
import { getEnv } from "@/lib/config/env";

let pool: Pool | null = null;

type LookupCallback = (error: NodeJS.ErrnoException | null, address: string, family: number) => void;
type LookupOptions = Parameters<typeof dns.lookup>[1];
type PoolConfigWithLookup = PoolConfig & {
  lookup?: (hostname: string, options: LookupOptions | LookupCallback, callback?: LookupCallback) => void;
};

function createPoolConfig(connectionString: string): PoolConfigWithLookup {
  return {
    connectionString,
    lookup(hostname, options, callback) {
      const done = (typeof options === "function" ? options : callback) as LookupCallback | undefined;
      if (!done) {
        return;
      }

      const resolve = (done: LookupCallback) => {
        dns.resolve6(hostname, (resolveError, ipv6Addresses) => {
          if (!resolveError && ipv6Addresses?.length) {
            done(null, ipv6Addresses[0], 6);
            return;
          }

          dns.lookup(hostname, (lookupError, address, family) => {
            done(lookupError, address, family);
          });
        });
      };

      resolve(done);
    }
  };
}

export function getDbPool() {
  if (pool) {
    return pool;
  }

  const env = getEnv();
  if (!env.DATABASE_URL) {
    return null;
  }

  pool = new Pool(createPoolConfig(env.DATABASE_URL) as PoolConfig);
  return pool;
}
