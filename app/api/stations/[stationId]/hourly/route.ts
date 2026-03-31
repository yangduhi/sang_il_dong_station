import { NextRequest } from "next/server";
import { getDashboardRepository } from "@/lib/repositories";
import { hourlyQuerySchema } from "@/lib/schemas/queries";
import { hourlyProfileResponseSchema } from "@/lib/schemas/responses";
import { jsonOk } from "@/lib/utils/http";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ stationId: string }> }
) {
  const { stationId } = await context.params;
  const query = hourlyQuerySchema.parse({
    from: request.nextUrl.searchParams.get("from") ?? undefined,
    to: request.nextUrl.searchParams.get("to") ?? undefined,
    weekdayType: request.nextUrl.searchParams.get("weekdayType") ?? undefined,
    aggregationLevel: request.nextUrl.searchParams.get("aggregationLevel") ?? undefined
  });

  const repository = getDashboardRepository();
  const response = await repository.getHourlyProfile(stationId, query);
  const parsed = hourlyProfileResponseSchema.parse(response);

  return jsonOk(parsed.data, {
    ...parsed.meta,
    queryEcho: query
  });
}
