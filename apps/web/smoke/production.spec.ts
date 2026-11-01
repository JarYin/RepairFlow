import { expect, test } from "@playwright/test";
import { healthResponseSchema } from "@repairflow/contracts";

test("GET /api/health through the Web domain answers per the contract", async ({
  request,
}) => {
  const response = await request.get("/api/health");

  expect(response.status()).toBe(200);
  expect(healthResponseSchema.parse(await response.json())).toEqual({
    status: "ok",
  });
});

test("the home page opens and reaches the API", async ({ page }) => {
  const response = await page.goto("/");

  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "RepairFlow" })).toBeVisible();
  await expect(page.getByRole("status")).toHaveText("API: ok");
});
