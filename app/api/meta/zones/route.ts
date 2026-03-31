import { getDashboardRepository } from "@/lib/repositories";
import { jsonOk } from "@/lib/utils/http";

export async function GET() {
  const repository = getDashboardRepository();
  const zones = await repository.listZones();

  return jsonOk(
    {
      zones
    },
    {
      sourceNames: ["local-sample"],
      grainLabel: "zone",
      lastLoadedAt: "2026-03-31T07:30:00+09:00",
      limitations: ["Zone list is backed by the sample dashboard fixture in local mode."],
      queryEcho: {}
    }
  );
}
