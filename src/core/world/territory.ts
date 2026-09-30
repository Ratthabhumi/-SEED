// Territory / outpost / raid model — pure data + derivation.
// Simulation owns mutation + scheduling; this module owns shapes, tuning
// constants, and bonus derivation so UI and tests share one source of truth.
import type { POIType } from "../world/poi";

export type OutpostSpec = "research" | "military" | "economy";

export interface Territory {
  poiId: string;
  poiType: POIType;
  x: number;
  y: number;
  spec: OutpostSpec | "";
  tier: 1 | 2;
  hp: number;
  maxHp: number;
  disabled: boolean;
  /** World-elapsed seconds when tier 2 became eligible (held-since clock). */
  heldSince: number;
  /** Repair progress 0..REPAIR_NEED while the player is near a disabled post. */
  repairT: number;
}

export interface RaidState {
  poiId: string;
  /** Seconds until raiders land (warning window). */
  tMinus: number;
  /** True once the raider wave has spawned (repel check active). */
  landed: boolean;
}

/** POI must be threat-free within this radius to claim. */
export const CLAIM_CLEAR_RADIUS = 400;
/** Player must be within this radius to claim / repair. */
export const CLAIM_REACH_RADIUS = 350;
export const OUTPOST_MAXHP = 300;
export const RAID_INTERVAL = 180;
export const RAID_FIRST_DELAY = 90;
export const RAID_WARN_SEC = 30;
/** Seconds a tier-1 post must be held before tier 2 unlocks. */
export const TIER2_HOLD_SEC = 90;
/** Seconds of player presence to repair a disabled post to 50%. */
export const REPAIR_NEED = 10;
/** Siege DPS scale: outpost takes e.dmg per contact-second via hitCd gating. */
export const RAID_SIZE_BASE = 3;

export function activeTerritories(ts: readonly Territory[]): Territory[] {
  return ts.filter((t) => !t.disabled);
}

/** Research: +10% knowledge per active research tier (additive tiers). */
export function territoryKnowledgeBonus(ts: readonly Territory[]): number {
  let tiers = 0;
  for (const t of ts) if (!t.disabled && t.spec === "research") tiers += t.tier;
  return 0.1 * tiers;
}

/** Military: +1 squad slot per active military outpost (base handled by sim). */
export function militaryBonusSlots(ts: readonly Territory[]): number {
  let n = 0;
  for (const t of ts) if (!t.disabled && t.spec === "military") n++;
  return n;
}

/** Economy: +1.5 hp/s per tier while the player is near an active post. */
export function economyRegenAt(ts: readonly Territory[], px: number, py: number): number {
  let regen = 0;
  for (const t of ts) {
    if (t.disabled || t.spec !== "economy") continue;
    const d = Math.hypot(t.x - px, t.y - py);
    if (d <= 800) regen += 1.5 * t.tier;
  }
  return regen;
}

export function territoryById(ts: readonly Territory[], poiId: string): Territory | undefined {
  return ts.find((t) => t.poiId === poiId);
}
