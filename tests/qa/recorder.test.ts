import { describe, it, expect } from "vitest";
import { PlaytestRecorder, type QaCtx, type QaVersions } from "../../src/qa/PlaytestRecorder";

const VERSIONS: QaVersions = { packageVersion: "0.1.1", worldgen: 2, content: 2, saveSchema: 1 };
const ORDER = ["stone", "bronze", "iron", "industrial", "atomic", "space"];

function ctx(simTime = 10, age = "stone", ascension = 0): QaCtx {
  return { simTime, wallTime: simTime + 2, age, ascension };
}

function recorder(): PlaytestRecorder {
  return new PlaytestRecorder("EPOCH-GOLDEN-001", VERSIONS, 0, ORDER);
}

describe("playtest recorder checkpoints", () => {
  it("records each checkpoint exactly once", () => {
    const r = recorder();
    expect(r.checkpoint("RUN_START", ctx())).toBe(true);
    expect(r.checkpoint("RUN_START", ctx(11))).toBe(false);
    expect(r.checkpoint("BRONZE_REACHED", ctx(100, "bronze"))).toBe(true);
    expect(r.hasCheckpoint("BRONZE_REACHED")).toBe(true);
    expect(r.hasCheckpoint("SPACE_REACHED")).toBe(false);
    // Repeatable across ascensions only.
    expect(r.checkpoint("CHILD_WORLD_STARTED", ctx(700, "stone", 1))).toBe(true);
    expect(r.checkpoint("CHILD_WORLD_STARTED", ctx(701, "stone", 1))).toBe(false);
    expect(r.checkpoint("CHILD_WORLD_STARTED", ctx(1400, "stone", 2))).toBe(true);
  });
});

describe("playtest recorder assertions", () => {
  it("dedupes identical FAILs but keeps PASS history", () => {
    const r = recorder();
    r.assert("draft", "Draft lifecycle", false, "surfaces=2", ctx());
    r.assert("draft", "Draft lifecycle", false, "surfaces=2", ctx(11));
    r.assert("draft", "Draft lifecycle", false, "surfaces=3", ctx(12));
    r.assert("draft", "Draft lifecycle", true, "recovered", ctx(13));
    const fails = r.snapshot().assertions.filter((a) => !a.pass);
    expect(fails.length).toBe(2);
    expect(r.hasFail("draft")).toBe(true);
    expect(r.hasFail("seed")).toBe(false);
    expect(r.autoResult()).toBe("AUTOMATED_CHECKS_FAIL");
  });

  it("passes with no failures and no console errors", () => {
    const r = recorder();
    r.assert("seed", "Seed invariant", true, "ok", ctx());
    r.console("warn", "a warning", "", ctx());
    expect(r.autoResult()).toBe("AUTOMATED_CHECKS_PASS");
    r.console("error", "boom", "stack", ctx());
    expect(r.autoResult()).toBe("AUTOMATED_CHECKS_FAIL");
  });
});

describe("playtest recorder evidence", () => {
  it("captures feedback, lang switches, overflows, and pool saturation", () => {
    const r = recorder();
    r.feedbackMark("ภาพอ่านยาก", "", { px: 1, py: 2, chunk: "0,0", fps: 59, enemies: 5, projs: 6, build: "lv3" }, ctx());
    r.langSwitch("en", "th", true, ctx(200));
    r.overflow({ selector: ".hud", lang: "th", viewport: "800x600", kind: "horizontal", overBy: 12, simTime: 200, wallTime: 202 });
    r.overflow({ selector: ".hud", lang: "th", viewport: "800x600", kind: "horizontal", overBy: 14, simTime: 201, wallTime: 203 });
    r.poolSaturation("enemies", 650, 650, ctx(300));
    r.poolSaturation("enemies", 650, 650, ctx(301));
    const s = r.snapshot();
    expect(s.feedback.length).toBe(1);
    expect(s.langSwitches.length).toBe(1);
    expect(s.overflows.length).toBe(1); // deduped by selector+lang+viewport+kind
    expect(s.poolSaturations.length).toBe(1); // once per pool per ascension
    r.finish("human-ended", 999);
    expect(r.snapshot().endReason).toBe("human-ended");
  });

  it("bounds all buffers under spam", () => {
    const r = recorder();
    for (let i = 0; i < 2000; i++) {
      r.assert(`id-${i % 700}`, "n", true, `d${i}`, ctx(i));
      r.console("warn", `w${i}`, "", ctx(i));
      r.feedbackMark("x", "", { px: 0, py: 0, chunk: "0,0", fps: 60, enemies: 0, projs: 0, build: "" }, ctx(i));
    }
    const s = r.snapshot();
    expect(s.assertions.length).toBeLessThanOrEqual(500);
    expect(s.consoleEntries.length).toBeLessThanOrEqual(300);
    expect(s.feedback.length).toBeLessThanOrEqual(200);
  });
});
