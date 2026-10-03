// Territory / outpost / raid model — pure data + derivation.
// Simulation owns mutation + scheduling; this module owns shapes, tuning
// constants, and bonus derivation so UI and tests share one source of truth.
import type { POIType } from "../world/poi";
import { AGE_DEFS } from "../progression/ages";
import { calculateLogisticsCost, calculateMaxLogistics } from "../emergence/outpostLogistics";

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
  /** Whether this outpost is garrisoned (removed from mobile squad pool). */
  garrisoned: boolean;
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

/**
 * OUTPOST CAPACITY (v0.23.1 territory economy): claiming is a strategic
 * trade-off, not free expansion. Provisional balance values, one canonical
 * function — UI, sim, and tests share it. Disabled outposts do NOT consume
 * capacity (they are not controlled); repaired posts are grandfathered even
 * if that exceeds capacity (never evict on repair).
 */
export function outpostCapacity(ageIndex: number): number {
  const ages = AGE_DEFS.length;
  const clamped = Math.max(0, Math.min(ageIndex, ages - 1));
  return clamped + 1;
}

/** Active (controlled, non-disabled) outpost count against capacity. */
export function outpostsHeld(ts: readonly Territory[]): number {
  return activeTerritories(ts).length;
}

/** True when another claim fits under capacity (disabled posts excluded). */
export function canClaimMore(ts: readonly Territory[], ageIndex: number): boolean {
  return outpostsHeld(ts) < outpostCapacity(ageIndex);
}

/**
 * Mission-critical exemption (v0.23.1 no-softlock rule): the FIRST Alien
 * Signal claim — required by the Space mission — is always allowed, even on
 * a full frontier. Rationale: signals are scarce story sites, not economic
 * expansion; a junk-filled frontier must never block the mission chain.
 * Later signals follow the normal economy. The exempt post still counts
 * toward capacity/dominion afterwards (grandfathered, like repairs).
 */
export function signalExempt(
  ts: readonly Territory[],
  ageIndex: number,
  poiType: POIType,
  signalSecured: boolean,
): boolean {
  return poiType === "signal" && !signalSecured && !canClaimMore(ts, ageIndex);
}

/**
 * OUTPOST UPGRADE COST (v0.23.1): tier 2 costs Knowledge — roughly 9% of the
 * NEXT age's Knowledge threshold, rounded to readable 25s. Space (no next
 * age) reuses its own threshold. One canonical pure function; sim and UI
 * consume the same value so display and deduction can never disagree.
 */
export function outpostUpgradeCost(ageIndex: number): number {
  const last = AGE_DEFS.length - 1;
  const clamped = Math.max(0, Math.min(ageIndex, last));
  const basis = AGE_DEFS[Math.min(clamped + 1, last)]?.knowledgeThreshold
    ?? AGE_DEFS[clamped]?.knowledgeThreshold
    ?? 0;
  return Math.max(25, Math.round((basis * 0.09) / 25) * 25);
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

// Re-export logistics functions for UI consumption
export { calculateLogisticsCost, calculateMaxLogistics } from "../emergence/outpostLogistics";
