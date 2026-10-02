// v0.24 Origins — unique rulesets per identity
// Each Origin has a unique mechanical verb, not just family pairs.

import type { OriginId, WeaponFamily, EnKeys } from "../progression/origins";
import type { EffectTarget } from "../sim/progression";
import { ORIGINS } from "../progression/origins";

export type OriginRulesetId = "hunters" | "engineers" | "resonant" | "sentinels";

export interface OriginRuleset {
  id: OriginRulesetId;
  nameKey: EnKeys;
  descriptionKey: EnKeys;
  // Unique mechanical verb
  system: {
    type: "marked_prey" | "fabrication" | "resonance" | "bastion_network";
    config: Record<string, number | string | boolean>;
  };
  // Starting families (kept for compatibility)
  families: [WeaponFamily, WeaponFamily];
  // Tech weighting modifiers
  techWeightModifiers: Record<string, number>;
  // Unique starting ability/structure
  signature: {
    type: string;
    config: Record<string, number | string | boolean>;
  };
}

export const ORIGIN_RULESETS: Record<OriginRulesetId, OriginRuleset> = {
  hunters: {
    id: "hunters",
    nameKey: "origin.hunters.name",
    descriptionKey: "origin.hunters.description",
    system: {
      type: "marked_prey",
      config: {
        maxMarks: 3,
        trophyChance: 0.35,
        trophyChoices: 3,
      },
    },
    families: ["kinetic", "field"],
    techWeightModifiers: {
      // Hunters favor offense and field
      kinetic: 1.3,
      field: 1.2,
      energy: 0.9,
      defense: 0.8,
    },
    signature: {
      type: "marked_prey",
      config: {},
    },
  },
  engineers: {
    id: "engineers",
    nameKey: "origin.engineers.name",
    descriptionKey: "origin.engineers.description",
    system: {
      type: "fabrication",
      config: {
        modularSlots: 2,
        efficiencyBonus: 0.15,
        turretDiscount: 0.1,
      },
    },
    families: ["kinetic", "defense"],
    techWeightModifiers: {
      kinetic: 1.2,
      defense: 1.3,
      energy: 0.9,
      field: 0.8,
    },
    signature: {
      type: "fabrication",
      config: {},
    },
  },
  resonant: {
    id: "resonant",
    nameKey: "origin.resonant.name",
    descriptionKey: "origin.resonant.description",
    system: {
      type: "resonance",
      config: {
        harmonicCap: 5,
        comboThreshold: 3,
        chainMultiplier: 1.5,
      },
    },
    families: ["energy", "field"],
    techWeightModifiers: {
      energy: 1.3,
      field: 1.2,
      kinetic: 0.9,
      defense: 0.8,
    },
    signature: {
      type: "resonance",
      config: {},
    },
  },
  sentinels: {
    id: "sentinels",
    nameKey: "origin.sentinels.name",
    descriptionKey: "origin.sentinels.description",
    system: {
      type: "bastion_network",
      config: {
        linkRange: 800,
        maxLinks: 4,
        networkBonus: 0.2,
      },
    },
    families: ["energy", "defense"],
    techWeightModifiers: {
      energy: 1.2,
      defense: 1.3,
      kinetic: 0.9,
      field: 0.9,
    },
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