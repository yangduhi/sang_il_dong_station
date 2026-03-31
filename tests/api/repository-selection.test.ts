import { afterEach, describe, expect, it, vi } from "vitest";

describe("repository selection", () => {
  afterEach(() => {
    delete process.env.APP_DATA_MODE;
    delete process.env.APP_SOURCE_MODE;
    vi.resetModules();
  });

  it("uses the Postgres repository directly when APP_DATA_MODE is postgres", async () => {
    process.env.APP_DATA_MODE = "postgres";
    process.env.APP_SOURCE_MODE = "live";

    const { getDashboardRepository } = await import("@/lib/repositories");
    const repository = getDashboardRepository();

    expect(repository.constructor.name).toBe("PostgresDashboardRepository");
  });
});
