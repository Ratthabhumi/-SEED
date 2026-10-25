// Ascension Legacies — bounded inheritance, never whole-build carryover.
// (ADR-0006 Decision 5.) Authored defs + deterministic candidate derivation
// from the completed world's achievements. No RNG anywhere in this module:
// candidates are pure functions of breakthroughs / top damage / ascension.
import type { TechEffect } from "../tech/graph";
import type { WeaponFamily } from "../combat/weapons";
import type { EnKeys } from "../../i18n/en";
import { BREAKTHROUGHS } from "../tech/synergy";

export interface LegacyDef {
  id: string;
  nameKey: EnKeys;
  descKey: EnKeys;
  effects: TechEffect[];
  /** Breakthrough recorded as inherited (display + no re-trigger). */
  breakthroughId?: string;
  /**
   * P1-05: pure affinity legacies only function through this family.
   * The Origin picker must restrict to Origins containing it — a chosen
   * Legacy may never start dead.
   */
  requiredFamily?: WeaponFamily;
}

export const MAX_LEGACIES = 3;

const HEIR_EFFECTS: Record<string, TechEffect[]> = {
  metallurgy: [{ kind: "damageMul", value: 0.15 }, { kind: "knowledgeMul", value: 0.1 }],
  "war-machine": [{ kind: "projectileAdd", value: 1 }, { kind: "cooldownMul", value: -0.1 }],
  bioforge: [{ kind: "regenAdd", value: 1.5 }, { kind: "maxHpAdd", value: 30 }],
  grid: [{ kind: "auraAdd", value: 1 }, { kind: "damageMul", value: 0.15 }],
  fortress: [{ kind: "maxHpAdd", value: 60 }, { kind: "summonAdd", value: 1 }],
};

const AFFINITY_FAMILY: Record<string, WeaponFamily> = {
  kinetic: "kinetic",
  energy: "energy",
  defense: "defense",
  field: "field",
};

const TRAITS = ["trait-swift", "trait-keen", "trait-sturdy"] as const;

function heirDef(breakthroughId: string): LegacyDef {
  const b = BREAKTHROUGHS.find((x) => x.id === breakthroughId);
  return {
    id: `heir-${breakthroughId}`,
    // Reuse the breakthrough's own keys: identical effects, truthful label.
    nameKey: b?.titleKey ?? "breakthrough.metallurgy",
    descKey: "legacy.heir.description",
    effects: HEIR_EFFECTS[breakthroughId] ?? [{ kind: "damageMul", value: 0.1 }],
    breakthroughId,
  };
}

function affinityDef(family: WeaponFamily): LegacyDef {
  const effects: Record<WeaponFamily, TechEffect[]> = {
    kinetic: [{ kind: "projectileAdd", value: 1 }],
    energy: [{ kind: "beamAdd", value: 1 }],
    defense: [{ kind: "summonAdd", value: 1 }],
    field: [{ kind: "mineAdd", value: 1 }],
  };
  return {
    id: `affinity-${family}`,
    nameKey: `legacy.affinity.${family}.name` as EnKeys,
    descKey: `legacy.affinity.${family}.description` as EnKeys,
    effects: effects[family],
    requiredFamily: family,
  };
}

function traitDef(traitId: string): LegacyDef {
  const effects: Record<string, TechEffect[]> = {
    "trait-swift": [{ kind: "moveMul", value: 0.1 }],
    "trait-keen": [{ kind: "knowledgeMul", value: 0.15 }],
    "trait-sturdy": [{ kind: "maxHpAdd", value: 30 }],
  };
  return {
    id: traitId,
    nameKey: `legacy.${traitId === "trait-swift" ? "swift" : traitId === "trait-keen" ? "keen" : "sturdy"}.name` as EnKeys,
    descKey: `legacy.${traitId === "trait-swift" ? "swift" : traitId === "trait-keen" ? "keen" : "sturdy"}.description` as EnKeys,
    effects: effects[traitId] ?? [{ kind: "moveMul", value: 0.1 }],
  };
}

export interface LegacySource {
  breakthroughs: string[];
  topDamageSource: string;
  ascension: number;
}

/**
 * Exactly 3 deterministic Legacy candidates. No RNG: order and content derive
 * from completed-world achievements (signature breakthrough → top-family
 * affinity → rotating authored trait), deduplicated deterministically.
 */
export function legacyCandidates(src: LegacySource): LegacyDef[] {
  const firstHeir = BREAKTHROUGHS.map((b) => b.id).find((id) => src.breakthroughs.includes(id));
  const topFam: WeaponFamily = AFFINITY_FAMILY[src.topDamageSource] ?? "kinetic";
  const out: LegacyDef[] = [];
  out.push(firstHeir ? heirDef(firstHeir) : affinityDef(topFam));
  out.push(affinityDef(topFam));
  out.push(traitDef(TRAITS[src.ascension % TRAITS.length] as string));
  // Deterministic dedupe (e.g. no-breakthrough pacifist runs).
  const seen = new Set<string>();
  const uniq = out.filter((d) => (seen.has(d.id) ? false : (seen.add(d.id), true)));
  let ti = 0;
  while (uniq.length < 3) {
    const fill = traitDef(TRAITS[(src.ascension + ++ti) % TRAITS.length] as string);
    if (!seen.has(fill.id)) {
      seen.add(fill.id);
      uniq.push(fill);
    }
    if (ti > 10) break;
  }
  return uniq.slice(0, 3);
}

export function legacyById(id: string, src: LegacySource): LegacyDef | null {
  return legacyCandidates(src).find((d) => d.id === id) ?? null;
}

/**
 * Reconstruct a LegacyDef from its id alone (for re-applying stored legacies
 * on child worlds). Returns null for unknown ids — never throws.
 */
export function legacyDefById(id: string): LegacyDef | null {
  if (id.startsWith("heir-")) {
    const b = id.slice("heir-".length);
    if (!BREAKTHROUGHS.some((x) => x.id === b)) return null;
    return heirDef(b);
  }
  if (id.startsWith("affinity-")) {
    const f = id.slice("affinity-".length);
    if (!["kinetic", "energy", "defense", "field"].includes(f)) return null;
    return affinityDef(f as WeaponFamily);
  }
  if ((TRAITS as readonly string[]).includes(id)) return traitDef(id);
  return null;
}
