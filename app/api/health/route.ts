import { getDashboardRepository } from "@/lib/repositories";
import { healthResponseSchema } from "@/lib/schemas/responses";
import { jsonOk } from "@/lib/utils/http";

export async function GET() {
  const repository = getDashboardRepository();
  const response = await repository.getHealth();
  const parsed = healthResponseSchema.parse(response);

  return jsonOk(parsed.data, parsed.meta);
}
