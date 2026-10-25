import { describe, it, expect } from "vitest";
import { RunSimulation } from "../../src/core/sim/RunSimulation";

// P2-04: splitter parent reward must survive pooled-child reuse.
describe("splitter death reward", () => {
  it("parent xp=20 pickup preserved; children separate", () => {
    const sim = new RunSimulation({ masterSeed: "EPOCH-GOLDEN-001" });
    sim.state.spawnT = 99999;
    sim.state.eliteT = 99999;
    const ev: never[] = [];
    // Elite chaser: base xp 1 × 5 = 5 parent reward.
    const parent = sim.spawnEnemy("chaser", true, false, 0, 300, ev, "splitter");
    expect(parent).not.toBeNull();
    expect(parent?.xp).toBe(5);
    const idx = sim.state.enemies.indexOf(parent!);
    sim.debugDamageEnemy(idx, 1e9);
    // Parent pickup carries the PARENT reward…
    const parentPickups = sim.state.pickups.filter((p) => p.active && p.value === 5);
    expect(parentPickups.length).toBe(1);
    // …and exactly two swarm children exist with their own xp 1.
    const children = sim.state.enemies.filter((e) => e.active && e.family === "swarm" && !e.elite);
    expect(children.length).toBe(2);
    for (const c of children) expect(c.xp).toBe(1);
  });
});
