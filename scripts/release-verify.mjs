// Release artifact verification (R6.2). Fails the pipeline on any violation.
// Checks: existence, index.html at ZIP root, no wrapper dir, relative asset
// refs, no missing assets, UTF-8 filenames, itch limits, licenses, no secrets.
import { execSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
const zipName = `seed-web-v${pkg.version}.zip`;
const zipPath = path.join(root, "release", zipName);

let failures = 0;
function check(ok, label, detail) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures++;
}

if (!existsSync(zipPath)) {
  check(false, "zip exists", zipPath);
  process.exit(1);
}
check(true, "zip exists", `${zipName} (${(statSync(zipPath).size / 1024).toFixed(0)} KB)`);

// ---- list entries + extract to temp ----
const tmp = mkdtempSync(path.join(os.tmpdir(), "seed-verify-"));
let names = [];
let totalUncompressed = 0;
try {
  if (process.platform === "win32") {
    const listJson = execSync(
      `powershell -NoProfile -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; $z=[IO.Compression.ZipFile]::OpenRead('${zipPath}'); $z.Entries | ForEach-Object { [pscustomobject]@{n=$_.FullName; l=$_.Length} } | ConvertTo-Json -Compress; $z.Dispose()"`,
      { encoding: "utf8" },
    );
    const parsed = JSON.parse(listJson.trim() || "[]");
    names = (Array.isArray(parsed) ? parsed : [parsed]).map((e) => ({ name: e.n, len: e.l }));
    execSync(
      `powershell -NoProfile -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [IO.Compression.ZipFile]::ExtractToDirectory('${zipPath}', '${tmp}')"`,
      { stdio: "inherit" },
    );
  } else {
    const out = execSync(`unzip -l "${zipPath}"`, { encoding: "utf8" });
    names = out.split("\n").slice(3, -3).map((line) => {
      const m = line.match(/^\s*(\d+)\s+\S+\s+\S+\s+(.*)$/);
      return m ? { name: m[2].trim(), len: Number(m[1]) } : null;
    }).filter(Boolean);
    execSync(`unzip -q -o "${zipPath}" -d "${tmp}"`, { stdio: "inherit" });
  }
} catch (err) {
  check(false, "zip readable/extractable", String(err));
  process.exit(1);
}
for (const e of names) totalUncompressed += e.len;

// ---- structural checks ----
const fileNames = names.map((e) => e.name).filter((n) => !n.endsWith("/"));
check(fileNames.includes("index.html"), "index.html at ZIP root");
check(!fileNames.some((n) => n.includes("..")), "no parent-dir escapes");
const topDirs = new Set(fileNames.filter((n) => n.includes("/")).map((n) => n.split("/")[0]));
check(!(fileNames.includes("index.html") && topDirs.has("dist")), "no wrapper directory");

// ---- filenames UTF-8 ----
const badNames = fileNames.filter((n) => n.includes("�"));
check(badNames.length === 0, "filenames UTF-8 compatible", badNames.slice(0, 3).join(","));

// ---- itch limits ----
check(fileNames.length <= 1000, "file count within itch limits", `${fileNames.length} files`);
check(totalUncompressed <= 500 * 1024 * 1024, "extracted size within itch limits", `${(totalUncompressed / 1048576).toFixed(1)} MB`);
const biggest = names.reduce((m, e) => Math.max(m, e.len), 0);
check(biggest <= 200 * 1024 * 1024, "single file within itch limits", `${(biggest / 1048576).toFixed(1)} MB max`);

// ---- index.html asset refs ----
const indexPath = path.join(tmp, "index.html");
if (!existsSync(indexPath)) {
  check(false, "extracted index.html present");
} else {
  const html = readFileSync(indexPath, "utf8");
  check(html.includes("-SEED"), "index.html names the game");
  check(/<meta charset="UTF-8"/.test(html), "index.html declares UTF-8");
  const refs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((m) => m[1]).filter((u) => !u.startsWith("#") && !u.startsWith("data:"));
  const absolute = refs.filter((u) => u.startsWith("/") || /^[a-z]+:/i.test(u));
  check(absolute.length === 0, "all asset references relative", absolute.slice(0, 3).join(","));
  const missing = refs.filter((u) => !existsSync(path.join(tmp, u.split("?")[0].split("#")[0])));
  check(missing.length === 0, "no missing referenced assets", missing.slice(0, 3).join(","));
  check(!/BEGIN .*PRIVATE KEY|AKIA[0-9A-Z]{16}/.test(html), "known-secret-pattern scan of index.html");
}

// ---- licenses ----
for (const f of ["THIRD_PARTY_NOTICES.txt", "licenses/PHASER-MIT.txt", "licenses/OFL-1.1.txt"]) {
  check(existsSync(path.join(tmp, f)), `licensed notice packaged: ${f}`);
}

// ---- secret filenames (basic forbidden-file check) ----
const secretFiles = fileNames.filter((n) => /\.(pem|key|env)$/i.test(n));
check(secretFiles.length === 0, "no forbidden secret files in artifact");

rmSync(tmp, { recursive: true, force: true });
if (failures > 0) {
  console.error(`release:verify FAILED (${failures})`);
  process.exit(1);
}
console.log("release:verify OK");
