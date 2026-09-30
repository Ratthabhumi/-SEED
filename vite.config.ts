import { defineConfig } from "vite";
import { qaSinkPlugin } from "./scripts/qa-sink.mjs";

// Minimal env typing without @types/node (vite/client only provides browser types).
declare const process: { env: Record<string, string | undefined> };

export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 1500,
    target: "es2020",
  },
  server: { port: 5173 },
  // Dev-only QA report sink (SEED_QA_SINK=1 via `npm run qa:human`).
  // Never runs in `vite build` / `vite preview` / itch static hosting.
  plugins: process.env.SEED_QA_SINK === "1" ? [qaSinkPlugin()] : [],
});
