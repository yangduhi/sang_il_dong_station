import { NextRequest } from "next/server";
import { getDashboardRepository } from "@/lib/repositories";
import { stationOverviewQuerySchema } from "@/lib/schemas/queries";
import { stationOverviewResponseSchema } from "@/lib/schemas/responses";
import { jsonOk } from "@/lib/utils/http";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ stationId: string }> }
) {
  const { stationId } = await context.params;
  const query = stationOverviewQuerySchema.parse({
    from: request.nextUrl.searchParams.get("from") ?? undefined,
    to: request.nextUrl.searchParams.get("to") ?? undefined
  });

  const repository = getDashboardRepository();
  const response = await repository.getStationOverview(stationId, query);
  const parsed = stationOverviewResponseSchema.parse(response);

  return jsonOk(parsed.data, {
    ...parsed.meta,
    queryEcho: query
  });
}
