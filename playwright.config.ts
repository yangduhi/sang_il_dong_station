import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  use: {
    baseURL: "http://127.0.0.1:32123"
  },
  webServer: {
    command: "npx pnpm@10.8.1 dev",
    env: {
      PORT: "32123"
    },
    port: 32123,
    reuseExistingServer: false,
    timeout: 120_000
  }
});
