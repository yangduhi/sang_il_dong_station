import { NextRequest } from "next/server";
import { getDashboardRepository } from "@/lib/repositories";
import { stationSearchQuerySchema } from "@/lib/schemas/queries";
import { jsonOk } from "@/lib/utils/http";

export async function GET(request: NextRequest) {
  const query = stationSearchQuerySchema.parse({
    query: request.nextUrl.searchParams.get("query") ?? undefined
  });
  const repository = getDashboardRepository();
  const stations = await repository.searchStations(query.query ?? "");

  return jsonOk(
    { stations },
    {
      sourceNames: ["local-sample"],
      grainLabel: "station",
      lastLoadedAt: "2026-03-31T07:30:00+09:00",
      limitations: ["Station search uses the current configured repository mode."],
      queryEcho: query
    }
  );
}
