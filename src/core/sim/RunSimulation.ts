// Framework-independent run simulation (ADR 0003).
//
// One RunSimulation instance == one run attempt. Restarting a seed means
// constructing a NEW instance, so Phaser Scene reuse can never leak state.
// No Phaser / DOM / storage / audio imports — events go out via SimEvent[].
//
// Phase order per step (documented, tested at cell boundaries):
//   input → player movement → director/spawn → enemy movement → spatial rebuild
//   → weapons/projectiles/collisions → mines → pickups/progression → POI → events
import { fnv1a32 } from "../seed/hash";
import { initRunRng, type RunRngStreams } from "../seed/runRng";
import { deriveAscensionSeed } from "../seed/streams";
import { WORLDGEN_VERSION } from "../seed/versions";
import { xpForLevel } from "./fixedStep";
import { applyTechEffect, defaultEffectTarget, scaleKnowledge } from "./progression";
import { worldToChunk } from "../world/chunks";
import { ChunkCache } from "./chunkCache";
import { canonicalSnapshot, snapshotStreams, stateHash, type RngSnapshots } from "./stateHash";
import { AGES, CRITICAL_SPINE, type AgeId, type TechNode } from "../tech/graph";
import { generateTechGraph } from "../tech/generator";
import { checkBreakthroughs } from "../tech/synergy";
import { canAdvanceAge } from "../progression/ages";
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
    return {
      masterSeed, worldSeed,
      worldNonce: worldNonceFor(masterSeed, ascension),
      ascension, difficultyMul: this.difficultyMul,
      ageIndex: 0, elapsed: 0, ageElapsed: 0, ageKills: 0,
      runElapsed: 0, runHighestAge: "stone", runKills: 0,
      px: 0, py: 0, vx: 0, vy: 0, dashT: 0, dashCd: 0, iframe: 0,
      build: defaultEffectTarget(),
      level: 1, xp: 0, xpNext: xpForLevel(1), knowledgeTotal: 0,
      pendingLevels: 0, draftOpen: false, draftChoices: [],
      owned: [], ownedTags: [], breakthroughs: [],
      weaponStage: { kinetic: 0, energy: 0, defense: 0, field: 0 },
      originId, expansionFamily: "",
      legacies: [],
      poiFamiliesClaimed: [],
      draftContext: "level",
      spawnT: 0, eliteT: 60, mineT: 0, auraT: 0,
      weaponCd: { kinetic: 0, energy: 0, defense: 0, field: 0 },
      guardianAng: 0, orbitAng: 0, beamFlash: null,
      enemies: Array.from({ length: MAX_ENEMIES }, () => ({
        active: false, x: 0, y: 0, hp: 1, maxHp: 1, shield: 0,
        family: "chaser" as EnemyFamily, speed: 100, dmg: 5, radius: 12, xp: 1,
        elite: false, affix: "" as EliteAffix | "", flash: 0, shootT: 0, boss: false, hitCd: 0,
      })),
      projs: Array.from({ length: MAX_PROJ }, () => ({
        active: false, x: 0, y: 0, vx: 0, vy: 0, dmg: 1, radius: 5,
        life: 0, friendly: true, color: 0xffffff, src: "",
      })),
      pickups: Array.from({ length: MAX_PICKUP }, () => ({ active: false, x: 0, y: 0, value: 1 })),
      mines: Array.from({ length: MAX_MINES }, () => ({ active: false, x: 0, y: 0, dmg: 10, radius: 60, life: 0 })),
      chunksWorld: [], poisWorld: [],
      bossSpawned: false, ascendReady: false, bossIndex: -1, over: false,
      stats: { kills: 0, elites: 0, bosses: 0, techsTaken: 0, chunksTotal: 0, poisTotal: 0, knowledgeEarned: 0 },
      damageBySource: {}, topDamageSource: "", highestAge: "stone",
      worldDamageBySource: {}, worldTopDamageSource: "", worldBreakthroughsEarned: [],
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

  /** Count of generated (non-fallback) options currently available — frontier test hook. */
  generatedOptionsCount(): number {
    return this.availableNodes().length;
  }

  private buildDraft(context: "level" | "poi", filter?: (n: TechNode) => boolean): void {
    const s = this.state;
    let pool = this.availableNodes();
    if (filter) {
      const picked = pool.filter(filter);
      // A themed draft with zero candidates falls back to the open pool
      // (still a real choice, never an empty modal).
      if (picked.length > 0) pool = picked;
    }
    const scored = pool.map((n) => ({ n, w: n.weight * (0.5 + this.streams.draft.nextFloat()) }));
    scored.sort((a, b) => b.w - a.w);
    const picks: TechNode[] = [];
    const kinds = new Set<string>();
    for (const cand of scored) {
      const k = cand.n.effects[0]?.kind ?? "other";
      if (picks.length < 3 && (!kinds.has(k) || picks.length >= 2)) {
        picks.push(cand.n);
        kinds.add(k);
      }
      if (picks.length >= 3) break;
    }
    // Emergency fallback only (should be rare with the wide-frontier graph).
    // Dedicated keys whose numbers match the effects EXACTLY (P2 localization).
    const fb = fallbackCards(s.level);
    while (picks.length < 3) picks.push(fb[picks.length] as TechNode);
    s.draftChoices = picks;
    s.draftOpen = true;
    s.draftContext = context;
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

  /** Apply a draft pick. Returns events (tech_selected, breakthrough*, maybe draft_opened). */
  chooseDraft(i: number): SimEvent[] {
    const s = this.state;
    const ev: SimEvent[] = [];
    if (!s.draftOpen || s.over) return ev;
    const n = s.draftChoices[i];
    if (!n) return ev;
    s.draftOpen = false;
    s.draftChoices = [];
    s.draftContext = "level";
    this.grantNode(n.id, n);
    s.stats.techsTaken++;
    ev.push({ type: "tech_selected", techId: n.id });
    const ownedTags = new Set(s.ownedTags);
    const unlocked = new Set(s.breakthroughs);
    for (const b of checkBreakthroughs(ownedTags, unlocked)) {
      s.breakthroughs.push(b.id);
      // Earned-in-this-world evidence (P1-04); inherited heirs never land here.
      if (!s.worldBreakthroughsEarned.includes(b.id)) s.worldBreakthroughsEarned.push(b.id);
      for (const e of b.effects) applyTechEffect(s.build, e);
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
   * WORLD EXPANSION choice (ADR-0006 Decision 1): unlock exactly one of the
   * two inactive families. Valid only once per world, only a locked family.
   */
  chooseExpansion(fam: WeaponFamily): SimEvent[] {
    const s = this.state;
    const ev: SimEvent[] = [];
    if (s.over || s.expansionFamily !== "") return ev;
    if (!lockedFamilies(s.originId, "").includes(fam)) return ev;
    s.expansionFamily = fam;
    ev.push({ type: "expansion_unlocked", family: fam });
    return ev;
  }

  private grantNode(id: string, node?: TechNode): void {
    const s = this.state;
    const n = node ?? this.graph.find((x) => x.id === id);
    if (!n) return;
    if (!s.owned.includes(id)) s.owned.push(id);
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

  // --------------------------------------------------------------- knowledge
  /** THE canonical progression op. Multiplier applied exactly once here. */
  gainKnowledge(baseAmount: number, source: string, ev: SimEvent[]): void {
    const s = this.state;
    if (s.over || baseAmount <= 0) return;
    const total = scaleKnowledge(baseAmount, s.build.knowledgeMul);
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
    ev.push({ type: "enemy_killed", elite: wasElite, boss: wasBoss });
    if (wasElite && !wasBoss) s.stats.elites++;
    if (wasBoss) {
      s.stats.bosses++;
      s.stats.elites++;
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
    if ((AGES[s.ageIndex] as AgeId) === "space" && !s.bossSpawned && s.ageElapsed > 15) {
      // Transactional: bossSpawned reflects actual boss existence (P1-03).
      const affix = ELITE_AFFIXES[this.streams.boss.nextInt(0, ELITE_AFFIXES.length)] as EliteAffix;
      const boss = this.spawnEnemy("tank", true, true, Math.PI / 4, 800, ev, affix);
      if (boss) s.bossSpawned = true;
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
      const k = Math.floor(e.x / SPATIAL_CELL) * 73856093 ^ Math.floor(e.y / SPATIAL_CELL) * 19349663;
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
        const bucket = this.buckets.get(cx * 73856093 ^ cy * 19349663);
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
    // Linear scan (R3.4: spatial nearest-query upgrade deferred until profiling).
    let best: SimEnemy | null = null;
    let bd = maxD;
    for (const e of this.state.enemies) {
      if (!e.active) continue;
      const dx = e.x - x;
      const dy = e.y - y;
      if (Math.abs(dx) > bd || Math.abs(dy) > bd) continue;
      const d = Math.hypot(dx, dy);
      if (d < bd) { bd = d; best = e; }
    }
    return best;
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

    // 3. Age progression (design A: transition auto-grants the age spine).
    const next = s.ageIndex + 1;
    if (next < AGES.length) {
      const need = OBJECTIVE_KILLS[next] ?? 0;
      if (canAdvanceAge(next, s.elapsed, s.ageElapsed, s.knowledgeTotal, s.ageKills >= need)) {
        s.ageIndex = next;
        s.ageElapsed = 0;
        s.ageKills = 0;
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
        ev.push({ type: "age_reached", age: ageId });
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

    // 4. Director / spawning.
    this.director(dt, ev);
    if (s.over) return ev;

    // 5. Enemy movement.
    for (const e of s.enemies) {
      if (!e.active) continue;
      if (e.flash > 0) e.flash -= dt;
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
    }

    // 6. Spatial rebuild AFTER movement, BEFORE weapons/collisions.
    this.rebuildSpatial();

    // 7. Weapons + projectiles.
    this.updateWeapons(dt, ev);
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
      ev.push({ type: "poi_discovered", poiType: type, knowledge: scaleKnowledge(info.knowledge, b.knowledgeMul) });
      return;
    }
    s.poiFamiliesClaimed.push(type);
    ev.push({ type: "poi_major", poiType: type });
    if (type === "megasite") {
      // Major cache + full repair, no modal interruption.
      this.gainKnowledge(150, "poi", ev);
      b.hp = b.maxHp;
      ev.push({ type: "poi_discovered", poiType: type, knowledge: scaleKnowledge(150, b.knowledgeMul) });
      return;
    }
    if (type === "worldtree") {
      b.hp = b.maxHp;
    }
    if (s.draftOpen) {
      // Exactly-one draft surface wins: no modal stacking, base Knowledge instead.
      this.gainKnowledge(info.knowledge, "poi", ev);
      ev.push({ type: "poi_discovered", poiType: type, knowledge: scaleKnowledge(info.knowledge, b.knowledgeMul) });
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
