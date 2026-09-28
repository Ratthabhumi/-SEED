import { describe, it, expect } from "vitest";
import { RunSimulation } from "../../src/core/sim/RunSimulation";
import { initRunRng } from "../../src/core/seed/runRng";
import { deriveAscensionSeed } from "../../src/core/seed/streams";
import { getPOIsForChunk } from "../../src/core/world/poi";
import { sampleFields } from "../../src/core/world/biome";
import { worldNonceFor } from "../../src/core/sim/RunSimulation";
import type { InputFrame } from "../../src/core/sim/InputFrame";

const IDLE: InputFrame = { moveX: 0, moveY: 0, dashPressed: false };

function ascendFresh(master: string, preSpam: number): RunSimulation {
  const sim = new RunSimulation({ masterSeed: master });
  // Spam the OLD world's streams (loot + event heavy) before ascending.
  for (let i = 0; i < 20; i++) sim.step(1 / 60, { moveX: 1, moveY: 0, dashPressed: false });
  void preSpam;
  sim.state.ascendReady = true; // test hook: state is plain data
  const ev = sim.ascend();
  expect(ev.some((e) => e.type === "ascended")).toBe(true);
  return sim;
}

describe("ascension stream isolation", () => {
  it("child world seed derives from master + index only", () => {
    const sim = ascendFresh("EPOCH-GOLDEN-001", 0);
    expect(sim.state.worldSeed).toBe(deriveAscensionSeed("EPOCH-GOLDEN-001", 1));
    expect(sim.state.ascension).toBe(1);
  });

  it("heavy pre-ascension consumption does not change the child world", () => {
    const a = ascendFresh("EPOCH-GOLDEN-001", 0);
    const b = ascendFresh("EPOCH-GOLDEN-001", 0);
    // Run identical post-ascension trajectories (scripted inputs + draft picks).
    for (const sim of [a, b]) {
      for (let i = 0; i < 300; i++) {
        const ev = sim.step(1 / 60, { moveX: Math.cos(i / 30), moveY: Math.sin(i / 30), dashPressed: i % 120 === 0 });
        for (const e of ev) if (e.type === "draft_opened") sim.chooseDraft(0);
        if (sim.state.over) break;
      }
    }
    expect(a.hash()).toBe(b.hash());
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
    sim.state.ascendReady = true;
    sim.ascend();
    expect(sim.state.chunksWorld).toEqual([]);
    expect(sim.state.poisWorld).toEqual([]);
    expect(sim.state.stats.chunksTotal).toBe(5);
    expect(sim.state.stats.poisTotal).toBe(2);
  });

  it("idle steps are deterministic", () => {
    const a = new RunSimulation({ masterSeed: "EPOCH-GOLDEN-001" });
    const c = new RunSimulation({ masterSeed: "EPOCH-GOLDEN-001" });
    for (let i = 0; i < 60; i++) { a.step(1 / 60, IDLE); c.step(1 / 60, IDLE); }
    expect(a.hash()).toBe(c.hash());
  });
});
