import { getDashboardRepository } from "@/lib/repositories";
import { dataQualitySummaryResponseSchema } from "@/lib/schemas/responses";
import { jsonOk } from "@/lib/utils/http";

export async function GET() {
  const repository = getDashboardRepository();
  const response = await repository.getDataQualitySummary("sangil-5-551");
  const parsed = dataQualitySummaryResponseSchema.parse(response);

  return jsonOk(parsed.data, parsed.meta);
}
