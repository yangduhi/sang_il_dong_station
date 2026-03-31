import type { DashboardRepository } from "@/lib/repositories/dashboard-repository";
import {
  sampleHealth,
  sampleHourly,
  sampleOriginToZone,
  sampleOverview,
  sampleQuality,
  sampleStations,
  sampleZoneToDestination,
  sampleZones
} from "@/lib/data/sample-dashboard";

export class LocalDashboardRepository implements DashboardRepository {
  async getHealth() {
    return sampleHealth;
  }

  async getStationOverview(stationId: string, query: Record<string, unknown>) {
    void stationId;
    void query;
    return sampleOverview;
  }

  async getHourlyProfile(stationId: string, query: Record<string, unknown>) {
    void stationId;
    void query;
    return sampleHourly;
  }

  async getOriginToZone(query: Record<string, unknown>) {
    void query;
    return sampleOriginToZone;
  }

  async getZoneToDestination(query: Record<string, unknown>) {
    void query;
    return sampleZoneToDestination;
  }

  async getDataQualitySummary(stationId: string) {
    void stationId;
    return sampleQuality;
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
