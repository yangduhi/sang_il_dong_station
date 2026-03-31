import { describe, expect, it } from "vitest";
import { sampleHealth, sampleOriginToZone, sampleOverview, sampleQuality } from "@/lib/data/sample-dashboard";
import {
  dataQualitySummaryResponseSchema,
  healthResponseSchema,
  odOriginToZoneResponseSchema,
  stationOverviewResponseSchema
} from "@/lib/schemas/responses";

describe("response contracts", () => {
  it("parses station overview sample", () => {
    expect(stationOverviewResponseSchema.parse(sampleOverview).data.station.stationName).toBe("상일동역");
  });

  it("parses living-zone outbound sample", () => {
    const parsed = odOriginToZoneResponseSchema.parse(sampleOriginToZone);
    expect(parsed.data.analysisScope.scopeLabel).toBe("상일동 생활권");
    expect(parsed.data.rows[0]?.zoneName).toBe("강남·서초");
  });

  it("parses health sample", () => {
    expect(healthResponseSchema.parse(sampleHealth).data.status).toBe("ok");
  });

  it("parses quality sample", () => {
    expect(dataQualitySummaryResponseSchema.parse(sampleQuality).data.analysisScopes.length).toBeGreaterThan(0);
  });
});
