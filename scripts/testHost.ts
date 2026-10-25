// Test-runner environment only; does not enter gameplay or production bundles.
export const WINDOWS_TEST_HOST =
  (globalThis as unknown as { process?: { platform?: string } }).process?.platform === "win32";
