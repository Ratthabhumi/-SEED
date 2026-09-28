import { describe, it, expect } from "vitest";
import { RunSimulation } from "../../src/core/sim/RunSimulation";
import { MAX_ENEMIES } from "../../src/core/sim/RunState";

// P1-03: boss spawning is transactional under pool saturation.
describe("boss pool saturation", () => {
  it("saturated pool → boss still spawns (deterministic reclaim), Ascension reachable", () => {
    const sim = new RunSimulation({ masterSeed: "EPOCH-GOLDEN-001" });
    const ev: never[] = [];
    for (let i = 0; i < MAX_ENEMIES; i++) {
      sim.spawnEnemy("chaser", false, false, 0, 800 + (i % 50), ev);
    }
    expect(sim.state.enemies.filter((e) => e.active).length).toBe(MAX_ENEMIES);

    const boss = sim.spawnEnemy("tank", true, true, 0, 700, ev, "armored");
    expect(boss).not.toBeNull();
    expect(sim.state.bossIndex).toBeGreaterThanOrEqual(0);
    expect(boss?.affix).toBe("armored");
    // Pool size unchanged: one composted, one boss in.
    expect(sim.state.enemies.filter((e) => e.active).length).toBe(MAX_ENEMIES);

    // Killing the boss still opens Ascension.
    const idx = sim.state.bossIndex;
    sim.debugDamageEnemy(idx, 1e9);
    expect(sim.state.stats.bosses).toBe(1);
    expect(sim.state.ascendReady).toBe(true);
  });

  it("ordinary spawn fails cleanly (null) when saturated — no phantom state", () => {
    const sim = new RunSimulation({ masterSeed: "EPOCH-GOLDEN-001" });
    for (let i = 0; i < MAX_ENEMIES; i++) sim.spawnEnemy("swarm", false, false, 0, 800, []);
    expect(sim.spawnEnemy("chaser", false, false, 0, 800, [])).toBeNull();
    expect(sim.state.bossIndex).toBe(-1);
  });
});
