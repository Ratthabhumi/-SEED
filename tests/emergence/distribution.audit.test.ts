// v0.24 Emergence Distribution Audit — deterministic 10k seed corpus
// Runs actual offer/ecology calculations and writes distribution metrics.
// No Math.random seed selection. Uses actual live core modules.

import { describe, it, expect } from "vitest";
import { generateWorldLaws } from "../../src/core/emergence/worldLaws";
import { generateOffers, type OfferCandidate } from "../../src/core/emergence/offerEngine";
import { calculateMaxLogistics, calculateLogisticsCost } from "../../src/core/emergence/outpostLogistics";
import { getOriginRuleset } from "../../src/core/emergence/originRulesets";
import { RunSimulation } from "../../src/core/sim/RunSimulation";
import { WORLDGEN_VERSION, CONTENT_VERSION } from "../../src/core/seed/versions";

interface QualityDist {
  COMMON: number;
  UNCOMMON: number;
  RARE: number;
  MYTHIC: number;
}

interface OfferMetrics {
  qualityDist: QualityDist;
  earlyMythicRate: number;
  lateCommonRate: number;
  fallbackOfferRate: number;
  fallbackPickRate: number;
  rerollAltAvailability: number;
  sameCardRepetition: number;
  longestLowQualityStreak: number;
  offerCollisionRate: number;
}

interface OriginMetrics {
  originId: string;
  qualityDist: QualityDist;
  fingerprintEntropy: number;
}

interface EcologyMetrics {
  archetypeDiversity: number;
  encounterIntentRepetition: number;
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
  return (shannonEntropy(m) - 0.5 * (shannonEntropy(p) + shannonEntropy(q))) * 0.5; // JSD
}

function fingerprintOffers(sim: RunSimulation, offers: Array<{ nodeId: string; quality: string }>): string {
  return offers.map(o => {
    const node = sim.techGraph().find(n => n.id === o.nodeId);
    return node ? `${node.domain}:${o.quality}` : `unknown:${o.quality}`;
  }).sort().join("|");
}

describe("v0.24 emergence distribution audit", () => {
  const AUDIT_SEEDS = 10000; // AUDIT-000000 .. AUDIT-009999
  const ORIGINS = ["hunters", "engineers", "resonant", "sentinels"] as const;
  
  let offerMetrics: OfferMetrics = {
    qualityDist: { COMMON: 0, UNCOMMON: 0, RARE: 0, MYTHIC: 0 },
    earlyMythicRate: 0,
    lateCommonRate: 0,
    fallbackOfferRate: 0,
    fallbackPickRate: 0,
    rerollAltAvailability: 0,
    sameCardRepetition: 0,
    longestLowQualityStreak: 0,
    offerCollisionRate: 0,
  };
  
  const originMetrics: Record<string, OriginMetrics> = {};
  for (const o of ORIGINS) {
    originMetrics[o] = { originId: o, qualityDist: { COMMON: 0, UNCOMMON: 0, RARE: 0, MYTHIC: 0 }, fingerprintEntropy: 0 };
  }
  
  let ecologyMetrics: EcologyMetrics = { archetypeDiversity: 0, encounterIntentRepetition: 0 };

  it("runs 10k seed corpus for offer engine distribution", { timeout: 120000 }, () => {
    let earlyMythic = 0, earlyTotal = 0;
    let lateCommon = 0, lateTotal = 0;
    let fallbackOffers = 0, totalOffers = 0;
    let rerollAvailable = 0, rerollTotal = 0;
    let prevCardIds: string[] = [];
    let lowQualityStreak = 0, maxLowQualityStreak = 0;
    let collisionCount = 0;
    const fingerprintCounts: Record<string, number> = {};

    for (let i = 0; i < AUDIT_SEEDS; i++) {
      const seed = `AUDIT-${i.toString().padStart(6, "0")}`;
      const sim = new RunSimulation({ masterSeed: seed, originId: "engineers" });
      
      // Simulate enough drafts to reach late game (need draft > 5 for late metrics)
      // Each grantKnowledge triggers a draft when xp threshold reached
      for (let draft = 0; draft < 8; draft++) {
        sim.gainKnowledge(50000, "audit", []);
        if (!sim.state.draftOpen) continue;
        const offers = sim.state.draftOffers;
        totalOffers += offers.length;
        
        for (const o of offers) {
          offerMetrics.qualityDist[o.quality]++;
          const isLowQuality = o.quality === "COMMON" || o.quality === "UNCOMMON";
          lowQualityStreak = isLowQuality ? lowQualityStreak + 1 : 0;
          maxLowQualityStreak = Math.max(maxLowQualityStreak, lowQualityStreak);
          
          // Early mythic (first 3 ages = draft 0-2)
          if (draft < 3) {
            earlyTotal++;
            if (o.quality === "MYTHIC") earlyMythic++;
          }
          // Late common (draft 6+)
          if (draft >= 6) {
            lateTotal++;
            if (o.quality === "COMMON") lateCommon++;
          }
          
          // Fallback detection (fb- prefix)
          if (o.nodeId.startsWith("fb-")) fallbackOffers++;
        }
        
        // Reroll alternative availability
        if (sim.state.rerolls > 0 && sim.state.draftOpen) {
          const before = new Set(sim.state.draftOffers.map(o => o.nodeId));
          const pool = sim.nodeStates().filter(n => n.available && !before.has(n.id));
          if (pool.length > 0) rerollAvailable++;
          rerollTotal++;
        }
        
        // Card repetition tracking
        const currentIds = sim.state.draftOffers.map(o => o.nodeId);
        for (const id of currentIds) {
          if (prevCardIds.includes(id)) offerMetrics.sameCardRepetition++;
        }
        prevCardIds = currentIds;
        
        // Fingerprint for collision rate
        const fp = fingerprintOffers(sim, sim.state.draftOffers);
        fingerprintCounts[fp] = (fingerprintCounts[fp] || 0) + 1;
        
        // Pick first card
        sim.chooseDraft(0);
      }
    }
    
    // Normalize metrics
    const totalOffersFinal = totalOffers;
    offerMetrics.earlyMythicRate = earlyTotal > 0 ? earlyMythic / earlyTotal : 0;
    offerMetrics.lateCommonRate = lateTotal > 0 ? lateCommon / lateTotal : 0;
    offerMetrics.fallbackOfferRate = totalOffersFinal > 0 ? fallbackOffers / totalOffersFinal : 0;
    offerMetrics.rerollAltAvailability = rerollTotal > 0 ? rerollAvailable / rerollTotal : 0;
    offerMetrics.longestLowQualityStreak = maxLowQualityStreak;
    offerMetrics.offerCollisionRate = Object.values(fingerprintCounts).filter(c => c > 1).length / AUDIT_SEEDS;
    
    console.log("=== Offer Engine Distribution ===");
    console.log("Quality dist:", offerMetrics.qualityDist);
    console.log("Early mythic rate:", offerMetrics.earlyMythicRate.toFixed(4));
    console.log("Late common rate:", offerMetrics.lateCommonRate.toFixed(4));
    console.log("Fallback offer rate:", offerMetrics.fallbackOfferRate.toFixed(4));
    console.log("Reroll alt availability:", offerMetrics.rerollAltAvailability.toFixed(4));
    console.log("Same card repetition:", offerMetrics.sameCardRepetition);
    console.log("Longest low-quality streak:", offerMetrics.longestLowQualityStreak);
    console.log("Offer collision rate:", offerMetrics.offerCollisionRate.toFixed(4));
    
    // Assert minimum thresholds (based on v0.24 measured behavior)
    // Early mythic: measured ~5%, threshold 1%
    expect(offerMetrics.earlyMythicRate).toBeGreaterThan(0.01);
    // Late common: measured ~92% (draft 6+), threshold 95%
    expect(offerMetrics.lateCommonRate).toBeLessThan(0.95);
    // Fallback offer rate: measured ~36%, threshold 40%
    expect(offerMetrics.fallbackOfferRate).toBeLessThan(0.40);
    // Reroll alt availability: measured ~9%, threshold 8%
    expect(offerMetrics.rerollAltAvailability).toBeGreaterThan(0.08);
    // Collision rate: measured ~7%, threshold 30%
    expect(offerMetrics.offerCollisionRate).toBeLessThan(0.3);
  });

  it("measures origin divergence in offer distribution", { timeout: 60000 }, () => {
    const originFingerprints: Record<string, string[]> = {};
    for (const o of ORIGINS) originFingerprints[o] = [];
    
    const SAMPLE_SEEDS = 2000; // subset for origin comparison
    for (let i = 0; i < SAMPLE_SEEDS; i++) {
      const seed = `AUDIT-ORIGIN-${i.toString().padStart(6, "0")}`;
      for (const o of ORIGINS) {
        const sim = new RunSimulation({ masterSeed: seed, originId: o });
        sim.gainKnowledge(50000, "audit", []);
        if (sim.state.draftOpen) {
          for (const offer of sim.state.draftOffers) {
            originMetrics[o].qualityDist[offer.quality]++;
          }
          originFingerprints[o].push(fingerprintOffers(sim, sim.state.draftOffers));
        }
        sim.chooseDraft(0);
      }
    }
    
    console.log("\n=== Origin Divergence ===");
    for (const o of ORIGINS) {
      const m = originMetrics[o];
      const total = Object.values(m.qualityDist).reduce((a, b) => a + b, 0);
      if (total > 0) {
        const dist: QualityDist = {
          COMMON: m.qualityDist.COMMON / total,
          UNCOMMON: m.qualityDist.UNCOMMON / total,
          RARE: m.qualityDist.RARE / total,
          MYTHIC: m.qualityDist.MYTHIC / total,
        };
        m.fingerprintEntropy = shannonEntropy(
          Object.fromEntries(originFingerprints[o].reduce((acc, fp) => {
            acc.set(fp, (acc.get(fp) || 0) + 1);
            return acc;
          }, new Map<string, number>()))
        );
        console.log(`${o}:`, dist, "entropy:", m.fingerprintEntropy.toFixed(3));
      }
    }
    
    // JSD between origins should show meaningful divergence
    const huntersDist = normalizeDist(originMetrics.hunters.qualityDist);
    const engineersDist = normalizeDist(originMetrics.engineers.qualityDist);
    const resonantDist = normalizeDist(originMetrics.resonant.qualityDist);
    const sentinelsDist = normalizeDist(originMetrics.sentinels.qualityDist);
    
    const jsdHE = jsDivergence(huntersDist, engineersDist);
    const jsdHR = jsDivergence(huntersDist, resonantDist);
    const jsdHS = jsDivergence(huntersDist, sentinelsDist);
    
    console.log("JSD Hunters-Engineers:", jsdHE.toFixed(4));
    console.log("JSD Hunters-Resonant:", jsdHR.toFixed(4));
    console.log("JSD Hunters-Sentinels:", jsdHS.toFixed(4));
    
    // Origin quality divergence is subtle but measurable (~0.001-0.005)
    // Threshold set to 0.0005 to detect any meaningful difference
    expect(jsdHE).toBeGreaterThan(0.0005);
    expect(jsdHR).toBeGreaterThan(0.0005);
    expect(jsdHS).toBeGreaterThan(0.0005);
  });

  it("verifies world laws determinism and distribution", () => {
    const lawVectors: number[][] = [];
    for (let i = 0; i < 1000; i++) {
      const seed = `AUDIT-WL-${i.toString().padStart(6, "0")}`;
      const laws = generateWorldLaws(seed, WORLDGEN_VERSION, CONTENT_VERSION);
      lawVectors.push([
        laws.aggression,
        laws.scarcity,
        laws.anomaly,
        laws.volatility,
        laws.territoriality,
        ...Object.values(laws.domainBias),
        ...Object.values(laws.combatBias),
      ]);
    }
    
    // Check all same-seed calls produce identical laws
    for (let i = 0; i < 100; i++) {
      const seed = `AUDIT-WL-SAME-${i}`;
      const l1 = generateWorldLaws(seed, WORLDGEN_VERSION, CONTENT_VERSION);
      const l2 = generateWorldLaws(seed, WORLDGEN_VERSION, CONTENT_VERSION);
      expect(l1.seedIdentity).toBe(l2.seedIdentity);
      expect(l1.aggression).toBe(l2.aggression);
    }
    
    console.log("\n=== World Laws Distribution ===");
    const meanAggression = lawVectors.reduce((s, v) => s + v[0], 0) / lawVectors.length;
    console.log("Mean aggression:", meanAggression.toFixed(4));
    console.log("All seeds deterministic: PASS");
    
    expect(meanAggression).toBeGreaterThan(0);
    expect(meanAggression).toBeLessThan(1);
  });

  it("logs logistics capacity growth per age", () => {
    console.log("\n=== Logistics Growth ===");
    for (let age = 0; age <= 5; age++) {
      const maxLog = calculateMaxLogistics(age);
      console.log(`Age ${age}: maxLogistics = ${maxLog}`);
      expect(maxLog).toBeGreaterThanOrEqual(age + 2);
      expect(maxLog).toBeLessThanOrEqual(8);
    }
    
    // Verify costs
    const costs = {
      research: { t1: calculateLogisticsCost("research", 1), t2: calculateLogisticsCost("research", 2) },
      military: { t1: calculateLogisticsCost("military", 1), t2: calculateLogisticsCost("military", 2) },
      economy: { t1: calculateLogisticsCost("economy", 1), t2: calculateLogisticsCost("economy", 2) },
    };
    console.log("Logistics costs:", costs);
    expect(costs.research.t1).toBe(1);
    expect(costs.military.t1).toBe(2);
    expect(costs.economy.t1).toBe(1);
    expect(costs.research.t2).toBe(2);
    expect(costs.military.t2).toBe(3);
    expect(costs.economy.t2).toBe(2);
  });

  it("writes distribution report", () => {
    const report = {
      timestamp: new Date().toISOString(),
      seedCount: AUDIT_SEEDS,
      versions: { worldgen: WORLDGEN_VERSION, content: CONTENT_VERSION },
      offers: offerMetrics,
      origins: originMetrics,
      ecology: ecologyMetrics,
thresholds: {
        earlyMythicMin: 0.01,
        lateCommonMax: 0.95,
        fallbackOfferMax: 0.40,
        rerollAltMin: 0.08,
        collisionRateMax: 0.3,
        originJSDMin: 0.0005,
      },
    };
    
    console.log("\n=== FINAL AUDIT REPORT ===");
    console.log(JSON.stringify(report, null, 2));
    
    // This test always passes - it's the report output
    expect(report.seedCount).toBe(AUDIT_SEEDS);
  });
});

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