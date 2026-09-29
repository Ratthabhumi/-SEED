import { describe, it, expect } from "vitest";
import { PlaytestRecorder, type QaCtx, type QaVersions } from "../../src/qa/PlaytestRecorder";
import { renderMarkdown, renderJSON } from "../../src/qa/PlaytestReport";
import { analyzeRects, type RectEntry } from "../../src/qa/VisualChecks";

const VERSIONS: QaVersions = { packageVersion: "0.1.1", worldgen: 2, content: 2, saveSchema: 1 };
const ORDER = ["stone", "bronze", "iron", "industrial", "atomic", "space"];

function ctx(simTime: number, age = "stone"): QaCtx {
  return { simTime, wallTime: simTime + 1, age, ascension: 0 };
}

describe("playtest report", () => {
  it("renders all required sections and serializes to JSON", () => {
    const r = new PlaytestRecorder("EPOCH-GOLDEN-001", VERSIONS, 0, ORDER);
    r.setEnvironment({
      userAgent: "test", viewport: "1280x720", devicePixelRatio: 1, screen: "1920x1080",
      refreshHz: "~60Hz", hardwareConcurrency: 8, deviceMemory: "8GB", webgl: "test-gl",
    });
    r.checkpoint("RUN_START", ctx(0));
    r.checkpoint("SPACE_REACHED", ctx(600, "space"));
    r.assert("seed", "Seed invariant", true, "ok", ctx(1));
    r.feedbackMark("read", "ภาพอ่านยาก", "note", { px: 0, py: 0, chunk: "0,0", fps: 60, enemies: 1, projs: 2, build: "lv1" }, ctx(100));
    r.rate("qa.rateCombat", 4, ctx(101));
    r.recordAgeKnowledge("bronze", 512, ctx(102));
    r.finish("human-ended", 700);
    const snap = r.snapshot();
    const md = renderMarkdown(snap);
    for (const section of [
      "## Environment", "## Seed / Versions", "## Route", "## Age Transition Times",
      "## Knowledge At Age", "## Build Identity / Engagement",
      "## Boss", "## Ascension", "## Performance Summary", "## Peak Entity Counts",
      "## Pool Saturation", "## Functional Runtime Assertions", "## Console Errors / Warnings",
      "## EN/TH Switching", "## UI Overflow Findings", "## Human Feedback Markers",
      "## Human Ratings", "## Automatic Gate Result", "## Items Requiring Human Judgment",
    ]) {
      expect(md).toContain(section);
    }
    expect(md).toContain("AUTOMATED_CHECKS_PASS");
    expect(md).toContain("600.00s sim");
    const json = renderJSON(snap);
    expect(JSON.parse(json).seed).toBe("EPOCH-GOLDEN-001");
  });
});

describe("visual overflow analysis", () => {
  const base: RectEntry = {
    selector: ".hud", lang: "th", viewport: "1280x720",
    x: 0, y: 0, w: 100, h: 20, scrollW: 100, scrollH: 20, clientW: 100, clientH: 20,
  };
  it("detects horizontal, vertical, and offscreen overflow; ignores fitting elements", () => {
    expect(analyzeRects([base], { w: 1280, h: 720 })).toEqual([]);
    const h = analyzeRects([{ ...base, scrollW: 130 }], { w: 1280, h: 720 });
    expect(h[0]?.kind).toBe("horizontal");
    expect(h[0]?.overBy).toBe(30);
    const v = analyzeRects([{ ...base, scrollH: 45 }], { w: 1280, h: 720 });
    expect(v[0]?.kind).toBe("vertical");
    const o = analyzeRects([{ ...base, x: 1200, w: 200 }], { w: 1280, h: 720 });
    expect(o[0]?.kind).toBe("offscreen");
    expect(o[0]?.overBy).toBe(120);
  });

  it("never throws on degenerate rects", () => {
    expect(() => analyzeRects([], { w: 0, h: 0 })).not.toThrow();
  });
});
