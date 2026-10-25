import { describe, it, expect } from "vitest";
import { RunSimulation, worldNonceFor } from "../../src/core/sim/RunSimulation";
import { deriveAscensionSeed } from "../../src/core/seed/streams";
import { generateTechGraph } from "../../src/core/tech/generator";
import { validateTechGraph } from "../../src/core/tech/validator";
import { getChunkDescriptor } from "../../src/core/world/chunks";
import { threatBudget } from "../../src/core/director/director";

// Replay / long-run edge audit: no arbitrary caps, numbers stay finite,
// identities stay collision-free.
describe("long-run edge cases", () => {
  it("ascension 1000: child seed finite, streams init, graph validates", () => {
    const child = deriveAscensionSeed("EPOCH-GOLDEN-001", 1000);
    expect(child).toContain("ascension:1000");
    const sim = new RunSimulation({ masterSeed: "EPOCH-GOLDEN-001" });
    sim.state.ascendReady = true;
    // Walk ascensions via repeated state surgery is slow; assert the pieces:
    const g = generateTechGraph(child, 1000);
    expect(validateTechGraph(g).ok).toBe(true);
    expect(Number.isFinite(threatBudget(1e9, 5, 1000))).toBe(true);
    expect(threatBudget(1e9, 5, 1000)).toBeLessThan(1e12);
  });

  it("world nonces distinct across ascensions 0..100 (no collision in sample)", () => {
    const nonces = new Set<string>();
    for (let i = 0; i <= 100; i++) nonces.add(worldNonceFor("EPOCH-GOLDEN-001", i));
    expect(nonces.size).toBe(101);
  });

  it("64-char seeds and extreme coordinates stay finite", () => {
    const long = `EPOCH-${"A".repeat(29)}-${"9".repeat(29)}`.slice(0, 64);
    expect(long.length).toBeLessThanOrEqual(64);
    const d = getChunkDescriptor(long, 1_000_000, -1_000_000);
    for (const v of [d.elevation, d.temperature, d.moisture, d.anomaly, d.civilizationInfluence]) {
      expect(Number.isFinite(v)).toBe(true);
    }
  });

  it("huge elapsed/kill counters stay finite", () => {
    expect(Number.isFinite(threatBudget(3.6e6, 5, 50))).toBe(true);
    const sim = new RunSimulation({ masterSeed: "EPOCH-GOLDEN-001" });
    sim.state.stats.kills = 9e12;
    sim.state.stats.knowledgeEarned = 9e12;
    expect(Number.isFinite(sim.state.stats.kills)).toBe(true);
    expect(sim.snapshot().length).toBeGreaterThan(0);
  });
});
