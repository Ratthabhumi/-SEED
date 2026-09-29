// Visual Lab section + composite-scene spec — pure data, no Phaser.
// Lets unit tests prove the lab's review coverage (sections, entity counts)
// without booting the engine. The scene renders FROM this spec.
import type { EnemyFamily, EliteAffix } from "../../core/director/director";
import type { POIType } from "../../core/world/poi";
import type { BiomeId } from "../../core/world/biome";

export type LabSectionId =
  | "player" | "enemies" | "elites" | "boss" | "shots" | "archetypes"
  | "poi" | "biomes" | "contrast-matrix"
  | "composite-verdant" | "composite-arid" | "strings";

export const LAB_SECTIONS: LabSectionId[] = [
  "player", "enemies", "elites", "boss", "shots", "archetypes",
  "poi", "biomes", "contrast-matrix",
  "composite-verdant", "composite-arid", "strings",
];

export type CompositeKind =
  | "player" | "enemy" | "elite" | "friendly" | "hostile"
  | "knowledge" | "mine" | "poi";

export interface CompositePlacement {
  kind: CompositeKind;
  dx: number;
  dy: number;
  family?: EnemyFamily;
  affix?: EliteAffix;
  boss?: boolean;
  value?: number;
  poi?: POIType;
}

export interface CompositeSpec {
  id: Extract<LabSectionId, "composite-verdant" | "composite-arid">;
  biome: BiomeId;
  placements: CompositePlacement[];
}

const VERDANT: CompositePlacement[] = [
  { kind: "player", dx: 0, dy: 0 },
  { kind: "enemy", family: "chaser", dx: -90, dy: -60 },
  { kind: "enemy", family: "chaser", dx: 90, dy: -60 },
  { kind: "enemy", family: "chaser", dx: -140, dy: 20 },
  { kind: "enemy", family: "chaser", dx: 140, dy: 20 },
  { kind: "enemy", family: "chaser", dx: -60, dy: 120 },
  { kind: "enemy", family: "chaser", dx: 60, dy: 120 },
  { kind: "enemy", family: "chaser", dx: 180, dy: -40 },
  { kind: "enemy", family: "chaser", dx: -180, dy: -90 },
  { kind: "enemy", family: "ranged", dx: -220, dy: -150 },
  { kind: "enemy", family: "ranged", dx: 220, dy: -150 },
  { kind: "enemy", family: "ranged", dx: -220, dy: 150 },
  { kind: "enemy", family: "ranged", dx: 220, dy: 150 },
  { kind: "enemy", family: "tank", dx: 260, dy: 80 },
  { kind: "enemy", family: "tank", dx: -260, dy: 60 },
  { kind: "enemy", family: "swarm", dx: -120, dy: -110 },
  { kind: "enemy", family: "swarm", dx: -150, dy: -90 },
  { kind: "enemy", family: "swarm", dx: -135, dy: -135 },
  { kind: "enemy", family: "swarm", dx: 120, dy: -110 },
  { kind: "enemy", family: "swarm", dx: 150, dy: -90 },
  { kind: "enemy", family: "swarm", dx: -110, dy: 190 },
  { kind: "enemy", family: "swarm", dx: -140, dy: 210 },
  { kind: "enemy", family: "swarm", dx: 110, dy: 190 },
  { kind: "enemy", family: "swarm", dx: 140, dy: 210 },
  { kind: "enemy", family: "swarm", dx: 0, dy: -200 },
  { kind: "elite", family: "tank", affix: "armored", dx: 320, dy: -120 },
  { kind: "friendly", dx: -40, dy: -30 },
  { kind: "friendly", dx: 30, dy: 40 },
  { kind: "friendly", dx: -20, dy: 90 },
  { kind: "friendly", dx: 80, dy: -90 },
  { kind: "hostile", dx: -50, dy: -20 },
  { kind: "hostile", dx: 50, dy: 30 },
  { kind: "hostile", dx: 0, dy: 70 },
  { kind: "hostile", dx: -100, dy: 50 },
  { kind: "hostile", dx: 100, dy: -50 },
  { kind: "knowledge", dx: -30, dy: 50, value: 5 },
  { kind: "knowledge", dx: 40, dy: -40, value: 10 },
  { kind: "knowledge", dx: -70, dy: -10, value: 3 },
  { kind: "knowledge", dx: 70, dy: 60, value: 15 },
  { kind: "knowledge", dx: 10, dy: -80, value: 8 },
  { kind: "mine", dx: 100, dy: 140 },
  { kind: "poi", dx: -320, dy: -160, poi: "ruin" },
];

const ARID: CompositePlacement[] = [
  { kind: "player", dx: 0, dy: 0 },
  { kind: "enemy", family: "chaser", dx: -100, dy: -40 },
  { kind: "enemy", family: "chaser", dx: 100, dy: -40 },
  { kind: "enemy", family: "chaser", dx: -150, dy: 60 },
  { kind: "enemy", family: "chaser", dx: 150, dy: 60 },
  { kind: "enemy", family: "chaser", dx: 0, dy: 140 },
  { kind: "enemy", family: "chaser", dx: -200, dy: -20 },
  { kind: "enemy", family: "chaser", dx: 200, dy: -20 },
  { kind: "enemy", family: "chaser", dx: 0, dy: -160 },
  { kind: "enemy", family: "ranged", dx: -240, dy: -120 },
  { kind: "enemy", family: "ranged", dx: 240, dy: -120 },
  { kind: "enemy", family: "ranged", dx: -240, dy: 120 },
  { kind: "enemy", family: "ranged", dx: 240, dy: 120 },
  { kind: "enemy", family: "tank", dx: 280, dy: 0 },
  { kind: "enemy", family: "tank", dx: -280, dy: 0 },
  { kind: "enemy", family: "swarm", dx: -90, dy: -130 },
  { kind: "enemy", family: "swarm", dx: -120, dy: -110 },
  { kind: "enemy", family: "swarm", dx: 90, dy: -130 },
  { kind: "enemy", family: "swarm", dx: 120, dy: -110 },
  { kind: "enemy", family: "swarm", dx: -90, dy: 170 },
  { kind: "enemy", family: "swarm", dx: -120, dy: 190 },
  { kind: "enemy", family: "swarm", dx: 90, dy: 170 },
  { kind: "enemy", family: "swarm", dx: 120, dy: 190 },
  { kind: "elite", family: "chaser", affix: "volatile", dx: -330, dy: 100 },
  { kind: "friendly", dx: -60, dy: 0 },
  { kind: "friendly", dx: 60, dy: -60 },
  { kind: "friendly", dx: 0, dy: 60 },
  { kind: "hostile", dx: -40, dy: -60 },
  { kind: "hostile", dx: 40, dy: -60 },
  { kind: "hostile", dx: 0, dy: 100 },
  { kind: "hostile", dx: -120, dy: 20 },
  { kind: "knowledge", dx: -50, dy: 40, value: 6 },
  { kind: "knowledge", dx: 50, dy: -30, value: 12 },
  { kind: "knowledge", dx: 0, dy: -60, value: 4 },
  { kind: "knowledge", dx: -20, dy: 110, value: 9 },
  { kind: "mine", dx: -110, dy: -150 },
  { kind: "poi", dx: 330, dy: -140, poi: "meteor" },
];

export const COMPOSITES: CompositeSpec[] = [
  { id: "composite-verdant", biome: "verdant", placements: VERDANT },
  { id: "composite-arid", biome: "arid", placements: ARID },
];

/** Critical tokens reviewed against every biome in the contrast matrix. */
export const CONTRAST_MATRIX_TOKENS = [
  "player", "chaser", "swarm", "friendly", "hostile", "knowledge", "mine",
] as const;

export type ContrastMatrixToken = (typeof CONTRAST_MATRIX_TOKENS)[number];

/** Count placements of one kind (optionally one family) in a spec. */
export function countPlacements(spec: CompositeSpec, kind: CompositeKind, family?: EnemyFamily): number {
  return spec.placements.filter((p) => p.kind === kind && (!family || p.family === family)).length;
}
