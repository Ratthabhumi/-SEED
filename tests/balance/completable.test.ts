import { describe, it, expect } from "vitest";
import { generateTechGraph } from "../../src/core/tech/generator";
import { validateTechGraph } from "../../src/core/tech/validator";
import { threatBudget } from "../../src/core/director/director";
import { xpForLevel } from "../../src/core/sim/fixedStep";
import { getWeaponStage } from "../../src/core/combat/weapons";
import type { WeaponFamily } from "../../src/core/combat/weapons";
import { sampleFields } from "../../src/core/world/biome";
import { canAdvanceAge } from "../../src/core/progression/ages";

// Procedural testing: N generated seeds must all be systems-completable.
const SEEDS = [
  "EPOCH-GOLDEN-001", "EPOCH-GOLDEN-002", "EPOCH-STRESS-001",
  "EPOCH-A7F2-K19X", "EPOCH-9BZZ-R21Q", "EPOCH-QQ11-WW22",
  "EPOCH-TEST-0001", "EPOCH-TEST-0002",
];

describe("balance sanity across generated seeds", () => {
  for (const seed of SEEDS) {
    it(`${seed}: tech graph valid + space reachable`, () => {
      const v = validateTechGraph(generateTechGraph(seed, 0));
      expect(v.ok).toBe(true);
    });

    it(`${seed}: threat curve finite across a full run`, () => {
      for (let t = 0; t <= 720; t += 60) {
        for (let a = 0; a < 6; a++) {
          const b = threatBudget(t, a, 0);
          expect(Number.isFinite(b)).toBe(true);
          expect(b).toBeGreaterThan(0);
        }
      }
    });

    it(`${seed}: world fields sane`, () => {
      const f = sampleFields(seed, 0, 0);
      for (const v of Object.values(f)) expect(Number.isFinite(v)).toBe(true);
    });
  }

  it("xp curve is positive and monotonic", () => {
    let prev = 0;
    for (let l = 1; l <= 60; l++) {
      const v = xpForLevel(l);
      expect(v).toBeGreaterThan(0);
      expect(v).toBeGreaterThanOrEqual(prev);
      prev = v;
    }
  });

  it("every weapon family has all 6 age stages with sane stats", () => {
    const fams: WeaponFamily[] = ["kinetic", "energy", "defense", "field"];
    for (const f of fams) {
      for (let a = 0; a < 6; a++) {
        const st = getWeaponStage(f, a);
        expect(st.damage).toBeGreaterThan(0);
        expect(st.cooldown).toBeGreaterThan(0);
        expect(Number.isFinite(st.damage + st.cooldown)).toBe(true);
      }
    }
  });

  it("age gating is satisfiable (knowledge + mission + dominion, no timer)", () => {
    const rich = { ageKills: 50, territoriesClaimed: 3, elitesAge: 5, outpostsTier2: 2, raidsSurvived: 2, signalSecured: true, breakthroughs: 2 };
    const poor = { ageKills: 0, territoriesClaimed: 0, elitesAge: 0, outpostsTier2: 0, raidsSurvived: 0, signalSecured: false, breakthroughs: 0 };
    const domRich = { active: 5, specialized: 3, tier2: 2, raidsSurvived: 2 };
    const domPoor = { active: 0, specialized: 0, tier2: 0, raidsSurvived: 0 };
    // Same predicate the sim and the HUD checklist share (v023 dominion).
    expect(canAdvanceAge(1, 10_000, rich, domRich)).toBe(true);
    expect(canAdvanceAge(1, 0, poor, domPoor)).toBe(false);
    // Dominion alone never advances without knowledge + mission.
    expect(canAdvanceAge(2, 0, poor, { active: 5, specialized: 5, tier2: 5, raidsSurvived: 5 })).toBe(false);
    expect(canAdvanceAge(99, 99999, rich, domRich)).toBe(false);
  });
});
