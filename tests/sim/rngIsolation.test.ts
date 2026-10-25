import { describe, it, expect } from "vitest";
import { RunSimulation } from "../../src/core/sim/RunSimulation";
import { initRunRng } from "../../src/core/seed/runRng";
import { deriveAscensionSeed } from "../../src/core/seed/streams";
import { getPOIsForChunk } from "../../src/core/world/poi";
import { sampleFields } from "../../src/core/world/biome";
import { worldNonceFor } from "../../src/core/sim/RunSimulation";
import type { InputFrame } from "../../src/core/sim/InputFrame";

const IDLE: InputFrame = { moveX: 0, moveY: 0, dashPressed: false };

/**
 * TEST-DEFECT FIX: branch A consumes a REAL 10,000 draws on EVERY old-world
 * gameplay stream before Ascension; branch B consumes none. This test FAILS
 * if Ascension accidentally reuses old RNG objects.
 */
function ascendWithSpam(master: string, spam: boolean): RunSimulation {
  const sim = new RunSimulation({ masterSeed: master });
  if (spam) {
    for (const k of ["event", "enemy", "draft", "loot", "boss"] as const) {
      for (let i = 0; i < 10_000; i++) sim.streams[k].nextUint32();
    }
  }
  sim.state.ascendReady = true; // test hook: state is plain data
  const ev = sim.ascend("affinity-kinetic", "hunters");
  expect(ev.some((e) => e.type === "ascended")).toBe(true);
  return sim;
}

describe("ascension stream isolation (real 10k spam)", () => {
  it("child world seed derives from master + index only", () => {
    const sim = ascendWithSpam("EPOCH-GOLDEN-001", true);
    expect(sim.state.worldSeed).toBe(deriveAscensionSeed("EPOCH-GOLDEN-001", 1));
    expect(sim.state.ascension).toBe(1);
  });

  it("10k-spam vs no-spam: identical child stream prefixes", () => {
    const a = ascendWithSpam("EPOCH-GOLDEN-001", true);
    const b = ascendWithSpam("EPOCH-GOLDEN-001", false);
    expect(a.streamSnapshots()).toEqual(b.streamSnapshots());
  });

  it("10k-spam vs no-spam: identical post-ascension trajectories", () => {
    const a = ascendWithSpam("EPOCH-GOLDEN-001", true);
    const b = ascendWithSpam("EPOCH-GOLDEN-001", false);
    for (const sim of [a, b]) {
      for (let i = 0; i < 300; i++) {
        const ev = sim.step(1 / 60, { moveX: Math.cos(i / 30), moveY: Math.sin(i / 30), dashPressed: i % 120 === 0 });
        for (const e of ev) if (e.type === "draft_opened") sim.chooseDraft(0);
        if (sim.state.over) break;
      }
    }
    expect(a.snapshot()).toBe(b.snapshot());
  });

  it("loot/event spam never moves draft/enemy/boss streams", () => {
    const s1 = initRunRng("EPOCH-X");
    const s2 = initRunRng("EPOCH-X");
    for (let i = 0; i < 10000; i++) { s1.loot.nextUint32(); s1.event.nextUint32(); }
    expect(s1.draft.nextUint32()).toBe(s2.draft.nextUint32());
    expect(s1.enemy.nextUint32()).toBe(s2.enemy.nextUint32());
    expect(s1.boss.nextUint32()).toBe(s2.boss.nextUint32());
    expect(s1.event.nextUint32()).not.toBe(s2.event.nextUint32()); // sanity: spam did something
  });

  it("POI ids are world-scoped (same coords, different worlds, no collision)", () => {
    const f = sampleFields("EPOCH-GOLDEN-001", 512 * 5.5, 512 * 2.5);
    const n1 = worldNonceFor("EPOCH-GOLDEN-001", 0);
    const n2 = worldNonceFor("EPOCH-GOLDEN-001", 1);
    expect(n1).not.toBe(n2);
    const p1 = getPOIsForChunk("EPOCH-GOLDEN-001", 5, 2, f.anomaly, n1);
    const p2 = getPOIsForChunk("EPOCH-GOLDEN-001", 5, 2, f.anomaly, n2);
    if (p1.length > 0 && p2.length > 0) {
      expect(p1[0]?.id).not.toBe(p2[0]?.id);
    }
  });

  it("ascension resets world-scoped discovery but keeps run totals", () => {
    const sim = new RunSimulation({ masterSeed: "EPOCH-GOLDEN-001" });
    sim.state.chunksWorld.push("x");
    sim.state.poisWorld.push("y");
    sim.state.stats.chunksTotal = 5;
    sim.state.stats.poisTotal = 2;
    sim.state.runElapsed = 800;
    sim.state.runHighestAge = "space";
    sim.state.runKills = 500;
    sim.state.ascendReady = true;
    sim.ascend("affinity-kinetic", "hunters");
    expect(sim.state.chunksWorld).toEqual([]);
    expect(sim.state.poisWorld).toEqual([]);
    expect(sim.state.stats.chunksTotal).toBe(5);
    expect(sim.state.stats.poisTotal).toBe(2);
    // P2-02: run-level chronicle data survives the new world.
    expect(sim.state.runElapsed).toBe(800);
    expect(sim.state.runHighestAge).toBe("space");
    expect(sim.state.runKills).toBe(500);
    expect(sim.state.elapsed).toBe(0);
    expect(sim.state.ageIndex).toBe(0);
  });

  it("idle steps are deterministic", () => {
    const a = new RunSimulation({ masterSeed: "EPOCH-GOLDEN-001" });
    const c = new RunSimulation({ masterSeed: "EPOCH-GOLDEN-001" });
    for (let i = 0; i < 60; i++) { a.step(1 / 60, IDLE); c.step(1 / 60, IDLE); }
    expect(a.snapshot()).toBe(c.snapshot());
  });
});
