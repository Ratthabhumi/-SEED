// Local QA report sink — DEV ONLY. Never bundled, never served in production.
// The browser POSTs QA payloads here; the plugin writes them under a FIXED
// gitignored directory. No arbitrary paths, no execution, no external transmit.
// Plain JavaScript (Node + Vite config import it directly — no TS syntax here).
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";

export const QA_SINK_MAX_BYTES = 2 * 1024 * 1024;
export const QA_REPORT_DIR = "test-results/human-playtests";

/** Validate an incoming QA payload. Pure — unit-tested. */
export function validateQaPayload(body) {
  if (typeof body !== "object" || body === null) return { ok: false, reason: "not-object" };
  if (body.kind !== "qa-report") return { ok: false, reason: "bad-kind" };
  if (typeof body.seed !== "string" || body.seed.length === 0 || body.seed.length > 64) {
    return { ok: false, reason: "bad-seed" };
  }
  if (typeof body.reason !== "string" || body.reason.length === 0 || body.reason.length > 64) {
    return { ok: false, reason: "bad-reason" };
  }
  if (typeof body.markdown !== "string" || typeof body.data !== "object" || body.data === null) {
    return { ok: false, reason: "bad-shape" };
  }
  return { ok: true };
}

/** Filesystem-safe seed slug (fixed names only — client paths never trusted). */
export function sanitizeSeed(seed) {
  const s = String(seed).replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 48);
  return s.length > 0 ? s : "seed";
}

/** Filesystem-safe UTC stamp: 2026-09-30T003015Z (no colons). */
export function stampOf(date) {
  const p = (n, w = 2) => String(n).padStart(w, "0");
  return `${date.getUTCFullYear()}-${p(date.getUTCMonth() + 1)}-${p(date.getUTCDate())}T` +
    `${p(date.getUTCHours())}${p(date.getUTCMinutes())}${p(date.getUTCSeconds())}Z`;
}

/** Fixed output filenames for a report (latest + immutable stamped copy). */
export function qaFileNames(now, seed) {
  const slug = sanitizeSeed(seed);
  const stamp = stampOf(now);
  return {
    json: "latest.json",
    md: "latest.md",
    sJson: `${stamp}-${slug}.json`,
    sMd: `${stamp}-${slug}.md`,
  };
}

/**
 * Store a validated payload under rootDir/test-results/human-playtests/.
 * rootDir is injected (repo root in prod use, tmpdir in tests).
 */
export function storeQaReport(
  rootDir,
  body,
  now,
  write = (p, t) => writeFileSync(p, t, "utf8"),
  mkdir = (p) => mkdirSync(p, { recursive: true }),
) {
  const dir = join(rootDir, QA_REPORT_DIR);
  mkdir(dir);
  const names = qaFileNames(now, body.seed);
  const data = { ...body.data };
  if (body.sessionId && !data.sessionId) data.sessionId = body.sessionId;
  if (typeof body.reportSequence === "number") data.reportSequence = body.reportSequence;
  if (data.sessionId) {
    const id = createHash("sha256").update(String(data.sessionId)).digest("hex").slice(0, 24);
    const seq = Number.isSafeInteger(data.reportSequence) && data.reportSequence >= 0 ? data.reportSequence : 0;
    // Different sessions / human-response revisions in one second must not overwrite raw history.
    names.sJson = names.sJson.replace(/\.json$/, `-${id}-${seq}.json`);
    names.sMd = names.sMd.replace(/\.md$/, `-${id}-${seq}.md`);
  }
  // Capture provenance on the server, not from untrusted browser payloads.
  try {
    data.buildSha = execFileSync("git", ["rev-parse", "HEAD"], { cwd: rootDir, encoding: "utf8", windowsHide: true }).trim();
    data.buildDirty = execFileSync("git", ["status", "--porcelain", "--", "src", "scripts", "vite.config.ts", "package.json", "package-lock.json"], { cwd: rootDir, encoding: "utf8", windowsHide: true }).trim().length > 0;
  } catch {
    data.buildSha = "UNKNOWN";
    data.buildDirty = "UNKNOWN";
  }
  const jsonText = JSON.stringify(data, null, 2);
  const files = [names.json, names.md, names.sJson, names.sMd];
  write(join(dir, names.json), jsonText);
  write(join(dir, names.md), body.markdown);
  write(join(dir, names.sJson), jsonText);
  write(join(dir, names.sMd), body.markdown);
  return { dir, files };
}

/**
 * Handle one report POST body (pure logic over injected values — unit-tested).
 * Returns HTTP status + JSON body. Never trusts client paths.
 */
export function processReportPost(rootDir, bodyText, byteSize, now) {
  if (byteSize > QA_SINK_MAX_BYTES) {
    return { status: 400, body: { ok: false, reason: "too-large" } };
  }
  let body;
  try {
    body = JSON.parse(bodyText);
  } catch {
    return { status: 400, body: { ok: false, reason: "bad-json" } };
  }
  const v = validateQaPayload(body);
  if (!v.ok) return { status: 400, body: { ok: false, reason: v.reason ?? "invalid" } };
  try {
    const stored = storeQaReport(rootDir, body, now);
    return { status: 200, body: { ok: true, files: stored.files } };
  } catch {
    return { status: 500, body: { ok: false, reason: "write-failed" } };
  }
}

/** Vite dev-server plugin factory. Only mounted when SEED_QA_SINK=1. */
export function qaSinkPlugin() {
  return {
    name: "seed-qa-sink",
    configureServer(server) {
      server.middlewares.use("/__seed_qa/report", (reqU, resU, next) => {
        const req = reqU;
        const res = resU;
        if ((req.method ?? "GET").toUpperCase() !== "POST") {
          res.statusCode = 405;
          res.setHeader("content-type", "application/json");
          res.end(JSON.stringify({ ok: false, reason: "method-not-allowed" }));
          return;
        }
        const chunks = [];
        let size = 0;
        req.on("data", (c) => {
          const buf = Buffer.isBuffer(c) ? c : Buffer.from(String(c ?? ""));
          size += buf.length;
          if (size <= QA_SINK_MAX_BYTES) chunks.push(buf);
        });
        req.on("end", () => {
          const out = processReportPost(process.cwd(), Buffer.concat(chunks).toString("utf8"), size, new Date());
          res.statusCode = out.status;
          res.setHeader("content-type", "application/json");
          res.end(JSON.stringify(out.body));
        });
        void next;
      });
    },
  };
}
