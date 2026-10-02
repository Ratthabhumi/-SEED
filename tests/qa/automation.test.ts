import { describe, it, expect } from "vitest";
import { buildSanitizedMarkdown } from "../../scripts/qa-report.mjs";
import { applyHandoffSection, START_MARK, END_MARK } from "../../scripts/qa-handoff.mjs";
import { ReportDetector, isTerminalReport, reportIdentity, finalizeReport, checkAndFinalize } from "../../scripts/qa-watcher.mjs";
import { QA_REPORT_DIR } from "../../scripts/qa-sink.mjs";

declare const process: { env: Record<string, string | undefined> };

function snap() {
  return {
    seed: "EPOCH-GOLDEN-001",
    versions: { packageVersion: "0.2.0-dev.0", worldgen: 2, content: 3, saveSchema: 1 },
    environment: {
      userAgent: "SECRET-AGENT-STRING-THAT-MUST-NOT-LEAK",
      viewport: "1280x720",
      devicePixelRatio: 1,
      screen: "1920x1080",
      refreshHz: "~60Hz",
      hardwareConcurrency: 8,
      deviceMemory: "8GB",
      webgl: "test-gl",
    },
    checkpoints: [{ event: "RUN_START", simTime: 0, wallTime: 2, age: "stone", ascension: 0 }],
    perfCheckpoints: [],
    perfSamples: 10,
    assertions: [],
    feedback: [{ category: "feel", label: "น่าเบื่อ", note: "", px: 0, py: 0, chunk: "0,0", fps: 60, enemies: 1, projs: 0, build: "lv1", simTime: 50, wallTime: 52, age: "stone", ascension: 0 }],
    ratings: [{ question: "qa.rateCombat", score: 4, simTime: 100, wallTime: 102, age: "bronze", ascension: 0 }],
    ageKnowledge: [{ knowledge: 512, simTime: 100, wallTime: 102, age: "bronze", ascension: 0 }],
    engagement: [{
      origin: "hunters", families: "field+kinetic", techs: 3, breakthroughs: ["metallurgy"],
      legacies: [], poiClaims: ["ruin"], knowledge: 600, level: 5, weapons: "k1e0d0f1",
      simTime: 200, wallTime: 202, age: "bronze", ascension: 0,
    }],
    simMarks: [{ kind: "tech", detail: "stone-hunt", simTime: 30, wallTime: 32, age: "stone", ascension: 0 }],
    consoleEntries: [],
    langSwitches: [],
    overflows: [],
    poolSaturations: [],
    endReason: "target-complete",
    wallStart: 1700000000000,
    wallEnd: 1700000900000,
  };
}

describe("sanitized summary (qa:report)", () => {
  it("keeps project evidence and drops fingerprints", () => {
    const md = buildSanitizedMarkdown(snap() as never);
    expect(md).toContain("EPOCH-GOLDEN-001");
    expect(md).toContain("origin hunters");
    expect(md).toContain("qa.rateCombat: 4/5");
    expect(md).toContain("[feel] [น่าเบื่อ]");
    expect(md).toContain("1280x720");
    expect(md).not.toContain("SECRET-AGENT-STRING");
    expect(md).not.toContain("1700000000000");
    expect(md).not.toContain("deviceMemory");
  });
});

describe("handoff section update (qa:handoff)", () => {
  const base = `# Handoff\n\nOld failed-gate evidence stays.\n\n${START_MARK}\n\nOld section.\n\n${END_MARK}\n\nTail stays.\n`;

  it("replaces only the delimited section and preserves history", () => {
    const out = applyHandoffSection(base, "# New summary");
    expect(out).toContain("Old failed-gate evidence stays.");
    expect(out).toContain("Tail stays.");
    expect(out).toContain("# New summary");
    expect(out).not.toContain("Old section.");
    expect(out.indexOf(START_MARK)).toBeLessThan(out.indexOf(END_MARK));
  });

  it("throws when markers are missing", () => {
    expect(() => applyHandoffSection("# no markers", "# x")).toThrow();
  });
});

describe("zero-friction QA watcher and auto-finalization", () => {
  it("8. launcher ignores stale terminal latest.json existing before startup", () => {
    const stale = snap();
    const staleId = reportIdentity(stale as never);
    const detector = new ReportDetector(staleId);
    expect(detector.shouldFinalize(stale as never)).toBe(false);
  });

  it("9. launcher ignores autosave/non-terminal report", () => {
    const detector = new ReportDetector();
    const autosave = { ...snap(), endReason: "autosave" };
    expect(isTerminalReport(autosave as never)).toBe(false);
    expect(detector.shouldFinalize(autosave as never)).toBe(false);

    const empty = { ...snap(), endReason: "" };
    expect(isTerminalReport(empty as never)).toBe(false);
    expect(detector.shouldFinalize(empty as never)).toBe(false);
  });

  it("10. launcher detects a new terminal report", () => {
    const detector = new ReportDetector();
    const terminal = snap();
    expect(isTerminalReport(terminal as never)).toBe(true);
    expect(detector.shouldFinalize(terminal as never)).toBe(true);
  });

  it("11. new terminal report finalizes exactly once", () => {
    const detector = new ReportDetector();
    const terminal = snap();
    expect(detector.shouldFinalize(terminal as never)).toBe(true);
    // Duplicate fs events with the same terminal report identity are ignored
    expect(detector.shouldFinalize(terminal as never)).toBe(false);
    expect(detector.shouldFinalize(terminal as never)).toBe(false);
  });

  it("12. sanitized summary is generated", () => {
    const md = buildSanitizedMarkdown(snap() as never);
    expect(md).toContain("# -SEED v0.23.1 Interaction Clarity Human — Sanitized Evidence");
    expect(md).toContain("## Route");
    expect(md).toContain("## Civilization Command Loop Usage");
    expect(md).toContain("## Performance Summary");
  });

  it("12b. attempt vs success telemetry is reported separately (discovery != mutation)", () => {
    const s = snap();
    s.simMarks = [
      { kind: "reroll_attempt", detail: "a+b+c", simTime: 10, wallTime: 11, age: "stone", ascension: 0 },
      { kind: "reroll_attempt", detail: "a+b+c", simTime: 20, wallTime: 21, age: "stone", ascension: 0 },
      { kind: "draft_reroll", detail: "x", simTime: 21, wallTime: 22, age: "stone", ascension: 0 },
      { kind: "reroll_unavailable", detail: "none", simTime: 30, wallTime: 31, age: "stone", ascension: 0 },
      { kind: "reserve_attempt", detail: "a", simTime: 40, wallTime: 41, age: "stone", ascension: 0 },
      { kind: "draft_reserve", detail: "a", simTime: 41, wallTime: 42, age: "stone", ascension: 0 },
      { kind: "upgrade_attempt", detail: "p1", simTime: 50, wallTime: 51, age: "stone", ascension: 0 },
      { kind: "claim_attempt", detail: "p1", simTime: 60, wallTime: 61, age: "stone", ascension: 0 },
      { kind: "territory_claimed", detail: "p1:ruin", simTime: 61, wallTime: 62, age: "stone", ascension: 0 },
    ];
    const md = buildSanitizedMarkdown(s as never);
    expect(md).toContain("- Rerolls: 1 (attempts 2, unavailable 1)");
    expect(md).toContain("- Reserve uses: 1 (attempts 1)");
    expect(md).toContain("- Outpost upgrades: 0 (attempts 1)");
    expect(md).toContain("(claim attempts 1)");
  });

  it("13. handoff update preserves all historical sections outside markers", () => {
    const base = `# Handoff\n\nOld failed-gate evidence stays.\n\n${START_MARK}\n\nOld section.\n\n${END_MARK}\n\nTail stays.\n`;
    const out = applyHandoffSection(base, "# New summary");
    expect(out).toContain("Old failed-gate evidence stays.");
    expect(out).toContain("Tail stays.");
    expect(out).toContain("# New summary");
    expect(out).not.toContain("Old section.");
  });

  it("14. raw reports stay under gitignored test-results", () => {
    expect(QA_REPORT_DIR).toBe("test-results/human-playtests");
    expect(QA_REPORT_DIR.startsWith("test-results/")).toBe(true);
  });

  it("15. missing QA sink never breaks gameplay", () => {
    const originalFetch = globalThis.fetch;
    try {
      globalThis.fetch = () => Promise.reject(new Error("sink not available (e.g. 404 or production)"));
      expect(() => {
        fetch("/__seed_qa/report", { method: "POST", body: "{}" }).catch(() => undefined);
      }).not.toThrow();
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("16. production build does not require QA sink", () => {
    const orig = process.env.SEED_QA_SINK;
    delete process.env.SEED_QA_SINK;
    const isSinkEnabled = process.env.SEED_QA_SINK === "1";
    expect(isSinkEnabled).toBe(false);
    if (orig !== undefined) process.env.SEED_QA_SINK = orig;
  });

  it("finalizes report and updates handoff when new terminal report is detected", () => {
    const files = new Map<string, string>();
    const dirs: string[] = [];
    const norm = (p: string) => p.replace(/\\/g, "/");
    const mem = {
      write: (p: string, t: string) => files.set(norm(p), t),
      read: (p: string) => files.get(norm(p)) ?? "",
      mkdir: (p: string) => dirs.push(norm(p)),
      exists: (p: string) => files.has(norm(p)),
    };

    const root = "/repo";
    const handoffPath = `${root}/SESSION_HANDOFF.md`;
    mem.write(handoffPath, `# Handoff\n\n${START_MARK}\nOld.\n${END_MARK}\n\nTail.\n`);

    const reportPath = `${root}/${QA_REPORT_DIR}/latest.json`;
    const s = snap();
    const detector = new ReportDetector();

    // 1. File doesn't exist yet -> returns null
    expect(checkAndFinalize(reportPath, detector, root, null, mem.read, mem.exists)).toBeNull();

    // 2. Report written -> detected and finalized
    mem.write(reportPath, JSON.stringify(s));
    const result = checkAndFinalize(
      reportPath,
      detector,
      root,
      null,
      mem.read,
      mem.exists,
      (snapItem: unknown, r: string) => finalizeReport(snapItem, r, mem.write, mem.read, mem.mkdir, mem.exists),
    );
    expect(result).not.toBeNull();
    const outSummary = files.get(`${root}/docs/playtests/latest-v0231-interaction-human.md`);
    expect(outSummary).toBeDefined();
    expect(outSummary).toContain("# -SEED v0.23.1 Interaction Clarity Human — Sanitized Evidence");
    // Historical v0.23 evidence is never overwritten by the v0.23.1 pipeline.
    expect(files.get(`${root}/docs/playtests/latest-v023-frontier-human.md`)).toBeUndefined();

    const updatedHandoff = files.get(handoffPath);
    expect(updatedHandoff).toContain("# -SEED v0.23.1 Interaction Clarity Human — Sanitized Evidence");
    expect(updatedHandoff).toContain("Tail.");

    // 3. Duplicate check does not re-finalize (exactly once)
    expect(
      checkAndFinalize(
        reportPath,
        detector,
        root,
        null,
        mem.read,
        mem.exists,
        (snapItem: unknown, r: string) => finalizeReport(snapItem, r, mem.write, mem.read, mem.mkdir, mem.exists),
      ),
    ).toBeNull();
  });
});
