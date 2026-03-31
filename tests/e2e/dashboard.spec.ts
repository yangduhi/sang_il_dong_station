import { expect, test } from "@playwright/test";

test("dashboard renders key analytical sections", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "상일동역 승하차 추세 + 권역 OD" })).toBeVisible();
  await expect(page.getByText("상일동역 출발 -> 권역 도착")).toBeVisible();
  await expect(page.getByText("권역 출발 -> 상일동역 도착")).toBeVisible();
  await expect(page.getByText(/grainLabel:/)).toBeVisible();
});
