import { getEnv } from "@/lib/config/env";
import { LiveDashboardRepository } from "@/lib/repositories/live-dashboard-repository";
import { LocalDashboardRepository } from "@/lib/repositories/local-dashboard-repository";
import { PostgresDashboardRepository } from "@/lib/repositories/postgres-dashboard-repository";

export function getDashboardRepository() {
  const env = getEnv();
  const baseRepository =
    env.APP_DATA_MODE === "postgres"
    ? new PostgresDashboardRepository()
    : new LocalDashboardRepository();

  if (env.APP_SOURCE_MODE === "live") {
    return new LiveDashboardRepository(baseRepository);
  }

  return baseRepository;
}
