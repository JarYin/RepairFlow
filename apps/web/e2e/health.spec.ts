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

test("the home page shows that the API is reachable", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("status")).toHaveText("API: ok");
});

test("the home page shows when the API is unavailable", async ({ page }) => {
  await page.route("/api/health", (route) => route.fulfill({ status: 503 }));

  await page.goto("/");

  await expect(page.getByRole("status")).toHaveText("API: unavailable");
});

test("the home page rejects a response that breaks the contract", async ({
  page,
}) => {
  await page.route("/api/health", (route) =>
    route.fulfill({ json: { status: "down" } }),
  );

  await page.goto("/");

  await expect(page.getByRole("status")).toHaveText("API: unavailable");
});
