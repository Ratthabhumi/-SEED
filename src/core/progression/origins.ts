// Civilization Origins — build identity per world (ADR-0006 Decision 1).
// Pure data + derivation. No RNG: origin selection is a player choice.
import type { WeaponFamily } from "../combat/weapons";
import type { EnKeys } from "../../i18n/en";

export type OriginId = "hunters" | "engineers" | "resonant" | "sentinels";

// Re-export for downstream consumers
export type { WeaponFamily, EnKeys };

export type AbilityId = "volley" | "overdrive" | "nova" | "bulwark";

export interface AbilityDef {
  id: AbilityId;
  nameKey: EnKeys;
  descKey: EnKeys;
  cooldown: number;
}

export interface OriginDef {
  id: OriginId;
  nameKey: EnKeys;
  descKey: EnKeys;
  strategyKey: EnKeys;
  families: [WeaponFamily, WeaponFamily];
  ability: AbilityDef;
  techWeightModifiers: Record<WeaponFamily, number>;
}

export const ORIGINS: OriginDef[] = [
  {
    id: "hunters",
    nameKey: "origin.hunters.name",
    descKey: "origin.hunters.description",
    strategyKey: "origin.hunters.strategy",
    families: ["kinetic", "field"],
    ability: { id: "volley", nameKey: "ability.volley.name", descKey: "ability.volley.description", cooldown: 25 },
    techWeightModifiers: { kinetic: 1.3, field: 1.2, energy: 0.9, defense: 0.8 },
  },
  {
    id: "engineers",
    nameKey: "origin.engineers.name",
    descKey: "origin.engineers.description",
    strategyKey: "origin.engineers.strategy",
    families: ["kinetic", "defense"],
    ability: { id: "overdrive", nameKey: "ability.overdrive.name", descKey: "ability.overdrive.description", cooldown: 25 },
    techWeightModifiers: { kinetic: 1.2, defense: 1.3, energy: 0.9, field: 0.8 },
  },
  {
    id: "resonant",
    nameKey: "origin.resonant.name",
    descKey: "origin.resonant.description",
    strategyKey: "origin.resonant.strategy",
    families: ["energy", "field"],
    ability: { id: "nova", nameKey: "ability.nova.name", descKey: "ability.nova.description", cooldown: 25 },
    techWeightModifiers: { energy: 1.3, field: 1.2, kinetic: 0.9, defense: 0.8 },
  },
  {
    id: "sentinels",
    nameKey: "origin.sentinels.name",
    descKey: "origin.sentinels.description",
    strategyKey: "origin.sentinels.strategy",
    families: ["energy", "defense"],
    ability: { id: "bulwark", nameKey: "ability.bulwark.name", descKey: "ability.bulwark.description", cooldown: 30 },
    techWeightModifiers: { energy: 1.2, defense: 1.3, kinetic: 0.9, field: 0.9 },
  },
];

export const DEFAULT_ORIGIN: OriginId = "hunters";

export function originById(id: string): OriginDef {
  return ORIGINS.find((o) => o.id === id) ?? ORIGINS[0]!;
}

/** Canonical active-family set: origin pair + at most one expansion unlock. */
export function activeFamilies(originId: string, expansionFamily: WeaponFamily | ""): WeaponFamily[] {
  const base = [...originById(originId).families] as WeaponFamily[];
  if (expansionFamily !== "" && !base.includes(expansionFamily)) base.push(expansionFamily);
  return base;
}

/** Families still locked in this world (expansion candidates). */
export function lockedFamilies(originId: string, expansionFamily: WeaponFamily | ""): WeaponFamily[] {
  const active = activeFamilies(originId, expansionFamily);
  return (["kinetic", "energy", "defense", "field"] as WeaponFamily[]).filter((f) => !active.includes(f));
}