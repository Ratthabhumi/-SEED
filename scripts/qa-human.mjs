// qa:human launcher — enables the dev-only QA sink and starts Vite.
// Cross-platform (plain Node, no shell hacks). Prints the exact playtest URL.
import { spawn } from "node:child_process";

process.env.SEED_QA_SINK = "1";
console.log("");
console.log("-SEED HUMAN PLAYTEST READY");
console.log("http://localhost:5173/?qa=1");
console.log("");
console.log("Reports: test-results/human-playtests/");
console.log("");

const child = spawn("npx", ["vite", "--port", "5173", "--strictPort", "--host", "127.0.0.1"], {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: process.env,
});
child.on("exit", (code) => process.exit(code ?? 0));
