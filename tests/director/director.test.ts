import { describe, it, expect } from "vitest";
import { threatBudget, composeFromBudget, eliteChance } from "../../src/core/director/director";
import { Xoshiro128StarStar } from "../../src/core/seed/rng";

describe("threat director", () => {
  it("budgets remain finite and grow with time/age/ascension", () => {
    const early = threatBudget(10, 0, 0);
    const late = threatBudget(700, 5, 0);
    const asc = threatBudget(700, 5, 3);
    for (const v of [early, late, asc]) expect(Number.isFinite(v)).toBe(true);
    expect(late).toBeGreaterThan(early);
    expect(asc).toBeGreaterThan(late);
  });

  it("stone age never spawns tanks (era-gated)", () => {
    const rng = new Xoshiro128StarStar(1234);
    for (let i = 0; i < 50; i++) {
      expect(composeFromBudget(20, rng, 0).tank).toBe(0);
    }
  });

  it("eras stay compositionally diverse (no 90%+ single family)", () => {
    for (let age = 0; age <= 5; age++) {
      const rng = new Xoshiro128StarStar(777 + age);
      const totals = { chaser: 0, ranged: 0, tank: 0, swarm: 0, elite: 0 };
      for (let i = 0; i < 60; i++) {
        const c = composeFromBudget(40, rng, age);
        totals.chaser += c.chaser; totals.ranged += c.ranged;
        totals.tank += c.tank; totals.swarm += c.swarm; totals.elite += c.elite;
      }
      const sum = totals.chaser + totals.ranged + totals.tank + totals.swarm;
      expect(sum).toBeGreaterThan(0);
      for (const [fam, v] of Object.entries(totals)) {
        if (fam === "elite") continue;
        expect(v / sum, `age ${age} family ${fam}`).toBeLessThan(0.9);
      }
      // Every era fields at least two families overall.
      const used = [totals.chaser, totals.ranged, totals.tank, totals.swarm].filter((v) => v > 0).length;
      expect(used).toBeGreaterThanOrEqual(2);
    }
  });

  it("threat scaling remains bounded (no explosion at ascension 100)", () => {
    const b = threatBudget(720, 5, 100);
    expect(Number.isFinite(b)).toBe(true);
    expect(b).toBeLessThan(1e7);
  });

  it("elite chance is bounded", () => {
    expect(eliteChance(0, 0)).toBeGreaterThanOrEqual(0);
    expect(eliteChance(9, 99)).toBeLessThanOrEqual(0.22);
  });

  it("composition is deterministic for a fixed rng", () => {
    const mk = (): Xoshiro128StarStar => new Xoshiro128StarStar(999);
    expect(composeFromBudget(17, mk(), 2)).toEqual(composeFromBudget(17, mk(), 2));
  });
});
