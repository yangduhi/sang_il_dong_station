import type {
  DataQualitySummaryResponse,
  HourlyProfileResponse,
  OdOriginToZoneResponse,
  OdZoneToDestinationResponse,
  StationOverviewResponse
} from "@/lib/schemas/responses";
import { getDashboardRepository } from "@/lib/repositories";

type GranularitySnapshot = {
  originToZone: OdOriginToZoneResponse;
  zoneToDestination: OdZoneToDestinationResponse;
  hourly: HourlyProfileResponse;
};

export async function getDashboardSnapshot(stationId: string) {
  const repository = getDashboardRepository();
  const [overview, quality, zoneOrigin, zoneInbound, zoneHourly, sggOrigin, sggInbound, sggHourly] =
    await Promise.all([
      repository.getStationOverview(stationId, {}),
      repository.getDataQualitySummary(stationId),
      repository.getOriginToZone({ stationName: "상일동역", aggregationLevel: "zone" }),
      repository.getZoneToDestination({ stationName: "상일동역", aggregationLevel: "zone" }),
      repository.getHourlyProfile(stationId, { weekdayType: "weekday", aggregationLevel: "zone" }),
      repository.getOriginToZone({ stationName: "상일동역", aggregationLevel: "sgg" }),
      repository.getZoneToDestination({ stationName: "상일동역", aggregationLevel: "sgg" }),
      repository.getHourlyProfile(stationId, { weekdayType: "weekday", aggregationLevel: "sgg" })
    ]);

  const granularities: Record<"zone" | "sgg", GranularitySnapshot> = {
    zone: {
      originToZone: zoneOrigin,
      zoneToDestination: zoneInbound,
      hourly: zoneHourly
    },
    sgg: {
      originToZone: sggOrigin,
      zoneToDestination: sggInbound,
      hourly: sggHourly
    }
  };

  return {
    overview,
    quality,
    granularities
  };
}

export type DashboardSnapshot = Awaited<ReturnType<typeof getDashboardSnapshot>>;
export type DashboardGranularity = keyof DashboardSnapshot["granularities"];
export type DashboardOverview = StationOverviewResponse;
export type DashboardQuality = DataQualitySummaryResponse;
