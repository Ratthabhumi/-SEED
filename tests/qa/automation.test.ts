import { describe, it, expect } from "vitest";
import { buildSanitizedMarkdown } from "../../scripts/qa-report.mjs";
import { applyHandoffSection, START_MARK, END_MARK } from "../../scripts/qa-handoff.mjs";

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
