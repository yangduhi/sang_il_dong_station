import { NextRequest } from "next/server";
import { getDashboardRepository } from "@/lib/repositories";
import { odQuerySchema } from "@/lib/schemas/queries";
import { odOriginToZoneResponseSchema } from "@/lib/schemas/responses";
import { jsonOk } from "@/lib/utils/http";

export async function GET(request: NextRequest) {
  const query = odQuerySchema.parse({
    stationName: request.nextUrl.searchParams.get("stationName") ?? "상일동역",
    from: request.nextUrl.searchParams.get("from") ?? undefined,
    to: request.nextUrl.searchParams.get("to") ?? undefined,
    weekdayType: request.nextUrl.searchParams.get("weekdayType") ?? undefined,
    passengerType: request.nextUrl.searchParams.get("passengerType") ?? undefined,
    aggregationLevel: request.nextUrl.searchParams.get("aggregationLevel") ?? undefined
  });

  const repository = getDashboardRepository();
  const response = await repository.getOriginToZone(query);
  const parsed = odOriginToZoneResponseSchema.parse(response);

  return jsonOk(parsed.data, {
    ...parsed.meta,
    queryEcho: query
  });
}
