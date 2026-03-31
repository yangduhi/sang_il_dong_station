import { getDashboardRepository } from "@/lib/repositories";

export async function getDashboardSnapshot(stationId: string) {
  const repository = getDashboardRepository();
  const [overview, hourly, originToZone, zoneToDestination, quality] = await Promise.all([
    repository.getStationOverview(stationId, {}),
    repository.getHourlyProfile(stationId, { weekdayType: "weekday" }),
    repository.getOriginToZone({ stationName: "상일동역" }),
    repository.getZoneToDestination({ stationName: "상일동역" }),
    repository.getDataQualitySummary(stationId)
  ]);

  return {
    overview,
    hourly,
    originToZone,
    zoneToDestination,
    quality
  };
}
