// Visual language tokens — pure, framework-free, contract-tested.
// Shape + outline + fill identity for every gameplay entity. Color reinforces,
// never carries identity alone. See docs/VISUAL_LANGUAGE.md.
import type { EnemyFamily, EliteAffix } from "../../core/director/director";
import type { Archetype } from "../../core/combat/weapons";
import type { POIType } from "../../core/world/poi";

export type EnemyShape = "triangle" | "diamond" | "square" | "tri-cluster";
export type AffixMarker = "chevrons" | "brackets" | "spokes" | "lobes" | "shield-ring" | "none";
// Round 2: hostile and pickup silhouettes must differ even in grayscale.
export type ProjectileToken = "capsule-light" | "arrowhead-spike";
export type PickupToken = "crystal-shard";
export type PoiToken = "beacon" | "ring-dim";
// Round 2: every POI family owns a unique primary glyph (beacon stays secondary).
export type PoiGlyph =
  | "broken-arch"
  | "impact-star"
  | "vault-lock"
  | "signal-wave"
  | "hex-complex"
  | "branch-tree";
// Civ/background decoration identity — gameplay tokens must never equal this.
export type DecorationToken = "plus-mark";

const FAMILY_SHAPE: Record<EnemyFamily, EnemyShape> = {
  chaser: "triangle",
  ranged: "diamond",
  tank: "square",
  swarm: "tri-cluster",
};

/** Stable base silhouette per family — ages must never change this mapping. */
export function familyShape(family: EnemyFamily): EnemyShape {
  return FAMILY_SHAPE[family];
}

const AFFIX_MARKER: Record<EliteAffix, AffixMarker> = {
  swift: "chevrons",
  armored: "brackets",
  volatile: "spokes",
  splitter: "lobes",
  shielded: "shield-ring",
};

/** Secondary elite marker layered over the family shape (never replaces it). */
export function affixMarker(affix: EliteAffix | ""): AffixMarker {
  if (affix === "") return "none";
  return AFFIX_MARKER[affix];
}

export function friendlyProjectileToken(): ProjectileToken {
  return "capsule-light";
}

export function hostileProjectileToken(): ProjectileToken {
  return "arrowhead-spike";
}

export function pickupToken(): PickupToken {
  return "crystal-shard";
}

/** Background/civ decoration token — no gameplay token may equal this. */
export function decorationToken(): DecorationToken {
  return "plus-mark";
}

/** Undiscovered POIs are destinations (beacon); discovered ones dim rings. */
export function poiToken(found: boolean): PoiToken {
  return found ? "ring-dim" : "beacon";
}

export type WeaponVisual = "projectile" | "beam" | "aura" | "orbit" | "summon" | "mine";

/** Presentation dispatch mirrors the sim archetype dispatch (visual only). */
export function weaponVisual(archetype: Archetype): WeaponVisual {
  return archetype;
}

const POI_GLYPH: Record<POIType, PoiGlyph> = {
  ruin: "broken-arch",
  meteor: "impact-star",
  vault: "vault-lock",
  signal: "signal-wave",
  megasite: "hex-complex",
  worldtree: "branch-tree",
};

/** Unique primary glyph per POI family — the destination identity. */
export function poiGlyph(type: POIType): PoiGlyph {
  return POI_GLYPH[type];
}

export type LabContrastMode = "normal" | "grayscale" | "high";

/** Canvas CSS filter for the lab grayscale diagnostic (presentation only). */
export function contrastFilter(mode: LabContrastMode): string {
  return mode === "grayscale" ? "grayscale(1)" : "";
}

/** Boss silhouette id — must never equal the tank family shape ("square"). */
export function bossShapeId(): string {
  return "hex-crown";
}

// Palette: dark outlines for identity on any background; gold reserved for
// player-adjacent importance (player accents, elites, boss, POI beacons).
export const VL = {
  outlineDark: 0x0a0d13,
  outlineLight: 0xfff6d8,
  eliteRing: 0xffd166,
  eliteRingInner: 0xffffff,
  hostileOutline: 0x1a0505,
  friendlyCore: 0xfff6d8,
  knowledge: 0x53e0c8,
  knowledgeCore: 0xd8fff6,
  beacon: 0x53e0c8,
  boss: 0xff2222,
  bossInner: 0xffffff,
  playerCore: 0xffe08a,
  playerMid: 0xff9a3c,
  playerNotch: 0x1a1405,
  summon: 0x7fb8ff,
  danger: 0xff3333,
  aimTick: 0xffb03c,
} as const;
