import type {
  DataQualitySummaryResponse,
  HealthResponse,
  HourlyProfileResponse,
  OdOriginToZoneResponse,
  OdZoneToDestinationResponse,
  StationOverviewResponse
} from "@/lib/schemas/responses";

export interface DashboardRepository {
  getHealth(): Promise<HealthResponse>;
  getStationOverview(stationId: string, query: Record<string, unknown>): Promise<StationOverviewResponse>;
  getHourlyProfile(stationId: string, query: Record<string, unknown>): Promise<HourlyProfileResponse>;
  getOriginToZone(query: Record<string, unknown>): Promise<OdOriginToZoneResponse>;
  getZoneToDestination(query: Record<string, unknown>): Promise<OdZoneToDestinationResponse>;
  getDataQualitySummary(stationId: string): Promise<DataQualitySummaryResponse>;
  searchStations(query: string): Promise<Array<{ stationId: string; stationName: string }>>;
  listZones(): Promise<string[]>;
}
