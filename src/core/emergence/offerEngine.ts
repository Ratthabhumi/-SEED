// v0.24 Tech Offer Engine — deterministic, quality-aware, Gumbel-Top-k
// No age-rarity pattern. Quality sampled per offer. Gumbel-Top-k for K=3.

import { createStreamRng } from "../seed/streams";
import { WorldLaws } from "./worldLaws";
import { CRITICAL_SPINE } from "../tech/graph";
import type { TechNode, TechGraph, AgeId, Domain, Rarity } from "../tech/graph";

export interface OfferCandidate {
  node: TechNode;
  quality: "COMMON" | "UNCOMMON" | "RARE" | "MYTHIC";
  score: number;
  gumbel: number;
  novelty: number;
  penalty: number;
}

export interface OfferEngineConfig {
  // Quality baseline probabilities
  qualityBaseProb: {
    COMMON: number;
    UNCOMMON: number;
    RARE: number;
    MYTHIC: number;
  };
  // Scoring weights
  weights: {
    originAffinity: number;      // A
    buildSynergy: number;        // B
    worldLawAffinity: number;    // C
    geographyAffinity: number;   // D
    novelty: number;             // E
    recentOfferPenalty: number;  // F
    recentPickPenalty: number;   // G
    underusedPathBoost: number;  // H
  };
  // Gumbel temperature
  gumbelTemp: number;
  // Anti-pattern controls
  antiPattern: {
    maxRepeatDomain: number;
    maxRepeatQuality: number;
    badLuckCap: number;
  };
  // Early mythic / late common floors
  mythicFloorEarly: number;  // min mythic probability in first 3 ages
  commonFloorLate: number;   // max common probability in last 3 ages
}

export const DEFAULT_OFFER_CONFIG: OfferEngineConfig = {
  qualityBaseProb: {
    COMMON: 0.60,
    UNCOMMON: 0.27,
    RARE: 0.10,
    MYTHIC: 0.03,
  },
  weights: {
    originAffinity: 1.5,
    buildSynergy: 1.2,
    worldLawAffinity: 1.0,
    geographyAffinity: 0.8,
    novelty: 0.5,
    recentOfferPenalty: 0.7,
    recentPickPenalty: 0.5,
    underusedPathBoost: 0.4,
  },
  gumbelTemp: 1.0,
  antiPattern: {
    maxRepeatDomain: 2,
    maxRepeatQuality: 2,
    badLuckCap: 5,
  },
  mythicFloorEarly: 0.02,
  commonFloorLate: 0.40,
};

export interface TechOfferContext {
  sim: {
    owned: string[];
    ownedTags: string[];
    breakthroughs: string[];
    ageIndex: number;
    age: AgeId;
    originId: string;
    expansionFamily: string;
    pinnedTarget: string;
    draftChoices: string[];
    reservedTech: string;
    history: Array<{ kind: string; label: string; t: number }>;
    techGraph: () => readonly TechNode[];
  };
  laws: import("./worldLaws").WorldLaws;
  activeFamilies: Set<string>;
  recentOffers: string[][];
  recentPicks: string[];
  rng: ReturnType<typeof import("../seed/streams").createStreamRng>;
}

function softmax(z: number[], temp = 1.0): number[] {
  const maxZ = Math.max(...z);
  const exps = z.map((v) => Math.exp((v - maxZ) / temp));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((v) => v / sum);
}

// Sample quality from config distribution
function sampleQuality(rng: ReturnType<typeof import("../seed/streams").createStreamRng>, probs: { COMMON: number; UNCOMMON: number; RARE: number; MYTHIC: number }): "COMMON" | "UNCOMMON" | "RARE" | "MYTHIC" {
  const u = rng.nextFloat();
  const cum = [
    probs.COMMON,
    probs.COMMON + probs.UNCOMMON,
    probs.COMMON + probs.UNCOMMON + probs.RARE,
    1.0,
  ];
  if (u < cum[0]) return "COMMON";
  if (u < cum[1]) return "UNCOMMON";
  if (u < cum[2]) return "RARE";
  return "MYTHIC";
}

// Quality floors/ceilings by age (deterministic via seeded RNG)
function clampQualityByAge(
  quality: "COMMON" | "UNCOMMON" | "RARE" | "MYTHIC",
  ageIdx: number,
  config: typeof DEFAULT_OFFER_CONFIG,
  rng: ReturnType<typeof import("../seed/streams").createStreamRng>
): "COMMON" | "UNCOMMON" | "RARE" | "MYTHIC" {
  if (ageIdx <= 2 && quality === "COMMON") {
    // Early ages: ensure mythic floor
    if (rng.nextFloat() < DEFAULT_OFFER_CONFIG.mythicFloorEarly) return "MYTHIC";
  }
  if (ageIdx >= 3 && quality === "MYTHIC") {
    // Late ages: ensure common floor
    if (rng.nextFloat() < DEFAULT_OFFER_CONFIG.commonFloorLate) return "COMMON";
  }
  return quality;
}

// Quality affects score multiplier
const QUALITY_MULT = {
  COMMON: 1.0,
  UNCOMMON: 1.25,
  RARE: 1.5,
  MYTHIC: 2.0,
};

// Novelty bonus based on recent offer history
function computeNovelty(nodeId: string, recentOffers: string[][], ageIdx: number): number {
  let bonus = 0;
  const flat = recentOffers.flat();
  if (!flat.includes(nodeId)) bonus += 1.0; // never offered
  // Age transition novelty
  if (recentOffers.length > 0) {
    const lastAge = recentOffers[recentOffers.length - 1]?.[0];
    const nodeAge = ["stone", "bronze", "iron", "industrial", "atomic", "space"].indexOf(
      ["stone", "bronze", "iron", "industrial", "atomic", "space"].find(a => 
        ["stone", "bronze", "iron", "industrial", "atomic", "space"].includes(a)
      ) ?? "stone"
    );
    // Simplified: boost if from different age
  }
  return bonus;
}

// Build synergy with current owned tags
function computeBuildSynergy(node: { tags: string[]; synergyTags: string[] }, ownedTags: string[], breakthroughs: string[]): number {
  let bonus = 0;
  const allOwned = new Set([...ownedTags, ...breakthroughs]);
  for (const t of [...node.tags, ...node.synergyTags]) {
    if (allOwned.has(t)) bonus += 0.5;
  }
  return bonus;
}

// Origin affinity
function computeOriginAffinity(node: { effects: Array<{ family?: string }> }, activeFamilies: Set<string>): number {
  if (activeFamilies.size === 0) return 0;
  let bonus = 0;
  for (const eff of node.effects) {
    if (eff.family && activeFamilies.has(eff.family)) bonus += 1.0;
  }
  return bonus;
}

// World law affinity
function computeWorldLawAffinity(node: { tags: string[]; domain: string }, laws: { domainBias: Record<string, number>; combatBias: Record<string, number> }): number {
  let bonus = 0;
  // Domain bias
  bonus += laws.domainBias[node.domain] * 2.0 || 0;
  // Family bias via effects
  return bonus;
}

// Recent offer penalty
function recentOfferPenalty(nodeId: string, recentOffers: string[][]): number {
  const flat = recentOffers.flat();
  let penalty = 0;
  for (let i = 0; i < flat.length; i++) {
    if (flat[i] === nodeId) penalty += 1.0 / (i + 1);
  }
  return penalty;
}

// Recent pick penalty
function recentPickPenalty(nodeId: string, recentPicks: string[]): number {
  const idx = recentPicks.lastIndexOf(nodeId);
  if (idx === -1) return 0;
  return 1.0 / (recentPicks.length - idx);
}

// Underused path boost
function underusedPathBoost(node: { domain: string; tags: string[] }, recentOffers: string[][]): number {
  const flat = recentOffers.flat();
  const domainCount = flat.filter(id => id.startsWith(node.domain)).length;
  if (domainCount === 0) return 2.0;
  if (domainCount <= 2) return 1.0;
  return 0;
}

/**
 * Generate K=3 offers using Gumbel-Top-k from available pool.
 */
export function generateOffers(
  context: TechOfferContext,
  config: OfferEngineConfig = DEFAULT_OFFER_CONFIG,
  K = 3
): OfferCandidate[] {
  const { sim, laws, activeFamilies, recentOffers, recentPicks, rng } = context;
  
  // Build available pool (same logic as sim.availableNodes)
  let pool = sim.techGraph().filter((n: TechNode) => {
    if (sim.owned.includes(n.id)) return false;
    if (n.prerequisites.some((p: string) => !sim.owned.includes(p))) return false;
    if (n.exclusions.some((e: string) => sim.owned.includes(e))) return false;
    if (n.effects.some((e: { family?: string }) => e.family && !activeFamilies.has(e.family))) return false;
    const ageIdx = ["stone", "bronze", "iron", "industrial", "atomic", "space"].indexOf(n.age);
    return ageIdx <= sim.ageIndex + 1;
  });
  
  // Sample quality for each candidate and score them
  const candidates = pool.map((node: TechNode) => {
    const quality = sampleQuality(rng, config.qualityBaseProb);
    const clampedQuality = clampQualityByAge(quality, ["stone", "bronze", "iron", "industrial", "atomic", "space"].indexOf(node.age), config, rng);
    const score = computeOfferScore(node, clampedQuality, {
      sim,
      laws,
      activeFamilies,
      recentOffers,
      recentPicks: sim.history.filter(h => h.kind === "tech_selected").map(h => h.label),
      config: DEFAULT_OFFER_CONFIG,
    });
    
    return { node, quality: clampedQuality, score, gumbel: 0, novelty: 0, penalty: 0 };
  });
  
  // Score each candidate
  const scored = candidates.map((c) => ({
    ...c,
    score: computeOfferScore(c.node, c.quality, {
      sim,
      laws,
      activeFamilies,
      recentOffers: [],
      recentPicks: [],
      config: DEFAULT_OFFER_CONFIG,
    }),
  }));
  
  // Gumbel-Top-k selection
  const selected = gumbelTopK(scored, K, rng);
  
  // Apply quality clamping based on age
  const finalCandidates = selected.map((c) => ({
    node: c.node,
    quality: clampQualityByAge(c.quality, ["stone", "bronze", "iron", "industrial", "atomic", "space"].indexOf(c.node.age), config, rng),
    score: c.score,
    gumbel: c.gumbel,
    novelty: c.novelty,
    penalty: c.penalty,
  }));
  
  return finalCandidates;
}

/**
 * Gumbel-Top-k sampling for K=3
 */
export function gumbelTopK<T extends { score: number }>(
  candidates: Array<T>,
  K: number,
  rng: ReturnType<typeof import("../seed/streams").createStreamRng>
): Array<T & { gumbel: number }> {
  const withGumbel = candidates.map((c) => ({
    ...c,
    gumbel: -Math.log(-Math.log(rng.nextFloat())),
  }));
  withGumbel.sort((a, b) => (b.score + b.gumbel) - (a.score + a.gumbel));
  return withGumbel.slice(0, K);
}

export function computeOfferScore(
  node: { 
    id: string; 
    weight: number; 
    domain: string; 
    tags: string[]; 
    synergyTags: string[]; 
    effects: Array<{ family?: string }>;
    rarity: Rarity;
  },
  quality: "COMMON" | "UNCOMMON" | "RARE" | "MYTHIC",
  ctx: {
    sim: { owned: string[]; ownedTags: string[]; breakthroughs: string[]; ageIndex: number; age: AgeId; originId: string; expansionFamily: string; pinnedTarget: string; draftChoices: string[]; reservedTech: string; history: Array<{ kind: string; label: string; t: number }> };
    laws: { domainBias: Record<string, number>; combatBias: Record<string, number> };
    activeFamilies: Set<string>;
    recentOffers: string[][];
    recentPicks: string[];
    config: typeof DEFAULT_OFFER_CONFIG;
  }
): number {
  const w = ctx.config;
  let score = Math.log(Math.max(1, node.weight));
  
  // A: origin affinity
  score += w.weights.originAffinity * computeOriginAffinity({ effects: node.effects }, ctx.activeFamilies);
  
  // B: build synergy
  score += w.weights.buildSynergy * computeBuildSynergy({ tags: node.tags, synergyTags: node.synergyTags }, ctx.sim.ownedTags, ctx.sim.breakthroughs);
  
  // C: world law affinity
  score += w.weights.worldLawAffinity * computeWorldLawAffinity({ tags: node.tags, domain: node.domain }, ctx.laws);
  
  // D: geography affinity (placeholder)
  score += w.weights.geographyAffinity * 0;
  
  // E: novelty
  score += w.weights.novelty * computeNovelty(node.id, ctx.recentOffers, ctx.sim.ageIndex);
  
  // F: recent offer penalty
  score -= w.weights.recentOfferPenalty * recentOfferPenalty(node.id, ctx.recentOffers);
  
  // G: recent pick penalty
  score -= w.weights.recentPickPenalty * recentPickPenalty(node.id, ctx.recentPicks);
  
  // H: underused path boost
  score += w.weights.underusedPathBoost * underusedPathBoost({ domain: node.domain, tags: node.tags }, ctx.recentOffers);
  
  // Quality multiplier (use the sampled quality)
  score *= QUALITY_MULT[quality];
  
  // Pin bonus
  if (ctx.sim.pinnedTarget && ctx.sim.pinnedTarget === node.id) score *= 2.0;
  
  return score;
}