// v0.24 Outpost Logistics & Garrison — explicit opportunity cost
// Replaces opaque "capacity" with explicit Logistics points.

import type { OutpostSpec, Territory } from "../world/territory";
import type { EffectTarget } from "../sim/progression";

export interface OutpostConfig {
  maxLogistics: number;           // base per age/origin/tech
  logisticsPerTier: {
    research: number;
    military: number;
    economy: number;
  };
  upgradeCost: {
    logistics: number;
    knowledge: number;
  };
  // Garrison
  garrison: {
    enabled: boolean;
    mobileSlotCost: number;      // slots removed from escort when garrisoned
    benefit: {
      research: number;          // +% knowledge per tier
      military: number;          // +squad slots per tier
      economy: number;           // +HP/s per tier near player
    };
  };
}

export const DEFAULT_OUTPOST_CONFIG = {
  maxLogistics: 5,               // base (age 0: 1, +1 per age)
  logisticsPerTier: {
    research: 1,
    military: 2,  // military costs more logistics
    economy: 1,
  },
  upgradeCost: {
    logistics: 1,
    knowledge: (ageIndex: number) => Math.round((500 * Math.pow(1.5, ageIndex)) / 25) * 25, // ~9% of next age threshold
  },
  garrison: {
    enabled: true,
    mobileSlotCost: 1,           // each garrisoned outpost removes 1 mobile squad slot
    benefit: {
      research: 0.1,             // +10% knowledge per tier
      military: 1,               // +1 squad slot per tier
      economy: 1.5,              // +1.5 HP/s per tier near player
    },
  },
};

export interface OutpostState extends Territory {
  logistics: number;             // consumed logistics
  garrisoned: boolean;           // true = garrisoned, false = escort
  tier: 1 | 2;
  spec: OutpostSpec;
  hp: number;
  maxHp: number;
  disabled: boolean;
  heldSince: number;
  repairT: number;
}

export function calculateMaxLogistics(ageIndex: number, originLogisticsBonus: number = 0, techLogisticsBonus: number = 0): number {
  // Base logistics: age 0 starts at 3 to allow research(1)+military(2) or similar combos
  // Grows by 1 per age, caps at 8
  return Math.min(8, (ageIndex + 3) + originLogisticsBonus + techLogisticsBonus);
}

export function calculateLogisticsCost(spec: OutpostSpec, tier: 1 | 2, ageIndex: number = 0): number {
  const base = DEFAULT_OUTPOST_CONFIG.logisticsPerTier[spec];
  const tierMult = tier === 1 ? 1 : 1.5;
  return Math.ceil(base * tierMult);
}

export function canFoundOutpost(currentLogistics: number, cost: number, maxLogistics: number): boolean {
  return currentLogistics + cost <= maxLogistics;
}

export function applyFoundOutpost(
  state: { logistics: number; maxLogistics: number; territories: Territory[] },
  spec: OutpostSpec,
  tier: 1 | 2,
  ageIndex: number = 0
): boolean {
  const cost = calculateLogisticsCost(spec, tier, ageIndex);
  if (!canFoundOutpost(state.logistics, cost, state.maxLogistics)) return false;
  state.logistics += cost;
  return true;
}

export function applyUpgradeOutpost(
  outpost: Territory,
  spec: OutpostSpec,
  tier: 1 | 2,
  ageIndex: number
): { success: boolean; cost: number } {
  const cost = calculateLogisticsCost(spec, 2, ageIndex) - calculateLogisticsCost(spec, 1, ageIndex);
  // In reality, knowledge cost is handled in simulation
  return { success: true, cost };
}

export function calculateKnowledgeUpgradeCost(ageIndex: number): number {
  // ~9% of NEXT age threshold, rounded to 25
  const thresholds = [0, 500, 1500, 2800, 4500, 6500];
  const nextThreshold = thresholds[Math.min(ageIndex + 1, 5)];
  return Math.round((nextThreshold * 0.09) / 25) * 25;
}

// Garrison: remove from mobile, add to garrison
export function toggleGarrison(
  outpost: Territory,
  state: { squad: Array<{ active: boolean }>; maxSquadSlots: number }
): { success: boolean; message?: string } {
  const cost = DEFAULT_OUTPOST_CONFIG.garrison.mobileSlotCost;
  if (!outpost.garrisoned) {
    // Check if we have mobile slots to spare
    const activeMobile = state.squad.filter(s => s.active).length;
    if (activeMobile - 1 < 1) {
      return { success: false, message: "Need at least 1 mobile squad" };
    }
    // Garrison
    outpost.garrisoned = true;
    state.maxSquadSlots = Math.max(0, state.maxSquadSlots - 1);
    return { success: true };
  } else {
    // Recall
    outpost.garrisoned = false;
    state.maxSquadSlots += 1;
    return { success: true };
  }
}

export function calculateGarrisonBenefit(
  outpost: Territory,
  playerPos: { x: number; y: number }
): { hpRegen: number; squadBonus: number; knowledgeMul: number } {
  if (!outpost.garrisoned) return { hpRegen: 0, squadBonus: 0, knowledgeMul: 0 };
  
  const spec = outpost.spec;
  const tier = outpost.tier;
  const cfg = DEFAULT_OUTPOST_CONFIG.garrison.benefit;
  
  if (spec === "economy") {
    const dist = Math.hypot(outpost.x - playerPos.x, outpost.y - playerPos.y);
    if (dist <= 800) {
      return { hpRegen: cfg.economy * tier, squadBonus: 0, knowledgeMul: 0 };
    }
  }
  
  if (spec === "military") {
    return { hpRegen: 0, squadBonus: cfg.military * tier, knowledgeMul: 0 };
  }
  
  if (spec === "research") {
    return { hpRegen: 0, squadBonus: 0, knowledgeMul: cfg.research * tier };
  }
  
  return { hpRegen: 0, squadBonus: 0, knowledgeMul: 0 };
}