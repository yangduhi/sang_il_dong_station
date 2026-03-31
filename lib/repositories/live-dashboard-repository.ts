import type { DashboardRepository } from "@/lib/repositories/dashboard-repository";
import type {
  DataQualitySummaryResponse,
  HealthResponse,
  HourlyProfileResponse,
  OdOriginToZoneResponse,
  OdZoneToDestinationResponse,
  StationOverviewResponse
} from "@/lib/schemas/responses";
import { getEnv } from "@/lib/config/env";
import {
  buildLiveHourlyPlaceholder,
  buildLiveQualitySummary,
  fetchLiveOriginToZone,
  fetchLiveRidershipOverview,
  fetchLiveZoneToDestination
} from "@/lib/data/live-transport";
import {
  verifiedLiveOriginToZoneSnapshot,
  verifiedLiveZoneToDestinationSnapshot
} from "@/lib/data/live-snapshot";
import { sampleHealth, sampleStations, sampleZones } from "@/lib/data/sample-dashboard";

export class LiveDashboardRepository implements DashboardRepository {
  constructor(private readonly fallbackRepository: DashboardRepository) {}

  async getHealth(): Promise<HealthResponse> {
    const env = getEnv();
    return {
      ...sampleHealth,
      data: {
        ...sampleHealth.data,
        env: env.NODE_ENV,
        dataMode: env.APP_DATA_MODE,
        sourceMode: "live",
        db: {
          configured: Boolean(env.DATABASE_URL),
          mode: env.APP_DATA_MODE
        }
      },
      meta: {
        ...sampleHealth.meta,
        fallbackUsed: false,
        limitations: [
          "Live mode combines station-level ridership and living-zone OD from separate public sources."
        ]
      }
    };
  }

  async getStationOverview(stationId: string, query: Record<string, unknown>): Promise<StationOverviewResponse> {
    void stationId;
    void query;
    try {
      return await fetchLiveRidershipOverview();
    } catch {
      return this.fallbackRepository.getStationOverview(stationId, query);
    }
  }

  async getHourlyProfile(stationId: string, query: Record<string, unknown>): Promise<HourlyProfileResponse> {
    void stationId;
    void query;
    return buildLiveHourlyPlaceholder();
  }

  async getOriginToZone(query: Record<string, unknown>): Promise<OdOriginToZoneResponse> {
    void query;
    try {
      const response = await fetchLiveOriginToZone();
      return response.data.rows.length ? response : verifiedLiveOriginToZoneSnapshot;
    } catch {
      return verifiedLiveOriginToZoneSnapshot;
    }
  }

  async getZoneToDestination(query: Record<string, unknown>): Promise<OdZoneToDestinationResponse> {
    void query;
    try {
      const response = await fetchLiveZoneToDestination();
      return response.data.rows.length ? response : verifiedLiveZoneToDestinationSnapshot;
    } catch {
      return verifiedLiveZoneToDestinationSnapshot;
    }
  }

  async getDataQualitySummary(stationId: string): Promise<DataQualitySummaryResponse> {
    void stationId;
    try {
      return await buildLiveQualitySummary();
    } catch {
      return this.fallbackRepository.getDataQualitySummary(stationId);
    }
  }

  async searchStations(query: string) {
    return sampleStations
      .filter((station) => !query || station.stationName.includes(query))
      .map((station) => ({
        stationId: station.stationId,
        stationName: station.stationName
      }));
  }

  async listZones() {
    return sampleZones;
  }
}
