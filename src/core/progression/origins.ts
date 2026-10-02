// Civilization Origins — build identity per world (ADR-0006 Decision 1).
// Pure data + derivation. No RNG: origin selection is a player choice.
import type { WeaponFamily } from "../combat/weapons";
import type { EnKeys } from "../../i18n/en";

export type OriginId = "hunters" | "engineers" | "resonant" | "sentinels";

// Re-export for downstream consumers
export type { WeaponFamily, EnKeys };

export interface OriginDef {
  id: OriginId;
  nameKey: EnKeys;
  descKey: EnKeys;
  families: [WeaponFamily, WeaponFamily];
}

export const ORIGINS: OriginDef[] = [
  { id: "hunters", nameKey: "origin.hunters.name", descKey: "origin.hunters.description", families: ["kinetic", "field"] },
  { id: "engineers", nameKey: "origin.engineers.name", descKey: "origin.engineers.description", families: ["kinetic", "defense"] },
  { id: "resonant", nameKey: "origin.resonant.name", descKey: "origin.resonant.description", families: ["energy", "field"] },
  { id: "sentinels", nameKey: "origin.sentinels.name", descKey: "origin.sentinels.description", families: ["energy", "defense"] },
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