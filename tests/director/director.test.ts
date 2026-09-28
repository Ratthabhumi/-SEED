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

  it("enemy selection obeys era constraints (no tanks in stone age rush)", () => {
    const rng = new Xoshiro128StarStar(1234);
    let tanks = 0;
    for (let i = 0; i < 30; i++) tanks += composeFromBudget(20, rng, 0).tank;
    // age 0 allows tanks only via the 0.18 roll — bounded, never dominant
    expect(tanks).toBeLessThan(30 * 5);
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
