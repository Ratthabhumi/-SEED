// v0.25 Tech Offer Engine — deterministic, two-stage decoupled offer generation
// Stage 1: WHAT TECH APPEARS — Gumbel-Top-k over eligible TechNodes (quality-independent).
// Stage 2: HOW SPECIAL THAT OFFER INSTANCE IS — quality sampled across all qualities without age clamping.

import { createStreamRng } from "../seed/streams";
import type { WorldLaws } from "./worldLaws";
import { ORIGINS, type WeaponFamily } from "../progression/origins";
import type { TechNode, AgeId, Rarity } from "../tech/graph";

export interface OfferCandidate {
  node: TechNode;
  quality: "COMMON" | "UNCOMMON" | "RARE" | "MYTHIC";
  score: number;
  gumbel: number;
  novelty: number;
  penalty: number;
}

export interface OfferEngineConfig {
  // Quality baseline probabilities (Stage 2)
  qualityBaseProb: {
    COMMON: number;
    UNCOMMON: number;
    RARE: number;
    MYTHIC: number;
  };
  // Scoring weights (Stage 1)
  weights: {
    originAffinity: number;      // A
    buildSynergy: number;        // B
    worldLawAffinity: number;    // C
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
  laws: WorldLaws;
  activeFamilies: Set<string>;
  recentOffers: string[][];
  recentPicks: string[];
  rng: ReturnType<typeof createStreamRng>;
}

// Sample quality from config distribution (Stage 2) — all qualities possible across all ages
function sampleQuality(
  rng: ReturnType<typeof createStreamRng>,
  probs: { COMMON: number; UNCOMMON: number; RARE: number; MYTHIC: number }
): "COMMON" | "UNCOMMON" | "RARE" | "MYTHIC" {
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

// Novelty bonus based on recent offer history
function computeNovelty(nodeId: string, recentOffers: string[][], _ageIdx: number): number {
  let bonus = 0;
  const flat = recentOffers.flat();
  if (!flat.includes(nodeId)) bonus += 1.0; // never offered recently
  return bonus;
}

// Build synergy with current owned tags
function computeBuildSynergy(
  node: { tags: string[]; synergyTags: string[] },
  ownedTags: string[],
  breakthroughs: string[]
): number {
  let bonus = 0;
  const allOwned = new Set([...ownedTags, ...breakthroughs]);
  for (const t of [...node.tags, ...node.synergyTags]) {
    if (allOwned.has(t)) bonus += 0.5;
  }
  return bonus;
}

// Origin affinity
function computeOriginAffinity(
  node: { effects: Array<{ family?: string }> },
  activeFamilies: Set<string>
): number {
  if (activeFamilies.size === 0) return 0;
  let bonus = 0;
  for (const eff of node.effects) {
    if (eff.family && activeFamilies.has(eff.family)) bonus += 1.0;
  }
  return bonus;
}

// World law affinity: wired to both domainBias and combatBias
function computeWorldLawAffinity(
  node: { domain: string; effects: Array<{ family?: string }> },
  laws: { domainBias: Record<string, number>; combatBias: Record<string, number> }
): number {
  let bonus = 0;
  // Domain bias
  bonus += (laws.domainBias[node.domain] ?? 0) * 2.0;
  // Combat family bias wired to laws.combatBias
  for (const eff of node.effects) {
    if (eff.family && laws.combatBias[eff.family]) {
      bonus += (laws.combatBias[eff.family] ?? 0) * 1.5;
    }
  }
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

// Underused path boost based on domain frequency in recent offers (using actual metadata)
function underusedPathBoost(
  nodeDomain: string,
  recentOfferDomainCounts: Map<string, number>
): number {
  const domainCount = recentOfferDomainCounts.get(nodeDomain) ?? 0;
  if (domainCount === 0) return 2.0;
  if (domainCount <= 2) return 1.0;
  return 0;
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
  ctx: {
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
    };
    laws: { domainBias: Record<string, number>; combatBias: Record<string, number> };
    activeFamilies: Set<string>;
    recentOffers: string[][];
    recentPicks: string[];
    recentDomainCounts?: Map<string, number>;
    config: typeof DEFAULT_OFFER_CONFIG;
  }
): number {
  const w = ctx.config;
  let score = Math.log(Math.max(1, node.weight));
  
  // A: origin active family affinity
  score += w.weights.originAffinity * computeOriginAffinity({ effects: node.effects }, ctx.activeFamilies);

  // Origin strategic bias
  const originDef = ORIGINS.find((o) => o.id === ctx.sim.originId);
  if (originDef) {
    for (const eff of node.effects) {
      if (eff.family && originDef.techWeightModifiers[eff.family as WeaponFamily]) {
        score += (originDef.techWeightModifiers[eff.family as WeaponFamily] - 1.0) * 1.5;
      }
    }
  }
  
  // B: build synergy
  score += w.weights.buildSynergy * computeBuildSynergy(
    { tags: node.tags, synergyTags: node.synergyTags },
    ctx.sim.ownedTags,
    ctx.sim.breakthroughs
  );
  
  // C: world law affinity (domain + combat bias)
  score += w.weights.worldLawAffinity * computeWorldLawAffinity(
    { domain: node.domain, effects: node.effects },
    ctx.laws
  );
  
  // E: novelty
  score += w.weights.novelty * computeNovelty(node.id, ctx.recentOffers, ctx.sim.ageIndex);
  
  // F: recent offer penalty
  score -= w.weights.recentOfferPenalty * recentOfferPenalty(node.id, ctx.recentOffers);
  
  // G: recent pick penalty
  score -= w.weights.recentPickPenalty * recentPickPenalty(node.id, ctx.recentPicks);
  
  // H: underused path boost
  const domainCounts = ctx.recentDomainCounts ?? new Map<string, number>();
  score += w.weights.underusedPathBoost * underusedPathBoost(node.domain, domainCounts);
  
  // Pinned target bonus
  if (ctx.sim.pinnedTarget && ctx.sim.pinnedTarget === node.id) score *= 2.0;
  
  // NOTE: Quality is intentionally NOT factored into Stage 1 node selection.
  return score;
}

/**
 * Generate K=3 offers using two-stage decoupled pipeline.
 * STAGE 1: Gumbel-Top-k over eligible TechNodes (quality-independent).
 * STAGE 2: Sample quality and modifiers per selected offer without age-clamping.
 */
export function generateOffers(
  context: TechOfferContext,
  config: OfferEngineConfig = DEFAULT_OFFER_CONFIG,
  K = 3,
  candidateFilter?: (n: TechNode) => boolean
): OfferCandidate[] {
  const { sim, laws, activeFamilies, recentOffers, recentPicks, rng } = context;
  
  // Build available pool
  const allNodes = sim.techGraph();
  let pool = allNodes.filter((n: TechNode) => {
    if (sim.owned.includes(n.id)) return false;
    if (n.prerequisites.some((p: string) => !sim.owned.includes(p))) return false;
    if (n.exclusions.some((e: string) => sim.owned.includes(e))) return false;
    if (n.effects.some((e: { family?: string }) => e.family && !activeFamilies.has(e.family))) return false;
    const ageIdx = ["stone", "bronze", "iron", "industrial", "atomic", "space"].indexOf(n.age);
    return ageIdx <= sim.ageIndex + 1;
  });
  
  // Apply POI candidate filter if provided
  if (candidateFilter) {
    const filtered = pool.filter(candidateFilter);
    if (filtered.length > 0) pool = filtered;
  }

  // Pre-calculate domain frequency in recent offers using actual node metadata
  const nodeDomainMap = new Map<string, string>();
  for (const n of allNodes) nodeDomainMap.set(n.id, n.domain);
  const recentDomainCounts = new Map<string, number>();
  for (const batch of recentOffers) {
    for (const id of batch) {
      const d = nodeDomainMap.get(id);
      if (d) recentDomainCounts.set(d, (recentDomainCounts.get(d) ?? 0) + 1);
    }
  }

  // --- STAGE 1: WHAT TECH APPEARS ---
  const candidates = pool.map((node: TechNode) => {
    const score = computeOfferScore(node, {
      sim,
      laws,
      activeFamilies,
      recentOffers,
      recentPicks: recentPicks.length > 0 ? recentPicks : sim.history.filter(h => h.kind === "tech_selected").map(h => h.label),
      recentDomainCounts,
      config,
    });
    return { node, score };
  });

  const selectedNodes = gumbelTopK(candidates, K, rng, config.gumbelTemp);

  // --- STAGE 2: HOW SPECIAL THAT OFFER INSTANCE IS ---
  // Sample quality per selected offer without age clamping; all qualities valid in every age.
  const finalCandidates: OfferCandidate[] = selectedNodes.map((c) => {
    const quality = sampleQuality(rng, config.qualityBaseProb);
    const novelty = computeNovelty(c.node.id, recentOffers, sim.ageIndex);
    const penalty = recentOfferPenalty(c.node.id, recentOffers);
    return {
      node: c.node,
      quality,
      score: c.score,
      gumbel: c.gumbel,
      novelty,
      penalty,
    };
  });

  return finalCandidates;
}

/**
 * Gumbel-Top-k sampling
 */
export function gumbelTopK<T extends { score: number }>(
  candidates: Array<T>,
  K: number,
  rng: ReturnType<typeof createStreamRng>,
  temperature = 1.0
): Array<T & { gumbel: number }> {
  const withGumbel = candidates.map((c) => ({
    ...c,
    gumbel: -Math.log(-Math.log(rng.nextFloat())) * temperature,
  }));
  withGumbel.sort((a, b) => (b.score + b.gumbel) - (a.score + a.gumbel));
  return withGumbel.slice(0, K);
}