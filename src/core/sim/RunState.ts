// Canonical run state — plain data, no methods, no framework imports.
// The simulation mutates it; the renderer only reads it; stateHash covers it.
import type { AgeId } from "../tech/graph";
import type { WeaponFamily } from "../combat/weapons";
import type { EnemyFamily, EliteAffix } from "../director/director";
import type { TechNode } from "../tech/graph";
import type { POIType } from "../world/poi";
import type { WorldLaws } from "../emergence/worldLaws";
import type { EffectTarget } from "./progression";
import type { Territory, RaidState } from "../world/territory";
import type { SimAlly, SquadMode } from "../combat/squad";

// Draft offer quality (generated per-offer, not from authored rarity)
export type TechQuality = "COMMON" | "UNCOMMON" | "RARE" | "MYTHIC";

// Generated tech modifier IDs (v0.24 emergence)
export type TechModifierId =
  | "overcharged" | "extended" | "efficient" | "volatile"
  | "piercing" | "splash" | "homing" | "chain"
  | "reinforced" | "regenerating" | "warded" | "adaptive"
  | "swift" | "silent" | "massive" | "precise";

// A single generated draft offer — instance, not authored content
export interface DraftOffer {
  nodeId: string;
  quality: TechQuality;
  modifierIds: TechModifierId[];
  effectiveEffects: TechNode["effects"]; // resolved effects after quality/modifiers
  scoreBreakdown?: {
    base: number;
    origin: number;
    synergy: number;
    worldLaw: number;
    novelty: number;
    penalty: number;
    qualityMult: number;
  };
}

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
  // v0.25 emergence telemetry
  abilityUses: number;
  draftPicksByDomain: Record<string, number>;
  draftPicksByFamily: Record<string, number>;
  outpostsClaimed: number;
  rerollsUsed: number;
  reservesUsed: number;
  skipsUsed: number;
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
  draftOffers: DraftOffer[];
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
  // Reserved experimental scaffold state — not active runtime mechanics in v0.25.
  // Canonical origin differentiation is driven by starting family pairs, signature F abilities,
  // and offer weighting.
  originMechanic: {
    // Hunters: Marked Prey / Trophy (reserved)
    hunterMarks: string[];
    hunterTrophies: string[];
    // Engineers: Fabrication (reserved)
    fabricationModules: Array<{ type: string; level: number }>;
    fabricationCharges: number;
    // Resonant: Harmonic charge (reserved)
    harmonicCharge: number;
    lastResonanceFamily: string | "";
    // Sentinels: Bastion Network (reserved)
    bastionLinks: Array<{ siteA: string; siteB: string }>;
  };
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
  // Logistics / Garrison (v0.24)
  logistics: number;
  maxLogistics: number;
  // Origin command squad + active ability timers.
  squad: SimAlly[];
  squadMode: SquadMode;
  focusX: number;
  focusY: number;
  abilityCd: number;
  overdriveT: number;
  // Build history: bounded FIFO of player decisions (chronicle + tech map).
  history: Array<{ t: number; kind: string; label: string }>;
  // Recent draft offers for anti-pattern penalties (offer engine v0.24).
  recentDraftOffers: string[][];
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
  // World laws (derived from seed, governs tech/enemy/territory generation)
  worldLaws: WorldLaws;
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
