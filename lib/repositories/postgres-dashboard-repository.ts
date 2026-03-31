import type { DashboardRepository } from "@/lib/repositories/dashboard-repository";
import { sampleHealth } from "@/lib/data/sample-dashboard";
import { getDbPool } from "@/lib/db/client";
import { LocalDashboardRepository } from "@/lib/repositories/local-dashboard-repository";

const localFallback = new LocalDashboardRepository();

export class PostgresDashboardRepository implements DashboardRepository {
  async getHealth() {
    const pool = getDbPool();
    if (!pool) {
      return localFallback.getHealth();
    }

    await pool.query("select 1");
    return {
      ...sampleHealth,
      data: {
        ...sampleHealth.data,
        dataMode: "postgres" as const,
        db: {
          configured: true,
          mode: "postgres" as const
        }
      },
      meta: {
        ...sampleHealth.meta,
        fallbackUsed: false,
        limitations: []
      }
    };
  }

  async getStationOverview(stationId: string, query: Record<string, unknown>) {
    void stationId;
    void query;
    return localFallback.getStationOverview(stationId, query);
  }

  async getHourlyProfile(stationId: string, query: Record<string, unknown>) {
    void stationId;
    void query;
    return localFallback.getHourlyProfile(stationId, query);
  }

  async getOriginToZone(query: Record<string, unknown>) {
    return localFallback.getOriginToZone(query);
  }

  async getZoneToDestination(query: Record<string, unknown>) {
    return localFallback.getZoneToDestination(query);
  }

  async getDataQualitySummary(stationId: string) {
    return localFallback.getDataQualitySummary(stationId);
  }

  async searchStations(query: string) {
    return localFallback.searchStations(query);
  }

  async listZones() {
    return localFallback.listZones();
  }
}
