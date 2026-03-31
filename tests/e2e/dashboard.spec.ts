import { expect, test } from "@playwright/test";

test("dashboard renders station ridership and living-zone OD sections", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /상일동역 운영 리듬과/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "상일동 생활권 OD 맵" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "주요 도착 권역" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "주요 유입 권역" })).toBeVisible();
  await expect(page.getByText(/grainLabel:/)).toBeVisible();
});
