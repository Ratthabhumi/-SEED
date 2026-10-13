import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  // Browser runs must never erase durable human-playtest evidence.
  outputDir: "./test-results/browser",
  // Slow-office-machine accommodation (i5-10210U + software WebGL): some
  // real-time gameplay tests need >60s wall-clock there. Assertions unchanged;
  // a genuine hang still fails at this cap. CI (fast) is unaffected.
  timeout: 180_000,
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "node node_modules/vite/bin/vite.js preview --port 4173 --strictPort --host 127.0.0.1",
    url: "http://127.0.0.1:4173",
    // Never reuse: a stale server would silently test an old bundle.
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
