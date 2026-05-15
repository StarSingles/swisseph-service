/// <reference types="node" />
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./test",
  fullyParallel: false,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:8787",
    trace: "retain-on-failure",
  },
  webServer: {
    // Builds the Astro UI then starts wrangler dev in the service package.
    // wrangler dev serves /api/* and falls back to the built ASSETS for /*.
    command: "pnpm --filter @swisseph/web build && pnpm --filter @swisseph/service dev",
    url: "http://localhost:8787/api/v1/health",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
