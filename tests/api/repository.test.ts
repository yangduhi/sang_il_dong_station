import { describe, expect, it } from "vitest";
import { getDashboardRepository } from "@/lib/repositories";

describe("dashboard repository", () => {
  it("returns local fallback data", async () => {
    const repository = getDashboardRepository();
    const overview = await repository.getStationOverview("sangil-5-551", {});

    expect(overview.data.station.stationName).toBe("상일동역");
    expect(overview.meta.fallbackUsed).toBe(true);
  });
});
