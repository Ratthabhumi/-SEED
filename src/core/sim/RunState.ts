// Canonical run state — plain data, no methods, no framework imports.
// The simulation mutates it; the renderer only reads it; stateHash covers it.
import type { AgeId } from "../tech/graph";
import type { WeaponFamily } from "../combat/weapons";
import type { EnemyFamily, EliteAffix } from "../director/director";
import type { TechNode } from "../tech/graph";
import type { POIType } from "../world/poi";
import type { EffectTarget } from "./progression";
import type { Territory, RaidState } from "../world/territory";
import type { SimAlly, SquadMode } from "../combat/squad";

export interface SimEnemy {
  active: boolean; x: number; y: number;
  hp: number; maxHp: number; shield: number;
  family: EnemyFamily; speed: number; dmg: number; radius: number; xp: number;
  elite: boolean; affix: EliteAffix | ""; flash: number; shootT: number;
  boss: boolean; hitCd: number;
  /** Raid siege unit: marches on the raided outpost instead of the player. */
  siege: boolean;
}

export interface SimProj {
  active: boolean; x: number; y: number; vx: number; vy: number;
  dmg: number; radius: number; life: number; friendly: boolean; color: number; src: string;
}

export interface SimPickup { active: boolean; x: number; y: number; value: number; }
export interface SimMine { active: boolean; x: number; y: number; dmg: number; radius: number; life: number; }

export interface RunStats {
  kills: number; elites: number; bosses: number; techsTaken: number;
  chunksTotal: number; poisTotal: number; knowledgeEarned: number;
}

export interface RunState {
  // Identity
  masterSeed: string;
  worldSeed: string;
  worldNonce: string;
  ascension: number;
  difficultyMul: number;
  // Time / age (world-local) + run totals (never reset by Ascension)
  ageIndex: number;
  elapsed: number;
  ageElapsed: number;
  ageKills: number;
  runElapsed: number;
  runHighestAge: AgeId;
  runKills: number;
  // Player kinematics
  px: number; py: number; vx: number; vy: number;
  dashT: number; dashCd: number; iframe: number;
  // Build + progression
  build: EffectTarget;
  level: number; xp: number; xpNext: number;
  knowledgeTotal: number;
  pendingLevels: number;
  draftOpen: boolean;
  draftChoices: TechNode[];
  owned: string[];
  ownedTags: string[];
  breakthroughs: string[];
  weaponStage: Record<WeaponFamily, number>;
  // Draft agency (canonical — pinned/reserved/rerolls shape future drafts).
  reservedTech: string;
  rerolls: number;
  pinnedTarget: string;
  // Build identity (ADR-0006): origin pair + at most one expansion unlock.
  originId: string;
  expansionFamily: WeaponFamily | "";
  // Ascension legacy prestige: bounded inherited defs (max 3, FIFO).
  legacies: string[];
  // First-discovery major POI rewards, one per family per world.
  poiFamiliesClaimed: POIType[];
  // Age-mission counters (elitesAge resets on every age advance + ascension).
  elitesAge: number;
  raidsSurvived: number;
  signalSecured: boolean;
  /** Mission-complete toast already emitted for the current age (reset per age). */
  missionDoneCache: boolean;
  // Territory / raid (world-scoped; reset per ascension with the world).
  territories: Territory[];
  raid: RaidState | null;
  lastRaidAt: number;
  // Origin command squad + active ability timers.
  squad: SimAlly[];
  squadMode: SquadMode;
  focusX: number;
  focusY: number;
  abilityCd: number;
  overdriveT: number;
  // Build history: bounded FIFO of player decisions (chronicle + tech map).
  history: Array<{ t: number; kind: string; label: string }>;
  // Draft provenance for UI titles ("level" vs "poi").
  draftContext: "level" | "poi";
  // Timers / angles (transient but canonical — recreated identically per run)
  spawnT: number; eliteT: number; mineT: number; auraT: number;
  weaponCd: Record<WeaponFamily, number>;
  guardianAng: number; orbitAng: number;
  beamFlash: { x2: number; y2: number; t: number } | null;
  // Pools
  enemies: SimEnemy[];
  projs: SimProj[];
  pickups: SimPickup[];
  mines: SimMine[];
  // World-scoped discovery (reset per ascension) + run totals
  chunksWorld: string[];
  poisWorld: string[];
  // Boss / ascension / death
  bossSpawned: boolean;
  ascendReady: boolean;
  bossIndex: number; // -1 = none
  /** Derived endgame site (world-scoped): set on Space entry, never by hand. */
  stronghold: { x: number; y: number; revealed: boolean } | null;
  over: boolean;
  stats: RunStats;
  damageBySource: Record<string, number>;
  topDamageSource: string;
  highestAge: AgeId;
  // Current-world evidence for Legacy offers (P1-04): reset on Ascension,
  // unlike the run-total Chronicle fields above.
  worldDamageBySource: Record<string, number>;
  worldTopDamageSource: string;
  worldBreakthroughsEarned: string[];
}

export const MAX_ENEMIES = 650;
export const MAX_PROJ = 1000;
export const MAX_PICKUP = 400;
export const MAX_MINES = 60;
export const SPATIAL_CELL = 128;
