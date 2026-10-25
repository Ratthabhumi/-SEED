import { WINDOWS_TEST_HOST } from "./scripts/testHost";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    // Bound worker startup/memory on office hardware; assertions unchanged.
    maxWorkers: 1,
    testTimeout: WINDOWS_TEST_HOST ? 600000 : 120000,
    hookTimeout: 120000,
  },
});
