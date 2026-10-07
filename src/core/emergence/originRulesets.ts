// Reserved experimental scaffolds for future deep mechanics.
// Canonical live Origin differentiation is governed by authoritative definitions in
// src/core/progression/origins.ts (families, signature active F ability, offer weighting).

import type { OriginId, WeaponFamily, EnKeys } from "../progression/origins";
import type { EffectTarget } from "../sim/progression";
import { ORIGINS, originById } from "../progression/origins";

export type OriginRulesetId = "hunters" | "engineers" | "resonant" | "sentinels";

export interface OriginRuleset {
  id: OriginRulesetId;
  nameKey: EnKeys;
  descriptionKey: EnKeys;
  // Unique mechanical verb (reserved scaffold)
  system: {
    type: "marked_prey" | "fabrication" | "resonance" | "bastion_network";
    config: Record<string, number | string | boolean>;
  };
  // Starting families (authoritative from origins.ts)
  families: [WeaponFamily, WeaponFamily];
  // Tech weighting modifiers (authoritative from origins.ts)
  techWeightModifiers: Record<string, number>;
  // Unique starting ability/structure (reserved scaffold)
  signature: {
    type: string;
    config: Record<string, number | string | boolean>;
  };
}

export const ORIGIN_RULESETS: Record<OriginRulesetId, OriginRuleset> = {
  hunters: {
    id: "hunters",
    nameKey: originById("hunters").nameKey,
    descriptionKey: originById("hunters").descKey,
    system: {
      type: "marked_prey",
      config: {
        maxMarks: 3,
        trophyChance: 0.35,
        trophyChoices: 3,
      },
    },
    families: originById("hunters").families,
    techWeightModifiers: originById("hunters").techWeightModifiers,
    signature: {
      type: "marked_prey",
      config: {},
    },
  },
  engineers: {
    id: "engineers",
    nameKey: originById("engineers").nameKey,
    descriptionKey: originById("engineers").descKey,
    system: {
      type: "fabrication",
      config: {
        modularSlots: 2,
        efficiencyBonus: 0.15,
        turretDiscount: 0.1,
      },
    },
    families: originById("engineers").families,
    techWeightModifiers: originById("engineers").techWeightModifiers,
    signature: {
      type: "fabrication",
      config: {},
    },
  },
  resonant: {
    id: "resonant",
    nameKey: originById("resonant").nameKey,
    descriptionKey: originById("resonant").descKey,
    system: {
      type: "resonance",
      config: {
        harmonicCap: 5,
        comboThreshold: 3,
        chainMultiplier: 1.5,
      },
    },
    families: originById("resonant").families,
    techWeightModifiers: originById("resonant").techWeightModifiers,
    signature: {
      type: "resonance",
      config: {},
    },
  },
  sentinels: {
    id: "sentinels",
    nameKey: originById("sentinels").nameKey,
    descriptionKey: originById("sentinels").descKey,
    system: {
      type: "bastion_network",
      config: {
        linkRange: 800,
        maxLinks: 4,
        networkBonus: 0.2,
      },
    },
    families: originById("sentinels").families,
    techWeightModifiers: originById("sentinels").techWeightModifiers,
    signature: {
      type: "bastion_network",
      config: {},
    },
  },
};

export function getOriginRuleset(id: OriginRulesetId): OriginRuleset {
  return ORIGIN_RULESETS[id];
}

// Apply origin effects to build (called on origin select)
export function applyOriginEffects(
  build: EffectTarget,
  originId: OriginRulesetId,
  ascension: number
): void {
  const ruleset = ORIGIN_RULESETS[originId];
  if (!ruleset) return;

  // Apply tech weight modifiers (handled in offer engine)
  // Apply signature ability (handled in ability system)
  
  // Legacy: starting families preserved for backward compat
}

// Hunters: Marked Prey system
export function hunterMarkPrey(targetId: string, existingMarks: string[]): string[] {
  const marks = [...existingMarks];
  if (!marks.includes(targetId)) {
    marks.push(targetId);
    if (marks.length > 3) marks.shift(); // cap at 3
  }
  return marks;
}

export function hunterOnMarkedKill(targetId: string, marks: string[]): { trophy: string } | null {
  const idx = marks.indexOf(targetId);
  if (idx === -1) return null;
  // Consume mark, grant trophy choice
  return { trophy: `trophy-${targetId}` };
}

// Engineers: Fabrication system
export interface FabricationModule {
  type: string;
  level: number;
}

export function engineerFabricate(modules: FabricationModule[], slots: number): FabricationModule[] {
  const result = [...modules];
  if (result.length >= 2) return result; // max 2 modules
  result.push({ type: "turret", level: 1 });
  return result;
}

// Resonant: Resonance system
export function resonantAddHarmonic(charge: number, type: "energy" | "field"): number {
  return Math.min(5, charge + 1);
}

export function resonantCheckCombo(charge: number): { triggers: boolean; effect: string } | null {
  if (charge >= 3) return { triggers: true, effect: "resonance_burst" };
  return null;
}

// Sentinels: Bastion Network
export function sentinelLinkSites(siteA: string, siteB: string, range: number): boolean {
  // Link logic handled in territory system
  return true;
}

export function sentinelNetworkBonus(linkedCount: number): number {
  return 0.2 * linkedCount; // 20% per link
}