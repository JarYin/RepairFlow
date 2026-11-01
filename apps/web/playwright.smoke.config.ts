import { defineConfig, devices } from "@playwright/test";

// No webServer: this checks a stack that is already running, normally production.
const baseURL = process.env.SMOKE_BASE_URL;
if (!baseURL) {
  throw new Error("SMOKE_BASE_URL must be set to run the smoke test");
}

export default defineConfig({
  testDir: "./smoke",
  forbidOnly: !!process.env.CI,
  reporter: "list",
  // Room for a cold start of the API. A retry cannot hide a broken deploy,
  // because each attempt still has to get an answer from the API.
  timeout: 60_000,
  expect: { timeout: 30_000 },
  retries: 2,
  use: { baseURL },
  projects: [{ name: "chromium", use: devices["Desktop Chrome"] }],
});
