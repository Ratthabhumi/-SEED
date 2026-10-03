// Framework-independent run simulation (ADR 0003).
//
// One RunSimulation instance == one run attempt. Restarting a seed means
// constructing a NEW instance, so Phaser Scene reuse can never leak state.
// No Phaser / DOM / storage / audio imports — events go out via SimEvent[].
//
// Phase order per step (documented, tested at cell boundaries):
//   input → player movement → age/mission → director/spawn + raids → enemy
//   movement (incl. siege) → spatial rebuild → weapons/squad/projectiles/
//   collisions → mines → pickups/economy → territory upkeep → chunks/POI
import { fnv1a32 } from "../seed/hash";
import { initRunRng, type RunRngStreams } from "../seed/runRng";
import { deriveAscensionSeed } from "../seed/streams";
import { WORLDGEN_VERSION } from "../seed/versions";
import { xpForLevel } from "./fixedStep";
import { applyTechEffect, defaultEffectTarget, scaleKnowledge } from "./progression";
import { worldToChunk } from "../world/chunks";
import { ChunkCache } from "./chunkCache";
import { nearestEnemySpatial, cellKey } from "./spatial";
import { canonicalSnapshot, snapshotStreams, stateHash, type RngSnapshots } from "./stateHash";
import { AGES, CRITICAL_SPINE, type AgeId, type TechNode } from "../tech/graph";
import { generateTechGraph } from "../tech/generator";
import { checkBreakthroughs, BREAKTHROUGHS } from "../tech/synergy";
import { generateWorldLaws, type WorldLaws } from "../emergence/worldLaws";
import { CONTENT_VERSION } from "../seed/versions";
import { generateOffers, type OfferCandidate } from "../emergence/offerEngine";
import { calculateMaxLogistics, calculateLogisticsCost, applyFoundOutpost, calculateKnowledgeUpgradeCost, calculateGarrisonBenefit, toggleGarrison, type OutpostConfig } from "../emergence/outpostLogistics";
import { canAdvanceAge, type DominionState } from "../progression/ages";
import { missionDone, type MissionState } from "../progression/missions";
import {
  CLAIM_CLEAR_RADIUS, CLAIM_REACH_RADIUS, OUTPOST_MAXHP, RAID_INTERVAL, RAID_WARN_SEC,
  RAID_SIZE_BASE, TIER2_HOLD_SEC, REPAIR_NEED, activeTerritories,
  territoryKnowledgeBonus, militaryBonusSlots, economyRegenAt,
  territoryById, canClaimMore, signalExempt, outpostUpgradeCost, type OutpostSpec,
} from "../world/territory";
import {
  SQUAD_BASE_CAP, SQUAD_MAX, SQUAD_HP, SQUAD_DMG, SQUAD_SPEED, SQUAD_RANGE, SQUAD_CD,
  ORIGIN_ABILITY, OVERDRIVE_DURATION, NOVA_RADIUS, NOVA_DMG,
  VOLLEY_COUNT, VOLLEY_DMG, BULWARK_REPAIR, BULWARK_IFRAME, squadCap, type SquadMode,
} from "../combat/squad";
import { activeFamilies, lockedFamilies, originById, ORIGINS } from "../progression/origins";
import { legacyCandidates, legacyDefById, MAX_LEGACIES, type LegacyDef } from "../progression/legacies";
import {
  threatBudget, composeFromBudget, pickFamily, eligibleFamilies,
  ELITE_AFFIXES, ELITE_AFFIX_DEFS, type EnemyFamily, type EliteAffix,
} from "../director/director";
import { getWeaponStage, type WeaponFamily } from "../combat/weapons";
import { poiTypeFor, POI_DRAFT_FILTERS, type POIType } from "../world/poi";
import type { RunConfig } from "./RunConfig";
import type { InputFrame } from "./InputFrame";
import type { SimEvent } from "./SimEvent";
import {
  MAX_ENEMIES, MAX_PROJ, MAX_PICKUP, MAX_MINES, SPATIAL_CELL,
  type RunState, type SimEnemy,
  type DraftOffer,
  type TechModifierId,
  type TechQuality,
} from "./RunState";

const OBJECTIVE_KILLS = [0, 25, 60, 120, 200, 0];

/** Kills required within each age to satisfy its objective (index = next age). */
export const AGE_OBJECTIVE_KILLS: readonly number[] = OBJECTIVE_KILLS;

export function worldNonceFor(masterSeed: string, ascension: number): string {
  return fnv1a32(`${masterSeed}::w${WORLDGEN_VERSION}::asc${ascension}`).toString(16).padStart(8, "0");
}

const ENEMY_BASE: Record<EnemyFamily, { hp: number; speed: number; dmg: number; radius: number; xp: number }> = {
  chaser: { hp: 22, speed: 120, dmg: 8, radius: 14, xp: 1 },
  ranged: { hp: 16, speed: 95, dmg: 7, radius: 12, xp: 2 },
  tank: { hp: 70, speed: 62, dmg: 14, radius: 20, xp: 4 },
  swarm: { hp: 8, speed: 150, dmg: 5, radius: 9, xp: 1 },
};

export class RunSimulation {
  readonly state: RunState;
  readonly chunks = new ChunkCache();
  /** Gameplay RNG streams. Public-readonly so tests can prove isolation. */
  readonly streams: RunRngStreams;
  private graph: TechNode[];
  private masterSeed: string;
  private difficultyMul: number;
  // Derived-query structures (never hashed, never canonical).
  private buckets = new Map<number, number[]>();
  private bucketPool: number[][] = [];
  private scratch: SimEnemy[] = [];
  /** Collision/query count for the CURRENT step (F3 diagnostics). */
  queryCount = 0;

  constructor(config: RunConfig) {
    this.masterSeed = config.masterSeed;
    this.difficultyMul = config.difficultyMul ?? 1;
    this.state = this.freshWorldState(config.masterSeed, 0, originById(config.originId ?? "").id);
    this.streams = initRunRng(this.state.worldSeed);
    this.graph = generateTechGraph(this.state.worldSeed, 0).nodes;
    this.grantNode("spine-tools");
  }

  // ------------------------------------------------------------ construction
  private freshWorldState(masterSeed: string, ascension: number, originId: string): RunState {
    const worldSeed = ascension === 0 ? masterSeed : deriveAscensionSeed(masterSeed, ascension);
    const worldLaws = generateWorldLaws(masterSeed, WORLDGEN_VERSION, CONTENT_VERSION);
    const maxLogistics = calculateMaxLogistics(0);
    return {
      masterSeed, worldSeed,
      worldNonce: worldNonceFor(masterSeed, ascension),
      ascension, difficultyMul: this.difficultyMul,
      ageIndex: 0, elapsed: 0, ageElapsed: 0, ageKills: 0,
      runElapsed: 0, runHighestAge: "stone", runKills: 0,
      px: 0, py: 0, vx: 0, vy: 0, dashT: 0, dashCd: 0, iframe: 0,
      build: defaultEffectTarget(),
      level: 1, xp: 0, xpNext: xpForLevel(1), knowledgeTotal: 0,
      pendingLevels: 0, draftOpen: false, draftOffers: [],
      owned: [], ownedTags: [], breakthroughs: [],
      weaponStage: { kinetic: 0, energy: 0, defense: 0, field: 0 },
      reservedTech: "", rerolls: 1, pinnedTarget: "",
      originId, expansionFamily: "",
      originMechanic: {
        hunterMarks: [], hunterTrophies: [],
        fabricationModules: [], fabricationCharges: 0,
        harmonicCharge: 0, lastResonanceFamily: "",
        bastionLinks: [],
      },
      legacies: [],
      poiFamiliesClaimed: [],
      draftContext: "level",
      elitesAge: 0, raidsSurvived: 0, signalSecured: false,
      missionDoneCache: false,
      territories: [], raid: null, lastRaidAt: 0,
      logistics: 0,
      maxLogistics,
      squad: Array.from({ length: SQUAD_MAX }, (_, i) => ({
        active: i < SQUAD_BASE_CAP, x: (i === 0 ? -30 : 30), y: 0,
        hp: SQUAD_HP, maxHp: SQUAD_HP, dmg: SQUAD_DMG, cd: 0, inv: 0,
      })),
      squadMode: "follow" as SquadMode, focusX: 0, focusY: 0,
      abilityCd: 0, overdriveT: 0,
      history: [],
      recentDraftOffers: [],
      spawnT: 0, eliteT: 60, mineT: 0, auraT: 0,
      weaponCd: { kinetic: 0, energy: 0, defense: 0, field: 0 },
      guardianAng: 0, orbitAng: 0, beamFlash: null,
      enemies: Array.from({ length: MAX_ENEMIES }, () => ({
        active: false, x: 0, y: 0, hp: 1, maxHp: 1, shield: 0,
        family: "chaser" as EnemyFamily, speed: 100, dmg: 5, radius: 12, xp: 1,
        elite: false, affix: "" as EliteAffix | "", flash: 0, shootT: 0, boss: false, hitCd: 0,
        siege: false,
      })),
      projs: Array.from({ length: MAX_PROJ }, () => ({
        active: false, x: 0, y: 0, vx: 0, vy: 0, dmg: 1, radius: 5,
        life: 0, friendly: true, color: 0xffffff, src: "",
      })),
      pickups: Array.from({ length: MAX_PICKUP }, () => ({ active: false, x: 0, y: 0, value: 1 })),
      mines: Array.from({ length: MAX_MINES }, () => ({ active: false, x: 0, y: 0, dmg: 10, radius: 60, life: 0 })),
      chunksWorld: [], poisWorld: [],
      bossSpawned: false, ascendReady: false, bossIndex: -1, stronghold: null, over: false,
      stats: { kills: 0, elites: 0, bosses: 0, techsTaken: 0, chunksTotal: 0, poisTotal: 0, knowledgeEarned: 0 },
      damageBySource: {}, topDamageSource: "", highestAge: "stone",
      worldDamageBySource: {}, worldTopDamageSource: "", worldBreakthroughsEarned: [],
      worldLaws,
    };
  }

  /** Ascend to a child world as legacy prestige (ADR-0006 Decision 5).
   *  World-build progression resets (level 1, fresh tech/weapons/origin);
   *  run totals + bounded legacies persist. Requires a valid legacy + origin. */
  ascend(legacyId: string, originId: string): SimEvent[] {
    const s = this.state;
    const ev: SimEvent[] = [];
    if (!s.ascendReady || s.over) return ev;
    const offers = this.legacyOffers();
    const legacy = offers.find((d) => d.id === legacyId);
    const origin = ORIGINS.find((o) => o.id === originId);
    if (!legacy || !origin) return ev;
    // P1-05: a pure affinity Legacy must function in the chosen Origin —
    // the new World's origin pair (expansion comes later) must include it.
    if (legacy.requiredFamily && !(origin.families as readonly string[]).includes(legacy.requiredFamily)) {
      return ev;
    }
    const keep = {
      stats: { ...s.stats, chunksTotal: s.stats.chunksTotal, poisTotal: s.stats.poisTotal },
      dmg: { ...s.damageBySource }, top: s.topDamageSource, high: s.highestAge,
      // RUN-level chronicle data — a new world resets WORLD state, never these.
      runElapsed: s.runElapsed, runHighestAge: s.runHighestAge, runKills: s.runKills,
    };
    const asc = s.ascension + 1;
    const fresh = this.freshWorldState(this.masterSeed, asc, origin.id);
    // Restore run-persistent data.
    fresh.stats = keep.stats;
    fresh.damageBySource = keep.dmg; fresh.topDamageSource = keep.top;
    fresh.highestAge = keep.high;
    fresh.runElapsed = keep.runElapsed;
    fresh.runHighestAge = keep.runHighestAge;
    fresh.runKills = keep.runKills;
    // Build history is run evidence — a new world extends it, never wipes it.
    fresh.history = s.history;
    // Bounded legacy inheritance (FIFO cap), effects applied to the fresh build.
    fresh.legacies = [...s.legacies, legacy.id].slice(-MAX_LEGACIES);
    for (const lid of fresh.legacies) {
      const def = legacyDefById(lid);
      if (!def) continue;
      for (const e of def.effects) applyTechEffect(fresh.build, e);
      if (def.breakthroughId && !fresh.breakthroughs.includes(def.breakthroughId)) {
        fresh.breakthroughs.push(def.breakthroughId);
      }
    }
    fresh.build.hp = fresh.build.maxHp; // full repair on arrival
    Object.assign(s, fresh);
    // COMPLETELY fresh child-world streams (restored in place — the reference
    // never changes, so no old RNG object can leak into the new world).
    const child = initRunRng(s.worldSeed);
    (Object.keys(child) as (keyof RunRngStreams)[]).forEach((k) => {
      this.streams[k].restore(child[k].snapshot());
    });
    this.graph = generateTechGraph(s.worldSeed, asc).nodes;
    this.grantNode("spine-tools");
    this.logHistory("ascension", `world-${asc}`);
    ev.push({ type: "legacy_granted", id: legacy.id });
    ev.push({ type: "ascended", worldSeed: s.worldSeed, ascension: asc });
    return ev;
  }

  /** Deterministic Legacy candidates from CURRENT-WORLD achievements (no RNG). */
  legacyOffers(): LegacyDef[] {
    const s = this.state;
    return legacyCandidates({ breakthroughs: s.worldBreakthroughsEarned, topDamageSource: s.worldTopDamageSource, ascension: s.ascension });
  }

  hash(): string {
    return stateHash(this.state, this.streamSnapshots());
  }

  /** RNG snapshots for the canonical contract (non-consuming). */
  streamSnapshots(): RngSnapshots {
    return snapshotStreams(this.streams);
  }

  /** Full canonical snapshot string — tests compare these directly. */
  snapshot(): string {
    return canonicalSnapshot(this.state, this.streamSnapshots());
  }

  /**
   * E2E/dev hook — instantly kills the player (death-flow testing).
   * Never called by gameplay UI or any production path.
   */
  e2eKillPlayer(): SimEvent[] {
    const ev: SimEvent[] = [];
    this.state.build.hp = 1;
    this.state.iframe = 0;
    this.hurtPlayer(99999, ev);
    return ev;
  }

  /**
   * Test/dev hook — damages a pooled enemy directly (affix/reward testing).
   * Never called by gameplay UI or any production path.
   */
  debugDamageEnemy(index: number, dmg: number): SimEvent[] {
    const ev: SimEvent[] = [];
    const e = this.state.enemies[index];
    if (e) this.hurtEnemy(e, dmg, "debug", ev);
    return ev;
  }

  /** Current spatial bucket count (F3 diagnostics, non-canonical). */
  get spatialBucketCount(): number {
    return this.buckets.size;
  }

  // ------------------------------------------------------------------- draft
  private availableNodes(): TechNode[] {
    const s = this.state;
    const owned = new Set(s.owned);
    const active = new Set(activeFamilies(s.originId, s.expansionFamily));
    return this.graph.filter((n) => {
      if (owned.has(n.id)) return false;
      if (!n.prerequisites.every((p) => owned.has(p))) return false;
      if (n.exclusions.some((e) => owned.has(e))) return false;
      // Origin gating (ADR-0006): a node whose family-bound effect would do
      // nothing for this world's active families is never offered.
      for (const e of n.effects) {
        if (e.family && !active.has(e.family)) return false;
      }
      const rank = AGES.indexOf(n.age);
      return rank <= s.ageIndex + 1;
    });
  }

  /** Read-only tech graph for the Tech Map UI (same nodes the sim drafts). */
  techGraph(): readonly TechNode[] {
    return this.graph;
  }

  /**
   * Owned/available state per node, computed by the SIMULATION (the Tech Map
   * renders this verbatim, so UI display and draft gating match by construction).
   */
  nodeStates(): Array<{ id: string; owned: boolean; available: boolean }> {
    const avail = new Set(this.availableNodes().map((n) => n.id));
    const owned = new Set(this.state.owned);
    return this.graph.map((n) => ({ id: n.id, owned: owned.has(n.id), available: avail.has(n.id) }));
  }

  /**
   * Node ids on the pinned build path: the target plus its transitive unowned
   * prerequisites (tech target), or unowned nodes carrying tags a pinned
   * breakthrough still needs. Bounded draft weighting only — never a guarantee.
   */
  pinnedPathIds(): Set<string> {
    const s = this.state;
    const out = new Set<string>();
    const t = s.pinnedTarget;
    if (t === "") return out;
    const byId = new Map(this.graph.map((n) => [n.id, n]));
    const node = byId.get(t);
    if (node) {
      const stack: TechNode[] = [node];
      while (stack.length > 0) {
        const n = stack.pop() as TechNode;
        if (out.has(n.id) || s.owned.includes(n.id)) continue;
        out.add(n.id);
        for (const p of n.prerequisites) {
          const pn = byId.get(p);
          if (pn) stack.push(pn);
        }
      }
      return out;
    }
    const b = BREAKTHROUGHS.find((x) => x.id === t);
    if (!b) return out;
    const ownedTags = new Set(s.ownedTags);
    const missing = b.requires.filter((tag) => !ownedTags.has(tag));
    for (const n of this.graph) {
      if (s.owned.includes(n.id)) continue;
      if (n.tags.some((tag) => missing.includes(tag)) || n.synergyTags.some((tag) => missing.includes(tag))) {
        out.add(n.id);
      }
    }
    return out;
  }

  /** Bounded history log for the Chronicle build-history view (FIFO cap). */
  private logHistory(kind: string, label: string): void {
    const s = this.state;
    s.history.push({ t: Math.round(s.elapsed * 10) / 10, kind, label });
    while (s.history.length > 64) s.history.shift();
  }

  /** Count of generated (non-fallback) options currently available — frontier test hook. */
  generatedOptionsCount(): number {
    return this.availableNodes().length;
  }

  private buildDraft(context: "level" | "poi", filter?: (n: TechNode) => boolean): void {
    const s = this.state;
    const result = generateOffers({
      sim: {
        owned: s.owned,
        ownedTags: s.ownedTags,
        breakthroughs: s.breakthroughs,
        ageIndex: s.ageIndex,
        age: AGES[s.ageIndex],
        originId: s.originId,
        expansionFamily: s.expansionFamily,
        pinnedTarget: s.pinnedTarget,
        draftChoices: s.draftOffers.map(o => o.nodeId),
        reservedTech: s.reservedTech,
        history: s.history,
        techGraph: () => this.graph,
      },
      laws: s.worldLaws,
      activeFamilies: new Set(activeFamilies(s.originId, s.expansionFamily)),
      recentOffers: s.recentDraftOffers,
      recentPicks: s.history.filter(h => h.kind === "tech_selected").map(h => h.label),
      rng: this.streams.draft,
    }, undefined, 3, filter);
    
    // Convert OfferCandidate to DraftOffer with quality/modifiers applied
    let offers = result.map((c) => this.convertToDraftOffer(c.node, c.quality, c.score));
    
    // Reserved card reappears in the next compatible draft (replaces the
    // weakest pick; never a 4th card, never a fallback slot steal).
    if (s.reservedTech !== "" && !offers.some((o) => o.nodeId === s.reservedTech)) {
      const pool = this.availableNodes();
      const poolIds = new Set(pool.map((n) => n.id));
      if (poolIds.has(s.reservedTech)) {
        const node = pool.find((n) => n.id === s.reservedTech);
        if (node && offers.length > 0) {
          // Create DraftOffer for reserved tech with default quality
          offers[offers.length - 1] = this.convertToDraftOffer(node, "COMMON", 0);
        }
      }
    }
    
    // Emergency fallback only (should be rare with the wide-frontier graph).
    const fb = fallbackCards(s.level);
    while (offers.length < 3) {
      const fbNode = fb[offers.length] as TechNode;
      offers.push(this.convertToDraftOffer(fbNode, "COMMON", 0));
    }
    
    s.draftOffers = offers;
    s.recentDraftOffers.push(offers.map(o => o.nodeId));
    while (s.recentDraftOffers.length > 5) s.recentDraftOffers.shift();
    s.draftOpen = true;
    s.draftContext = context;
  }

  /**
   * Convert a TechNode + quality + score into a canonical DraftOffer.
   * Quality and modifiers affect the effective effects presented to the player.
   */
  private convertToDraftOffer(
    node: TechNode,
    quality: "COMMON" | "UNCOMMON" | "RARE" | "MYTHIC",
    score: number
  ): DraftOffer {
    const qualityMods: Record<string, number> = {
      COMMON: 1.0,
      UNCOMMON: 1.25,
      RARE: 1.5,
      MYTHIC: 2.0,
    };
    
    // Sample modifiers based on quality (deterministic from nodeId + quality)
    const modifierPool: TechModifierId[] = [
      "overcharged", "extended", "efficient", "volatile",
      "piercing", "splash", "homing", "chain",
      "reinforced", "regenerating", "warded", "adaptive",
      "swift", "silent", "massive", "precise",
    ];
    
    // Deterministic modifier selection
    const modCount = quality === "MYTHIC" ? 3 : quality === "RARE" ? 2 : quality === "UNCOMMON" ? 1 : 0;
    const modifierIds: TechModifierId[] = [];
    for (let i = 0; i < modCount; i++) {
      const idx = (fnv1a32(`${node.id}:${quality}:${i}`) >>> 0) % modifierPool.length;
      modifierIds.push(modifierPool[idx]);
    }
    
    // Apply quality multiplier to effect values
    const mult = qualityMods[quality];
    const effectiveEffects = node.effects.map((e) => ({
      ...e,
      value: typeof e.value === "number" ? e.value * mult : e.value,
    }));
    
    // Score breakdown for telemetry/debug
    const scoreBreakdown = {
      base: Math.log(Math.max(1, node.weight)),
      origin: 0,
      synergy: 0,
      worldLaw: 0,
      novelty: 0,
      penalty: 0,
      qualityMult: mult,
    };
    
    return {
      nodeId: node.id,
      quality,
      modifierIds,
      effectiveEffects,
      scoreBreakdown,
    };
  }

  /**
   * Filtered draft opener shared by POI discovery (ADR-0006 Decision 3).
   * No modal stacking (caller checks draftOpen).
   */
  private openFilteredDraft(filter: (n: TechNode) => boolean, ev: SimEvent[]): void {
    const s = this.state;
    s.pendingLevels++;
    this.buildDraft("poi", filter);
    ev.push({ type: "draft_opened", context: "poi" });
  }

  /**
   * Resolve a TechNode by ID from either the main graph or fallback cards.
   * Fallback nodes are not in the graph but are valid TechNodes with proper effects.
   */
  private resolveTechNode(nodeId: string): TechNode | undefined {
    // First check the main tech graph
    const graphNode = this.graph.find((n) => n.id === nodeId);
    if (graphNode) return graphNode;
    
    // Check fallback cards (level-based, but we can infer from nodeId pattern)
    // Fallback IDs are like "fb-dmg-1", "fb-hp-2", etc.
    const fbMatch = nodeId.match(/^fb-(dmg|hp|spd)-(\d+)$/);
    if (fbMatch) {
      const level = parseInt(fbMatch[2], 10);
      const fbCards = fallbackCards(level);
      return fbCards.find((f) => f.id === nodeId);
    }
    
    return undefined;
  }

  /** Apply a draft pick. Returns events (tech_selected, breakthrough*, maybe draft_opened). */
  chooseDraft(i: number): SimEvent[] {
    const s = this.state;
    const ev: SimEvent[] = [];
    if (!s.draftOpen || s.over) return ev;
    const offer = s.draftOffers[i];
    if (!offer) return ev;
    s.draftOpen = false;
    s.draftOffers = [];
    s.draftContext = "level";
    
    // Resolve the TechNode (handles both graph nodes and fallback nodes)
    const node = this.resolveTechNode(offer.nodeId);
    if (!node) return ev;
    
    // Bookkeeping: owned, tags, synergyTags, weaponEvolve (same as grantNode but without base effects)
    const first = !s.owned.includes(node.id);
    if (first) {
      s.owned.push(node.id);
      this.logHistory("tech", node.id);
    }
    for (const tg of node.tags) if (!s.ownedTags.includes(tg)) s.ownedTags.push(tg);
    for (const st of node.synergyTags) if (!s.ownedTags.includes(st)) s.ownedTags.push(st);
    for (const e of node.effects) {
      if (e.kind === "weaponEvolve") {
        const active = new Set(activeFamilies(s.originId, s.expansionFamily));
        for (const fam of (Object.keys(s.weaponStage) as WeaponFamily[])) {
          if (active.has(fam)) s.weaponStage[fam] = 5;
        }
      }
    }
    
    if (s.reservedTech === node.id) s.reservedTech = "";
    s.stats.techsTaken++;
    ev.push({ 
      type: "tech_selected", 
      techId: node.id,
      quality: offer.quality,
      modifierIds: offer.modifierIds,
    });
    
    // Apply effective effects (with quality/modifiers already applied) EXACTLY ONCE
    for (const e of offer.effectiveEffects) applyTechEffect(s.build, e);
    
    const ownedTags = new Set(s.ownedTags);
    const unlocked = new Set(s.breakthroughs);
    for (const b of checkBreakthroughs(ownedTags, unlocked)) {
      s.breakthroughs.push(b.id);
      if (!s.worldBreakthroughsEarned.includes(b.id)) s.worldBreakthroughsEarned.push(b.id);
      for (const e of b.effects) applyTechEffect(s.build, e);
      this.logHistory("breakthrough", b.id);
      ev.push({ type: "breakthrough", id: b.id });
    }
    s.pendingLevels--;
    if (s.pendingLevels > 0 && !s.over) {
      this.buildDraft("level");
      ev.push({ type: "draft_opened", context: "level" });
    }
    return ev;
  }

  /**
   * RESERVE one unselected card for the next compatible draft (one slot).
   * Fallback emergency cards cannot be reserved. Direct UI call (paused).
   */
  reserveCard(i: number): SimEvent[] {
    const s = this.state;
    const ev: SimEvent[] = [];
    if (!s.draftOpen || s.over) return ev;
    const offer = s.draftOffers[i];
    if (!offer || offer.nodeId.startsWith("fb-")) return ev;
    s.reservedTech = offer.nodeId;
    ev.push({ type: "draft_reserved", techId: offer.nodeId });
    return ev;
  }

  /**
   * REROLL the open draft (bounded: 1 per age, reset on age advance).
   * Deterministic meaningful-change contract (v0.23.1): if an alternative
   * exists, the redraw MUST change >= 1 visible non-reserved card. The
   * compatible reserved card stays put by design and never counts as a
   * change. Mechanism: normal weighted rebuild first (pin weighting and
   * variety preserved); if the rebuild shows nothing new, the weakest
   * non-reserved pick is force-swapped with the best unseen pool candidate
   * (weight desc, id asc — no stream, fully deterministic). If NO
   * alternative exists, the reroll is NOT consumed: zero mutation, zero
   * stream consumed, and an explicit `draft_reroll_unavailable` event is
   * returned instead. Same seed + same decisions always yields the same
   * result on every path.
   */
  rerollDraft(): SimEvent[] {
    const s = this.state;
    const ev: SimEvent[] = [];
    if (!s.draftOpen || s.over || s.rerolls <= 0) return ev;
    const prevOffers = [...s.draftOffers];
    const prevNR = new Set(
      prevOffers.filter((o) => !o.nodeId.startsWith("fb-") && o.nodeId !== s.reservedTech).map((o) => o.nodeId),
    );
    // Alternative check mirrors the open pool buildDraft() draws from
    // (reroll intentionally drops POI filters, as before — same pool).
    const prevShown = new Set(prevOffers.map((o) => o.nodeId));
    const candidates = this.availableNodes().filter(
      (n) => n.id !== s.reservedTech && !prevShown.has(n.id),
    );
    if (candidates.length === 0) {
      ev.push({ type: "draft_reroll_unavailable" });
      return ev;
    }
    s.rerolls--;
    this.buildDraft(s.draftContext);
    const postShown = new Set(s.draftOffers.map((o) => o.nodeId));
    let cur = s.draftOffers.filter((o) => !o.nodeId.startsWith("fb-") && o.nodeId !== s.reservedTech);
    if (!cur.some((o) => !prevNR.has(o.nodeId))) {
      // Redraw showed nothing new — force the meaningful change.
      const ordered = [...candidates].sort((a, b) => b.weight - a.weight || (a.id < b.id ? -1 : 1));
      const swapIn = ordered.find((n) => !postShown.has(n.id));
      // swapIn always exists here (a candidate outside the previous screen
      // that the rebuild did not surface); the guard keeps it total anyway.
      if (swapIn && !postShown.has(swapIn.id)) {
        let idx = -1;
        for (let i = s.draftOffers.length - 1; i >= 0; i--) {
          const o = s.draftOffers[i];
          if (o && !o.nodeId.startsWith("fb-") && o.nodeId !== s.reservedTech) {
            idx = i;
            break;
          }
        }
        // Replace with a new DraftOffer for the swapIn node
        s.draftOffers[idx < 0 ? s.draftOffers.length - 1 : idx] = this.convertToDraftOffer(swapIn, "COMMON", 0);
        cur = s.draftOffers.filter((o) => !o.nodeId.startsWith("fb-") && o.nodeId !== s.reservedTech);
      }
    }
    const newIds = cur.map((o) => o.nodeId);
    const changed = newIds.filter((id) => !prevNR.has(id)).length;
    this.logHistory("reroll", s.draftContext);
    ev.push({
      type: "draft_rerolled", rerollsLeft: s.rerolls,
      prevIds: [...prevNR], newIds, changed,
    });
    return ev;
  }

  /**
   * SKIP the open draft: no tech, small bounded knowledge consolation.
   * Queued drafts still chain (pendingLevels preserved).
   */
  skipDraft(): SimEvent[] {
    const s = this.state;
    const ev: SimEvent[] = [];
    if (!s.draftOpen || s.over) return ev;
    s.draftOpen = false;
    s.draftOffers = [];
    s.draftContext = "level";
    s.pendingLevels--;
    this.gainKnowledge(10 + s.level * 2, "skip", ev);
    this.logHistory("skip", `level-${s.level}`);
    ev.push({ type: "draft_skipped" });
    if (s.pendingLevels > 0 && !s.over) {
      this.buildDraft("level");
      ev.push({ type: "draft_opened", context: "level" });
    }
    return ev;
  }

  /**
   * PIN a build-path target (tech id or breakthrough id). Empty string clears.
   * Canonical: pinned weighting shapes future drafts deterministically.
   */
  pinTarget(id: string): SimEvent[] {
    const s = this.state;
    const ev: SimEvent[] = [];
    if (s.over) return ev;
    if (id === "") {
      s.pinnedTarget = "";
      return ev;
    }
    const isTech = this.graph.some((n) => n.id === id);
    const isBreakthrough = BREAKTHROUGHS.some((b) => b.id === id);
    if (!isTech && !isBreakthrough) return ev;
    s.pinnedTarget = id;
    ev.push({ type: "pin_set", target: id });
    return ev;
  }

  /**
   * WORLD EXPANSION choice (ADR-0006 Decision 1): unlock exactly one of the
   * two inactive families. Valid only once per world, only a locked family.
   */
  chooseExpansion(fam: WeaponFamily): SimEvent[] {
    const s = this.state;
    const ev: SimEvent[] = [];
    if (s.over || s.expansionFamily !== "") return ev;
    if (!lockedFamilies(s.originId, "").includes(fam)) return ev;
    s.expansionFamily = fam;
    this.logHistory("expansion", fam);
    ev.push({ type: "expansion_unlocked", family: fam });
    return ev;
  }

  // ------------------------------------------ stronghold (derived endgame)
  /**
   * Deterministic ENEMY STRONGHOLD site (§23): a seed-derived bearing at
   * fixed range, snapped to the nearest major POI (megasite/worldtree/
   * signal) when one exists nearby, else the raw point. Pure function of
   * worldSeed + static worldgen — chunk/POI generation is untouched.
   */
  private revealStronghold(ev: SimEvent[]): void {
    const s = this.state;
    if (s.stronghold?.revealed) return;
    const h = fnv1a32(`${s.worldSeed}::stronghold`);
    const ang = (h % 360) * (Math.PI / 180);
    const rawX = Math.cos(ang) * 6000;
    const rawY = Math.sin(ang) * 6000;
    let bx = rawX;
    let by = rawY;
    let bd = 1600;
    const { cx, cy } = worldToChunk(rawX, rawY);
    for (let ox = -3; ox <= 3; ox++) {
      for (let oy = -3; oy <= 3; oy++) {
        const desc = this.chunks.get(s.worldSeed, s.worldNonce, cx + ox, cy + oy);
        for (const poi of desc.poi) {
          if (poi.type !== "megasite" && poi.type !== "worldtree" && poi.type !== "signal") continue;
          const d = Math.hypot(poi.wx - rawX, poi.wy - rawY);
          if (d < bd) {
            bd = d;
            bx = poi.wx;
            by = poi.wy;
          }
        }
      }
    }
    s.stronghold = { x: Math.round(bx), y: Math.round(by), revealed: true };
    this.logHistory("stronghold", "revealed");
    ev.push({ type: "stronghold_revealed", x: s.stronghold.x, y: s.stronghold.y });
  }

  // ------------------------------------------------- territory & outposts
  /**
   * POIs the player could claim RIGHT NOW (UI CLAIM buttons poll this).
   * Discovered + unclaimed + in reach. `clear` reports the threat-free check.
   * Uses the last rebuilt spatial index (same freshness as weapon targeting).
   */
  claimablePOIs(): Array<{ poiId: string; poiType: POIType; x: number; y: number; dist: number; clear: boolean }> {
    const s = this.state;
    const out: Array<{ poiId: string; poiType: POIType; x: number; y: number; dist: number; clear: boolean }> = [];
    if (s.over) return out;
    const claimed = new Set(s.territories.map((t) => t.poiId));
    const { cx, cy } = worldToChunk(s.px, s.py);
    for (let ox = -2; ox <= 2; ox++) {
      for (let oy = -2; oy <= 2; oy++) {
        const desc = this.chunks.get(s.worldSeed, s.worldNonce, cx + ox, cy + oy);
        for (const poi of desc.poi) {
          if (!s.poisWorld.includes(poi.id) || claimed.has(poi.id)) continue;
          const dist = Math.hypot(poi.wx - s.px, poi.wy - s.py);
          if (dist > CLAIM_REACH_RADIUS) continue;
          this.scratch.length = 0;
          const foes = this.queryRadius(poi.wx, poi.wy, CLAIM_CLEAR_RADIUS, this.scratch);
          out.push({ poiId: poi.id, poiType: poi.type, x: poi.wx, y: poi.wy, dist, clear: foes.length === 0 });
        }
      }
    }
    out.sort((a, b) => a.dist - b.dist);
    return out;
  }

  /**
   * CLAIM a cleared POI as civilization territory (one claim per POI id).
   * Direct UI call. Fails silently (returns no events) unless every
   * precondition holds — the UI disables the button via claimablePOIs().
   * v0.24: territory claim is free; logistics cost applies when setting spec.
   * Signal first-claim exemption still applies (v0.23.1 no-softlock).
   */
  claimTerritory(poiId: string): SimEvent[] {
    const s = this.state;
    const ev: SimEvent[] = [];
    if (s.over) return ev;
    if (s.territories.some((t) => t.poiId === poiId)) return ev;
    if (!s.poisWorld.includes(poiId)) return ev;
    const cand = this.claimablePOIs().find((c) => c.poiId === poiId);
    if (!cand || !cand.clear) return ev;
    // Signal first-claim exemption (v0.23.1): always allow first Signal claim.
    // Other claims are gated by logistics at spec assignment (setOutpostSpec).
    // No hard limit on claim count; logistics is the constraint.
    s.territories.push({
      poiId, poiType: cand.poiType, x: cand.x, y: cand.y,
      spec: "", tier: 1, hp: OUTPOST_MAXHP, maxHp: OUTPOST_MAXHP,
      disabled: false, heldSince: s.elapsed, repairT: 0, garrisoned: false,
    });
    // First claim starts the raid clock (grace window, not instant pressure).
    if (s.lastRaidAt === 0) s.lastRaidAt = s.elapsed;
    // signalSecured is set in setOutpostSpec after successful specialization
    this.logHistory("claim", cand.poiType);
    ev.push({ type: "territory_claimed", poiId, poiType: cand.poiType });
    return ev;
  }

  /** Choose the ONE specialization for a fresh claim. Irreversible.
   * v0.24: consumes Logistics points based on spec + tier. */
  setOutpostSpec(poiId: string, spec: OutpostSpec): SimEvent[] {
    const s = this.state;
    const ev: SimEvent[] = [];
    if (s.over) return ev;
    const t = territoryById(s.territories, poiId);
    if (!t || t.spec !== "" || t.disabled) return ev;
    
    // Check logistics cost (tier 1)
    const cost = calculateLogisticsCost(spec, 1, s.ageIndex);
    if (s.logistics + cost > s.maxLogistics) {
      // Signal first-claim exemption (v0.23.1 no-softlock):
      // Allow first Signal specialization even if logistics full.
      // Check if this is the first Signal territory being specialized.
      const hasSignalSpecialized = s.territories.some(
        (terr) => terr.poiType === "signal" && terr.spec !== ""
      );
      const isFirstSignal = t.poiType === "signal" && !hasSignalSpecialized;
      if (!isFirstSignal) return ev;
    }
    
    t.spec = spec;
    s.logistics += cost;
    if (spec === "military") this.reinforceSquad();
    // Mark signal as secured AFTER successful specialization (for mission tracking)
    if (t.poiType === "signal") s.signalSecured = true;
    this.logHistory("outpost", `${spec}@${t.poiType}`);
    ev.push({ type: "outpost_spec", poiId, spec });
    return ev;
  }

  /**
   * Tier 2 after holding long enough with a chosen spec, PLUS a Knowledge
   * cost (v0.23.1 opportunity cost) AND logistics cost (v0.24).
   * All preconditions checked BEFORE any mutation.
   */
  upgradeOutpost(poiId: string): SimEvent[] {
    const s = this.state;
    const ev: SimEvent[] = [];
    if (s.over) return ev;
    const t = territoryById(s.territories, poiId);
    if (!t || t.disabled || t.spec === "" || t.tier !== 1) return ev;
    if (s.elapsed - t.heldSince < TIER2_HOLD_SEC) return ev;
    const knowledgeCost = outpostUpgradeCost(s.ageIndex);
    if (s.knowledgeTotal < knowledgeCost) return ev;
    const logisticsCost = calculateLogisticsCost(t.spec, 2, s.ageIndex) - calculateLogisticsCost(t.spec, 1, s.ageIndex);
    if (s.logistics + logisticsCost > s.maxLogistics) return ev;
    s.knowledgeTotal -= knowledgeCost;
    s.logistics += logisticsCost;
    t.tier = 2;
    t.hp = t.maxHp;
    this.logHistory("upgrade", `${t.spec}@${t.poiType}`);
    ev.push({ type: "outpost_upgraded", poiId });
    return ev;
  }

  /**
   * Garrison/Recall an outpost.
   * Garrisoning removes a mobile squad slot but activates the outpost's benefit.
   * Recalling restores the mobile slot and deactivates the benefit.
   */
  garrisonOutpost(poiId: string): SimEvent[] {
    const s = this.state;
    const ev: SimEvent[] = [];
    if (s.over) return ev;
    const t = territoryById(s.territories, poiId);
    if (!t || t.disabled || t.spec === "") return ev;
    
    const activeMobile = s.squad.filter(a => a.active).length;
    const maxSlots = squadCap(militaryBonusSlots(activeTerritories(s.territories)));
    
    if (!t.garrisoned) {
      // Garrison: need at least 1 mobile squad remaining
      if (activeMobile - 1 < 1) return ev;
      t.garrisoned = true;
      // Deactivate one mobile squad
      for (const a of s.squad) {
        if (a.active) {
          a.active = false;
          break;
        }
      }
      this.logHistory("garrison", `on@${t.poiType}`);
      ev.push({ type: "outpost_garrisoned", poiId, spec: t.spec });
    } else {
      // Recall
      t.garrisoned = false;
      // Try to activate a reserve squad if under cap
      if (activeMobile < maxSlots) {
        for (const a of s.squad) {
          if (!a.active) {
            a.active = true;
            a.hp = a.maxHp;
            a.x = s.px - 30;
            a.y = s.py;
            break;
          }
        }
      }
      this.logHistory("garrison", `off@${t.poiType}`);
      ev.push({ type: "outpost_recalled", poiId, spec: t.spec });
    }
    return ev;
  }

  /** Activate reserve allies up to the military-bonus cap. */
  private reinforceSquad(): void {
    const s = this.state;
    const cap = squadCap(militaryBonusSlots(activeTerritories(s.territories)));
    let active = 0;
    for (const a of s.squad) {
      if (a.active) { active++; continue; }
      if (active >= cap) break;
      a.active = true;
      a.hp = a.maxHp;
      a.x = s.px - 30;
      a.y = s.py;
      active++;
    }
  }

  // ------------------------------------------------------------------ raids
  /** Deterministic raid scheduler (event stream picks the target). */
  private updateRaid(dt: number, ev: SimEvent[]): void {
    const s = this.state;
    const targets = s.territories.filter((t) => !t.disabled && t.spec !== "");
    if (!s.raid) {
      if (targets.length > 0 && s.elapsed - s.lastRaidAt >= RAID_INTERVAL) {
        const pick = targets[this.streams.event.nextInt(0, targets.length)] as (typeof targets)[number];
        s.raid = { poiId: pick.poiId, tMinus: RAID_WARN_SEC, landed: false };
        ev.push({ type: "raid_incoming", poiId: pick.poiId, seconds: RAID_WARN_SEC });
      }
      return;
    }
    const t = territoryById(s.territories, s.raid.poiId);
    if (!t || t.disabled) {
      // Target gone meanwhile: raiders dissolve into the normal hunt.
      for (const e of s.enemies) if (e.active && e.siege) e.siege = false;
      s.raid = null;
      return;
    }
    if (!s.raid.landed) {
      s.raid.tMinus -= dt;
      if (s.raid.tMinus > 0) return;
      s.raid.landed = true;
      const n = RAID_SIZE_BASE + s.ascension;
      for (let i = 0; i < n; i++) {
        const ang = this.streams.event.nextFloat() * Math.PI * 2;
        const e = this.spawnEnemyAt("chaser", false, t.x + Math.cos(ang) * 500, t.y + Math.sin(ang) * 500, ev);
        if (e) e.siege = true;
      }
      return;
    }
    // Repelled when no siege unit remains.
    let siegeAlive = false;
    for (const e of s.enemies) {
      if (e.active && e.siege) { siegeAlive = true; break; }
    }
    if (!siegeAlive) {
      const poiId = s.raid.poiId;
      s.raid = null;
      s.lastRaidAt = s.elapsed;
      s.raidsSurvived++;
      this.gainKnowledge(100, "raid", ev);
      this.logHistory("raid", "repelled");
      ev.push({ type: "raid_repelled", poiId });
    }
  }

  /** Spawn at an explicit world position (siege waves); player-relative otherwise. */
  private spawnEnemyAt(family: EnemyFamily, elite: boolean, x: number, y: number, ev: SimEvent[]): SimEnemy | null {
    const s = this.state;
    const e = this.allocEnemy();
    if (!e) return null;
    const dx = x - s.px;
    const dy = y - s.py;
    const spawned = this.spawnEnemy(family, elite, false, Math.atan2(dy, dx), Math.max(1, Math.hypot(dx, dy)), ev);
    return spawned;
  }

  /** Outpost destroyed under siege: disabled, raid ends, siege dissolves. */
  private loseOutpost(t: { poiId: string }, ev: SimEvent[]): void {
    const s = this.state;
    const terr = territoryById(s.territories, t.poiId);
    if (!terr || terr.disabled) return;
    terr.disabled = true;
    terr.hp = 0;
    terr.repairT = 0;
    for (const e of s.enemies) if (e.active && e.siege) e.siege = false;
    s.raid = null;
    s.lastRaidAt = s.elapsed;
    this.logHistory("outpost-lost", terr.poiType);
    ev.push({ type: "outpost_lost", poiId: terr.poiId });
  }

  /** Territory upkeep: repair presence + economy aura (called every step). */
  private updateTerritories(dt: number, ev: SimEvent[]): void {
    const s = this.state;
    const b = s.build;
    const regen = economyRegenAt(activeTerritories(s.territories), s.px, s.py);
    if (regen > 0) b.hp = Math.min(b.maxHp, b.hp + regen * dt);
    for (const t of s.territories) {
      if (!t.disabled) continue;
      if (Math.hypot(t.x - s.px, t.y - s.py) > CLAIM_REACH_RADIUS) {
        t.repairT = 0;
        continue;
      }
      t.repairT += dt;
      if (t.repairT >= REPAIR_NEED) {
        t.disabled = false;
        t.hp = t.maxHp * 0.5;
        t.repairT = 0;
        this.logHistory("outpost-repaired", t.poiType);
        ev.push({ type: "outpost_repaired", poiId: t.poiId });
      }
    }
  }

  // ------------------------------------------------------------------- squad
  /** Direct UI command: rally / focus / hold. Focus aims at the nearest foe. */
  setSquadMode(mode: SquadMode): SimEvent[] {
    const s = this.state;
    const ev: SimEvent[] = [];
    if (s.over) return ev;
    s.squadMode = mode;
    if (mode === "focus") {
      const tgt = this.nearestEnemy(s.px, s.py, 700);
      s.focusX = tgt ? tgt.x : s.px;
      s.focusY = tgt ? tgt.y : s.py;
    }
    ev.push({ type: "squad_command", mode });
    return ev;
  }

  /** Origin active ability (F key). Bounded cooldown, deterministic effects. */
  tryAbility(): SimEvent[] {
    const s = this.state;
    const b = s.build;
    const ev: SimEvent[] = [];
    if (s.over || s.abilityCd > 0) return ev;
    const abil = ORIGIN_ABILITY[originById(s.originId).id];
    s.abilityCd = abil.cooldown;
    if (abil.id === "volley") {
      for (let i = 0; i < VOLLEY_COUNT; i++) {
        const a = (i * Math.PI * 2) / VOLLEY_COUNT;
        this.fireProjectile(s.px, s.py, s.px + Math.cos(a) * 100, s.py + Math.sin(a) * 100,
          480, VOLLEY_DMG * b.damageMul, 0xffc93c, "ability", true, 6);
      }
    } else if (abil.id === "overdrive") {
      s.overdriveT = OVERDRIVE_DURATION;
    } else if (abil.id === "nova") {
      this.scratch.length = 0;
      const hit = this.queryRadius(s.px, s.py, NOVA_RADIUS, this.scratch);
      for (const e of hit) this.hurtEnemy(e, NOVA_DMG * b.damageMul, "ability", ev);
    } else {
      b.hp = Math.min(b.maxHp, b.hp + BULWARK_REPAIR);
      s.iframe = Math.max(s.iframe, BULWARK_IFRAME);
    }
    ev.push({ type: "ability_used", id: abil.id });
    return ev;
  }

  private damageAlly(index: number, dmg: number): void {
    const s = this.state;
    const a = s.squad[index];
    if (!a || !a.active || a.inv > 0) return;
    a.hp -= dmg;
    a.inv = 0.5;
    if (a.hp <= 0) {
      a.hp = 0;
      a.active = false;
    }
  }

  /** Squad movement + supporting fire (runs after weapons, before projectiles). */
  private updateSquad(dt: number, ev: SimEvent[]): void {
    const s = this.state;
    if (s.abilityCd > 0) s.abilityCd -= dt;
    if (s.overdriveT > 0) s.overdriveT -= dt;
    const mult = s.overdriveT > 0 ? 0.4 : 1;
    void ev;
    let idx = 0;
    for (const a of s.squad) {
      if (!a.active) continue;
      if (a.inv > 0) a.inv -= dt;
      let tx = s.px;
      let ty = s.py;
      if (s.squadMode === "follow") {
        const ang = Math.PI * 0.75 + idx * 1.1;
        tx = s.px + Math.cos(ang) * 70;
        ty = s.py + Math.sin(ang) * 70;
      } else if (s.squadMode === "focus") {
        tx = s.focusX;
        ty = s.focusY;
      } else {
        tx = a.x;
        ty = a.y;
      }
      const dx = tx - a.x;
      const dy = ty - a.y;
      const d = Math.hypot(dx, dy);
      if (d > 8) {
        const stepLen = Math.min(d, SQUAD_SPEED * dt);
        a.x += (dx / d) * stepLen;
        a.y += (dy / d) * stepLen;
      }
      a.cd -= dt;
      if (a.cd <= 0) {
        const tgt = this.nearestEnemy(a.x, a.y, SQUAD_RANGE);
        if (tgt) {
          a.cd = SQUAD_CD * mult;
          this.fireProjectile(a.x, a.y, tgt.x, tgt.y, 520, a.dmg * s.build.damageMul, 0x9fd8ff, "squad", true, 5);
        } else {
          a.cd = 0.2;
        }
      }
      idx++;
    }
  }

  private grantNode(id: string, node?: TechNode): void {
    const s = this.state;
    const n = node ?? this.graph.find((x) => x.id === id);
    if (!n) return;
    const first = !s.owned.includes(id);
    if (first) {
      s.owned.push(id);
      this.logHistory("tech", id);
    }
    for (const tg of n.tags) if (!s.ownedTags.includes(tg)) s.ownedTags.push(tg);
    for (const st of n.synergyTags) if (!s.ownedTags.includes(st)) s.ownedTags.push(st);
    for (const e of n.effects) {
      if (e.kind === "weaponEvolve") {
        // Orbital Program evolves ACTIVE families only (origin identity holds).
        const active = new Set(activeFamilies(s.originId, s.expansionFamily));
        for (const fam of (Object.keys(s.weaponStage) as WeaponFamily[])) {
          if (active.has(fam)) s.weaponStage[fam] = 5;
        }
      } else {
        applyTechEffect(s.build, e);
      }
    }
  }

  /** Mission-readable counters derived from canonical state (single source). */
  private missionState(): MissionState {
    const s = this.state;
    const active = activeTerritories(s.territories);
    return {
      ageKills: s.ageKills,
      territoriesClaimed: s.territories.length,
      elitesAge: s.elitesAge,
      outpostsTier2: active.filter((t) => t.tier >= 2).length,
      raidsSurvived: s.raidsSurvived,
      signalSecured: s.signalSecured,
      breakthroughs: s.breakthroughs.length,
    };
  }

  /** Dominion-readable control state (disabled outposts never count). */
  private dominionState(): DominionState {
    const s = this.state;
    const active = activeTerritories(s.territories);
    return {
      active: active.length,
      specialized: active.filter((t) => t.spec !== "").length,
      tier2: active.filter((t) => t.tier >= 2).length,
      raidsSurvived: s.raidsSurvived,
    };
  }

  /** Effective knowledge multiplier: build multiplier × research outposts. */
  private knowledgeMult(): number {
    const s = this.state;
    return s.build.knowledgeMul * (1 + territoryKnowledgeBonus(activeTerritories(s.territories)));
  }

  /** Single canonical knowledge scaling (exactly-once, outpost-aware). */
  private scaledKnowledge(baseAmount: number): number {
    return scaleKnowledge(baseAmount, this.knowledgeMult());
  }

  // --------------------------------------------------------------- knowledge
  /** THE canonical progression op. Multiplier applied exactly once here. */
  gainKnowledge(baseAmount: number, source: string, ev: SimEvent[]): void {
    const s = this.state;
    if (s.over || baseAmount <= 0) return;
    const total = this.scaledKnowledge(baseAmount);
    s.xp += total;
    s.knowledgeTotal += total;
    s.stats.knowledgeEarned += total;
    void source;
    while (s.xp >= s.xpNext) {
      s.xp -= s.xpNext;
      s.level++;
      s.xpNext = xpForLevel(s.level);
      s.pendingLevels++;
    }
    if (s.pendingLevels > 0 && !s.draftOpen) {
      this.buildDraft("level");
      ev.push({ type: "draft_opened", context: "level" });
    }
  }

  private addDamage(src: string, v: number): void {
    const s = this.state;
    // Run-total Chronicle evidence (preserved across Ascension).
    s.damageBySource[src] = (s.damageBySource[src] ?? 0) + v;
    if ((s.damageBySource[src] as number) > (s.damageBySource[s.topDamageSource] ?? -1)) {
      s.topDamageSource = src;
    }
    // Current-world evidence for Legacy offers (reset on Ascension).
    s.worldDamageBySource[src] = (s.worldDamageBySource[src] ?? 0) + v;
    if ((s.worldDamageBySource[src] as number) > (s.worldDamageBySource[s.worldTopDamageSource] ?? -1)) {
      s.worldTopDamageSource = src;
    }
  }

  // ------------------------------------------------------------------ combat
  private hurtPlayer(dmg: number, ev: SimEvent[]): void {
    const s = this.state;
    if (s.over || s.iframe > 0) return;
    s.build.hp -= dmg;
    s.iframe = 0.6;
    ev.push({ type: "player_hurt", damage: dmg });
    if (s.build.hp <= 0) {
      s.build.hp = 0;
      s.over = true;
      ev.push({ type: "player_died" });
    }
  }

  private allocEnemy(): SimEnemy | null {
    for (const e of this.state.enemies) if (!e.active) return e;
    return null;
  }

  /**
   * Deterministic lowest-priority reclaim for progression-critical spawns.
   * Scans pool order, picks the weakest non-boss (non-elite first, then lowest
   * maxHp). Never random, never a boss.
   */
  private reclaimSlot(): SimEnemy | null {
    let victim: SimEnemy | null = null;
    for (const e of this.state.enemies) {
      if (!e.active || e.boss) continue;
      if (!victim) { victim = e; continue; }
      const aRank = (victim.elite ? 1 : 0) * 1e9 + victim.maxHp;
      const bRank = (e.elite ? 1 : 0) * 1e9 + e.maxHp;
      if (bRank < aRank) victim = e;
    }
    if (victim) victim.active = false; // silently composted — no reward, no event
    return victim;
  }

  /**
   * Transactional spawn. Returns the enemy, or null when the pool is
   * exhausted. Bosses deterministically reclaim a slot and therefore never
   * silently fail (P1-03). `affixOverride` is a test/dev hook (default: stream).
   */
  spawnEnemy(
    family: EnemyFamily, elite: boolean, boss: boolean,
    ang: number, dist: number, ev: SimEvent[], affixOverride?: EliteAffix,
  ): SimEnemy | null {
    const s = this.state;
    let e = this.allocEnemy();
    if (!e && boss) e = this.reclaimSlot();
    if (!e) return null;
    const base = ENEMY_BASE[family];
    const diff = (1 + s.ageIndex * 0.28) * (1 + s.ascension * 0.35) * (1 + s.elapsed / 900);
    const affix: EliteAffix | "" = elite
      ? (affixOverride ?? ELITE_AFFIXES[this.streams.enemy.nextInt(0, ELITE_AFFIXES.length)] as EliteAffix)
      : "";
    const def = affix ? ELITE_AFFIX_DEFS[affix] : null;
    e.active = true;
    e.x = s.px + Math.cos(ang) * dist;
    e.y = s.py + Math.sin(ang) * dist;
    e.family = family;
    e.maxHp = base.hp * diff * (boss ? 40 : 1) * (def?.maxHpMul ?? 1) * (elite && !boss && !def ? 6 : 1);
    e.hp = e.maxHp;
    e.shield = boss ? e.maxHp * 0.2 : (def ? e.maxHp * def.shieldFrac : 0);
    e.speed = base.speed * (1 + s.ageIndex * 0.04) * (def?.speedMul ?? 1);
    e.dmg = base.dmg * (1 + s.ageIndex * 0.15) * (1 + s.ascension * 0.2) * (boss ? 2 : 1) * (def?.outgoingDamageMul ?? 1);
    e.radius = base.radius * (boss ? 3 : elite ? 1.4 : 1);
    e.xp = base.xp * (elite ? 5 : 1) * (boss ? 15 : 1);
    e.elite = elite; e.boss = boss; e.affix = affix;
    e.flash = 0; e.shootT = 1 + this.streams.enemy.nextFloat() * 2; e.hitCd = 0;
    if (boss) {
      s.bossIndex = s.enemies.indexOf(e);
      ev.push({ type: "boss_warning" });
    }
    return e;
  }

  private hurtEnemy(e: SimEnemy, dmg: number, src: string, ev: SimEvent[], kx = 0, ky = 0): void {
    const s = this.state;
    if (!e.active || s.over) return;
    const def = e.affix ? ELITE_AFFIX_DEFS[e.affix as EliteAffix] : null;
    let rest = dmg * (def?.incomingDamageMul ?? 1);
    if (e.shield > 0) {
      const absorbed = Math.min(e.shield, rest);
      e.shield -= absorbed;
      rest -= absorbed;
    }
    e.hp -= rest;
    e.flash = 0.08;
    e.x += kx; e.y += ky;
    this.addDamage(src, Math.min(dmg, Math.max(0, e.hp + rest)));
    if (e.hp > 0) return;
    // Capture immutable death data BEFORE deactivation/reuse (P2-04): pooled
    // children may reuse this very object, so nothing may be read from `e`
    // after this point except through these locals.
    const deathReward = e.xp;
    const deathX = e.x;
    const deathY = e.y;
    const wasElite = e.elite;
    const wasBoss = e.boss;
    e.active = false;
    s.stats.kills++;
    s.runKills++;
    s.ageKills++;
    ev.push({ type: "enemy_killed", elite: wasElite, boss: wasBoss, x: deathX, y: deathY });
    if (wasElite && !wasBoss) {
      s.stats.elites++;
      s.elitesAge++;
    }
    if (wasBoss) {
      s.stats.bosses++;
      s.stats.elites++;
      s.elitesAge++;
      this.logHistory("boss", "boss");
      s.bossIndex = -1;
      // Boss drop burst — scatter uses the loot stream (never draft/world).
      for (let i = 0; i < 12; i++) {
        this.dropPickup(
          deathX + (this.streams.loot.nextFloat() - 0.5) * 120,
          deathY + (this.streams.loot.nextFloat() - 0.5) * 120,
          3,
        );
      }
      s.ascendReady = true;
      ev.push({ type: "boss_killed" });
      ev.push({ type: "ascension_ready" });
    }
    if (def && def.splitterCount > 0 && !wasBoss) {
      for (let i = 0; i < def.splitterCount; i++) {
        const m = this.allocEnemy();
        if (!m) break;
        const line = ENEMY_BASE.swarm;
        m.active = true;
        m.x = deathX + (i === 0 ? -14 : 14); m.y = deathY;
        m.family = "swarm"; m.maxHp = line.hp; m.hp = line.hp; m.shield = 0;
        m.speed = line.speed; m.dmg = line.dmg; m.radius = line.radius;
        m.xp = 1; m.elite = false; m.boss = false; m.affix = "";
        m.flash = 0; m.shootT = 0; m.hitCd = 0;
      }
    }
    if (def && def.volatileRadius > 0) {
      const d = Math.hypot(deathX - s.px, deathY - s.py);
      if (d <= def.volatileRadius) this.hurtPlayer(def.volatileDamage, ev);
      // Blast catches nearby allies too (squad positioning matters).
      for (let ai = 0; ai < s.squad.length; ai++) {
        const a = s.squad[ai] as (typeof s.squad)[number];
        if (!a.active) continue;
        if (Math.hypot(a.x - deathX, a.y - deathY) <= def.volatileRadius) this.damageAlly(ai, def.volatileDamage);
      }
    }
    this.dropPickup(deathX, deathY, deathReward);
  }

  /** Value-preserving pickup spawn. Pool pressure changes presentation, never value. */
  dropPickup(x: number, y: number, value: number): void {
    const s = this.state;
    if (value <= 0) return;
    for (const p of s.pickups) {
      if (!p.active) {
        p.active = true; p.x = x; p.y = y; p.value = value;
        return;
      }
    }
    // Pool full: merge into nearest active pickup within 500…
    let best: { x: number; y: number; value: number } | null = null;
    let bd = 500;
    for (const p of s.pickups) {
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < bd) { bd = d; best = p; }
    }
    if (best) {
      (best as { value: number }).value += value;
      return;
    }
    // …else recycle the farthest pickup, transferring its value into the new one.
    let far = s.pickups[0];
    let fd = -1;
    for (const p of s.pickups) {
      const d = Math.hypot(p.x - s.px, p.y - s.py);
      if (d > fd) { fd = d; far = p; }
    }
    (far as { value: number }).value += value;
    far.x = x; far.y = y; // slot reused in place (stays active)
  }

  // ---------------------------------------------------------------- director
  private director(dt: number, ev: SimEvent[]): void {
    const s = this.state;
    s.spawnT -= dt;
    if (s.spawnT <= 0) {
      const budget = threatBudget(s.elapsed, s.ageIndex, s.ascension, s.difficultyMul);
      const comp = composeFromBudget(Math.max(6, budget / 6), this.streams.enemy, s.ageIndex);
      // Elites paid from the budget spawn as affixed enemies right away.
      for (let i = 0; i < Math.min(comp.elite, 4); i++) {
        this.spawnEnemy(pickFamily(this.streams.enemy, s.ageIndex), true, false, this.streams.enemy.nextFloat() * Math.PI * 2, 750, ev);
      }
      const total = comp.chaser + comp.ranged + comp.tank + comp.swarm;
      const spawnN = Math.min(24, 2 + Math.floor(total / 2));
      // Ordinary wave: non-elite only. All elites are either budget-paid
      // (comp.elite above) or the documented scheduled milestone below (model B).
      for (let i = 0; i < spawnN; i++) {
        const fam = pickFamily(this.streams.enemy, s.ageIndex);
        this.spawnEnemy(fam, false, false, this.streams.enemy.nextFloat() * Math.PI * 2, 700 + this.streams.enemy.nextFloat() * 250, ev);
      }
      s.spawnT = 2.2;
    }
    s.eliteT -= dt;
    if (s.eliteT <= 0) {
      // Scheduled milestone encounter (model B: outside the ordinary budget,
      // explicitly bounded — 3 elites / 75s — and era-eligible like everything).
      s.eliteT = 75;
      const fams = eligibleFamilies(s.ageIndex, "milestone");
      for (let i = 0; i < 3; i++) {
        this.spawnEnemy(fams[this.streams.enemy.nextInt(0, fams.length)] as EnemyFamily, true, false, this.streams.enemy.nextFloat() * Math.PI * 2, 750, ev);
      }
    }
    if ((AGES[s.ageIndex] as AgeId) === "space" && !s.bossSpawned && s.stronghold?.revealed) {
      // Boss is the consequence of world control, not a timer: it answers
      // the player's approach to the revealed Stronghold (CONTENT_VERSION 5).
      const sh = s.stronghold;
      const dx = sh.x - s.px;
      const dy = sh.y - s.py;
      const dist = Math.hypot(dx, dy);
      if (dist < 1500) {
        // Transactional: bossSpawned reflects actual boss existence (P1-03).
        const affix = ELITE_AFFIXES[this.streams.boss.nextInt(0, ELITE_AFFIXES.length)] as EliteAffix;
        const boss = this.spawnEnemy("tank", true, true, Math.atan2(dy, dx), Math.max(1, dist), ev, affix);
        if (boss) s.bossSpawned = true;
      }
    }
  }

  // ------------------------------------------------------------------ spatial
  private rebuildSpatial(): void {
    for (const [, arr] of this.buckets) {
      arr.length = 0;
      this.bucketPool.push(arr);
    }
    this.buckets.clear();
    const es = this.state.enemies;
    for (let i = 0; i < es.length; i++) {
      const e = es[i] as SimEnemy;
      if (!e.active) continue;
      const k = cellKey(Math.floor(e.x / SPATIAL_CELL), Math.floor(e.y / SPATIAL_CELL));
      let b = this.buckets.get(k);
      if (!b) {
        b = this.bucketPool.pop() ?? [];
        this.buckets.set(k, b);
      }
      b.push(i);
    }
  }

  /** Fill `out` with active enemies within r of (x,y). No allocation. */
  queryRadius(x: number, y: number, r: number, out: SimEnemy[]): SimEnemy[] {
    out.length = 0;
    const x0 = Math.floor((x - r) / SPATIAL_CELL);
    const x1 = Math.floor((x + r) / SPATIAL_CELL);
    const y0 = Math.floor((y - r) / SPATIAL_CELL);
    const y1 = Math.floor((y + r) / SPATIAL_CELL);
    const es = this.state.enemies;
    for (let cx = x0; cx <= x1; cx++) {
      for (let cy = y0; cy <= y1; cy++) {
        const bucket = this.buckets.get(cellKey(cx, cy));
        if (!bucket) continue;
        this.queryCount++;
        for (let bi = 0; bi < bucket.length; bi++) {
          const e = es[bucket[bi] as number] as SimEnemy;
          if (e.active && Math.hypot(e.x - x, e.y - y) <= r + e.radius) out.push(e);
        }
      }
    }
    return out;
  }

  private nearestEnemy(x: number, y: number, maxD: number): SimEnemy | null {
    // Deterministic spatial lookup; selection semantics identical to the
    // legacy brute-force scan (min hypot distance, strict `<`, lowest pool
    // index wins ties) — proven by tests/sim/spatialNearest.test.ts.
    const idx = nearestEnemySpatial(this.state.enemies, this.buckets, SPATIAL_CELL, x, y, maxD);
    return idx === -1 ? null : (this.state.enemies[idx] as SimEnemy);
  }

  private fireProjectile(x: number, y: number, tx: number, ty: number, speed: number, dmg: number, color: number, src: string, friendly: boolean, radius = 6): void {
    for (const p of this.state.projs) {
      if (p.active) continue;
      const d = Math.max(1, Math.hypot(tx - x, ty - y));
      p.active = true; p.x = x; p.y = y;
      p.vx = ((tx - x) / d) * speed; p.vy = ((ty - y) / d) * speed;
      p.dmg = dmg; p.radius = radius; p.life = 2.2; p.friendly = friendly; p.color = color; p.src = src;
      return;
    }
  }

  // ------------------------------------------------------- weapon execution
  // Execution dispatches on WeaponStage.archetype (P1-04) — data determines
  // behavior, never the family name. Every family × tier must have a valid
  // executable path (covered by tests/sim/archetypes.test.ts).
  private fireProjectileSpread(
    fam: WeaponFamily, st: { speed: number; damage: number; radius: number; color: number },
    n: number, range: number,
  ): void {
    const s = this.state;
    const b = s.build;
    for (let i = 0; i < n; i++) {
      const tgt = this.nearestEnemy(s.px, s.py, range);
      if (!tgt) return;
      const spread = (i - (n - 1) / 2) * 0.12;
      const base = Math.atan2(tgt.y - s.py, tgt.x - s.px) + spread;
      for (const p of s.projs) {
        if (p.active) continue;
        p.active = true; p.x = s.px; p.y = s.py;
        p.vx = Math.cos(base) * st.speed; p.vy = Math.sin(base) * st.speed;
        p.dmg = st.damage * b.damageMul; p.radius = st.radius; p.life = 1.6;
        p.friendly = true; p.color = st.color; p.src = fam;
        break;
      }
    }
  }

  private beamStrike(fam: WeaponFamily, st: { damage: number; radius: number }, range: number, ev: SimEvent[]): void {
    const s = this.state;
    const tgt = this.nearestEnemy(s.px, s.py, range);
    if (!tgt) return;
    const hit = this.queryRadius(tgt.x, tgt.y, 60 + st.radius * 0.3, this.scratch);
    const lim = Math.min(hit.length, 10);
    for (let i = 0; i < lim; i++) this.hurtEnemy(hit[i] as SimEnemy, st.damage * s.build.damageMul, fam, ev);
    s.beamFlash = { x2: tgt.x, y2: tgt.y, t: 0.12 };
  }

  private auraTick(fam: WeaponFamily, radius: number, dmg: number, ev: SimEvent[]): void {
    const s = this.state;
    const hit = this.queryRadius(s.px, s.py, radius, this.scratch);
    const lim = Math.min(hit.length, 30);
    for (let i = 0; i < lim; i++) {
      this.hurtEnemy(hit[i] as SimEnemy, dmg, fam, ev);
      if (s.over) return;
    }
  }

  private orbitBlades(fam: WeaponFamily, dt: number, radius: number, blades: number, dmg: number, ev: SimEvent[]): void {
    const s = this.state;
    s.orbitAng += dt * 2.0;
    for (let i = 0; i < blades; i++) {
      const a = s.orbitAng + (i * Math.PI * 2) / Math.max(1, blades);
      const bx = s.px + Math.cos(a) * radius;
      const by = s.py + Math.sin(a) * radius;
      const hit = this.queryRadius(bx, by, 30, this.scratch);
      const lim = Math.min(hit.length, 4);
      for (let j = 0; j < lim; j++) {
        const e = hit[j] as SimEnemy;
        e.hitCd -= dt;
        if (e.hitCd <= 0) {
          e.hitCd = 0.35;
          this.hurtEnemy(e, dmg, fam, ev);
          if (s.over) return;
        }
      }
    }
  }

  private guardianFire(st: { damage: number; color: number }, guardians: number): void {
    const s = this.state;
    const lim = Math.min(guardians, 6);
    for (let i = 0; i < lim; i++) {
      const a = s.guardianAng + (i * Math.PI * 2) / Math.max(1, guardians);
      const gx = s.px + Math.cos(a) * 80;
      const gy = s.py + Math.sin(a) * 80;
      const tgt = this.nearestEnemy(gx, gy, 520);
      if (tgt) this.fireProjectile(gx, gy, tgt.x, tgt.y, 420, st.damage * s.build.damageMul, st.color, "defense", true, 6);
    }
  }

  private updateWeapons(dt: number, ev: SimEvent[]): void {
    const s = this.state;
    const b = s.build;
    const cdM = Math.max(0.3, b.cooldownMul);
    // Origin identity (ADR-0006): inactive families neither render attacks
    // nor deal simulation damage. Bonus counters tied to an inactive family
    // stay dormant with it.
    const kOn = activeFamilies(s.originId, s.expansionFamily).includes("kinetic");
    const eOn = activeFamilies(s.originId, s.expansionFamily).includes("energy");
    const dOn = activeFamilies(s.originId, s.expansionFamily).includes("defense");
    const fOn = activeFamilies(s.originId, s.expansionFamily).includes("field");
    const tick = (fam: WeaponFamily, cd: number, fire: () => void): void => {
      const left = s.weaponCd[fam] - dt;
      if (left <= 0) { s.weaponCd[fam] = cd; fire(); }
      else s.weaponCd[fam] = left;
    };
    // Kinetic: projectile stages fan shots; the Space beam stage fires a ray.
    if (kOn) {
      const st = getWeaponStage("kinetic", s.weaponStage.kinetic);
      tick("kinetic", st.cooldown * cdM, () => {
        if (st.archetype === "beam") this.beamStrike("kinetic", st, 800, ev);
        else this.fireProjectileSpread("kinetic", st, st.count + b.bonusProjectiles, 700);
      });
    }
    // Energy: projectile / aura / beam per stage, plus bonus-granted systems.
    if (eOn) {
      const st = getWeaponStage("energy", s.weaponStage.energy);
      if (st.archetype === "aura" || b.bonusAura > 0) {
        s.auraT -= dt;
        if (s.auraT <= 0) {
          s.auraT = 0.5;
          this.auraTick("energy", st.radius + b.bonusAura * 30, (st.archetype === "aura" ? st.damage : 10) * b.damageMul, ev);
        }
      }
      if (st.archetype === "beam" || b.beamUnlocked) {
        tick("energy", st.cooldown * cdM, () => this.beamStrike("energy", st, 800, ev));
      } else if (st.archetype === "projectile") {
        tick("energy", st.cooldown * cdM, () => {
          const tgt = this.nearestEnemy(s.px, s.py, 640);
          if (tgt) this.fireProjectile(s.px, s.py, tgt.x, tgt.y, st.speed || 380, st.damage * b.damageMul, st.color, "energy", true, st.radius * 0.8);
        });
      }
    }
    // Defense: orbit stages spin blades; summon stages keep guardian gunners.
    // Bonus-guardian counters only materialize through an active defense core.
    if (dOn) {
      const st = getWeaponStage("defense", s.weaponStage.defense);
      s.guardianAng += dt * 2.6;
      if (st.archetype === "orbit") {
        const blades = Math.max(1, st.count + b.bonusOrbit);
        this.orbitBlades("defense", dt, st.radius, blades, st.damage * b.damageMul, ev);
      }
      const guardians = (st.archetype === "summon" ? st.count : 0) + b.bonusGuardians;
      if (guardians > 0) {
        tick("defense", st.cooldown * cdM * 1.6, () => this.guardianFire(st, guardians));
      }
    }
    // Field: mines are the family signature (see mine section); the stage
    // archetype adds aura or orbit control on top.
    if (fOn) {
      const st = getWeaponStage("field", s.weaponStage.field);
      if (st.archetype === "aura" || b.bonusAura > 0) {
        s.auraT -= dt;
        if (s.auraT <= 0) {
          s.auraT = 0.5;
          this.auraTick("field", st.radius + b.bonusAura * 30, (st.archetype === "aura" ? st.damage : 10) * b.damageMul, ev);
        }
      }
      if (st.archetype === "orbit" || b.bonusOrbit > 0) {
        this.orbitBlades("field", dt, st.radius || 110, 2 + b.bonusOrbit, st.damage * b.damageMul * 0.4, ev);
      }
    }
    if (s.beamFlash) {
      s.beamFlash.t -= dt;
      if (s.beamFlash.t <= 0) s.beamFlash = null;
    }
  }

  // --------------------------------------------------------------------- step
  step(dt: number, input: InputFrame): SimEvent[] {
    const s = this.state;
    const ev: SimEvent[] = [];
    if (s.over) return ev;
    this.queryCount = 0;

    s.elapsed += dt;
    s.runElapsed += dt;
    s.ageElapsed += dt;
    const b = s.build;

    // 1. Input → player movement.
    const il = Math.hypot(input.moveX, input.moveY);
    const nx = il > 0 ? input.moveX / Math.max(1, il) : 0;
    const ny = il > 0 ? input.moveY / Math.max(1, il) : 0;
    const dashing = s.dashT > 0;
    const sp = b.speed * (dashing ? 3.1 : 1);
    s.vx = il > 0 ? nx * sp : 0;
    s.vy = il > 0 ? ny * sp : 0;
    s.px += s.vx * dt;
    s.py += s.vy * dt;

    // 2. Dash + regen.
    s.dashCd -= dt;
    s.dashT -= dt;
    s.iframe -= dt;
    if (input.dashPressed && s.dashCd <= 0 && il > 0) {
      s.dashCd = 2.2;
      s.dashT = 0.18;
      s.iframe = Math.max(s.iframe, 0.35);
    }
    if (b.regen > 0) b.hp = Math.min(b.maxHp, b.hp + b.regen * dt);

    // 3. Age progression (v023 frontier contract: knowledge + mission +
    // dominion; design A transition still auto-grants the age spine).
    const next = s.ageIndex + 1;
    if (next < AGES.length) {
      const ms = this.missionState();
      const ds = this.dominionState();
      const targetAge = AGES[next] as AgeId;
      if (next > 0 && missionDone(targetAge as Exclude<AgeId, "stone">, ms) && !s.missionDoneCache) {
        s.missionDoneCache = true;
        ev.push({ type: "mission_complete", age: targetAge });
      }
      if (canAdvanceAge(next, s.knowledgeTotal, ms, ds)) {
        s.ageIndex = next;
        s.maxLogistics = calculateMaxLogistics(next);
        s.ageElapsed = 0;
        s.ageKills = 0;
        s.elitesAge = 0;
        s.rerolls = 1;
        s.missionDoneCache = false;
        // Regroup: the squad reforms at full strength on every age advance.
        for (const a of s.squad) {
          a.active = true;
          a.hp = a.maxHp;
          a.x = s.px + (a.x >= s.px ? 30 : -30);
          a.y = s.py;
        }
        const ageId = AGES[next] as AgeId;
        s.highestAge = ageId;
        if (next > AGES.indexOf(s.runHighestAge)) s.runHighestAge = ageId;
        const spine = CRITICAL_SPINE.find((c) => c.age === ageId);
        if (spine && !s.owned.includes(spine.id)) this.grantNode(spine.id);
        s.weaponStage = {
          kinetic: Math.max(s.weaponStage.kinetic, next),
          energy: Math.max(s.weaponStage.energy, next),
          defense: Math.max(s.weaponStage.defense, next),
          field: Math.max(s.weaponStage.field, next),
        };
        b.hp = Math.min(b.maxHp, b.hp + b.maxHp * 0.3);
        this.logHistory("age", ageId);
        ev.push({ type: "age_reached", age: ageId });
        // Space entry reveals the ENEMY STRONGHOLD (derived site, §23).
        if (ageId === "space") this.revealStronghold(ev);
        // WORLD EXPANSION decision at Industrial (ADR-0006 Decision 1).
        if (next === 3 && s.expansionFamily === "") {
          const locked = lockedFamilies(s.originId, "");
          if (locked.length === 2) {
            ev.push({ type: "expansion_offered", families: [locked[0] as WeaponFamily, locked[1] as WeaponFamily] });
          }
        }
        for (let i = 0; i < 3; i++) {
          this.spawnEnemy("chaser", true, false, this.streams.event.nextFloat() * Math.PI * 2, 700, ev);
        }
      }
    }

    // 4. Director / spawning + deterministic raid scheduler.
    this.director(dt, ev);
    if (s.over) return ev;
    this.updateRaid(dt, ev);
    if (s.over) return ev;

    // 5. Enemy movement (siege units march on the raided outpost).
    for (const e of s.enemies) {
      if (!e.active) continue;
      if (e.flash > 0) e.flash -= dt;
      if (e.siege) {
        const t = s.raid ? territoryById(s.territories, s.raid.poiId) : undefined;
        if (!t || t.disabled || !s.raid) {
          e.siege = false;
        } else {
          const sx = t.x - e.x;
          const sy = t.y - e.y;
          const sd = Math.max(1, Math.hypot(sx, sy));
          e.x += (sx / sd) * e.speed * dt;
          e.y += (sy / sd) * e.speed * dt;
          e.hitCd -= dt;
          if (sd < 70 && e.hitCd <= 0) {
            e.hitCd = 1;
            t.hp -= e.dmg;
            if (t.hp <= 0) this.loseOutpost({ poiId: t.poiId }, ev);
          }
          if (s.over) return ev;
          continue;
        }
      }
      const dx = s.px - e.x;
      const dy = s.py - e.y;
      const d = Math.max(1, Math.hypot(dx, dy));
      if (e.family === "ranged") {
        if (d > 420) { e.x += (dx / d) * e.speed * dt; e.y += (dy / d) * e.speed * dt; }
        else if (d < 280) { e.x -= (dx / d) * e.speed * dt; e.y -= (dy / d) * e.speed * dt; }
        e.shootT -= dt;
        if (e.shootT <= 0 && d < 640) {
          e.shootT = 2.2;
          this.fireProjectile(e.x, e.y, s.px, s.py, 260, e.dmg, 0xff5a5a, "enemy", false, 6);
        }
      } else {
        e.x += (dx / d) * e.speed * dt;
        e.y += (dy / d) * e.speed * dt;
      }
      if (d < e.radius + 14) this.hurtPlayer(e.dmg, ev);
      if (s.over) return ev;
      // Command squad takes contact damage too (positioning matters).
      for (let ai = 0; ai < s.squad.length; ai++) {
        const a = s.squad[ai] as (typeof s.squad)[number];
        if (!a.active) continue;
        if (Math.hypot(a.x - e.x, a.y - e.y) < e.radius + 10) this.damageAlly(ai, e.dmg);
      }
    }

    // 6. Spatial rebuild AFTER movement, BEFORE weapons/collisions.
    this.rebuildSpatial();

    // 7. Weapons + command squad + projectiles.
    this.updateWeapons(dt, ev);
    if (s.over) return ev;
    this.updateSquad(dt, ev);
    if (s.over) return ev;
    // Territory upkeep (repair presence, economy aura) every step.
    this.updateTerritories(dt, ev);
    if (s.over) return ev;
    for (const p of s.projs) {
      if (!p.active) continue;
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.life <= 0 || Math.abs(p.x - s.px) > 1400 || Math.abs(p.y - s.py) > 1400) {
        p.active = false;
        continue;
      }
      if (p.friendly) {
        const hit = this.queryRadius(p.x, p.y, p.radius + 6, this.scratch);
        if (hit.length > 0) {
          const e = hit[0] as SimEnemy;
          const d = Math.max(1, Math.hypot(e.x - p.x, e.y - p.y));
          const kb = 14;
          this.hurtEnemy(e, p.dmg, p.src, ev, ((e.x - p.x) / d) * kb, ((e.y - p.y) / d) * kb);
          p.active = false;
        }
      } else if (Math.hypot(p.x - s.px, p.y - s.py) < p.radius + 14) {
        p.active = false;
        this.hurtPlayer(p.dmg, ev);
        if (s.over) return ev;
      }
    }

    // 8. Mines (field-family signature — dormant without an active field core).
    s.mineT -= dt;
    if (s.mineT <= 0) {
      s.mineT = 1.2;
      const want = activeFamilies(s.originId, s.expansionFamily).includes("field") ? 1 + b.bonusMines : 0;
      let placed = 0;
      for (const m of s.mines) {
        if (placed >= want) break;
        if (m.active) continue;
        const st = getWeaponStage("field", s.weaponStage.field);
        m.active = true;
        m.x = s.px + (this.streams.event.nextFloat() - 0.5) * 300;
        m.y = s.py + (this.streams.event.nextFloat() - 0.5) * 300;
        m.dmg = st.damage * b.damageMul;
        m.radius = st.radius;
        m.life = 12;
        placed++;
      }
    }
    for (const m of s.mines) {
      if (!m.active) continue;
      m.life -= dt;
      if (m.life <= 0) { m.active = false; continue; }
      const hit = this.queryRadius(m.x, m.y, m.radius, this.scratch);
      if (hit.length > 0) {
        m.active = false;
        const lim = Math.min(hit.length, 12);
        for (let i = 0; i < lim; i++) this.hurtEnemy(hit[i] as SimEnemy, m.dmg, "field", ev);
        if (s.over) return ev;
      }
    }

    // 9. Pickups.
    for (const k of s.pickups) {
      if (!k.active) continue;
      const dx = s.px - k.x;
      const dy = s.py - k.y;
      const d = Math.max(1, Math.hypot(dx, dy));
      if (d < 240) {
        const pull = d < b.pickupR ? 700 : 260;
        k.x += (dx / d) * pull * dt;
        k.y += (dy / d) * pull * dt;
      }
      if (d < 22) {
        k.active = false;
        this.gainKnowledge(k.value, "pickup", ev);
      }
    }

    // 10. Chunks + POI discovery (cached descriptors).
    const { cx, cy } = worldToChunk(s.px, s.py);
    const key = `${cx},${cy}`;
    if (!s.chunksWorld.includes(key)) {
      s.chunksWorld.push(key);
      s.stats.chunksTotal++;
    }
    for (let ox = -1; ox <= 1; ox++) {
      for (let oy = -1; oy <= 1; oy++) {
        const desc = this.chunks.get(s.worldSeed, s.worldNonce, cx + ox, cy + oy);
        for (const poi of desc.poi) {
          if (s.poisWorld.includes(poi.id)) continue;
          if (Math.hypot(poi.wx - s.px, poi.wy - s.py) < 70) {
            s.poisWorld.push(poi.id);
            s.stats.poisTotal++;
            this.poiReward(poi.type, ev);
          }
        }
      }
    }
    return ev;
  }

  /**
   * POI reward contract (ADR-0006 Decision 3). First discovery of each family
   * per world pays a DISTINCT deterministic reward; repeats pay Knowledge.
   * Positions/visuals untouched. At most one modal per family per world, and
   * never stacked over an open draft (falls back to base Knowledge).
   */
  private poiReward(type: POIType, ev: SimEvent[]): void {
    const s = this.state;
    const b = s.build;
    const info = poiTypeFor(type);
    if (s.poiFamiliesClaimed.includes(type)) {
      this.gainKnowledge(info.knowledge, "poi", ev);
      ev.push({ type: "poi_discovered", poiType: type, knowledge: this.scaledKnowledge(info.knowledge) });
      return;
    }
    s.poiFamiliesClaimed.push(type);
    ev.push({ type: "poi_major", poiType: type });
    if (type === "megasite") {
      // Major cache + full repair, no modal interruption.
      this.gainKnowledge(150, "poi", ev);
      b.hp = b.maxHp;
      ev.push({ type: "poi_discovered", poiType: type, knowledge: this.scaledKnowledge(150) });
      return;
    }
    if (type === "worldtree") {
      b.hp = b.maxHp;
    }
    if (s.draftOpen) {
      // Exactly-one draft surface wins: no modal stacking, base Knowledge instead.
      this.gainKnowledge(info.knowledge, "poi", ev);
      ev.push({ type: "poi_discovered", poiType: type, knowledge: this.scaledKnowledge(info.knowledge) });
      return;
    }
    this.openPoiDraft(type, ev);
  }

  /** Themed discovery draft filters — the per-family reward contract. */
  private openPoiDraft(type: POIType, ev: SimEvent[]): void {
    this.openFilteredDraft(POI_DRAFT_FILTERS[type], ev);
  }
}

/**
 * Emergency fallback draft cards (exported for contract tests).
 * Dedicated i18n keys whose numbers match the effects EXACTLY.
 */
export function fallbackCards(level: number): TechNode[] {
  return [
    { id: `fb-dmg-${level}`, titleKey: "tech.fallback.dmg.name", descriptionKey: "tech.fallback.dmg.description", age: "stone", domain: "warfare", tags: ["offense"], prerequisites: [], exclusions: [], rarity: "common", weight: 1, effects: [{ kind: "damageMul", value: 0.1 }], synergyTags: [] },
    { id: `fb-hp-${level}`, titleKey: "tech.fallback.hp.name", descriptionKey: "tech.fallback.hp.description", age: "stone", domain: "warfare", tags: ["defense"], prerequisites: [], exclusions: [], rarity: "common", weight: 1, effects: [{ kind: "maxHpAdd", value: 25 }], synergyTags: [] },
    { id: `fb-spd-${level}`, titleKey: "tech.fallback.spd.name", descriptionKey: "tech.fallback.spd.description", age: "stone", domain: "industry", tags: ["mobility"], prerequisites: [], exclusions: [], rarity: "common", weight: 1, effects: [{ kind: "moveMul", value: 0.07 }], synergyTags: [] },
  ];
}
