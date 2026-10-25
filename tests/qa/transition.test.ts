// v0.24 QA truth repairs: ascension observer compares against the last
// CHECKED state (never the previous RAF frame), and post-ascension
// engagement requires child-world SIM seconds (wall time never qualifies).
import { describe, it, expect } from "vitest";
import { QaSession, type QaAdapter, type QaFrameData } from "../../src/qa/qaPanel";

function stubAdapter(): QaAdapter {
  return {
    frame: () => { throw new Error("unused"); },
    snapshot: () => "",
    lang: () => "en",
    versions: () => ({ packageVersion: "0.2.0-dev.0", worldgen: 2, content: 6, saveSchema: 1 }),
    ageOrder: () => ["stone", "bronze", "iron", "industrial", "atomic", "space"],
  };
}

function frame(over: Partial<QaFrameData>): QaFrameData {
  return {
    simTime: 0, runElapsed: 0, age: "stone", ageIndex: 0, ascension: 0,
    masterSeed: "EPOCH-GOLDEN-001", worldSeed: "W0",
    px: 0, py: 0, over: false, draftOpen: false,
    enemies: 0, projs: 0, pickups: 0, mines: 0,
    enemyCap: 650, projCap: 1000, pickupCap: 400,
    bossSpawned: false, bossIndex: -1, bossActive: false, bossKills: 0,
    ascendReady: false, runKills: 0, runHighestAge: "stone",
    level: 1, owned: [], originId: "hunters", activeFamilies: ["kinetic", "field"],
    breakthroughs: [], legacies: [], poiClaims: [], knowledgeTotal: 0,
    weaponStages: "k0e0d0f0", techsTaken: 0,
    fps: 60, frameMs: 16, simMsAvg: 0.2, queries: 0, buckets: 0,
    chunkHits: 0, chunkMisses: 0, chunkCx: 0, chunkCy: 0, biome: "?",
    objective: null, nearestPOI: null, buildSummary: "",
    ...over,
  } as QaFrameData;
}

type SessionPriv = {
  prevAgeIndex: number;
  prevAscension: number;
  checkTransitions(f: QaFrameData): void;
};

function session(): { s: QaSession; p: SessionPriv } {
  const s = new QaSession(stubAdapter());
  return { s, p: s as unknown as SessionPriv };
}

function ascensionAssertions(s: QaSession) {
  return s.recorder.snapshot().assertions.filter((a) => a.id === "ascension");
}

describe("ascension observer truth", () => {
  it("passes worldChanged against the checked baseline, not the RAF frame", () => {
    const { s, p } = session();
    // Baseline check on the parent world (asc 0).
    p.prevAgeIndex = 5;
    p.prevAscension = 0;
    const parent = frame({
      simTime: 955, runElapsed: 1200, ageIndex: 5, age: "space", ascension: 0,
      worldSeed: "W0", runKills: 300, runHighestAge: "space", knowledgeTotal: 6500,
    });
    p.checkTransitions(parent);
    expect(ascensionAssertions(s)).toHaveLength(0);
    // Detector fires LATE on an already-post-transition frame pair — the old
    // code compared child-vs-child and failed worldChanged. The checked
    // baseline (W0) must still prove the transition.
    const child = frame({
      simTime: 2, runElapsed: 1210, ageIndex: 0, age: "stone", ascension: 1,
      worldSeed: "W1", runKills: 310, runHighestAge: "space", knowledgeTotal: 0,
    });
    p.checkTransitions(child);
    const asserts = ascensionAssertions(s);
    expect(asserts).toHaveLength(1);
    expect(asserts[0]?.pass).toBe(true);
    expect(asserts[0]?.detail).toContain("worldChanged:true");
    // A repeat check on steady child state asserts nothing new.
    p.checkTransitions(child);
    expect(ascensionAssertions(s)).toHaveLength(1);
  });

  it("post-ascension checkpoints require child sim seconds (wall never counts)", () => {
    const { s, p } = session();
    p.prevAgeIndex = 5;
    p.prevAscension = 0;
    const parent = frame({
      simTime: 955, runElapsed: 1200, ageIndex: 5, age: "space", ascension: 0,
      worldSeed: "W0", runKills: 300, runHighestAge: "space",
    });
    p.checkTransitions(parent);
    const child = frame({
      simTime: 1, runElapsed: 1210, ageIndex: 0, age: "stone", ascension: 1,
      worldSeed: "W1", runKills: 310, runHighestAge: "space",
    });
    p.checkTransitions(child);
    const cps = () => s.recorder.snapshot().checkpoints.map((c) => c.event);
    expect(cps()).toContain("ASCENSION_STARTED");
    expect(cps()).toContain("CHILD_WORLD_STARTED");
    // Only ~5 child sim-seconds: no 30s checkpoint (wall time in-test is
    // milliseconds either way, so only the sim gate can fire it).
    p.checkTransitions(frame({
      simTime: 6, runElapsed: 1220, ageIndex: 0, age: "stone", ascension: 1,
      worldSeed: "W1", runKills: 312, runHighestAge: "space",
    }));
    expect(cps()).not.toContain("POST_ASCENSION_30S");
    // 30 child sim-seconds: fires on sim time alone.
    p.checkTransitions(frame({
      simTime: 31, runElapsed: 1250, ageIndex: 0, age: "stone", ascension: 1,
      worldSeed: "W1", runKills: 315, runHighestAge: "space",
    }));
    expect(cps()).toContain("POST_ASCENSION_30S");
    expect(cps()).not.toContain("POST_ASCENSION_60S");
  });
});
