// qa:human launcher — enables the dev-only QA sink, starts Vite,
// and watches for the terminal playtest report to automatically finalize
// evidence and update SESSION_HANDOFF.md without human friction.
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { startReportWatcher } from "./qa-watcher.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPORT_PATH = join(ROOT, "test-results", "human-playtests", "latest.json");

process.env.SEED_QA_SINK = "1";
console.log("");
console.log("-SEED HUMAN PLAYTEST READY");
console.log("http://localhost:5173/?qa=1");
console.log("");
console.log("Reports: test-results/human-playtests/");
console.log("Watcher: auto-finalization enabled for terminal reports");
console.log("");

const watcher = startReportWatcher({
  reportPath: REPORT_PATH,
  rootDir: ROOT,
});

const child = spawn("npx", ["vite", "--port", "5173", "--strictPort", "--host", "127.0.0.1"], {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: process.env,
});

child.on("exit", (code) => {
  watcher.stop();
  process.exit(code ?? 0);
});
