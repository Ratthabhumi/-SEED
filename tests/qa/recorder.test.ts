import { describe, it, expect } from "vitest";
import { PlaytestRecorder, type QaCheckpointName, type QaCtx, type QaVersions } from "../../src/qa/PlaytestRecorder";

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

  it("POST_ASCENSION_30S, POST_ASCENSION_60S, and POST_ASCENSION_120S are legal QaCheckpointNames", () => {
    const legalNames: QaCheckpointName[] = [
      "POST_ASCENSION_30S",
      "POST_ASCENSION_60S",
      "POST_ASCENSION_120S",
    ];
    expect(legalNames).toHaveLength(3);
  });

  it("records POST_ASCENSION_120S per-ascension and dedupes within same ascension", () => {
    const r = recorder();
    // 4. POST_ASCENSION_120S ascension 1 records
    expect(r.checkpoint("POST_ASCENSION_120S", ctx(820, "stone", 1))).toBe(true);
    // 5. duplicate POST_ASCENSION_120S ascension 1 does not duplicate
    expect(r.checkpoint("POST_ASCENSION_120S", ctx(825, "stone", 1))).toBe(false);
    // 6. POST_ASCENSION_120S ascension 2 also records
    expect(r.checkpoint("POST_ASCENSION_120S", ctx(1520, "stone", 2))).toBe(true);
    // 7. CHILD_WORLD_STARTED remains repeatable per Ascension
    expect(r.checkpoint("CHILD_WORLD_STARTED", ctx(700, "stone", 1))).toBe(true);
    expect(r.checkpoint("CHILD_WORLD_STARTED", ctx(701, "stone", 1))).toBe(false);
    expect(r.checkpoint("CHILD_WORLD_STARTED", ctx(1400, "stone", 2))).toBe(true);
  });
});

describe("playtest recorder ratings and engagement", () => {
  it("keeps one value per rating question and records engagement", () => {
    const r = recorder();
    r.rate("qa.rateCombat", 4, ctx(100));
    r.rate("qa.rateCombat", 2, ctx(200));
    r.rate("qa.rateDesire", 9, ctx(200)); // clamped to 5
    r.recordAgeKnowledge("bronze", 512.7, ctx(150, "bronze"));
    r.recordAgeKnowledge("bronze", 999, ctx(151, "bronze")); // deduped per age+asc
    const s = r.snapshot();
    expect(s.ratings).toHaveLength(2);
    expect(s.ratings.find((x) => x.question === "qa.rateCombat")?.score).toBe(2);
    expect(s.ratings.find((x) => x.question === "qa.rateDesire")?.score).toBe(5);
    expect(s.ageKnowledge).toHaveLength(1);
    expect(s.ageKnowledge[0]?.knowledge).toBe(512);
  });

  it("feedback carries an unambiguous category", () => {
    const r = recorder();
    r.feedbackMark("read", "ภาพอ่านยาก", "", { px: 0, py: 0, chunk: "0,0", fps: 60, enemies: 0, projs: 0, build: "" }, ctx());
    expect(r.snapshot().feedback[0]?.category).toBe("read");
  });

  it("target-complete needs child world plus 120s evidence", () => {
    const r = recorder();
    expect(r.isTargetComplete()).toBe(false);
    r.checkpoint("CHILD_WORLD_STARTED", ctx(700, "stone", 1));
    expect(r.isTargetComplete()).toBe(false);
    r.pushPerf({
      fps: 60, frameMs: 16, simMs: 2, enemies: 10, projs: 20, pickups: 5, mines: 1,
      enemyPoolUsed: 10, projPoolUsed: 20, pickupPoolUsed: 5, queries: 3, buckets: 2,
      chunkHits: 9, chunkMisses: 1,
    });
    r.perfSnapshot("post-ascension+120s", ctx(820, "stone", 1));
    expect(r.isTargetComplete()).toBe(true);
  });

  it("records ordered sim decision marks", () => {
    const r = recorder();
    r.simMark("tech", "stone-hunt", ctx(30));
    r.simMark("breakthrough", "metallurgy", ctx(120));
    r.simMark("legacy", "heir-metallurgy", ctx(700, "stone", 1));
    const marks = r.snapshot().simMarks;
    expect(marks.map((m) => `${m.kind}:${m.detail}`)).toEqual([
      "tech:stone-hunt",
      "breakthrough:metallurgy",
      "legacy:heir-metallurgy",
    ]);
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
    r.feedbackMark("read", "ภาพอ่านยาก", "", { px: 1, py: 2, chunk: "0,0", fps: 59, enemies: 5, projs: 6, build: "lv3" }, ctx());
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
      r.feedbackMark("note", "x", "", { px: 0, py: 0, chunk: "0,0", fps: 60, enemies: 0, projs: 0, build: "" }, ctx(i));
    }
    const s = r.snapshot();
    expect(s.assertions.length).toBeLessThanOrEqual(500);
    expect(s.consoleEntries.length).toBeLessThanOrEqual(300);
    expect(s.feedback.length).toBeLessThanOrEqual(200);
  });
});
