import { describe, it, expect } from "vitest";
import { RunSimulation } from "../../src/core/sim/RunSimulation";
import { CRITICAL_SPINE } from "../../src/core/tech/graph";

// Design A: entering an age auto-grants its spine, so the whole age opens at once.
describe("tech draft frontier width", () => {
  for (let age = 0; age <= 5; age++) {
    it(`age ${age}: spine owned → >= 3 generated options`, () => {
      const sim = new RunSimulation({ masterSeed: "EPOCH-GOLDEN-001" });
      sim.state.ageIndex = age;
      for (let i = 0; i <= age; i++) {
        const id = CRITICAL_SPINE[i]?.id;
        if (id && !sim.state.owned.includes(id)) sim.state.owned.push(id);
      }
      expect(sim.generatedOptionsCount()).toBeGreaterThanOrEqual(3);
    });
  }

  it("holds across the generated-seed corpus", () => {
    const seeds = ["EPOCH-GOLDEN-002", "EPOCH-STRESS-001", "EPOCH-A7F2-K19X", "EPOCH-9BZZ-R21Q"];
    for (const seed of seeds) {
      for (const age of [0, 2, 5]) {
        const sim = new RunSimulation({ masterSeed: seed });
        sim.state.ageIndex = age;
        for (let i = 0; i <= age; i++) {
          const id = CRITICAL_SPINE[i]?.id;
          if (id && !sim.state.owned.includes(id)) sim.state.owned.push(id);
        }
        expect(sim.generatedOptionsCount(), `${seed}@${age}`).toBeGreaterThanOrEqual(3);
      }
    }
  });
});
