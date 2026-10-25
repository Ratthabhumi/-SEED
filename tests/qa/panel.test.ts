import { describe, it, expect, vi } from "vitest";
import { QaSession, type QaAdapter } from "../../src/qa/qaPanel";

function stubAdapter(): QaAdapter {
  return {
    frame: () => { throw new Error("unused"); },
    snapshot: () => "",
    lang: () => "en",
    versions: () => ({ packageVersion: "0.2.0-dev.0", worldgen: 2, content: 3, saveSchema: 1 }),
    ageOrder: () => ["stone", "bronze", "iron", "industrial", "atomic", "space"],
  };
}

describe("qa panel compact default", () => {
  it("starts collapsed; recording does not depend on expansion", () => {
    const session = new QaSession(stubAdapter());
    expect((session as unknown as { collapsed: boolean }).collapsed).toBe(true);
    // Recorder works without any DOM.
    session.recorder.rate("qa.rateCombat", 5, { simTime: 1, wallTime: 2, age: "stone", ascension: 0 });
    expect(session.recorder.snapshot().ratings).toHaveLength(1);
  });
});

// The observed 83a3a2f report mixed a millisecond start with a second end.
it("records terminal wall timestamps in the same millisecond clock", () => {
  var clock = vi.spyOn(performance, "now").mockReturnValue(15000);
  var session = new QaSession(stubAdapter());
  var internals = session as unknown as { persistReports: () => void; refreshPanel: () => void };
  internals.persistReports = () => undefined;
  internals.refreshPanel = () => undefined;
  clock.mockReturnValue(75000);
  session.end("player-died");
  var snap = session.recorder.snapshot();
  expect((snap.wallEnd - snap.wallStart) / 1000).toBe(60);
  clock.mockRestore();
});
