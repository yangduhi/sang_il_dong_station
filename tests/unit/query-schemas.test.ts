import { describe, expect, it } from "vitest";
import { hourlyQuerySchema, odQuerySchema } from "@/lib/schemas/queries";

describe("query schemas", () => {
  it("parses od aggregation level", () => {
    const parsed = odQuerySchema.parse({
      stationName: "상일동역",
      aggregationLevel: "sgg"
    });

    expect(parsed.aggregationLevel).toBe("sgg");
  });

  it("parses hourly aggregation level", () => {
    const parsed = hourlyQuerySchema.parse({
      aggregationLevel: "zone"
    });

    expect(parsed.aggregationLevel).toBe("zone");
  });
});
