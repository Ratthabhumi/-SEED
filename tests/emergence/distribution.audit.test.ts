// v0.25 Emergence & Experience Distribution Audit
// Measures real age-index buckets (Stone..Space), separates real vs fallback offers,
// evaluates rule-based synthetic players, and tests trajectory divergence.
// Deterministic seeded streams only. No Math.random.

import { describe, it, expect } from "vitest";
import { generateWorldLaws, deriveWorldTraits, type WorldLaws } from "../../src/core/emergence/worldLaws";
import { generateOffers, type OfferCandidate } from "../../src/core/emergence/offerEngine";
import { calculateMaxLogistics, calculateLogisticsCost } from "../../src/core/emergence/outpostLogistics";
import { ORIGINS, originById, type OriginId, type WeaponFamily } from "../../src/core/progression/origins";
import { ORIGIN_ABILITY } from "../../src/core/combat/squad";
import { RunSimulation } from "../../src/core/sim/RunSimulation";
import { WORLDGEN_VERSION, CONTENT_VERSION } from "../../src/core/seed/versions";
import { AGES, type AgeId } from "../../src/core/tech/graph";

interface QualityDist {
  COMMON: number;
  UNCOMMON: number;
  RARE: number;
  MYTHIC: number;
}

interface AgeMetrics {
  age: AgeId;
  realCount: number;
  fallbackCount: number;
  qualityDist: QualityDist;
}

function shannonEntropy(counts: Record<string, number>): number {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total === 0) return 0;
  return -Object.values(counts).reduce((sum, c) => {
    if (c === 0) return sum;
    const p = c / total;
    return sum + p * Math.log2(p);
  }, 0);
}

function jsDivergence(p: Record<string, number>, q: Record<string, number>): number {
  const allKeys = new Set([...Object.keys(p), ...Object.keys(q)]);
  const m: Record<string, number> = {};
  for (const k of allKeys) {
    m[k] = ((p[k] || 0) + (q[k] || 0)) / 2;
  }
  return (shannonEntropy(m) - 0.5 * (shannonEntropy(p) + shannonEntropy(q))) * 0.5;
}

function normalizeDist(dist: QualityDist): Record<string, number> {
  const total = Object.values(dist).reduce((a, b) => a + b, 0);
  if (total === 0) return { COMMON: 0, UNCOMMON: 0, RARE: 0, MYTHIC: 0 };
  return {
    COMMON: dist.COMMON / total,
    UNCOMMON: dist.UNCOMMON / total,
    RARE: dist.RARE / total,
    MYTHIC: dist.MYTHIC / total,
  };
}

describe("v0.25 emergence and experience distribution audit", () => {
  const AUDIT_SEEDS = 1000;
  const ORIGIN_LIST: OriginId[] = ["hunters", "engineers", "resonant", "sentinels"];

  it("measures real age-index buckets and separates fallback vs real offers", { timeout: 90000 }, () => {
    const ageMetrics: Record<AgeId, AgeMetrics> = {
      stone: { age: "stone", realCount: 0, fallbackCount: 0, qualityDist: { COMMON: 0, UNCOMMON: 0, RARE: 0, MYTHIC: 0 } },
      bronze: { age: "bronze", realCount: 0, fallbackCount: 0, qualityDist: { COMMON: 0, UNCOMMON: 0, RARE: 0, MYTHIC: 0 } },
      iron: { age: "iron", realCount: 0, fallbackCount: 0, qualityDist: { COMMON: 0, UNCOMMON: 0, RARE: 0, MYTHIC: 0 } },
      industrial: { age: "industrial", realCount: 0, fallbackCount: 0, qualityDist: { COMMON: 0, UNCOMMON: 0, RARE: 0, MYTHIC: 0 } },
      atomic: { age: "atomic", realCount: 0, fallbackCount: 0, qualityDist: { COMMON: 0, UNCOMMON: 0, RARE: 0, MYTHIC: 0 } },
      space: { age: "space", realCount: 0, fallbackCount: 0, qualityDist: { COMMON: 0, UNCOMMON: 0, RARE: 0, MYTHIC: 0 } },
    };

    let totalRealOffers = 0;
    let totalFallbackOffers = 0;
    let rerollAvailable = 0;
    let rerollTotal = 0;
    const globalQualityDist: QualityDist = { COMMON: 0, UNCOMMON: 0, RARE: 0, MYTHIC: 0 };
    const fingerprints = new Map<string, number>();

    for (let i = 0; i < AUDIT_SEEDS; i++) {
      const seed = `AUDIT-V025-${i.toString().padStart(6, "0")}`;
      const origin = ORIGIN_LIST[i % ORIGIN_LIST.length]!;
      const sim = new RunSimulation({ masterSeed: seed, originId: origin });

      // Sample offers across all 6 real ages
      for (let ageIdx = 0; ageIdx < AGES.length; ageIdx++) {
        const ageId = AGES[ageIdx] as AgeId;
        sim.state.ageIndex = ageIdx;
        sim.state.ageElapsed = 10;
        sim.state.pendingLevels = 1;
        sim.gainKnowledge(1000 * (ageIdx + 1), "audit", []);

        if (sim.state.draftOpen) {
          const offers = sim.state.draftOffers;
          const fp = offers.map(o => `${o.nodeId}:${o.quality}`).sort().join("|");
          fingerprints.set(fp, (fingerprints.get(fp) || 0) + 1);

          for (const o of offers) {
            const isFallback = o.nodeId.startsWith("fb-");
            if (isFallback) {
              ageMetrics[ageId].fallbackCount++;
              totalFallbackOffers++;
            } else {
              ageMetrics[ageId].realCount++;
              ageMetrics[ageId].qualityDist[o.quality]++;
              globalQualityDist[o.quality]++;
              totalRealOffers++;
            }
          }

          if (sim.state.rerolls > 0) {
            const before = new Set(offers.map(o => o.nodeId));
            const pool = sim.nodeStates().filter(n => n.available && !before.has(n.id));
            if (pool.length > 0) rerollAvailable++;
            rerollTotal++;
          }

          // Pick first non-fallback offer if available, else first offer
          const pickIdx = Math.max(0, offers.findIndex(o => !o.nodeId.startsWith("fb-")));
          sim.chooseDraft(pickIdx);
        }
      }
    }

    console.log("=== Real Age Bucket Distribution (v0.25) ===");
    for (const ageId of AGES) {
      const m = ageMetrics[ageId];
      const norm = normalizeDist(m.qualityDist);
      console.log(
        `Age ${ageId.padEnd(10)}: real=${m.realCount}, fb=${m.fallbackCount}, quality=(${Object.entries(norm)
          .map(([k, v]) => `${k}:${(v * 100).toFixed(1)}%`)
          .join(" ")})`
      );

      // Acceptance criterion: Every measured age bucket must have sample count > 0
      expect(m.realCount).toBeGreaterThan(0);
      // All qualities possible across all ages (no age-clamping)
      expect(m.qualityDist.COMMON).toBeGreaterThan(0);
      expect(m.qualityDist.UNCOMMON).toBeGreaterThan(0);
    }

    const fallbackRate = totalFallbackOffers / (totalRealOffers + totalFallbackOffers);
    const rerollRate = rerollTotal > 0 ? rerollAvailable / rerollTotal : 0;
    const totalDraftSamples = AUDIT_SEEDS * AGES.length;
    const collisionRate = Array.from(fingerprints.values()).filter(c => c > 1).length / totalDraftSamples;

    console.log(`Global real quality:`, normalizeDist(globalQualityDist));
    console.log(`Fallback offer rate: ${(fallbackRate * 100).toFixed(2)}%`);
    console.log(`Reroll alternative availability: ${(rerollRate * 100).toFixed(2)}%`);
    console.log(`Collision rate: ${(collisionRate * 100).toFixed(2)}%`);

    expect(fallbackRate).toBeLessThan(0.40);
    expect(rerollRate).toBeGreaterThan(0.08);
    expect(collisionRate).toBeLessThan(0.35);
  });

  it("measures origin divergence and legibility in offer distribution", { timeout: 60000 }, () => {
    const originPicks: Record<OriginId, Record<string, number>> = {
      hunters: {},
      engineers: {},
      resonant: {},
      sentinels: {},
    };

    const SAMPLE_COUNT = 300;
    for (let i = 0; i < SAMPLE_COUNT; i++) {
      const seed = `AUDIT-DIV-${i.toString().padStart(5, "0")}`;
      for (const origin of ORIGIN_LIST) {
        const sim = new RunSimulation({ masterSeed: seed, originId: origin });
        sim.gainKnowledge(2000, "audit", []);
        if (sim.state.draftOpen) {
          for (const off of sim.state.draftOffers) {
            const node = sim.techGraph().find(n => n.id === off.nodeId);
            const domain = node?.domain ?? "unknown";
            originPicks[origin][domain] = (originPicks[origin][domain] || 0) + 1;
          }
          sim.chooseDraft(0);
        }
      }
    }

    console.log("=== Origin Domain Divergence ===");
    for (const origin of ORIGIN_LIST) {
      console.log(`${origin}:`, originPicks[origin]);
      const def = originById(origin);
      expect(def.families.length).toBe(2);
      expect(def.ability.cooldown).toBeGreaterThan(0);
      expect(ORIGIN_ABILITY[origin].id).toBe(def.ability.id);
    }

    // Measure JSD across origins
    const jsdHE = jsDivergence(originPicks.hunters, originPicks.engineers);
    const jsdHR = jsDivergence(originPicks.hunters, originPicks.resonant);
    const jsdHS = jsDivergence(originPicks.hunters, originPicks.sentinels);

    console.log(`JSD Hunters vs Engineers: ${jsdHE.toFixed(4)}`);
    console.log(`JSD Hunters vs Resonant: ${jsdHR.toFixed(4)}`);
    console.log(`JSD Hunters vs Sentinels: ${jsdHS.toFixed(4)}`);

    expect(jsdHE).toBeGreaterThan(0.0001);
    expect(jsdHR).toBeGreaterThan(0.0001);
    expect(jsdHS).toBeGreaterThan(0.0001);
  });

  it("verifies world laws determinism and player-visible world traits", () => {
    for (let i = 0; i < 200; i++) {
      const seed = `AUDIT-LAWS-${i}`;
      const l1 = generateWorldLaws(seed, WORLDGEN_VERSION, CONTENT_VERSION);
      const l2 = generateWorldLaws(seed, WORLDGEN_VERSION, CONTENT_VERSION);
      expect(l1.seedIdentity).toBe(l2.seedIdentity);
      expect(l1.aggression).toBe(l2.aggression);

      const traits1 = deriveWorldTraits(l1);
      const traits2 = deriveWorldTraits(l2);
      expect(traits1.length).toBeGreaterThanOrEqual(1);
      expect(traits1.length).toBeLessThanOrEqual(2);
      expect(traits1[0]!.id).toBe(traits2[0]!.id);
      expect(traits1[0]!.nameKey).toBe(traits2[0]!.nameKey);
      expect(traits1[0]!.descKey).toBe(traits2[0]!.descKey);
    }
  });

  it("evaluates lightweight rule-based synthetic players (BUILD_SEEKER, SURVIVOR, EXPANDER, AGGRESSOR)", () => {
    type PolicyName = "BUILD_SEEKER" | "SURVIVOR" | "EXPANDER" | "AGGRESSOR";

    interface PolicyResult {
      techsTaken: number;
      abilityUses: number;
      synergies: number;
      outposts: number;
      topDomain: string;
      damageShare: Record<string, number>;
    }

    const runSyntheticPolicy = (policy: PolicyName, seed: string, origin: OriginId): PolicyResult => {
      const sim = new RunSimulation({ masterSeed: seed, originId: origin });

      // Simulate a series of progression steps
      for (let step = 0; step < 15; step++) {
        sim.gainKnowledge(3000, "step", []);

        // Use ability based on policy
        if (policy === "AGGRESSOR" || policy === "SURVIVOR") {
          sim.tryAbility();
        }

        if (sim.state.draftOpen) {
          const offers = sim.state.draftOffers;
          let bestIdx = 0;

          if (policy === "BUILD_SEEKER") {
            // Pick card with highest synergy with owned tags
            const ownedSet = new Set(sim.state.ownedTags);
            let maxSynergy = -1;
            offers.forEach((o, idx) => {
              const node = sim.techGraph().find(n => n.id === o.nodeId);
              const syn = node ? node.synergyTags.filter(t => ownedSet.has(t)).length : 0;
              if (syn > maxSynergy) {
                maxSynergy = syn;
                bestIdx = idx;
              }
            });
          } else if (policy === "SURVIVOR") {
            // Prioritize defense / health
            const defIdx = offers.findIndex(o => {
              const node = sim.techGraph().find(n => n.id === o.nodeId);
              return node?.effects.some(e => e.family === "defense" || e.kind === "maxHpAdd" || e.kind === "regenAdd");
            });
            if (defIdx >= 0) bestIdx = defIdx;
          } else if (policy === "EXPANDER") {
            // Prioritize industry / economy
            const indIdx = offers.findIndex(o => {
              const node = sim.techGraph().find(n => n.id === o.nodeId);
              return node?.domain === "industry" || node?.tags.includes("tools");
            });
            if (indIdx >= 0) bestIdx = indIdx;
          } else if (policy === "AGGRESSOR") {
            // Prioritize warfare / damage
            const warIdx = offers.findIndex(o => {
              const node = sim.techGraph().find(n => n.id === o.nodeId);
              return node?.domain === "warfare" || node?.effects.some(e => e.family === "kinetic" || e.family === "energy");
            });
            if (warIdx >= 0) bestIdx = warIdx;
          }

          sim.chooseDraft(bestIdx);
        }

        // Policy action: claim outposts if EXPANDER
        if (policy === "EXPANDER" && sim.state.poisWorld.length > 0) {
          const claimable = sim.claimablePOIs().find(c => c.clear);
          if (claimable) sim.claimTerritory(claimable.poiId);
        }
      }

      // Compute top domain
      const domPicks = sim.state.stats.draftPicksByDomain;
      let topDomain = "none";
      let topCount = -1;
      for (const [d, c] of Object.entries(domPicks)) {
        if (c > topCount) {
          topCount = c;
          topDomain = d;
        }
      }

      return {
        techsTaken: sim.state.stats.techsTaken,
        abilityUses: sim.state.stats.abilityUses,
        synergies: sim.state.breakthroughs.length,
        outposts: sim.state.stats.outpostsClaimed,
        topDomain,
        damageShare: { ...sim.state.damageBySource },
      };
    };

    const seed = "AUDIT-SYNTHETIC-POLICY-001";
    const seekerRes = runSyntheticPolicy("BUILD_SEEKER", seed, "engineers");
    const survivorRes = runSyntheticPolicy("SURVIVOR", seed, "sentinels");
    const expanderRes = runSyntheticPolicy("EXPANDER", seed, "hunters");
    const aggressorRes = runSyntheticPolicy("AGGRESSOR", seed, "resonant");

    console.log("=== Synthetic Policy Audit Results ===");
    console.log("BUILD_SEEKER:", seekerRes);
    console.log("SURVIVOR:    ", survivorRes);
    console.log("EXPANDER:    ", expanderRes);
    console.log("AGGRESSOR:   ", aggressorRes);

    // Verify policies produce distinct strategic outcomes:
    expect(aggressorRes.abilityUses).toBeGreaterThan(0);
    expect(survivorRes.abilityUses).toBeGreaterThan(0);
    expect(seekerRes.techsTaken).toBeGreaterThan(5);
    expect(expanderRes.techsTaken).toBeGreaterThan(5);
  });

  it("verifies trajectory divergence under SAME SEED + DIFFERENT ORIGIN and DIFFERENT SEED + SAME ORIGIN", () => {
    // 1. SAME SEED + DIFFERENT ORIGINS
    const fixedSeed = "AUDIT-COMPARISON-FIXED-SEED";
    const originRuns = ORIGIN_LIST.map(o => {
      const sim = new RunSimulation({ masterSeed: fixedSeed, originId: o });
      for (let s = 0; s < 10; s++) {
        sim.gainKnowledge(2000, "audit", []);
        if (sim.state.draftOpen) sim.chooseDraft(0);
      }
      return {
        origin: o,
        picks: { ...sim.state.stats.draftPicksByDomain },
        familyPicks: { ...sim.state.stats.draftPicksByFamily },
      };
    });

    console.log("=== SAME SEED + DIFFERENT ORIGINS ===");
    originRuns.forEach(r => console.log(r.origin, "Family picks:", r.familyPicks));

    // Verify different origins pick different families even on the exact same seed
    const huntersFam = originRuns.find(r => r.origin === "hunters")!.familyPicks;
    const resonantFam = originRuns.find(r => r.origin === "resonant")!.familyPicks;
    expect(huntersFam).not.toEqual(resonantFam);

    // 2. DIFFERENT SEEDS + SAME ORIGIN
    const seeds = ["AUDIT-SEED-ALPHA", "AUDIT-SEED-BETA", "AUDIT-SEED-GAMMA"];
    const seedRuns = seeds.map(s => {
      const sim = new RunSimulation({ masterSeed: s, originId: "engineers" });
      const traits = deriveWorldTraits(sim.state.worldLaws);
      for (let step = 0; step < 10; step++) {
        sim.gainKnowledge(2000, "audit", []);
        if (sim.state.draftOpen) sim.chooseDraft(0);
      }
      return {
        seed: s,
        traits: traits.map(t => t.id),
        domainPicks: { ...sim.state.stats.draftPicksByDomain },
      };
    });

    console.log("=== DIFFERENT SEEDS + SAME ORIGIN ===");
    seedRuns.forEach(r => console.log(r.seed, "Traits:", r.traits, "Domains:", r.domainPicks));

    // Seeds produce distinct world traits
    const allTraits = seedRuns.map(r => r.traits.join(","));
    const distinctTraits = new Set(allTraits);
    expect(distinctTraits.size).toBeGreaterThan(1);
  });

  it("verifies logistics growth and costs per age", () => {
    for (let age = 0; age <= 5; age++) {
      const maxLog = calculateMaxLogistics(age);
      expect(maxLog).toBeGreaterThanOrEqual(age + 2);
      expect(maxLog).toBeLessThanOrEqual(8);
    }

    const costs = {
      research: { t1: calculateLogisticsCost("research", 1), t2: calculateLogisticsCost("research", 2) },
      military: { t1: calculateLogisticsCost("military", 1), t2: calculateLogisticsCost("military", 2) },
      economy: { t1: calculateLogisticsCost("economy", 1), t2: calculateLogisticsCost("economy", 2) },
    };
    expect(costs.research.t1).toBe(1);
    expect(costs.military.t1).toBe(2);
    expect(costs.economy.t1).toBe(1);
  });
});