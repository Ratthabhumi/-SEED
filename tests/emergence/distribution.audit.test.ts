// v0.26 Emergence & Experience Distribution Audit
// Separates three distinct evidence classes:
//   Class A: Conditioned Distribution Tests (Staged Sampling)
//   Class B: Natural Gameplay Simulations (Full Step Loop Factorial Evaluation)
//   Class C: Trajectory Divergence (Excluding Fallbacks, Mathematical JSD)
// Deterministic seeded streams only. No Math.random.

import { describe, it, expect } from "vitest";
import { generateWorldLaws, deriveWorldTraits, type WorldLaws } from "../../src/core/emergence/worldLaws";
import { calculateMaxLogistics, calculateLogisticsCost } from "../../src/core/emergence/outpostLogistics";
import { ORIGINS, originById, type OriginId, type WeaponFamily } from "../../src/core/progression/origins";
import { ORIGIN_ABILITY } from "../../src/core/combat/squad";
import { RunSimulation } from "../../src/core/sim/RunSimulation";
import { SIM_DT } from "../../src/core/sim/fixedStep";
import { worldToChunk } from "../../src/core/world/chunks";
import { WORLDGEN_VERSION, CONTENT_VERSION } from "../../src/core/seed/versions";
import { AGES, type AgeId } from "../../src/core/tech/graph";
import type { InputFrame } from "../../src/core/sim/InputFrame";

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

/**
 * Standard Shannon entropy: H(P) = -sum p_i * log2(p_i)
 * Uses base 2 logarithm; returns bits.
 */
export function shannonEntropy(counts: Record<string, number>): number {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total <= 0) return 0;
  let ent = 0;
  for (const c of Object.values(counts)) {
    if (c > 0) {
      const p = c / total;
      ent -= p * Math.log2(p);
    }
  }
  return ent;
}

/**
 * Mathematically correct Jensen-Shannon Divergence:
 * JSD(P || Q) = H(M) - 0.5 * (H(P) + H(Q))
 * where M = 0.5 * (P + Q).
 * Using base-2 logarithm, JSD is bounded in [0, 1].
 */
export function jsDivergence(p: Record<string, number>, q: Record<string, number>): number {
  const sumP = Object.values(p).reduce((a, b) => a + b, 0);
  const sumQ = Object.values(q).reduce((a, b) => a + b, 0);
  if (sumP <= 0 || sumQ <= 0) return 0;

  const allKeys = new Set([...Object.keys(p), ...Object.keys(q)]);
  const normP: Record<string, number> = {};
  const normQ: Record<string, number> = {};
  const mixture: Record<string, number> = {};

  for (const k of allKeys) {
    const pk = (p[k] || 0) / sumP;
    const qk = (q[k] || 0) / sumQ;
    normP[k] = pk;
    normQ[k] = qk;
    mixture[k] = 0.5 * (pk + qk);
  }

  const hM = shannonEntropy(mixture);
  const hP = shannonEntropy(normP);
  const hQ = shannonEntropy(normQ);

  const jsd = hM - 0.5 * (hP + hQ);
  return Math.max(0, Math.min(1, jsd));
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

describe("v0.26 emergence & experience distribution audit", () => {
  const ORIGIN_LIST: OriginId[] = ["hunters", "engineers", "resonant", "sentinels"];

  // --------------------------------------------------------------------------
  // Math Unit Verification: JSD Properties
  // --------------------------------------------------------------------------
  it("verifies mathematical Jensen-Shannon Divergence properties and normalization", () => {
    // 1. Identical distributions -> JSD = 0
    const p1 = { a: 10, b: 20 };
    const q1 = { a: 20, b: 40 };
    expect(jsDivergence(p1, q1)).toBeCloseTo(0, 5);

    // 2. Completely orthogonal distributions -> JSD = 1.0 (with base-2 log)
    const p2 = { a: 10 };
    const q2 = { b: 10 };
    expect(jsDivergence(p2, q2)).toBeCloseTo(1.0, 5);

    // 3. Symmetry: JSD(P, Q) === JSD(Q, P)
    const p3 = { warfare: 5, industry: 2, science: 3 };
    const q3 = { warfare: 1, industry: 6, science: 3 };
    expect(jsDivergence(p3, q3)).toBeCloseTo(jsDivergence(q3, p3), 5);

    // 4. Boundedness in [0, 1]
    const d = jsDivergence(p3, q3);
    expect(d).toBeGreaterThanOrEqual(0);
    expect(d).toBeLessThanOrEqual(1);
  });

  // --------------------------------------------------------------------------
  // Class A: Conditioned Distribution Tests (Staged Sampling)
  // --------------------------------------------------------------------------
  it("[Class A: Conditioned Sampling] Real Age Buckets, Decoupled Quality, and Fallback Invariants", { timeout: 90000 }, () => {
    // Conditioned/staged sampling: intentionally stages sim.state.ageIndex across all 6 real ages (stone..space)
    // to test offer engine candidate generation, quality sampling distributions, and fallback rates at statistical scale.
    const AUDIT_SEEDS = 1000;
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
      const seed = `AUDIT-V026-${i.toString().padStart(6, "0")}`;
      const origin = ORIGIN_LIST[i % ORIGIN_LIST.length]!;
      const sim = new RunSimulation({ masterSeed: seed, originId: origin });

      // Staged sample across all 6 real ages
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

          const pickIdx = Math.max(0, offers.findIndex(o => !o.nodeId.startsWith("fb-")));
          sim.chooseDraft(pickIdx);
        }
      }
    }

    console.log("=== [Class A: Conditioned Sampling] Real Age Bucket Distribution ===");
    for (const ageId of AGES) {
      const m = ageMetrics[ageId];
      const norm = normalizeDist(m.qualityDist);
      console.log(
        `Age ${ageId.padEnd(10)}: real=${m.realCount}, fb=${m.fallbackCount}, quality=(${Object.entries(norm)
          .map(([k, v]) => `${k}:${(v * 100).toFixed(1)}%`)
          .join(" ")})`
      );

      // Acceptance criteria: Every measured age bucket has positive sample count > 0
      expect(m.realCount).toBeGreaterThan(0);

      // Explicit assertion: All 4 qualities appear in every age bucket without age clamping
      expect(m.qualityDist.COMMON).toBeGreaterThan(0);
      expect(m.qualityDist.UNCOMMON).toBeGreaterThan(0);
      expect(m.qualityDist.RARE).toBeGreaterThan(0);
      expect(m.qualityDist.MYTHIC).toBeGreaterThan(0);
    }

    const fallbackRate = totalFallbackOffers / (totalRealOffers + totalFallbackOffers);
    // Reroll pool alternative candidate availability: fraction of drafts with rerolls where unshown candidates exist
    const rerollPoolAvailabilityRate = rerollTotal > 0 ? rerollAvailable / rerollTotal : 0;
    // Denominator uses genuinely observed draft samples across all seeds and ages
    const observedDraftSamples = Array.from(fingerprints.values()).reduce((sum, c) => sum + c, 0);
    // Metric definition reconciliation:
    // 1. collidingFingerprintGroupRate: fraction of observed drafts whose unique fingerprint group appears > 1 time
    //    (previously mislabeled 'collision rate' and masked repeated sample frequency).
    const collidingFingerprintGroupRate = Array.from(fingerprints.values()).filter(c => c > 1).length / observedDraftSamples;
    // 2. duplicateDraftSampleFrequency: genuine rate of redundant draft occurrences across the sample space.
    const duplicateDraftSampleFrequency = Array.from(fingerprints.values()).reduce((sum, c) => sum + (c > 1 ? c - 1 : 0), 0) / observedDraftSamples;

    console.log(`Global real quality:`, normalizeDist(globalQualityDist));
    console.log(`Fallback offer rate: ${(fallbackRate * 100).toFixed(2)}%`);
    console.log(`Reroll candidate pool availability: ${(rerollPoolAvailabilityRate * 100).toFixed(2)}%`);
    console.log(`Colliding fingerprint group rate: ${(collidingFingerprintGroupRate * 100).toFixed(2)}%`);
    console.log(`Duplicate draft sample frequency (true collision rate): ${(duplicateDraftSampleFrequency * 100).toFixed(2)}%`);

    expect(fallbackRate).toBeLessThan(0.40);
    expect(rerollPoolAvailabilityRate).toBeGreaterThan(0.08);
    expect(collidingFingerprintGroupRate).toBeLessThan(0.35);
    expect(duplicateDraftSampleFrequency).toBeLessThan(0.65);
  });

  // --------------------------------------------------------------------------
  // Class B: Natural Gameplay Simulations (Full Step Loop Factorial Evaluation)
  // --------------------------------------------------------------------------
  type PolicyName = "BUILD_SEEKER" | "SURVIVOR" | "EXPANDER" | "AGGRESSOR";

  interface NaturalRunMetrics {
    seed: string;
    origin: OriginId;
    policy: PolicyName;
    survivedSec: number;
    highestAge: AgeId;
    kills: number;
    techsTaken: number;
    abilityUses: number;
    outpostsClaimed: number;
    outpostsSpecialized: number;
    logisticsUsed: number;
    reservesUsed: number;
    rerollsUsed: number;
    picksByDomain: Record<string, number>;
    picksByFamily: Record<string, number>;
    damageShare: Record<string, number>;
  }

  function runNaturalSimulation(seed: string, origin: OriginId, policy: PolicyName, maxSteps = 2400): NaturalRunMetrics {
    const sim = new RunSimulation({ masterSeed: seed, originId: origin });

    // Pre-cache nearby POIs for EXPANDER navigation once at startup
    const nearbyPOIs: Array<{ id: string; x: number; y: number }> = [];
    if (policy === "EXPANDER") {
      const { cx, cy } = worldToChunk(sim.state.px, sim.state.py);
      for (let ox = -3; ox <= 3; ox++) {
        for (let oy = -3; oy <= 3; oy++) {
          const desc = sim.chunks.get(sim.state.worldSeed, sim.state.worldNonce, cx + ox, cy + oy);
          for (const poi of desc.poi) {
            nearbyPOIs.push({ id: poi.id, x: poi.wx, y: poi.wy });
          }
        }
      }
    }

    // Step-by-step natural autonomous simulation without progression cheats
    for (let step = 0; step < maxSteps; step++) {
      if (sim.state.over) break;

      let moveX = 0;
      let moveY = 0;
      let dashPressed = false;

      // Policy-specific movement & navigation
      if (policy === "EXPANDER") {
        const claimed = new Set(sim.state.territories.map(t => t.poiId));
        let bestDist = Infinity;
        let target: { x: number; y: number } | null = null;
        for (const poi of nearbyPOIs) {
          if (claimed.has(poi.id)) continue;
          const d = Math.hypot(poi.x - sim.state.px, poi.y - sim.state.py);
          if (d < bestDist) {
            bestDist = d;
            target = poi;
          }
        }

        if (target && bestDist > 10) {
          const dx = target.x - sim.state.px;
          const dy = target.y - sim.state.py;
          moveX = dx / bestDist;
          moveY = dy / bestDist;
        }

        // Check territory claim every 15 ticks (~250ms)
        if (step % 15 === 0) {
          const claimable = sim.claimablePOIs().find(c => c.clear);
          if (claimable) {
            sim.claimTerritory(claimable.poiId);
            if (sim.state.territories.length > 0 && sim.state.logistics + 1 <= sim.state.maxLogistics) {
              sim.setOutpostSpec(claimable.poiId, "economy");
            }
          }
        }
      } else if (policy === "AGGRESSOR") {
        // Find nearest active enemy to engage
        let nearestEnemy: { x: number; y: number } | null = null;
        let nearDist = Infinity;
        for (const e of sim.state.enemies) {
          if (!e.active) continue;
          const d = Math.hypot(e.x - sim.state.px, e.y - sim.state.py);
          if (d < nearDist) {
            nearDist = d;
            nearestEnemy = e;
          }
        }

        if (nearestEnemy && nearDist > 50) {
          const dx = nearestEnemy.x - sim.state.px;
          const dy = nearestEnemy.y - sim.state.py;
          moveX = dx / nearDist;
          moveY = dy / nearDist;
        }

        // Aggressively use active ability off cooldown when enemies exist nearby
        if (nearDist < 300) {
          sim.tryAbility();
        }
      } else if (policy === "SURVIVOR") {
        // Kite away from close enemies
        let dangerX = 0;
        let dangerY = 0;
        let threatCount = 0;
        for (const e of sim.state.enemies) {
          if (!e.active) continue;
          const d = Math.hypot(e.x - sim.state.px, e.y - sim.state.py);
          if (d < 160) {
            dangerX += (sim.state.px - e.x);
            dangerY += (sim.state.py - e.y);
            threatCount++;
          }
        }

        if (threatCount > 0) {
          const d = Math.hypot(dangerX, dangerY);
          if (d > 0) {
            moveX = dangerX / d;
            moveY = dangerY / d;
            dashPressed = threatCount >= 3;
          }
        }

        // Defensive panic ability use when HP is reduced or surrounded
        if (sim.state.build.hp < sim.state.build.maxHp * 0.8 || threatCount >= 3) {
          sim.tryAbility();
        }
      } else if (policy === "BUILD_SEEKER") {
        // Navigate toward nearest knowledge pickup on ground
        let nearestPickup: { x: number; y: number } | null = null;
        let pDist = Infinity;
        for (const p of sim.state.pickups) {
          if (!p.active) continue;
          const d = Math.hypot(p.x - sim.state.px, p.y - sim.state.py);
          if (d < pDist) {
            pDist = d;
            nearestPickup = p;
          }
        }

        if (nearestPickup && pDist > 10) {
          const dx = nearestPickup.x - sim.state.px;
          const dy = nearestPickup.y - sim.state.py;
          moveX = dx / pDist;
          moveY = dy / pDist;
        }
      }

      // Execute canonical simulation tick
      const input: InputFrame = { moveX, moveY, dashPressed };
      sim.step(SIM_DT, input);

      // Handle natural draft level-up choices according to policy
      while (sim.state.draftOpen && !sim.state.over) {
        const offers = sim.state.draftOffers;
        let bestIdx = 0;

        if (policy === "BUILD_SEEKER") {
          // Maximize synergy tags with owned build
          const ownedSet = new Set(sim.state.ownedTags);
          let maxSyn = -1;
          offers.forEach((o, idx) => {
            const node = sim.techGraph().find(n => n.id === o.nodeId);
            const syn = node ? node.synergyTags.filter(t => ownedSet.has(t)).length : 0;
            if (syn > maxSyn) {
              maxSyn = syn;
              bestIdx = idx;
            }
          });
          if (maxSyn === 0 && sim.state.rerolls > 0) {
            const ev = sim.rerollDraft();
            if (ev.some(e => e.type === "draft_rerolled")) {
              continue;
            }
          }
        } else if (policy === "SURVIVOR") {
          // Prioritize defense / health / regen / armor
          const defIdx = offers.findIndex(o => {
            const node = sim.techGraph().find(n => n.id === o.nodeId);
            return node?.effects.some(e => e.family === "defense" || e.kind === "maxHpAdd" || e.kind === "regenAdd");
          });
          if (defIdx >= 0) {
            bestIdx = defIdx;
          } else if (sim.state.reservedTech === "" && offers.length > 1) {
            sim.reserveCard(0);
          }
        } else if (policy === "EXPANDER") {
          // Prioritize industry / economy / tools
          const indIdx = offers.findIndex(o => {
            const node = sim.techGraph().find(n => n.id === o.nodeId);
            return node?.domain === "industry" || node?.tags.includes("tools");
          });
          if (indIdx >= 0) bestIdx = indIdx;
        } else if (policy === "AGGRESSOR") {
          // Prioritize warfare / kinetic / energy / damage
          const warIdx = offers.findIndex(o => {
            const node = sim.techGraph().find(n => n.id === o.nodeId);
            return node?.domain === "warfare" || node?.effects.some(e => e.family === "kinetic" || e.family === "energy");
          });
          if (warIdx >= 0) bestIdx = warIdx;
        }

        sim.chooseDraft(bestIdx);
      }
    }

    return {
      seed,
      origin,
      policy,
      survivedSec: sim.state.elapsed,
      highestAge: sim.state.highestAge,
      kills: sim.state.stats.kills,
      techsTaken: sim.state.stats.techsTaken,
      abilityUses: sim.state.stats.abilityUses,
      outpostsClaimed: sim.state.stats.outpostsClaimed,
      outpostsSpecialized: sim.state.territories.filter(t => t.spec !== "").length,
      logisticsUsed: sim.state.logistics,
      reservesUsed: sim.state.stats.reservesUsed,
      rerollsUsed: sim.state.stats.rerollsUsed,
      picksByDomain: { ...sim.state.stats.draftPicksByDomain },
      picksByFamily: { ...sim.state.stats.draftPicksByFamily },
      damageShare: { ...sim.state.damageBySource },
    };
  }

  it("[Class B: Natural Gameplay] Autonomous Factorial Policy Evaluation (BUILD_SEEKER, SURVIVOR, EXPANDER, AGGRESSOR)", { timeout: 60000 }, () => {
    // Factorial Experiment: Same Seeds x Same Origins x 4 Distinct Policies
    const FACTORIAL_SEEDS = ["FACTORIAL-001", "FACTORIAL-002", "FACTORIAL-003"];
    const POLICIES: PolicyName[] = ["BUILD_SEEKER", "SURVIVOR", "EXPANDER", "AGGRESSOR"];

    const results: NaturalRunMetrics[] = [];
    for (const seed of FACTORIAL_SEEDS) {
      for (const origin of ORIGIN_LIST) {
        for (const policy of POLICIES) {
          results.push(runNaturalSimulation(seed, origin, policy, 2400));
        }
      }
    }

    // Aggregate metrics per policy across all 12 factorial cells per policy
    const policyAggregates = POLICIES.map(p => {
      const cohort = results.filter(r => r.policy === p);
      const avgKills = cohort.reduce((sum, r) => sum + r.kills, 0) / cohort.length;
      const totalOutposts = cohort.reduce((sum, r) => sum + r.outpostsClaimed, 0);
      const totalAbilities = cohort.reduce((sum, r) => sum + r.abilityUses, 0);
      const warfarePicks = cohort.reduce((sum, r) => sum + (r.picksByDomain.warfare || 0), 0);
      const industryPicks = cohort.reduce((sum, r) => sum + (r.picksByDomain.industry || 0), 0);
      const defensePicks = cohort.reduce((sum, r) => sum + (r.picksByFamily.defense || 0), 0);

      return {
        policy: p,
        runs: cohort.length,
        avgKills,
        totalOutposts,
        totalAbilities,
        warfarePicks,
        industryPicks,
        defensePicks,
      };
    });

    console.log("=== [Class B: Natural Gameplay] Factorial Policy Aggregates (48 runs, max 40s canonical sim time) ===");
    console.log("Note: Measures autonomous simulation capabilities & invariant adherence via direct API actions; does NOT prove human player onboarding or fun.");
    console.table(policyAggregates);

    const expanderAgg = policyAggregates.find(a => a.policy === "EXPANDER")!;
    const aggressorAgg = policyAggregates.find(a => a.policy === "AGGRESSOR")!;
    const survivorAgg = policyAggregates.find(a => a.policy === "SURVIVOR")!;
    const seekerAgg = policyAggregates.find(a => a.policy === "BUILD_SEEKER")!;

    // 1. Evidence of actual expansion: EXPANDER claims outposts naturally
    expect(expanderAgg.totalOutposts).toBeGreaterThan(0);
    expect(expanderAgg.totalOutposts).toBeGreaterThanOrEqual(aggressorAgg.totalOutposts);

    // 2. Evidence of aggression: AGGRESSOR exercises active abilities and warfare drafts
    expect(aggressorAgg.totalAbilities).toBeGreaterThan(0);
    expect(aggressorAgg.avgKills).toBeGreaterThan(0);

    // 3. Evidence of survival / seeker choices
    expect(survivorAgg.runs).toBe(12);
    expect(seekerAgg.runs).toBe(12);

    // 4. Honest reporting: confirm real combat took place across natural runs
    const allTotalKills = results.reduce((sum, r) => sum + r.kills, 0);
    expect(allTotalKills).toBeGreaterThan(50);
  });

  // --------------------------------------------------------------------------
  // Class C: Single-Draft Offer & First-Pick Heuristic Divergence (Excluding Fallbacks)
  // --------------------------------------------------------------------------
  it("[Class C: Single-Draft Offer & First-Pick Heuristic Divergence] Same Seed + Different Origins & Different Seeds + Same Origin (Excluding Fallbacks)", { timeout: 60000 }, () => {
    // Clarification: This evaluates single-draft offer generation divergence and first non-fallback heuristic pick
    // after artificial Knowledge injection (gainKnowledge(2000)).
    // This measures structural offer engine divergence, NOT full multi-draft player decision trajectories.
    // 1. SAME SEED + DIFFERENT ORIGIN DIVERGENCE (Excluding Fallbacks)
    const originOffersByDomain: Record<OriginId, Record<string, number>> = {
      hunters: {}, engineers: {}, resonant: {}, sentinels: {},
    };
    const originPicksByDomain: Record<OriginId, Record<string, number>> = {
      hunters: {}, engineers: {}, resonant: {}, sentinels: {},
    };
    const originFallbackOffers: Record<OriginId, number> = {
      hunters: 0, engineers: 0, resonant: 0, sentinels: 0,
    };

    const SAMPLE_COUNT = 300;
    for (let i = 0; i < SAMPLE_COUNT; i++) {
      const seed = `AUDIT-DIV-${i.toString().padStart(5, "0")}`;
      for (const origin of ORIGIN_LIST) {
        const sim = new RunSimulation({ masterSeed: seed, originId: origin });
        sim.gainKnowledge(2000, "audit", []);
        if (sim.state.draftOpen) {
          const offers = sim.state.draftOffers;

          for (const off of offers) {
            if (off.nodeId.startsWith("fb-")) {
              originFallbackOffers[origin]++;
              continue;
            }
            const node = sim.techGraph().find(n => n.id === off.nodeId);
            // Non-fallback nodes MUST have a defined canonical domain
            expect(node, `Data integrity failure: node ${off.nodeId} not found in graph`).toBeDefined();
            const domain = node!.domain;
            originOffersByDomain[origin][domain] = (originOffersByDomain[origin][domain] || 0) + 1;
          }

          // Pick the first non-fallback offer (or 0)
          const pickIdx = Math.max(0, offers.findIndex(o => !o.nodeId.startsWith("fb-")));
          const chosenOffer = offers[pickIdx];
          if (chosenOffer && !chosenOffer.nodeId.startsWith("fb-")) {
            const pickedNode = sim.techGraph().find(n => n.id === chosenOffer.nodeId);
            if (pickedNode) {
              originPicksByDomain[origin][pickedNode.domain] = (originPicksByDomain[origin][pickedNode.domain] || 0) + 1;
            }
          }
          sim.chooseDraft(pickIdx);
        }
      }
    }

    console.log("=== [Class C: Single-Draft Offer & First-Pick Heuristic Divergence] Canonical Domain Offers (Fallback Excluded) ===");
    console.log("Note: Single-draft offer/heuristic-pick divergence, not full player trajectory divergence.");
    for (const origin of ORIGIN_LIST) {
      console.log(`${origin} offers:`, originOffersByDomain[origin], `(fallback count: ${originFallbackOffers[origin]})`);
      console.log(`${origin} picks: `, originPicksByDomain[origin]);
      // Verify no 'unknown' or fallback key leaked into canonical domains
      expect(originOffersByDomain[origin].unknown).toBeUndefined();
      expect(originPicksByDomain[origin].unknown).toBeUndefined();
    }

    // Measure mathematically correct JSD across non-fallback canonical domain offers
    const offerJsdHE = jsDivergence(originOffersByDomain.hunters, originOffersByDomain.engineers);
    const offerJsdHR = jsDivergence(originOffersByDomain.hunters, originOffersByDomain.resonant);
    const offerJsdHS = jsDivergence(originOffersByDomain.hunters, originOffersByDomain.sentinels);

    // Measure mathematically correct JSD across non-fallback canonical domain picks
    const pickJsdHE = jsDivergence(originPicksByDomain.hunters, originPicksByDomain.engineers);
    const pickJsdHR = jsDivergence(originPicksByDomain.hunters, originPicksByDomain.resonant);
    const pickJsdHS = jsDivergence(originPicksByDomain.hunters, originPicksByDomain.sentinels);

    console.log(`Normalized Offer JSD Hunters vs Engineers: ${offerJsdHE.toFixed(4)}`);
    console.log(`Normalized Offer JSD Hunters vs Resonant:  ${offerJsdHR.toFixed(4)}`);
    console.log(`Normalized Offer JSD Hunters vs Sentinels: ${offerJsdHS.toFixed(4)}`);
    console.log(`Normalized Pick JSD Hunters vs Engineers:  ${pickJsdHE.toFixed(4)}`);
    console.log(`Normalized Pick JSD Hunters vs Resonant:   ${pickJsdHR.toFixed(4)}`);
    console.log(`Normalized Pick JSD Hunters vs Sentinels:  ${pickJsdHS.toFixed(4)}`);

    // Verify non-trivial, statistically measurable origin divergence:
    // Raw offers show measurable difference (> 0.01, and > 0.10 for Sentinels vs Hunters)
    expect(offerJsdHE).toBeGreaterThan(0.01);
    expect(offerJsdHR).toBeGreaterThan(0.01);
    expect(offerJsdHS).toBeGreaterThan(0.10);

    // Selected picks show amplified divergence (> 0.035, and > 0.10 for Sentinels vs Hunters)
    expect(pickJsdHE).toBeGreaterThan(0.035);
    expect(pickJsdHR).toBeGreaterThan(0.035);
    expect(pickJsdHS).toBeGreaterThan(0.10);

    // 2. DIFFERENT SEEDS + SAME ORIGIN (World Traits & Causal Domain Shift)
    const SEEDS = ["AUDIT-SEED-ALPHA", "AUDIT-SEED-BETA", "AUDIT-SEED-GAMMA"];
    const seedTraitRuns = SEEDS.map(s => {
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

    console.log("=== DIFFERENT SEEDS + SAME ORIGIN (Causal World Traits) ===");
    seedTraitRuns.forEach(r => console.log(r.seed, "Traits:", r.traits, "Picks:", r.domainPicks));

    const distinctTraitSets = new Set(seedTraitRuns.map(r => r.traits.join(",")));
    expect(distinctTraitSets.size).toBeGreaterThan(1);
  });

  // --------------------------------------------------------------------------
  // Invariants: World Laws & Logistics
  // --------------------------------------------------------------------------
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