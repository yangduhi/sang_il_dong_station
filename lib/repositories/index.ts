import { getEnv } from "@/lib/config/env";
import { LocalDashboardRepository } from "@/lib/repositories/local-dashboard-repository";
import { PostgresDashboardRepository } from "@/lib/repositories/postgres-dashboard-repository";

export function getDashboardRepository() {
  const env = getEnv();
  return env.APP_DATA_MODE === "postgres"
    ? new PostgresDashboardRepository()
    : new LocalDashboardRepository();
}
