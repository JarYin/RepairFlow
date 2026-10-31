import { defineConfig, devices } from "@playwright/test";

// Dedicated ports, so the tests never hit a dev server left running on 3000/4000.
const API_PORT = 4100;
const WEB_PORT = 3100;

export default defineConfig({
  testDir: "./e2e",
  forbidOnly: !!process.env.CI,
  reporter: "list",
  use: { baseURL: `http://localhost:${WEB_PORT}` },
  projects: [{ name: "chromium", use: devices["Desktop Chrome"] }],
  webServer: [
    {
      command:
        "pnpm --filter api... build && pnpm --filter api start:prod",
      env: { PORT: String(API_PORT) },
      url: `http://localhost:${API_PORT}/api/health`,
      timeout: 120_000,
    },
    {
      // The rewrite target is fixed at build time, as it is in production.
      command: "pnpm --filter web... build && pnpm --filter web start",
      env: {
        API_ORIGIN: `http://localhost:${API_PORT}`,
        PORT: String(WEB_PORT),
      },
      url: `http://localhost:${WEB_PORT}`,
      timeout: 240_000,
    },
  ],
});
