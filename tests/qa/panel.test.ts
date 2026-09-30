import { describe, it, expect } from "vitest";
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
