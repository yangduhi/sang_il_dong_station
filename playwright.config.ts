import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  use: {
    baseURL: "http://127.0.0.1:3000"
  },
  webServer: {
    command: "npx pnpm@10.8.1 dev",
    port: 3000,
    reuseExistingServer: true,
    timeout: 120_000
  }
});
