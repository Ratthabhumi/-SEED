import { describe, it, expect } from "vitest";
import { RunSimulation } from "../../src/core/sim/RunSimulation";
import {
  composeFromBudget, eligibleFamilies, THREAT_COST,
} from "../../src/core/director/director";
import { Xoshiro128StarStar } from "../../src/core/seed/rng";
import type { InputFrame } from "../../src/core/sim/InputFrame";

const IDLE: InputFrame = { moveX: 0, moveY: 0, dashPressed: false };

// P2-05: every runtime spawn pathway obeys era eligibility; budget honesty.
describe("director runtime contract", () => {
  it("Stone: tanks ineligible for EVERY encounter type", () => {
    expect(eligibleFamilies(0, "ordinary")).not.toContain("tank");
    expect(eligibleFamilies(0, "milestone")).not.toContain("tank");
    const rng = new Xoshiro128StarStar(42);
    for (let i = 0; i < 100; i++) {
      expect(composeFromBudget(60, rng, 0).tank).toBe(0);
    }
  });

  it("Bronze+: tanks eligible as designed", () => {
    expect(eligibleFamilies(1, "ordinary")).toContain("tank");
    expect(eligibleFamilies(1, "milestone")).toContain("tank");
  });

  it("composed cost never exceeds the budget (model A wave)", () => {
    const rng = new Xoshiro128StarStar(7);
    for (let i = 0; i < 100; i++) {
      const budget = 6 + (i % 40);
      const c = composeFromBudget(budget, rng, 2);
      const cost =
        c.chaser * THREAT_COST.chaser! + c.ranged * THREAT_COST.ranged! +
        c.tank * THREAT_COST.tank! + c.swarm * THREAT_COST.swarm! +
        c.elite * THREAT_COST.elite!;
      expect(cost, `budget ${budget}`).toBeLessThanOrEqual(Math.floor(budget));
    }
  });

  it("sim Stone milestone waves spawn zero tanks", () => {
    const sim = new RunSimulation({ masterSeed: "EPOCH-GOLDEN-001" });
    sim.state.spawnT = 99999; // silence ordinary waves; milestones only
    sim.state.eliteT = 0.01;
    for (let i = 0; i < 600 && !sim.state.over; i++) {
      const ev = sim.step(1 / 60, IDLE);
      for (const e of ev) if (e.type === "draft_opened") sim.chooseDraft(0);
      if (i % 60 === 0) sim.state.eliteT = 0.01; // force frequent milestones
    }
    const tanks = sim.state.enemies.filter((e) => e.active && e.family === "tank");
    expect(tanks.length).toBe(0);
  });
});
