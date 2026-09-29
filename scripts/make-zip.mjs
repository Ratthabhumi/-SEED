// Creates release/seed-web-v0.1.0.zip with index.html at root (itch.io ready).
// R6.1: the old ZIP is DELETED first — never updated in place (no stale files).
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
// Single-source version ownership: package.json is the only version declaration.
const version = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8")).version;
const zipPath = path.join(root, "release", `seed-web-v${version}.zip`);
const distDir = path.join(root, "dist");

if (!existsSync(distDir)) {
  console.error("dist/ missing — run `npm run build` first.");
  process.exit(1);
}
mkdirSync(path.join(root, "release"), { recursive: true });
if (existsSync(zipPath)) rmSync(zipPath);

try {
  if (process.platform === "win32") {
    execSync(
      `powershell -NoProfile -Command "Compress-Archive -Path '${distDir}\\*' -DestinationPath '${zipPath}' -Force"`,
      { stdio: "inherit" },
    );
  } else {
    execSync(`cd "${distDir}" && zip -r "${zipPath}" .`, { stdio: "inherit" });
  }
  console.log(`wrote ${zipPath}`);
} catch (err) {
  console.error("zip failed", err);
  process.exit(1);
}
