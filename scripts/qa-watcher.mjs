// qa-watcher — watches test-results/human-playtests/latest.json,
// detects new terminal reports, and automatically runs sanitized evidence
// generation and SESSION_HANDOFF.md updates (zero friction).
import { existsSync, mkdirSync, readFileSync, watch, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildSanitizedMarkdown } from "./qa-report.mjs";
import { applyHandoffSection } from "./qa-handoff.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

export const TERMINAL_REASONS = new Set(["target-complete", "player-died", "human-ended"]);

/**
 * Returns a stable identity string for a report snapshot.
 */
export function reportIdentity(snap) {
  if (!snap || typeof snap !== "object") return "";
  return `${snap.sessionId ?? ""}::${snap.seed ?? ""}::${snap.wallStart ?? ""}::${snap.wallEnd ?? ""}::${snap.endReason ?? ""}`;
}

/**
 * Returns true only if the snapshot represents a completed terminal run.
 * Autosaves, partial snapshots, and empty endReasons are ignored.
 */
export function isTerminalReport(snap) {
  if (!snap || typeof snap !== "object") return false;
  if (!Array.isArray(snap.checkpoints)) return false;
  if (typeof snap.endReason !== "string") return false;
  return TERMINAL_REASONS.has(snap.endReason);
}

/**
 * Manages detection state: rejects stale baseline reports, ensures exactly-once finalization.
 */
export class ReportDetector {
  constructor(initialIdentity = "") {
    this.finalizedIdentities = new Set();
    if (initialIdentity) {
      this.finalizedIdentities.add(initialIdentity);
    }
  }

  /**
   * Evaluates a report snapshot.
   * Returns true if this is a NEW terminal report that should be finalized.
   * Marks the identity as finalized so repeated checks return false.
   */
  shouldFinalize(snap) {
    if (!isTerminalReport(snap)) return false;
    const id = reportIdentity(snap);
    if (!id || this.finalizedIdentities.has(id)) return false;
    this.finalizedIdentities.add(id);
    return true;
  }
}

/**
 * Safely inspects an existing report file at startup to establish baseline identity.
 */
export function getInitialReportIdentity(reportPath) {
  if (!existsSync(reportPath)) return "";
  try {
    const raw = readFileSync(reportPath, "utf8");
    const snap = JSON.parse(raw);
    return isTerminalReport(snap) ? reportIdentity(snap) : "";
  } catch {
    return "";
  }
}

/**
 * Automatically finalizes report: writes sanitized summary and updates SESSION_HANDOFF.md.
 */
export function finalizeReport(
  snap,
  rootDir = ROOT,
  write = (p, t) => writeFileSync(p, t, "utf8"),
  read = (p) => readFileSync(p, "utf8"),
  mkdir = (p) => mkdirSync(p, { recursive: true }),
  exists = (p) => existsSync(p),
) {
  const md = buildSanitizedMarkdown(snap);
  const outPath = join(rootDir, "docs", "playtests", "latest-v0221-human-revalidation.md");
  mkdir(dirname(outPath));
  write(outPath, md);

  const handoffPath = join(rootDir, "SESSION_HANDOFF.md");
  const handoff = read(handoffPath);
  const updatedHandoff = applyHandoffSection(handoff, md);
  write(handoffPath, updatedHandoff);

  if (!exists(outPath) || !exists(handoffPath)) {
    throw new Error("Finalization verification failed: output files missing");
  }

  console.log("");
  console.log("-SEED PLAYTEST EVIDENCE FINALIZED");
  console.log("");
  console.log("docs/playtests/latest-v0221-human-revalidation.md");
  console.log("SESSION_HANDOFF.md updated");
  console.log("");

  return { outPath, handoffPath, md };
}

/**
 * Check file at reportPath; if it's a new terminal report according to detector, finalize it.
 */
export function checkAndFinalize(
  reportPath,
  detector,
  rootDir = ROOT,
  onFinalized = null,
  read = (p) => readFileSync(p, "utf8"),
  exists = (p) => existsSync(p),
  finalize = (s, r) => finalizeReport(s, r),
) {
  if (!exists(reportPath)) return null;
  let snap;
  try {
    const raw = read(reportPath);
    snap = JSON.parse(raw);
  } catch {
    // Incomplete write or invalid JSON — ignore until file is complete.
    return null;
  }

  if (detector.shouldFinalize(snap)) {
    const result = finalize(snap, rootDir);
    if (onFinalized) onFinalized(result);
    return result;
  }
  return null;
}

/**
 * Start watching report file using fs.watch with modest polling fallback (1000ms).
 * Fully portable on Windows.
 */
export function startReportWatcher(options) {
  const {
    reportPath,
    rootDir = ROOT,
    detector = new ReportDetector(getInitialReportIdentity(reportPath)),
    pollIntervalMs = 1000,
    onFinalized = null,
  } = options;

  let stopped = false;
  let debounceTimer = null;

  const triggerCheck = () => {
    if (stopped) return;
    try {
      checkAndFinalize(reportPath, detector, rootDir, onFinalized);
    } catch (err) {
      console.error("[qa-watcher] Finalization error:", err);
    }
  };

  const scheduleCheck = () => {
    if (stopped) return;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(triggerCheck, 200);
  };

  // Watch directory if it exists, or parent directory
  const reportDir = dirname(reportPath);
  let fsWatcher = null;
  try {
    mkdirSync(reportDir, { recursive: true });
    fsWatcher = watch(reportDir, { persistent: false }, scheduleCheck);
  } catch (e) {
    // If fs.watch fails on some platform/env, fallback polling handles it.
  }

  const pollTimer = setInterval(triggerCheck, pollIntervalMs);
  if (pollTimer.unref) pollTimer.unref();

  return {
    stop() {
      stopped = true;
      if (debounceTimer) clearTimeout(debounceTimer);
      clearInterval(pollTimer);
      if (fsWatcher) {
        try { fsWatcher.close(); } catch {}
      }
    },
  };
}
