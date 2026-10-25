import { execFileSync } from "node:child_process";

/** Frozen at Vite startup/build, never retroactively assigned at report submission. */
export function readBuildProvenance(rootDir) {
  try {
    const run = args => execFileSync("git", args, { cwd: rootDir, encoding: "utf8", windowsHide: true }).trim();
    return { buildSha: run(["rev-parse", "HEAD"]), buildDirty: run(["status", "--porcelain", "--", "src", "scripts", "vite.config.ts", "package.json", "package-lock.json"]).length > 0 };
  } catch { return { buildSha: "UNKNOWN", buildDirty: "UNKNOWN" }; }
}

/** Local telemetry provenance is observational, not cryptographic attestation. */
export function reconcileBuildProvenance(bundled, saved) {
  const valid = /^[a-f0-9]{40}$/.test(bundled?.buildSha ?? "");
  return {
    buildSha: valid ? bundled.buildSha : "UNKNOWN",
    buildDirty: valid && typeof bundled.buildDirty === "boolean" && typeof saved.buildDirty === "boolean"
      ? bundled.buildDirty || saved.buildDirty || bundled.buildSha !== saved.buildSha : "UNKNOWN",
    reportSavedSha: saved.buildSha,
  };
}
