// GameScene — ADAPTER (ADR 0003). Owns no canonical gameplay state.
// Browser input → InputFrame → RunSimulation.step() → state → Phaser render.
// SimEvent → DOM / audio / camera. Restart = NEW RunSimulation instance.
import Phaser from "phaser";
import { normalizeSeedString, generateRandomSeed } from "../../core/seed/hash";
import { WORLDGEN_VERSION, CONTENT_VERSION, SAVE_SCHEMA_VERSION } from "../../core/seed/versions";
import { FixedAccumulator, SIM_DT } from "../../core/sim/fixedStep";
import { InputLatch } from "../../core/sim/InputLatch";
import { RunSimulation } from "../../core/sim/RunSimulation";
import type { SimEvent } from "../../core/sim/SimEvent";
import { MAX_ENEMIES, MAX_PROJ, MAX_PICKUP, type SimEnemy } from "../../core/sim/RunState";
import { CLAIM_CLEAR_RADIUS, CLAIM_REACH_RADIUS } from "../../core/world/territory";
import { classifySite, frontierObjective, type FrontierObjective, type FrontierSite } from "../frontier/sites";
import { dominionProgress } from "../../core/progression/ages";
import { worldToChunk, CHUNK_SIZE, ACTIVE_RADIUS_CHUNKS } from "../../core/world/chunks";
import { BIOME_STYLE, CIV_LAYER, ENEMY_LINEAGE } from "../../content/content";
import type { AgeId } from "../../core/tech/graph";
import { AGES } from "../../core/tech/graph";
import { BREAKTHROUGHS, breakthroughProgress, nearestBreakthroughs, completingBreakthrough, tagDisplayKey } from "../../core/tech/synergy";
import { activeFamilies, ORIGINS, originById, type OriginId } from "../../core/progression/origins";
import { legacyDefById } from "../../core/progression/legacies";
import type { WeaponFamily } from "../../core/combat/weapons";
import { CRITICAL_SPINE } from "../../core/tech/graph";
import { AGE_DEFS, ageGates } from "../../core/progression/ages";
import { ORIGIN_SQUAD_NAME, ORIGIN_ABILITY, squadCap } from "../../core/combat/squad";
import { militaryBonusSlots, activeTerritories, type OutpostSpec } from "../../core/world/territory";
import { threatBudget } from "../../core/director/director";
import { getWeaponStage } from "../../core/combat/weapons";
import { t, setLang, getLang } from "../../i18n/i18n";
import type { EnKeys } from "../../i18n/en";
import { loadSave, storeSave } from "../../core/save/save";
import { sfx } from "../audio/sfx";
import { uiRoot, clearUI, el, button, toast, applyUiScale } from "../ui";
import { TITLE_SEED_KEY, TITLE_ORIGIN_KEY } from "./TitleScene";
import { isQAMode, GOLDEN_QA_SEED } from "../../qa/qaMode";
import { QaSession, type QaFrameData, type QaPOIInfo } from "../../qa/qaPanel";
import { drawEnemy } from "../render/EnemyRenderer";
import { drawPlayer } from "../render/PlayerRenderer";
import {
  drawFriendlyProj, drawHostileProj, drawBeam, drawAura, drawOrbit, drawSummon, drawMine, drawKnowledge,
} from "../render/ProjectileRenderer";
import { drawGround, drawPoi, drawTerritoryDressing } from "../render/WorldRenderer";
import { nearestInterest, drawOffscreenIndicator, minimapCells } from "../render/NavigationRenderer";
import { TechMapView } from "../tech/TechMapView";
import { SEED_ASSETS } from "../assets/seedAssets";
import { TutorialDirector } from "../onboarding/TutorialDirector";
import pkg from "../../../package.json";

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  return sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))] as number;
}

export class GameScene extends Phaser.Scene {
  private sim!: RunSimulation;
  private masterSeed = "EPOCH-GOLDEN-001";
  private acc = new FixedAccumulator();
  private latch = new InputLatch();
  private paused = false;
  private deathPersisted = false;

  private gfx!: Phaser.GameObjects.Graphics;
  private ground!: Phaser.GameObjects.Graphics;
  private playerArc!: Phaser.GameObjects.Arc;
  private debugText!: Phaser.GameObjects.Text;
  private showDebug = false;
  private lastGroundKey = "";

  private keys: Record<string, Phaser.Input.Keyboard.Key> = {};
  private keyHandlers: { event: string; fn: () => void }[] = [];
  private hud: Record<string, HTMLElement> = {};
  private hudT = 0;
  // Modal overlays: blocking choice modals (expansion/legacy/origin) pause
  // stepping until decided; timed beats (breakthrough/age) pause briefly.
  private blockingModal: HTMLElement | null = null;
  private modalT = 0;
  /** FIFO builders for modals requested while another is visible (P1-02). */
  private modalQueue: Array<() => void> = [];
  // Presentation state (never canonical): facing, hurt flash, contrast, hints.
  private playerFacing = -Math.PI / 2;
  private lastHurtT = -10;
  private bossGfx: Phaser.GameObjects.Graphics | null = null;
  private navT = 0;
  /** Frontier scan (1 Hz): open sites + single shared focus (§22). */
  private frontierSites: FrontierSite[] = [];
  private frontierFocus: FrontierObjective | null = null;
  private siteScratch: SimEnemy[] = [];
  /** Telemetry-only seen sets (presentation-side, never canonical). */
  private claimPromptsSeen = new Set<string>();
  private firstClaimLogged = false;
  private prevFocusId = "";
  private prevDominion = -1;
  /** Transient impact presentation (never canonical): death rings + damage numbers. */
  private bursts: Array<{ x: number; y: number; t: number; max: number; big: boolean }> = [];
  private dmgNums: Array<{ x: number; y: number; txt: string; t: number }> = [];
  private floatText: Phaser.GameObjects.Text[] = [];
  private onboard: { done: Set<string>; active: string; until: number } = { done: new Set(), active: "", until: 0 };
  private tutorial: TutorialDirector | null = null;

  // QA harness (read-only observer, ?qa=1 only — null in normal play).
  private qa: QaSession | null = null;
  private qaOverlay = false;
  private qaGfx: Phaser.GameObjects.Graphics | null = null;
  private qaText: Phaser.GameObjects.Text | null = null;
  private qaBiome = "?";
  private qaPoi: QaPOIInfo | null = null;
  private qaScanT = 0;

  // Rolling performance samples (bounded) — real p50/p95, never EMA-as-p95.
  private simSamples: number[] = [];
  private frameSamples: number[] = [];
  private fpsEMA = 60;
  /** Tech Map / Civ Map overlay open (pauses stepping like a modal). */
  private techMapOpen = false;
  private techMapSel = "";
  private techMapView: TechMapView | null = null;
  private civMapOpen = false;
  private vfxPool: Phaser.GameObjects.Image[] = [];

  constructor() {
    super("game");
  }

  preload(): void {
    this.load.image("seed_hit_impact", SEED_ASSETS.vfx.hitImpact);
    this.load.image("seed_claim_glow", SEED_ASSETS.vfx.claimGlow);
    this.load.image("seed_breakthrough_spark", SEED_ASSETS.vfx.breakthroughSpark);
    this.load.image("seed_raid_alert", SEED_ASSETS.vfx.raidAlert);
    this.load.image("seed_outpost_research", SEED_ASSETS.structures.research);
    this.load.image("seed_outpost_military", SEED_ASSETS.structures.military);
    this.load.image("seed_outpost_economic", SEED_ASSETS.structures.economic);
  }

  private spawnVfx(
    key: string,
    x: number,
    y: number,
    scale = 1,
    tint = 0xffffff,
    duration = 300,
    blendMode = Phaser.BlendModes.ADD,
  ): void {
    let img = this.vfxPool.find((item) => !item.visible);
    if (!img) {
      if (this.vfxPool.length >= 16) return;
      img = this.add.image(x, y, key);
      img.setDepth(45);
      this.vfxPool.push(img);
    }
    img.setTexture(key);
    img.setPosition(x, y);
    img.setScale(scale);
    img.setAlpha(1);
    img.setTint(tint);
    img.setBlendMode(blendMode);
    img.setVisible(true);
    this.tweens.add({
      targets: img,
      alpha: 0,
      scale: scale * 1.35,
      duration,
      onComplete: () => {
        img?.setVisible(false);
      },
    });
  }

  create(): void {
    const save = loadSave(localStorage);
    setLang(save.settings.lang);
    sfx.setVolume(save.settings.volume);
    applyUiScale(save.settings.uiScale ?? 1);

    const pending = sessionStorage.getItem(TITLE_SEED_KEY);
    this.masterSeed = normalizeSeedString(pending || generateRandomSeed()) || generateRandomSeed();
    sessionStorage.removeItem(TITLE_SEED_KEY);

    this.startRun(this.masterSeed);
  }

  /** Fresh run (and restart path): new simulation, clean adapter state. */
  private startRun(seed: string): void {
    const originRaw = sessionStorage.getItem(TITLE_ORIGIN_KEY) ?? "";
    sessionStorage.removeItem(TITLE_ORIGIN_KEY);
    this.sim = new RunSimulation({ masterSeed: seed, originId: originRaw });
    this.modalQueue = [];
    this.closeBlocking();
    this.acc = new FixedAccumulator();
    this.latch = new InputLatch();
    this.paused = false;
    this.deathPersisted = false;
    this.lastGroundKey = "";
    this.simSamples = [];
    this.frameSamples = [];

    this.ground = this.add.graphics().setDepth(-10);
    this.gfx = this.add.graphics().setDepth(0);
    this.playerArc = this.add.circle(0, 0, 16, 0xffd166) as unknown as Phaser.GameObjects.Arc;
    // Camera anchor only — the player body is drawn by PlayerRenderer.
    this.playerArc.setVisible(false);
    this.playerArc.setDepth(10);
    this.cameras.main.startFollow(this.playerArc, false, 0.14, 0.14);
    this.bossGfx = this.add.graphics().setDepth(45);
    this.bossGfx.setScrollFactor(0);
    this.playerFacing = -Math.PI / 2;
    this.lastHurtT = -10;
    this.onboard = { done: new Set(), active: "", until: 0 };
    this.frontierSites = [];
    this.frontierFocus = null;
    this.claimPromptsSeen = new Set<string>();
    this.firstClaimLogged = false;
    this.prevFocusId = "";
    this.prevDominion = -1;

    this.tutorial?.dispose();
    const save = loadSave(localStorage);
    this.tutorial = new TutorialDirector(save.settings.tutorialCompleted ?? false);

    const kb = this.input.keyboard;
    if (kb) {
      this.keys = {
        W: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        UP: kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
        DOWN: kb.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
        LEFT: kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
        RIGHT: kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      };
      const on = (event: string, fn: () => void): void => {
        kb.on(event, fn);
        this.keyHandlers.push({ event, fn });
      };
      // P1-02: Space edge latches in the adapter (survives zero-step frames);
      // movement is level-polled per frame. Never JustDown() inside step timing.
      on("keydown-SPACE", () => {
        this.latch.pressDash();
      });
      on("keydown-F3", () => {
        this.showDebug = !this.showDebug;
        this.debugText.setVisible(this.showDebug);
      });
      on("keydown-F10", () => {
        this.qa?.toggleInspector();
      });
      on("keydown-ESC", () => {
        if (this.techMapOpen) {
          this.toggleTechMap();
          return;
        }
        if (this.civMapOpen) {
          this.toggleCivMap();
          return;
        }
        if (this.blockingModal) {
          // Timed beats dismiss; binding choices must be decided.
          if (this.modalT > 0) this.closeBlocking();
          return;
        }
        const s = this.sim.state;
        if (!s.over && !s.draftOpen) this.togglePause();
      });
      on("keydown-ONE", () => this.pickCard(0));
      on("keydown-TWO", () => this.pickCard(1));
      on("keydown-THREE", () => this.pickCard(2));
      // Command layer (v021): squad orders + origin ability + map screens.
      on("keydown-Q", () => this.issueSquad("follow"));
      on("keydown-E", () => this.issueSquad("focus"));
      on("keydown-R", () => this.issueSquad("hold"));
      on("keydown-F", () => this.useAbility());
      on("keydown-C", () => this.claimNearestSite());
      on("keydown-T", () => this.toggleTechMap());
      on("keydown-M", () => this.toggleCivMap());
    }
    this.input.on("pointerdown", this.unlockAudio);

    this.debugText = this.add.text(10, 110, "", {
      fontSize: "12px", color: "#7fff9f", fontFamily: "monospace", backgroundColor: "rgba(0,0,0,0.6)",
    });
    this.debugText.setScrollFactor(0).setDepth(50).setVisible(this.showDebug);

    document.addEventListener("visibilitychange", this.onHidden);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.onShutdown, this);

    this.buildHUD();
    this.tutorial.start();
    this.refreshGround(true);
    toast("ui.ageReached", t("age.stone"), t("objective.stone"));

    // Deterministic E2E/dev hook (query param only — never in production play).
    // Exposes scripted progression/death/introspection WITHOUT touching balance.
    if (new URLSearchParams(window.location.search).has("e2e")) {
      (window as unknown as { __seedE2E?: unknown }).__seedE2E = {
        grant: (n: number) => {
          const ev: SimEvent[] = [];
          this.sim.gainKnowledge(n, "e2e", ev);
          this.handleEvents(ev);
        },
        kill: () => this.handleEvents(this.sim.e2eKillPlayer()),
        readyAscend: () => {
          // Test-only shortcut for the boss-kill trigger; ascend() itself
          // (child world, fresh streams, stat separation) runs the real path.
          this.sim.state.ascendReady = true;
          this.refreshHUD();
        },
        readyExpansion: () => {
          // Test-only staging for the Industrial transition: satisfies the
          // CURRENT canonical gates (knowledge + mission + dominion) through
          // real paths — two genuine distinct claims + specializations plus
          // coherent breakthrough evidence — then the age-up, events, and
          // modal queue run real code. Returns self-diagnostics (Phase A A1).
          const s = this.sim.state;
          s.ageIndex = 2;
          s.elapsed = 400;
          s.ageElapsed = 130;
          s.knowledgeTotal = 2800;
          s.ageKills = 120;
          s.elitesAge = 1;
          for (const e of s.enemies) e.active = false;
          for (const t of ["fire", "tools"]) if (!s.ownedTags.includes(t)) s.ownedTags.push(t);
          if (!s.breakthroughs.includes("metallurgy")) s.breakthroughs.push("metallurgy");
          const { cx, cy } = worldToChunk(s.px, s.py);
          const claimed: string[] = [];
          outer: for (let r = 0; r < 6 && claimed.length < 2; r++) {
            for (let ox = -r; ox <= r && claimed.length < 2; ox++) {
              for (let oy = -r; oy <= r && claimed.length < 2; oy++) {
                const desc = this.sim.chunks.get(s.worldSeed, s.worldNonce, cx + ox, cy + oy);
                for (const poi of desc.poi) {
                  if (s.poisWorld.includes(poi.id)) continue;
                  s.px = poi.wx;
                  s.py = poi.wy;
                  s.poisWorld.push(poi.id);
                  s.stats.poisTotal++;
                  this.handleEvents(this.sim.claimTerritory(poi.id));
                  this.handleEvents(this.sim.setOutpostSpec(poi.id, "research"));
                  claimed.push(poi.id);
                  if (claimed.length >= 2) break outer;
                }
              }
            }
          }
          this.refreshHUD();
          const gates = ageGates(3, s.knowledgeTotal, this.missionStateOf(s), this.dominionStateOf(s));
          const ds = this.dominionStateOf(s);
          return {
            ready: gates.every((g) => g.done),
            gates: gates.map((g) => ({ id: g.id, have: g.have, need: g.need, done: g.done })),
            activeOutposts: ds.active,
            specialized: ds.specialized,
            breakthroughs: s.breakthroughs.length,
          };
        },
        advance: (seconds: number) => {
          // Test-only deterministic fast-forward (E2E time travel): godmode
          // on, idle input, queued drafts auto-picked. Never in normal play.
          const s = this.sim.state;
          s.build.hp = 1e9;
          s.build.maxHp = 1e9;
          const steps = Math.max(0, Math.floor(seconds * 60));
          for (let i = 0; i < steps; i++) {
            const ev = this.sim.step(SIM_DT, { moveX: 0, moveY: 0, dashPressed: false });
            for (const e of ev) {
              if (e.type === "draft_opened") { while (s.draftOpen && !s.over) this.sim.chooseDraft(0); }
            }
            if (s.over) break;
          }
          while (s.draftOpen && !s.over) this.sim.chooseDraft(0);
          this.refreshHUD();
        },
        hash: () => this.sim.hash(),
        snapshot: () => this.sim.snapshot(),
        seed: () => this.masterSeed,
        cleanPresentation: () => {
          const s = this.sim.state;
          s.build.hp = 100;
          s.build.maxHp = 100;
          this.refreshHUD();
        },
        setLang: (code: "en" | "th") => this.applyLanguage(code),
        teleportToPOI: () => {
          // Test-only staging: move to the nearest undiscovered POI so
          // discovery/claim flows run without a 10-minute walk.
          const s = this.sim.state;
          const { cx, cy } = worldToChunk(s.px, s.py);
          let best: { x: number; y: number; d: number } | null = null;
          for (let ox = -3; ox <= 3; ox++) {
            for (let oy = -3; oy <= 3; oy++) {
              const desc = this.sim.chunks.get(s.worldSeed, s.worldNonce, cx + ox, cy + oy);
              for (const poi of desc.poi) {
                if (s.poisWorld.includes(poi.id)) continue;
                const d = Math.hypot(poi.wx - s.px, poi.wy - s.py);
                if (!best || d < best.d) best = { x: poi.wx, y: poi.wy, d };
              }
            }
          }
          if (best) {
            s.px = best.x;
            s.py = best.y;
          }
          this.refreshHUD();
          return best !== null;
        },
        tryClaim: () => {
          // Mirrors the contextual CLAIM button exactly: nearest claimable
          // POI, real claimTerritory preconditions, zero staging/clearing.
          const list = this.sim.claimablePOIs();
          if (list.length === 0) return "";
          const c = list[0] as { poiId: string };
          const before = this.sim.state.territories.length;
          this.handleEvents(this.sim.claimTerritory(c.poiId));
          return this.sim.state.territories.length > before ? c.poiId : "";
        },
        claimFirst: () => {
          // Test-only staging: clear the field, then run the real
          // claim + specialization path on the first claimable POI.
          const s = this.sim.state;
          for (const e of s.enemies) e.active = false;
          const list = this.sim.claimablePOIs();
          const c = list.find((x) => x.clear) ?? list[0];
          if (!c) return "";
          this.handleEvents(this.sim.claimTerritory(c.poiId));
          this.handleEvents(this.sim.setOutpostSpec(c.poiId, "research"));
          this.refreshHUD();
          return c.poiId;
        },
        openSpecPicker: (poiId?: string) => {
          const s = this.sim.state;
          const id = poiId || s.territories[0]?.poiId || "e2e_outpost";
          this.showSpecPicker(id);
        },
      };
    }


    // QA playtest harness: read-only observer, query-gated, zero gameplay effect.
    if (isQAMode(window.location.search)) this.startQa();
  }

  /** QA session bootstrap (?qa=1 only). Never runs in normal play. */
  private startQa(): void {
    const adapter = {
      frame: () => this.buildQaFrame(),
      snapshot: () => {
        try {
          return this.sim.snapshot();
        } catch {
          return "";
        }
      },
      lang: () => getLang(),
      versions: () => ({
        packageVersion: (pkg as { version: string }).version,
        worldgen: WORLDGEN_VERSION,
        content: CONTENT_VERSION,
        saveSchema: SAVE_SCHEMA_VERSION,
      }),
      ageOrder: () => AGES as readonly string[],
    };
    this.qa = new QaSession(adapter);
    this.qa.start();
    // F4 diagnostics OFF by default (Phase 2): recording continues regardless.
    this.qaOverlay = false;
    this.qaGfx = this.add.graphics().setDepth(40);
    this.qaGfx.setVisible(false);
    this.qaText = this.add.text(10, 200, "", {
      fontSize: "12px", color: "#ffe08a", fontFamily: "monospace", backgroundColor: "rgba(0,0,0,0.65)",
    });
    this.qaText.setScrollFactor(0).setDepth(50).setVisible(false);
    const kb = this.input.keyboard;
    if (kb) {
      const toggle = (): void => {
        this.qaOverlay = !this.qaOverlay;
        this.qaGfx?.setVisible(this.qaOverlay);
        this.qaText?.setVisible(this.qaOverlay);
      };
      kb.on("keydown-F4", toggle);
      this.keyHandlers.push({ event: "keydown-F4", fn: toggle });
    }
  }

  /** Map canonical sim state → plain QA frame data (observe, never mutate). */
  private buildQaFrame(): QaFrameData {
    const s = this.sim.state;
    let enemies = 0;
    for (const e of s.enemies) if (e.active) enemies++;
    let projs = 0;
    for (const p of s.projs) if (p.active) projs++;
    let pickups = 0;
    for (const k of s.pickups) if (k.active) pickups++;
    let mines = 0;
    for (const m of s.mines) if (m.active) mines++;
    let simSum = 0;
    for (const v of this.simSamples) simSum += v;
    const bossActive = s.bossIndex >= 0 && (s.enemies[s.bossIndex]?.active === true);
    const next = s.ageIndex + 1;
    const ageId = AGES[s.ageIndex] as AgeId;
    return {
      simTime: s.elapsed,
      runElapsed: s.runElapsed,
      age: ageId,
      ageIndex: s.ageIndex,
      ascension: s.ascension,
      masterSeed: s.masterSeed,
      worldSeed: s.worldSeed,
      px: s.px,
      py: s.py,
      over: s.over,
      draftOpen: s.draftOpen,
      enemies,
      projs,
      pickups,
      mines,
      enemyCap: MAX_ENEMIES,
      projCap: MAX_PROJ,
      pickupCap: MAX_PICKUP,
      bossSpawned: s.bossSpawned,
      bossIndex: s.bossIndex,
      bossActive,
      bossKills: s.stats.bosses,
      ascendReady: s.ascendReady,
      runKills: s.runKills,
      runHighestAge: s.runHighestAge,
      level: s.level,
      owned: [...s.owned],
      fps: this.fpsEMA,
      frameMs: this.frameSamples.length > 0 ? (this.frameSamples[this.frameSamples.length - 1] as number) : 0,
      simMsAvg: this.simSamples.length > 0 ? simSum / this.simSamples.length : 0,
      queries: this.sim.queryCount,
      buckets: this.sim.spatialBucketCount,
      chunkHits: this.sim.chunks.hits,
      chunkMisses: this.sim.chunks.misses,
      chunkCx: worldToChunk(s.px, s.py).cx,
      chunkCy: worldToChunk(s.px, s.py).cy,
      biome: this.qaBiome,
      objective: next < AGES.length
        ? (() => {
          const gates = ageGates(next, s.knowledgeTotal, this.missionStateOf(s), this.dominionStateOf(s));
          const kn = gates.find((g) => g.id === "knowledge");
          const dm = gates.find((g) => g.id === "dominion");
          const mi = gates.find((g) => g.id === "mission");
          return {
            killsHave: mi?.have ?? 0,
            killsNeed: mi?.need ?? 0,
            knowHave: kn?.have ?? 0,
            knowNeed: kn?.need ?? 0,
            elapsedHave: dm?.have ?? 0,
            elapsedNeed: dm?.need ?? 0,
          };
        })()
        : null,
      nearestPOI: this.qaPoi,
      buildSummary: `lv${s.level}+${s.stats.techsTaken}t[${s.breakthroughs.join("+") || "-"}]`,
      originId: s.originId,
      activeFamilies: activeFamilies(s.originId, s.expansionFamily),
      breakthroughs: [...s.breakthroughs],
      legacies: [...s.legacies],
      poiClaims: [...s.poiFamiliesClaimed],
      knowledgeTotal: Math.floor(s.knowledgeTotal),
      weaponStages: `k${s.weaponStage.kinetic}e${s.weaponStage.energy}d${s.weaponStage.defense}f${s.weaponStage.field}`,
      techsTaken: s.stats.techsTaken,
    };
  }

  /** Throttled world-context scan for the QA overlay (1 Hz — never per frame). */
  private scanQaWorld(): void {
    const s = this.sim.state;
    try {
      const { cx, cy } = worldToChunk(s.px, s.py);
      const here = this.sim.chunks.get(s.worldSeed, s.worldNonce, cx, cy);
      this.qaBiome = here.biome;
      let best: QaPOIInfo | null = null;
      for (let ox = -2; ox <= 2; ox++) {
        for (let oy = -2; oy <= 2; oy++) {
          const desc = this.sim.chunks.get(s.worldSeed, s.worldNonce, cx + ox, cy + oy);
          for (const poi of desc.poi) {
            const found = s.poisWorld.includes(poi.id);
            const dx = poi.wx - s.px;
            const dy = poi.wy - s.py;
            const dist = Math.hypot(dx, dy);
            const cand: QaPOIInfo = { dx, dy, dist, poiType: poi.type, found };
            if (!best) best = cand;
            else if (best.found && !found) best = cand; // undiscovered wins
            else if (best.found === found && dist < best.dist) best = cand;
          }
        }
      }
      // Prefer undiscovered POIs; fall back to nearest discovered.
      this.qaPoi = best;
    } catch {
      // QA must never break gameplay.
    }
  }

  /** Diagnostic readability overlay (F4, QA mode only): chunk + POI guidance. */
  private drawQaOverlay(): void {
    const g = this.qaGfx;
    const tx = this.qaText;
    const f = this.qa?.lastFrame;
    if (!g || !tx || !f) return;
    g.clear();
    const gx = f.chunkCx * CHUNK_SIZE;
    const gy = f.chunkCy * CHUNK_SIZE;
    g.lineStyle(2, 0xffe08a, 0.8);
    g.strokeRect(gx, gy, CHUNK_SIZE, CHUNK_SIZE);
    if (f.nearestPOI && !f.nearestPOI.found) {
      g.lineStyle(2, 0x53e0c8, 0.9);
      g.lineBetween(f.px, f.py, f.px + f.nearestPOI.dx, f.py + f.nearestPOI.dy);
      g.fillStyle(0x53e0c8, 1);
      g.fillCircle(f.px + f.nearestPOI.dx, f.py + f.nearestPOI.dy, 8);
    }
    const o = f.objective;
    tx.setText(
      `QA pos ${f.px.toFixed(0)},${f.py.toFixed(0)}  chunk ${f.chunkCx},${f.chunkCy}  biome ${f.biome}\n` +
      `POI ${f.nearestPOI ? `${f.nearestPOI.poiType} ${f.nearestPOI.dist.toFixed(0)}u${f.nearestPOI.found ? " (found)" : ""}` : "none nearby"}\n` +
      `obj ${o ? `☠${Math.min(o.killsHave, o.killsNeed)}/${o.killsNeed} kn${o.knowHave}/${o.knowNeed} t${o.elapsedHave}/${o.elapsedNeed}` : "max age"}\n` +
      `foes ${f.enemies}  boss ${f.bossSpawned ? (f.bossActive ? "FIGHT" : "down?") : "—"}  asc ${f.ascension}`,
    );
  }

  /** Language switch: DOM text only — sim/RNG/state untouched (tested). */
  private applyLanguage(code: "en" | "th"): void {
    const from = getLang();
    const qaBefore = this.qa ? this.qa.beforeLangSwitch() : "";
    const sv = loadSave(localStorage);
    sv.settings.lang = code;
    storeSave(localStorage, sv);
    setLang(code);
    document.getElementById("pause-screen")?.remove();
    this.buildHUD();
    if (this.paused) this.showPause();
    // New prose lengths change node footprints: re-layout the open map.
    if (this.techMapOpen && this.techMapView) this.techMapView.relayout();
    if (this.qa && qaBefore) this.qa.afterLangSwitch(qaBefore, from, code);
  }

  private unlockAudio = (): void => {
    sfx.unlock();
  };

  private onHidden = (): void => {
    const s = this.sim?.state;
    if (s && document.hidden && !this.paused && !s.over && !s.draftOpen) this.togglePause();
  };

  private onShutdown(): void {
    this.techMapView?.destroy();
    this.techMapView = null;
    this.tutorial?.dispose();
    this.tutorial = null;
    this.qa?.dispose();
    this.qa = null;
    this.qaGfx = null;
    this.qaText = null;
    this.bossGfx = null;
    document.removeEventListener("visibilitychange", this.onHidden);
    this.input.off("pointerdown", this.unlockAudio);
    const kb = this.input.keyboard;
    if (kb) for (const h of this.keyHandlers) kb.off(h.event, h.fn);
    this.keyHandlers = [];
  }

  // ------------------------------------------------------------- HUD (DOM)
  private buildHUD(): void {
    clearUI();
    const root = uiRoot();
    const hud = el("div", "hud");
    // Top-left: ONE actionable macro objective + compass (§11/20).
    const topLeft = el("div", "hud-top-left");
    const age = el("div", "hud-objective");
    topLeft.appendChild(age);
    const compass = el("div", "nav-compass");
    topLeft.appendChild(compass);
    hud.appendChild(topLeft);
    // Top strip secondary info (level/time/kills/seed; collapses at density).
    const top = el("div", "hud-top");
    const stats = el("div", "hud-stats");
    top.appendChild(stats);
    hud.appendChild(top);
    // Bottom-left: ONE player command dock (HP/origin/squad/ability/techmap).
    const dock = el("div", "hud-dock-bl");
    const status = el("div", "status-card");
    const hpLine = el("div", "status-hp");
    const hpBar = el("div", "mini-bar");
    const hpFill = document.createElement("div");
    hpFill.className = "mini-fill hp";
    hpBar.appendChild(hpFill);
    status.appendChild(hpLine);
    status.appendChild(hpBar);
    const identLine = el("div", "status-ident");
    status.appendChild(identLine);
    const squadLine = el("div", "status-squad");
    status.appendChild(squadLine);
    dock.appendChild(status);
    // Bottom-center knowledge progress (SECONDARY).
    const know = el("div", "knowledge-card");
    const knowLabel = el("div", "knowledge-label", "ui.knowledge");
    const knowNums = el("div", "knowledge-nums");
    const knowBar = el("div", "mini-bar");
    const knowFill = document.createElement("div");
    knowFill.className = "mini-fill kn";
    knowBar.appendChild(knowFill);
    know.appendChild(knowLabel);
    know.appendChild(knowNums);
    know.appendChild(knowBar);
    hud.appendChild(know);
    // Top-right next-age checklist card (PRIMARY objective).
    const topRight = el("div", "hud-top-right");
    const ageCard = el("div", "age-card");
    topRight.appendChild(ageCard);
    // Build plan line (kept class for e2e; shows pinned target + goals).
    const goals = el("div", "hud-goals");
    topRight.appendChild(goals);
    // Persistent action container OUTSIDE wiped blocks (P1-01 class).
    const ascendWrap = el("div", "hud-ascend");
    topRight.appendChild(ascendWrap);
    hud.appendChild(topRight);
    // Territory / claim action bar (inside the bottom-left dock).
    const terrBar = el("div", "territory-bar");
    dock.appendChild(terrBar);
    // Tech map button (T also works).
    const techBtn = document.createElement("button");
    techBtn.id = "techmap-btn";
    techBtn.className = "btn prompt-badge";
    const tIcon = document.createElement("img");
    tIcon.src = SEED_ASSETS.prompts.t;
    tIcon.className = "prompt-key-icon";
    tIcon.alt = "T";
    techBtn.appendChild(tIcon);
    const tText = document.createElement("span");
    tText.textContent = ` ${t("ui.techMap")} [T]`;
    techBtn.appendChild(tText);
    techBtn.addEventListener("click", () => this.toggleTechMap());
    dock.appendChild(techBtn);
    hud.appendChild(dock);
    // Tactical minimap (bottom-right zone).
    const mmZone = el("div", "hud-bottom-right");
    const mm = document.createElement("canvas");
    mm.id = "minimap";
    mm.width = 148;
    mm.height = 148;
    mmZone.appendChild(mm);
    hud.appendChild(mmZone);
    const bossBar = el("div", "boss-bar");
    bossBar.style.display = "none";
    const bossFill = document.createElement("div");
    bossFill.className = "boss-fill";
    bossBar.appendChild(bossFill);
    const bossLabel = el("div", "boss-label", "ui.boss");
    bossBar.appendChild(bossLabel);
    hud.appendChild(bossBar);
    root.appendChild(hud);
    const hint = el("div", "onboard-hint");
    hint.style.display = "none";
    root.appendChild(hint);
    this.hud = {
      stats, age, compass, status, hpLine, hpFill, identLine, squadLine,
      know, knowNums, knowFill, ageCard, goals, ascendWrap, terrBar, techBtn,
      minimap: mm, bossBar, bossFill, hint,
    };
    this.refreshHUD();
  }

  private refreshHUD(): void {
    const s = this.sim.state;
    const { stats, age, hpLine, hpFill, identLine, squadLine, knowNums, knowFill, ageCard, goals } = this.hud;
    if (!stats || !age || !hpLine || !hpFill || !identLine || !squadLine || !knowNums || !knowFill || !ageCard || !goals) return;
    const ageId = AGES[s.ageIndex] as AgeId;
    const mm = Math.floor(s.runElapsed / 60);
    const ss = Math.floor(s.runElapsed % 60).toString().padStart(2, "0");
    // Top strip: level · time · kills · seed (secondary, compact).
    stats.innerHTML = "";
    const add = (txt: string, cls = ""): void => {
      const span = document.createElement("span");
      if (cls) span.className = cls;
      span.textContent = txt;
      stats.appendChild(span);
    };
    add(`${t("ui.level")} ${s.level}`);
    add(`${mm}:${ss}`);
    add(`☠ ${s.stats.kills}`);
    add(this.masterSeed, "hud-seed");
    // Status card: HP number + compact bar, origin · age, squad state.
    hpLine.textContent = `♥ ${Math.ceil(Math.max(0, s.build.hp))} / ${Math.ceil(s.build.maxHp)}`;
    hpFill.style.width = `${Math.max(0, (s.build.hp / s.build.maxHp) * 100)}%`;
    const origin = ORIGINS.find((o) => o.id === s.originId);
    const fams = activeFamilies(s.originId, s.expansionFamily)
      .map((f) => t(`family.${f}` as EnKeys)).join("+");
    identLine.textContent = `${origin ? t(origin.nameKey) : s.originId} (${fams}) · ${t(`age.${ageId}` as EnKeys)}`;
    const alive = s.squad.filter((a) => a.active).length;
    const abil = ORIGIN_ABILITY[originById(s.originId).id];
    const abilTxt = s.abilityCd > 0 ? `${t("ui.ability")} ${Math.ceil(s.abilityCd)}s` : `${t("ui.ability")}: ${t(abil.nameKey)} [F]`;
    squadLine.innerHTML = "";
    const squadTitle = document.createElement("span");
    squadTitle.textContent = `${t(ORIGIN_SQUAD_NAME[originById(s.originId).id])} ${alive}/${s.squad.length} · `;
    squadLine.appendChild(squadTitle);

    const modeBadge = document.createElement("span");
    modeBadge.className = "prompt-badge";
    const modeIcon = document.createElement("img");
    modeIcon.className = "prompt-key-icon";
    const modeKey = s.squadMode === "focus" ? "e" : s.squadMode === "hold" ? "r" : "q";
    modeIcon.src = SEED_ASSETS.prompts[modeKey];
    modeIcon.alt = modeKey.toUpperCase();
    modeBadge.appendChild(modeIcon);
    const modeText = document.createElement("span");
    modeText.textContent = ` ${s.squadMode.toUpperCase()} · `;
    modeBadge.appendChild(modeText);
    squadLine.appendChild(modeBadge);

    const abilBadge = document.createElement("span");
    abilBadge.className = "prompt-badge";
    const abilIcon = document.createElement("img");
    abilIcon.className = "prompt-key-icon";
    abilIcon.src = SEED_ASSETS.prompts.f;
    abilIcon.alt = "F";
    abilBadge.appendChild(abilIcon);
    const abilSpan = document.createElement("span");
    abilSpan.textContent = ` ${abilTxt}`;
    abilBadge.appendChild(abilSpan);
    squadLine.appendChild(abilBadge);
    // Knowledge card: progress toward the next age's threshold.
    const next = s.ageIndex + 1;
    const nextNeed = next < AGES.length ? (AGE_DEFS[next]?.knowledgeThreshold ?? 1) : 1;
    knowNums.textContent = `${Math.floor(s.knowledgeTotal)} / ${nextNeed}`;
    knowFill.style.width = `${Math.min(100, (s.knowledgeTotal / Math.max(1, nextNeed)) * 100)}%`;
    // Age card: one checklist row per gate (the SAME predicate as the sim).
    ageCard.innerHTML = "";
    if (next < AGES.length) {
      const title = document.createElement("div");
      title.className = "age-card-title";
      title.textContent = `${t("ui.nextAge")}: ${t(`age.${AGES[next] as AgeId}` as EnKeys)}`;
      ageCard.appendChild(title);
      const gates = ageGates(next, s.knowledgeTotal, this.missionStateOf(s), this.dominionStateOf(s));
      for (const g of gates) {
        const row = document.createElement("div");
        row.className = "gate-row" + (g.done ? " done" : "");
        const mark = document.createElement("span");
        mark.className = "gate-mark";
        mark.textContent = g.done ? "✓" : "✗";
        const lab = document.createElement("span");
        lab.className = "gate-label";
        lab.textContent = `${t(g.labelKey)} ${g.have}/${g.need}`;
        const bar = document.createElement("div");
        bar.className = "gate-bar";
        const fill = document.createElement("div");
        fill.className = "gate-fill";
        fill.style.width = `${g.need > 0 ? Math.min(100, (g.have / g.need) * 100) : 100}%`;
        bar.appendChild(fill);
        row.appendChild(mark);
        row.appendChild(lab);
        row.appendChild(bar);
        ageCard.appendChild(row);
        for (const mstep of g.mission) {
          const sub = document.createElement("div");
          sub.className = "gate-sub" + (mstep.done ? " done" : "");
          sub.textContent = `${mstep.done ? "✓" : "○"} ${t(mstep.labelKey)} ${mstep.have}/${mstep.need}`;
          ageCard.appendChild(sub);
        }
        for (const dsub of g.sub) {
          const sub = document.createElement("div");
          sub.className = "gate-sub" + (dsub.done ? " done" : "");
          sub.textContent = `${dsub.done ? "✓" : "○"} ${t(dsub.labelKey)} ${dsub.have}/${dsub.need}`;
          ageCard.appendChild(sub);
        }
      }
    } else {
      ageCard.textContent = `${t(`age.${ageId}` as EnKeys)} · ${t("ui.progressKnowledge")} ${Math.floor(s.knowledgeTotal)}`;
    }
    // Mission one-liner under the top strip (QA structural class retained).
    age.textContent = this.frontierObjectiveText();
    // Persistent Ascension entry (STAY dismisses the offer screen; this stays).
    const wrap = this.hud.ascendWrap;
    if (wrap) {
      const want = s.ascendReady && !s.over;
      let ab = wrap.querySelector("button");
      if (want && !ab) {
        ab = document.createElement("button");
        ab.className = "btn primary";
        ab.style.pointerEvents = "auto";
        ab.textContent = t("ui.ascend");
        ab.addEventListener("click", () => this.showLegacyPick());
        wrap.appendChild(ab);
      } else if (!want && ab) {
        ab.remove();
      }
    }
    // Build plan line: pinned target + nearest breakthrough goals.
    const pin = s.pinnedTarget !== "" ? `${t("ui.buildPlan")}: ${this.planLabel(s.pinnedTarget)} · ` : "";
    const near = nearestBreakthroughs([...s.ownedTags], [...s.breakthroughs], 2)
      .map((p) => `${t(p.titleKey)} ${p.have}/${p.need}`).join(" · ");
    goals.textContent = pin + near;
    if (s.bossIndex >= 0) {
      const boss = s.enemies[s.bossIndex];
      if (boss?.active) {
        const span = document.createElement("span");
        span.textContent = ` ${t("ui.boss")} ${Math.ceil((boss.hp / boss.maxHp) * 100)}%`;
        stats.appendChild(span);
      }
    }
    this.refreshBossBar();
    this.navT -= 0.15;
    if (this.navT <= 0) {
      this.navT = 1;
      this.applyHudDensity();
      this.updateFrontier();
      this.updateCompass();
      this.updateTerritoryBar();
      this.drawMinimap();
    }
    this.updateOnboard();
  }

  /** Mission counters for the shared advancement contract (HUD == sim). */
  private missionStateOf(s: RunSimulation["state"]): import("../../core/progression/missions").MissionState {
    const active = activeTerritories(s.territories);
    return {
      ageKills: s.ageKills,
      territoriesClaimed: s.territories.length,
      elitesAge: s.elitesAge,
      outpostsTier2: active.filter((x) => x.tier >= 2).length,
      raidsSurvived: s.raidsSurvived,
      signalSecured: s.signalSecured,
      breakthroughs: s.breakthroughs.length,
    };
  }

  /** Dominion control state (disabled outposts never count). */
  private dominionStateOf(s: RunSimulation["state"]): import("../../core/progression/ages").DominionState {
    const active = activeTerritories(s.territories);
    return {
      active: active.length,
      specialized: active.filter((x) => x.spec !== "").length,
      tier2: active.filter((x) => x.tier >= 2).length,
      raidsSurvived: s.raidsSurvived,
    };
  }

  /** ONE actionable macro objective, top-left (§11/20). */
  private frontierObjectiveText(): string {
    const s = this.sim.state;
    const f = this.frontierFocus;
    const arrowFor = (dx: number, dy: number): string => {
      const arrows = ["→", "↘", "↓", "↙", "←", "↖", "↑", "↗"];
      const idx = ((Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) % 8) + 8) % 8;
      return arrows[idx] as string;
    };
    if (!f) return t(`age.${AGES[s.ageIndex] as AgeId}` as EnKeys);
    const site = f.site;
    const dist = site ? Math.hypot(site.x - s.px, site.y - s.py).toFixed(0) : "";
    const arrow = site ? arrowFor(site.x - s.px, site.y - s.py) : "";
    switch (f.kind) {
      case "raid": {
        const terr = s.territories.find((x) => x.poiId === site?.poiId);
        const nm = terr ? t(`poi.${terr.poiType}.name` as EnKeys) : "";
        const secs = s.raid ? Math.max(0, Math.ceil(s.raid.tMinus)) : 0;
        return `${t("ui.raidIncoming")}: ${nm} ${secs}s ${arrow} ${dist}u`;
      }
      case "stronghold": {
        const bossOn = s.bossIndex >= 0 && s.enemies[s.bossIndex]?.active === true;
        return bossOn
          ? `${t("ui.boss")} ${arrow} ${dist}u`
          : `${t("objective.assaultStronghold")} ${arrow} ${dist}u`;
      }
      case "claim": {
        const nm = site ? t(`poi.${site.poiType}.name` as EnKeys) : "";
        return `${t("ui.establishOutpost")}: ${nm} ${arrow} ${dist}u`;
      }
      case "clear": {
        const nm = site ? t(`poi.${site.poiType}.name` as EnKeys) : "";
        return `${nm}: ${t("ui.claimNeedClear")} (${site?.foes ?? 0}) ${arrow} ${dist}u`;
      }
      case "dominion":
        return `${t("gate.dominion")}: ${f.dominionHave ?? 0}/${f.dominionNeed ?? 0} ${arrow}`;
      case "site": {
        const nm = site ? t(`poi.${site.poiType}.name` as EnKeys) : "";
        return `◈ ${nm} ${arrow} ${dist}u`;
      }
    }
  }

  /** Human label for a pinned target (tech name or breakthrough title). */
  private planLabel(id: string): string {
    const s = this.sim.state;
    const node = s.owned.includes(id)
      ? undefined
      : this.sim.techGraph().find((n) => n.id === id);
    if (node) return t(node.titleKey as EnKeys);
    const b = BREAKTHROUGHS.find((x) => x.id === id);
    if (b) return t(b.titleKey);
    return id;
  }

  /** Squad order / origin ability entry points (Q/E/R/F). */
  private issueSquad(mode: "follow" | "focus" | "hold"): void {
    const s = this.sim.state;
    if (s.over || this.techMapOpen) return;
    this.handleEvents(this.sim.setSquadMode(mode));
  }

  private useAbility(): void {
    const s = this.sim.state;
    if (s.over || this.techMapOpen) return;
    this.handleEvents(this.sim.tryAbility());
  }

  /** Territory action bar: CLAIM buttons + spec/upgrade for owned posts. */
  private updateTerritoryBar(): void {
    const bar = this.hud.terrBar;
    if (!bar) return;
    const s = this.sim.state;
    bar.innerHTML = "";
    for (const terr of s.territories) {
      if (terr.spec !== "" || terr.disabled) continue;
      const b = document.createElement("button");
      b.className = "btn terr-spec-btn";
      b.textContent = `${t("ui.outpostSpec")} (${t(`poi.${terr.poiType}.name` as EnKeys)})`;
      b.addEventListener("click", () => this.showSpecPicker(terr.poiId));
      bar.appendChild(b);
    }
    for (const terr of s.territories) {
      if (terr.disabled || terr.spec === "" || terr.tier !== 1) continue;
      const ready = s.elapsed - terr.heldSince >= 90;
      const b = document.createElement("button");
      b.className = "btn terr-up-btn";
      b.disabled = !ready;
      b.textContent = ready
        ? `${t("ui.upgrade")} (${t(`poi.${terr.poiType}.name` as EnKeys)})`
        : t("ui.upgradeNeedHold");
      if (ready) b.addEventListener("click", () => this.handleEvents(this.sim.upgradeOutpost(terr.poiId)));
      bar.appendChild(b);
    }
    for (const c of this.sim.claimablePOIs()) {
      // No claim button while hostiles remain: the objective line + C key
      // carry the clear state instead (§9).
      if (!c.clear) continue;
      const b = document.createElement("button");
      b.className = "btn terr-claim-btn";
      b.textContent = `${t("ui.claim")}: ${t(`poi.${c.poiType}.name` as EnKeys)}`;
      b.addEventListener("click", () => {
        const ev = this.sim.claimTerritory(c.poiId);
        this.handleEvents(ev);
        const terr = s.territories.find((x) => x.poiId === c.poiId);
        if (terr && terr.spec === "") this.showSpecPicker(c.poiId);
      });
      bar.appendChild(b);
    }
  }

  /**
   * Frontier site scan (1 Hz, shared by objective/compass/minimap/civmap).
   * Discovered, unclaimed POIs within 2000u with live foe counts + states.
   */
  private scanSites(): FrontierSite[] {
    const s = this.sim.state;
    const out: FrontierSite[] = [];
    if (s.over) return out;
    const claimed = new Set(s.territories.map((t) => t.poiId));
    const { cx, cy } = worldToChunk(s.px, s.py);
    for (let ox = -4; ox <= 4; ox++) {
      for (let oy = -4; oy <= 4; oy++) {
        const desc = this.sim.chunks.get(s.worldSeed, s.worldNonce, cx + ox, cy + oy);
        for (const poi of desc.poi) {
          if (!s.poisWorld.includes(poi.id) || claimed.has(poi.id)) continue;
          const dist = Math.hypot(poi.wx - s.px, poi.wy - s.py);
          if (dist > 2000) continue;
          this.siteScratch.length = 0;
          const foes = this.sim.queryRadius(poi.wx, poi.wy, CLAIM_CLEAR_RADIUS, this.siteScratch);
          out.push({
            poiId: poi.id,
            poiType: poi.type,
            x: poi.wx,
            y: poi.wy,
            dist,
            foes: foes.length,
            state: classifySite({
              discovered: true, claimed: false, disabled: false, underAttack: false,
              foes: foes.length, inReach: dist <= CLAIM_REACH_RADIUS,
            }),
          });
        }
      }
    }
    out.sort((a, b) => a.dist - b.dist);
    return out;
  }

  /** Recompute the single shared frontier focus (§11/22). */
  private updateFrontier(): void {
    const s = this.sim.state;
    this.frontierSites = this.scanSites();
    let raid: { poiId: string; x: number; y: number; tMinus: number } | null = null;
    if (s.raid) {
      const terr = s.territories.find((x) => x.poiId === s.raid?.poiId);
      if (terr) raid = { poiId: terr.poiId, x: terr.x, y: terr.y, tMinus: s.raid.tMinus };
    }
    const next = s.ageIndex + 1;
    const req = next < AGES.length ? AGE_DEFS[next]?.dominion : undefined;
    const ds = this.dominionStateOf(s);
    this.frontierFocus = frontierObjective({
      raid,
      stronghold: s.stronghold,
      bossActive: s.bossIndex >= 0 && (s.enemies[s.bossIndex]?.active === true),
      openSites: this.frontierSites,
      dominionHave: ds.active,
      dominionNeed: req?.outposts ?? 0,
    });
    // Telemetry (§36): site states, focus changes, claim prompts, first claim,
    // and dominion progression. Read-only observation, never gameplay.
    const qa = this.qa;
    if (!qa) return;
    for (const site of this.frontierSites) {
      if (site.state === "CONTESTED" || site.state === "CLAIMABLE") {
        if (!this.claimPromptsSeen.has(site.poiId)) {
          this.claimPromptsSeen.add(site.poiId);
          qa.noteSimEvent("site_prompt", `${site.state}:${site.poiType}`);
        }
      }
    }
    const focusId = this.frontierFocus?.site?.poiId ?? this.frontierFocus?.kind ?? "";
    if (focusId !== this.prevFocusId) {
      this.prevFocusId = focusId;
      if (focusId) qa.noteSimEvent("focus", focusId);
    }
    if (!this.firstClaimLogged && s.territories.length > 0) {
      this.firstClaimLogged = true;
      qa.noteSimEvent("first_claim", `${s.elapsed.toFixed(1)}s`);
    }
    if (ds.active !== this.prevDominion) {
      this.prevDominion = ds.active;
      qa.noteSimEvent("dominion", `${ds.active}/${req?.outposts ?? 0}`);
    }
  }

  /** [C] claims the nearest valid, clear, in-reach, unclaimed site. */
  private claimNearestSite(): void {
    const s = this.sim.state;
    if (s.over || this.techMapOpen || this.civMapOpen || this.blockingModal) return;
    const c = this.sim.claimablePOIs().find((x) => x.clear);
    if (!c) return;
    this.handleEvents(this.sim.claimTerritory(c.poiId));
    const terr = s.territories.find((x) => x.poiId === c.poiId);
    if (terr && terr.spec === "") this.showSpecPicker(c.poiId);
    this.qa?.noteSimEvent("claim_key", c.poiId);
  }

  /** Binding outpost-specialization picker (pauses stepping until decided). */
  private showSpecPicker(poiId: string): void {
    const specs: Array<{ id: OutpostSpec; name: EnKeys; desc: EnKeys }> = [
      { id: "research", name: "ui.specResearch", desc: "ui.specResearchDesc" },
      { id: "military", name: "ui.specMilitary", desc: "ui.specMilitaryDesc" },
      { id: "economy", name: "ui.specEconomy", desc: "ui.specEconomyDesc" },
    ];
    this.showBlocking("spec-screen", 0, (screen) => {
      const panel = el("div", "panel panel-md");
      panel.appendChild(el("h2", "", "ui.outpostSpec"));
      const row = el("div", "btn-row");
      for (const sp of specs) {
        const b = document.createElement("button");
        b.className = "btn primary terr-spec-btn";
        const icon = document.createElement("img");
        icon.src = SEED_ASSETS.structures[sp.id];
        icon.className = "structure-preview-icon";
        icon.alt = sp.id;
        b.appendChild(icon);
        const txt = document.createElement("span");
        txt.textContent = `${t(sp.name)} — ${t(sp.desc)}`;
        b.appendChild(txt);
        b.addEventListener("click", () => {
          this.handleEvents(this.sim.setOutpostSpec(poiId, sp.id));
          this.closeBlocking();
        });
        row.appendChild(b);
      }
      panel.appendChild(row);
      screen.appendChild(panel);
    });
  }

  /** Tech Map (T): the SAME deterministic graph the sim drafts, made visible with Dagre and Panzoom. */
  private toggleTechMap(): void {
    const s = this.sim.state;
    if (s.over) return;
    if (this.civMapOpen) this.toggleCivMap();
    if (this.techMapOpen) {
      this.techMapView?.destroy();
      this.techMapView = null;
      document.getElementById("techmap-screen")?.remove();
      this.techMapOpen = false;
      return;
    }
    if (s.draftOpen || this.blockingModal) return;
    this.techMapOpen = true;
    this.techMapSel = "";
    this.qa?.noteSimEvent("techmap_open", "open");
    this.tutorial?.onTechMapOpened();
    this.renderTechMap();
  }

  private renderTechMap(): void {
    if (this.techMapView) {
      this.techMapView.destroy();
      this.techMapView = null;
    }
    document.getElementById("techmap-screen")?.remove();
    this.techMapView = new TechMapView({
      sim: this.sim,
      selectedId: this.techMapSel,
      onSelect: (id) => {
        this.techMapSel = id;
      },
      onPin: (id) => {
        this.handleEvents(this.sim.pinTarget(id));
      },
      onClose: () => {
        this.toggleTechMap();
      },
    });
    this.techMapView.mount(uiRoot());
  }

  /** Civilization map (M): large explored-world view + territory ledger. */
  private toggleCivMap(): void {
    const s = this.sim.state;
    if (s.over) return;
    if (this.techMapOpen) this.toggleTechMap();
    if (this.civMapOpen) {
      document.getElementById("civmap-screen")?.remove();
      this.civMapOpen = false;
      return;
    }
    if (s.draftOpen || this.blockingModal) return;
    this.civMapOpen = true;
    this.qa?.noteSimEvent("civmap_open", "open");
    this.tutorial?.onCivMapOpened();
    const root = uiRoot();
    const screen = el("div", "screen");
    screen.id = "civmap-screen";
    const panel = el("div", "panel panel-lg civmap-panel");
    panel.appendChild(el("h2", "", "ui.civilizationMap"));
    const cv = document.createElement("canvas");
    cv.width = 420;
    cv.height = 300;
    panel.appendChild(cv);
    const list = el("div", "civmap-list");
    if (s.territories.length === 0) {
      const d = document.createElement("div");
      d.textContent = "—";
      list.appendChild(d);
    }
    for (const terr of s.territories) {
      const d = document.createElement("div");
      const specKey = terr.spec === "" ? null : (`ui.spec${terr.spec[0]?.toUpperCase()}${terr.spec.slice(1)}` as EnKeys);
      const raidMark = s.raid && s.raid.poiId === terr.poiId ? ` ⚠ ${t("ui.raidIncoming")} ${Math.ceil(s.raid.tMinus)}s` : "";
      d.textContent = `◈ ${t(`poi.${terr.poiType}.name` as EnKeys)} · ` +
        `${specKey ? t(specKey) : "—"} · T${terr.tier} · HP ${Math.ceil(terr.hp)}/${terr.maxHp}${terr.disabled ? " · ✗" : ""}${raidMark}`;
      list.appendChild(d);
    }
    if (s.stronghold?.revealed) {
      const d = document.createElement("div");
      const dx = s.stronghold.x - s.px;
      const dy = s.stronghold.y - s.py;
      d.textContent = `👑 ${t("ui.stronghold")} · ${Math.hypot(dx, dy).toFixed(0)}u`;
      list.appendChild(d);
    }
    panel.appendChild(list);
    panel.appendChild(button("ui.back", () => this.toggleCivMap(), "btn primary"));
    screen.appendChild(panel);
    root.appendChild(screen);
    this.drawCivMap(cv);
  }

  private drawCivMap(cv: HTMLCanvasElement): void {
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const s = this.sim.state;
    const W = cv.width;
    const H = cv.height;
    const RANGE = 12;
    const { cx, cy } = worldToChunk(s.px, s.py);
    ctx.fillStyle = "#0b0e14";
    ctx.fillRect(0, 0, W, H);
    const cellX = W / (RANGE * 2 + 1);
    const cellY = H / (RANGE * 2 + 1);
    for (const m of minimapCells(s.chunksWorld, cx, cy, RANGE)) {
      if (!m.seen) continue;
      ctx.fillStyle = "#1d2a3a";
      ctx.fillRect((m.ox + RANGE) * cellX + 1, (m.oy + RANGE) * cellY + 1, cellX - 2, cellY - 2);
    }
    const dot = (wx: number, wy: number, color: string, r = 3): void => {
      const dx = (wx - s.px) / 512;
      const dy = (wy - s.py) / 512;
      if (Math.abs(dx) > RANGE || Math.abs(dy) > RANGE) return;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(W / 2 + dx * cellX, H / 2 + dy * cellY, r, 0, Math.PI * 2);
      ctx.fill();
    };
    for (const terr of s.territories) dot(terr.x, terr.y, terr.disabled ? "#555555" : "#53e0c8", 4);
    // Frontier network (derived, never persisted): each active territory
    // links to its two nearest open frontier sites (§21).
    const open: Array<{ x: number; y: number }> = [];
    for (let ox = -RANGE; ox <= RANGE; ox++) {
      for (let oy = -RANGE; oy <= RANGE; oy++) {
        const desc = this.sim.chunks.get(s.worldSeed, s.worldNonce, cx + ox, cy + oy);
        for (const poi of desc.poi) {
          if (s.poisWorld.includes(poi.id)) continue;
          dot(poi.wx, poi.wy, "#ffd166", 2);
          open.push({ x: poi.wx, y: poi.wy });
        }
      }
    }
    const toXY = (wx: number, wy: number): { x: number; y: number } => ({
      x: W / 2 + ((wx - s.px) / 512) * cellX,
      y: H / 2 + ((wy - s.py) / 512) * cellY,
    });
    ctx.strokeStyle = "rgba(83,224,200,0.4)";
    ctx.lineWidth = 1;
    for (const terr of s.territories) {
      if (terr.disabled) continue;
      const near = open
        .map((p) => ({ p, d: Math.hypot(p.x - terr.x, p.y - terr.y) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, 2);
      const a = toXY(terr.x, terr.y);
      for (const { p } of near) {
        const b = toXY(p.x, p.y);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      // Raid front marker on the raided node.
      if (s.raid && s.raid.poiId === terr.poiId) {
        ctx.strokeStyle = "#ff2222";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(a.x, a.y, 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = "rgba(83,224,200,0.4)";
        ctx.lineWidth = 1;
      }
    }
    const boss = s.bossIndex >= 0 ? s.enemies[s.bossIndex] : undefined;
    if (boss?.active) dot(boss.x, boss.y, "#ff2222", 5);
    dot(s.px, s.py, "#ffffff", 4);
    // Shared focus identity on the civ map: stronghold ring + site.
    if (s.stronghold?.revealed) {
      const dx = (s.stronghold.x - s.px) / 512;
      const dy = (s.stronghold.y - s.py) / 512;
      if (Math.abs(dx) <= RANGE && Math.abs(dy) <= RANGE) {
        ctx.strokeStyle = "#ff8800";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(W / 2 + dx * cellX, H / 2 + dy * cellY, 8, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    const cf = this.frontierFocus?.site;
    if (cf && cf.poiId !== "stronghold") dot(cf.x, cf.y, "#ffffff", 3);
  }
  private drawMinimap(): void {
    const cv = this.hud.minimap as HTMLCanvasElement | undefined;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const s = this.sim.state;
    const W = cv.width;
    const H = cv.height;
    const RANGE = 4;
    const { cx, cy } = worldToChunk(s.px, s.py);
    ctx.fillStyle = "rgba(8,12,18,0.85)";
    ctx.fillRect(0, 0, W, H);
    const cell = W / (RANGE * 2 + 1);
    // Fog by construction: only visited chunk keys render (contract-tested).
    for (const m of minimapCells(s.chunksWorld, cx, cy, RANGE)) {
      if (!m.seen) continue;
      ctx.fillStyle = "#1d2a3a";
      ctx.fillRect((m.ox + RANGE) * cell + 1, (m.oy + RANGE) * cell + 1, cell - 2, cell - 2);
    }
    const dot = (wx: number, wy: number, color: string, r = 2.5): void => {
      const dx = (wx - s.px) / 512;
      const dy = (wy - s.py) / 512;
      if (Math.abs(dx) > RANGE || Math.abs(dy) > RANGE) return;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(W / 2 + dx * cell, H / 2 + dy * cell, r, 0, Math.PI * 2);
      ctx.fill();
    };
    for (const terr of s.territories) {
      dot(terr.x, terr.y, terr.disabled ? "#555555" : "#53e0c8", 3.5);
    }
    if (s.raid) {
      const terr = s.territories.find((x) => x.poiId === s.raid?.poiId);
      if (terr) {
        const pulse = 3 + 2 * Math.sin(performance.now() / 200);
        dot(terr.x, terr.y, "#ff2222", pulse);
      }
    }
    for (let ox = -RANGE; ox <= RANGE; ox++) {
      for (let oy = -RANGE; oy <= RANGE; oy++) {
        const desc = this.sim.chunks.get(s.worldSeed, s.worldNonce, cx + ox, cy + oy);
        for (const poi of desc.poi) {
          if (s.poisWorld.includes(poi.id)) continue;
          dot(poi.wx, poi.wy, "#ffd166", 2);
        }
      }
    }
    const boss = s.bossIndex >= 0 ? s.enemies[s.bossIndex] : undefined;
    if (boss?.active) dot(boss.x, boss.y, "#ff2222", 4);
    dot(s.px, s.py, "#ffffff", 3);
    // Shared focus identity on the minimap: stronghold + current site.
    if (s.stronghold?.revealed) {
      const dx = (s.stronghold.x - s.px) / 512;
      const dy = (s.stronghold.y - s.py) / 512;
      if (Math.abs(dx) <= RANGE && Math.abs(dy) <= RANGE) {
        ctx.strokeStyle = "#ff8800";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(W / 2 + dx * cell, H / 2 + dy * cell, 7, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    const cf = this.frontierFocus?.site;
    if (cf && cf.poiId !== "stronghold") dot(cf.x, cf.y, "#ffffff", 2);
  }

  private refreshBossBar(): void {
    const bar = this.hud.bossBar;
    const fill = this.hud.bossFill;
    if (!bar || !fill) return;
    const s = this.sim.state;
    const boss = s.bossIndex >= 0 ? s.enemies[s.bossIndex] : undefined;
    if (boss?.active) {
      bar.style.display = "block";
      fill.style.width = `${Math.max(0, Math.min(100, (boss.hp / boss.maxHp) * 100))}%`;
    } else {
      bar.style.display = "none";
    }
  }

  /** Compass strip: ONE shared focus identity (§22) — boss, raid, stronghold, site. */
  private updateCompass(): void {
    const c = this.hud.compass;
    if (!c) return;
    const s = this.sim.state;
    const arrowFor = (dx: number, dy: number): string => {
      const arrows = ["→", "↘", "↓", "↙", "←", "↖", "↑", "↗"];
      const idx = ((Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) % 8) + 8) % 8;
      return arrows[idx] as string;
    };
    const boss = s.bossIndex >= 0 ? s.enemies[s.bossIndex] : undefined;
    if (boss?.active) {
      const dx = boss.x - s.px;
      const dy = boss.y - s.py;
      c.textContent = `${arrowFor(dx, dy)} ${t("ui.boss")} ${Math.hypot(dx, dy).toFixed(0)}u`;
      return;
    }
    // Raid target first (defend-or-lose pressure).
    if (s.raid) {
      const terr = s.territories.find((x) => x.poiId === s.raid?.poiId);
      if (terr) {
        const dx = terr.x - s.px;
        const dy = terr.y - s.py;
        c.textContent = `⚠ ${t(`poi.${terr.poiType}.name` as EnKeys)} ${Math.hypot(dx, dy).toFixed(0)}u ${arrowFor(dx, dy)}`;
        return;
      }
    }
    // Revealed stronghold outranks routine navigation.
    if (s.stronghold?.revealed) {
      const dx = s.stronghold.x - s.px;
      const dy = s.stronghold.y - s.py;
      c.textContent = `👑 ${t("ui.stronghold")} ${Math.hypot(dx, dy).toFixed(0)}u ${arrowFor(dx, dy)}`;
      return;
    }
    // Frontier focus site (claim/clear/navigate share one identity).
    const f = this.frontierFocus?.site;
    if (f && this.frontierFocus && this.frontierFocus.kind !== "dominion") {
      const dx = f.x - s.px;
      const dy = f.y - s.py;
      const nm = f.poiId === "stronghold" ? t("ui.stronghold") : t(`poi.${f.poiType}.name` as EnKeys);
      c.textContent = `◈ ${nm} ${Math.hypot(dx, dy).toFixed(0)}u ${arrowFor(dx, dy)}`;
      return;
    }
    // Fallback: nearest undiscovered POI (presentation scan; throttled to 1 Hz).
    const { cx, cy } = worldToChunk(s.px, s.py);
    const cands: Array<{ x: number; y: number; label: string }> = [];
    for (let ox = -2; ox <= 2; ox++) {
      for (let oy = -2; oy <= 2; oy++) {
        const desc = this.sim.chunks.get(s.worldSeed, s.worldNonce, cx + ox, cy + oy);
        for (const poi of desc.poi) {
          if (s.poisWorld.includes(poi.id)) continue;
          cands.push({ x: poi.wx, y: poi.wy, label: t(`poi.${poi.type}.name` as EnKeys) });
        }
      }
    }
    const hit = nearestInterest(s.px, s.py, cands);
    c.textContent = hit ? `◈ ${hit.label} ${hit.dist.toFixed(0)}u ${arrowFor(Math.cos(hit.angleRad), Math.sin(hit.angleRad))}` : "";
  }

  /** Lightweight contextual teaching: one line at a time, auto-dismissed. */
  private updateOnboard(): void {
    const h = this.hud.hint;
    if (!h) return;
    const s = this.sim.state;
    const now = performance.now() / 1000;
    const moved = Math.hypot(s.px, s.py) > 60;
    if (this.onboard.active !== "") {
      if (now >= this.onboard.until || (this.onboard.active === "move" && moved)) {
        h.style.display = "none";
        this.onboard.active = "";
      } else {
        return;
      }
    }
    const show = (id: string, key: EnKeys, dur = 7): boolean => {
      if (this.onboard.done.has(id)) return false;
      this.onboard.done.add(id);
      this.onboard.active = id;
      this.onboard.until = now + dur;
      h.textContent = t(key);
      h.style.display = "block";
      return true;
    };
    if (show("move", "hint.move", 9)) return;
    if (!moved) return;
    let foes = 0;
    for (const e of s.enemies) if (e.active) foes++;
    if (foes > 0 && show("auto", "hint.auto")) return;
    if (s.knowledgeTotal > 0 && show("knowledge", "hint.knowledge")) return;
    if ((s.draftOpen || s.stats.techsTaken > 0) && show("draft", "hint.draft")) return;
    if (s.ageIndex < AGES.length - 1 && s.ageElapsed > 90 && show(`gated-${s.ageIndex}`, "hint.gated")) return;
    const c = this.hud.compass;
    if (c && c.textContent !== "" && show("poi", "hint.poi")) return;
  }

  // ------------------------------------------------------------- draft
  /** State-driven single draft surface (P1-01). Called every frame. */
  private syncDraftUI(): void {
    const open = this.sim.state.draftOpen && !this.sim.state.over && !this.paused;
    const el = document.getElementById("draft-screen");
    if (open && !el) this.openDraft();
    else if (!open && el) el.remove();
  }

  private openDraft(): void {
    const s = this.sim.state;
    if (document.getElementById("draft-screen")) return; // exactly-one guard
    this.tutorial?.onDraftOpened();
    // Drafts take precedence over informational map overlays.
    if (this.techMapOpen) this.toggleTechMap();
    if (this.civMapOpen) this.toggleCivMap();
    const root = uiRoot();
    const screen = el("div", "screen");
    screen.id = "draft-screen";
    screen.appendChild(el("h2", "", s.draftContext === "poi" ? "ui.poiFound" : "ui.chooseTech"));
    const cards = el("div", "cards");
    const ownedTags = [...s.ownedTags];
    s.draftChoices.forEach((n, i) => {
      const c = el("div", "card");
      c.setAttribute("role", "button");
      c.appendChild(el("div", "key", undefined, `[${i + 1}]`));
      const h = document.createElement("h3");
      h.textContent = t(n.titleKey as EnKeys);
      const d = document.createElement("p");
      d.textContent = t(n.descriptionKey as EnKeys);
      // Phase 4: legible plan — DOMAIN + synergy progress on every card.
      const dom = el("div", "card-domain", `domain.${n.domain}` as EnKeys);
      const syn = document.createElement("div");
      syn.className = "card-synergy";
      const done = completingBreakthrough([...n.tags, ...n.synergyTags], ownedTags, [...s.breakthroughs]);
      if (done) {
        syn.textContent = `${t("ui.completes")}: ${t(done.titleKey)}`;
        syn.classList.add("completes");
      } else {
        const lines: string[] = [];
        for (const p of breakthroughProgress([...ownedTags, ...n.tags, ...n.synergyTags], [...s.breakthroughs])) {
          if (p.have === 0 || p.have >= p.need) continue;
          const names = p.missing.map((m) => {
            const k = tagDisplayKey(m);
            return k ? t(k) : null;
          }).filter((x): x is string => x !== null);
          lines.push(`${t("ui.synergy")}: ${t(p.titleKey)} ${p.have}/${p.need}${names.length > 0 ? ` (${names.join(" · ")})` : ""}`);
          if (lines.length >= 2) break;
        }
        syn.textContent = lines.join("  ");
      }
      const r = el("div", `rarity rarity-${n.rarity}`, undefined, t(`rarity.${n.rarity}` as EnKeys));
      c.appendChild(h);
      c.appendChild(d);
      c.appendChild(dom);
      if (syn.textContent !== "") c.appendChild(syn);
      c.appendChild(r);
      c.addEventListener("click", () => this.pickCard(i));
      cards.appendChild(c);
      // Per-card RESERVE (one slot; fallback cards cannot be reserved).
      if (!n.id.startsWith("fb-")) {
        const rs = document.createElement("button");
        rs.className = "btn card-reserve";
        rs.textContent = `${t("ui.reserve")}${s.reservedTech === n.id ? " ✓" : ""}`;
        rs.addEventListener("click", (ev2) => {
          ev2.stopPropagation();
          this.handleEvents(this.sim.reserveCard(i));
          this.refreshHUD();
        });
        c.appendChild(rs);
      }
    });
    screen.appendChild(cards);
    // Draft agency row: reroll (bounded) + skip + owned-stays truth.
    const agency = el("div", "draft-agency");
    const reroll = document.createElement("button");
    reroll.className = "btn";
    reroll.disabled = s.rerolls <= 0;
    reroll.textContent = `${t("ui.reroll")} (${s.rerolls})`;
    reroll.addEventListener("click", () => {
      this.handleEvents(this.sim.rerollDraft());
      // Choices changed: drop the stale surface so syncDraftUI rebuilds.
      document.getElementById("draft-screen")?.remove();
    });
    const skip = document.createElement("button");
    skip.className = "btn";
    skip.textContent = t("ui.skip");
    skip.addEventListener("click", () => {
      this.handleEvents(this.sim.skipDraft());
      document.getElementById("draft-screen")?.remove();
    });
    agency.appendChild(reroll);
    agency.appendChild(skip);
    screen.appendChild(agency);
    const stays = el("div", "draft-stays", "ui.ownedStays");
    screen.appendChild(stays);
    root.appendChild(screen);
  }

  private pickCard(i: number): void {
    const s = this.sim.state;
    if (!s.draftOpen || s.over) return;
    const ev = this.sim.chooseDraft(i);
    sfx.select();
    this.handleEvents(ev);
    // Next queued draft (if any) appears via syncDraftUI — exactly one surface.
  }

  // ------------------------------------------------------------- pause/death
  private togglePause(): void {
    this.paused = !this.paused;
    if (this.paused) this.showPause();
    else document.getElementById("pause-screen")?.remove();
  }

  private showPause(): void {
    const root = uiRoot();
    const screen = el("div", "screen");
    screen.id = "pause-screen";
    const panel = el("div", "panel panel-md");
    panel.appendChild(el("h2", "", "ui.pause"));

    const save = loadSave(localStorage);

    // UI Scale selector
    const scaleRow = el("div", "settings-row");
    scaleRow.appendChild(el("span", "", "ui.uiScale"));
    const scales = el("div", "lang-row");
    const scaleOpts: Array<{ label: string; scale: import("../../core/save/save").UiScale }> = [
      { label: "100%", scale: 1 },
      { label: "125%", scale: 1.25 },
      { label: "150%", scale: 1.5 },
      { label: "200%", scale: 2 },
    ];
    for (const opt of scaleOpts) {
      const b = document.createElement("button");
      b.className = "btn" + (save.settings.uiScale === opt.scale ? " active" : "");
      b.textContent = opt.label;
      b.addEventListener("click", () => {
        save.settings.uiScale = opt.scale;
        storeSave(localStorage, save);
        applyUiScale(opt.scale);
        scales.querySelectorAll("button").forEach((btn) => btn.classList.remove("active"));
        b.classList.add("active");
      });
      scales.appendChild(b);
    }
    scaleRow.appendChild(scales);
    panel.appendChild(scaleRow);

    // Language switch mid-run: rebuilds UI only, simulation untouched.
    const langRow = el("div", "settings-row");
    langRow.appendChild(el("span", "", "ui.language"));
    const langs = el("div", "lang-row");
    for (const [code, label] of [["en", "English"], ["th", "ไทย"]] as const) {
      const b = document.createElement("button");
      b.className = "btn" + (save.settings.lang === code ? " active" : "");
      b.textContent = label;
      b.addEventListener("click", () => this.applyLanguage(code));
      langs.appendChild(b);
    }
    langRow.appendChild(langs);
    panel.appendChild(langRow);

    const col = el("div", "btn-row");
    col.appendChild(button("ui.resume", () => this.togglePause(), "btn primary"));
    col.appendChild(button("ui.guide", () => this.showGuide()));
    col.appendChild(button("ui.resetTutorial", () => {
      this.tutorial?.reset();
      toast("ui.tutorialResetDone");
    }));
    col.appendChild(button("ui.restart", () => this.restartRun()));
    col.appendChild(button("ui.quitToTitle", () => this.scene.start("title")));
    col.appendChild(button("ui.resetSave", () => {
      if (confirm(t("ui.confirmReset"))) {
        localStorage.removeItem("seed-game-save-v1");
        this.restartRun();
      }
    }, "btn danger"));
    panel.appendChild(col);
    screen.appendChild(panel);
    root.appendChild(screen);
  }

  private showGuide(): void {
    const root = uiRoot();
    const screen = el("div", "screen");
    screen.id = "guide-screen";
    const panel = el("div", "panel panel-lg");
    panel.appendChild(el("h2", "", "guide.title"));
    const content = el("div", "guide-content");

    const addSection = (titleKey: EnKeys, textKey: EnKeys): void => {
      const sec = el("div", "guide-section");
      sec.appendChild(el("h3", "", titleKey));
      const p = document.createElement("p");
      p.textContent = t(textKey);
      sec.appendChild(p);
      content.appendChild(sec);
    };

    addSection("ui.nextAge", "guide.advancement");
    addSection("ui.squad", "guide.controls");
    addSection("ui.techMap", "guide.techStacking");
    addSection("ui.outpostSpec", "guide.territory");

    panel.appendChild(content);
    panel.appendChild(button("ui.back", () => screen.remove(), "btn primary"));
    screen.appendChild(panel);
    root.appendChild(screen);
  }

  private restartRun(): void {
    // P2-01: Restart = SAME master seed, clean simulation. (Play Again uses a
    // fresh random seed; Quit returns to title.) Origin choice is preserved.
    this.techMapView?.destroy();
    this.techMapView = null;
    this.modalQueue = [];
    this.closeBlocking();
    this.techMapOpen = false;
    this.civMapOpen = false;
    document.getElementById("pause-screen")?.remove();
    document.getElementById("draft-screen")?.remove();
    document.getElementById("ascend-screen")?.remove();
    document.getElementById("techmap-screen")?.remove();
    document.getElementById("civmap-screen")?.remove();
    sessionStorage.setItem(TITLE_SEED_KEY, this.masterSeed);
    sessionStorage.setItem(TITLE_ORIGIN_KEY, this.sim.state.originId);
    this.scene.restart();
  }

  private fmtTime(sec: number): string {
    return `${Math.floor(sec / 60)}:${Math.floor(sec % 60).toString().padStart(2, "0")}`;
  }

  private persistRunEnd(): void {
    // P2-03: exactly-once terminal persistence (idempotent transition).
    if (this.deathPersisted) return;
    this.deathPersisted = true;
    const s = this.sim.state;
    const save = loadSave(localStorage);
    save.best.runs++;
    const isRecord = s.runElapsed >= save.best.bestTimeSec && s.runElapsed > 0;
    save.best.bestTimeSec = Math.max(save.best.bestTimeSec, Math.floor(s.runElapsed));
    save.best.bestKills = Math.max(save.best.bestKills, s.runKills);
    save.best.bestAscension = Math.max(save.best.bestAscension, s.ascension);
    if (isRecord) save.best.bestAge = s.runHighestAge;
    if (!save.history.includes(this.masterSeed)) save.history.unshift(this.masterSeed);
    save.history = save.history.slice(0, 50);
    storeSave(localStorage, save);
  }

  private showChronicle(): void {
    const s = this.sim.state;
    this.persistRunEnd(); // idempotent — safe even if the event path already ran
    document.getElementById("draft-screen")?.remove();
    const root = uiRoot();
    const screen = el("div", "screen");
    const panel = el("div", "panel panel-lg");
    panel.appendChild(el("h2", "", "ui.died"));
    panel.appendChild(el("div", "", "ui.runChronicle"));
    const dl = document.createElement("dl");
    dl.className = "chron";
    const famKey = (["kinetic", "energy", "defense", "field"] as string[]).includes(s.topDamageSource)
      ? t(`family.${s.topDamageSource}` as EnKeys)
      : s.topDamageSource || "-";
    const origin = ORIGINS.find((o) => o.id === s.originId);
    const legacyNames = s.legacies
      .map((id) => {
        const def = legacyDefById(id);
        return def ? t(def.nameKey) : null;
      })
      .filter((x): x is string => x !== null);
    const rows: [string, string][] = [
      [t("chronicle.seed"), `${this.masterSeed} · w${WORLDGEN_VERSION} · A${s.ascension}`],
      [t("chronicle.time"), this.fmtTime(s.runElapsed)],
      [t("chronicle.age"), t(`age.${s.runHighestAge}` as EnKeys)],
      [t("chronicle.kills"), String(s.runKills)],
      [t("chronicle.elites"), String(s.stats.elites)],
      [t("chronicle.bosses"), String(s.stats.bosses)],
      [t("chronicle.techs"), String(s.stats.techsTaken)],
      [t("chronicle.chunks"), String(s.stats.chunksTotal)],
      [t("chronicle.poi"), String(s.stats.poisTotal)],
      [t("chronicle.origin"), origin ? t(origin.nameKey) : s.originId],
      [t("chronicle.legacy"), legacyNames.length > 0 ? legacyNames.join(" · ") : "-"],
      [t("ui.topDamage"), `${famKey} · v${CONTENT_VERSION}`],
    ];
    for (const [k, v] of rows) {
      const dt = document.createElement("dt");
      dt.textContent = k;
      const dd = document.createElement("dd");
      dd.textContent = v;
      dl.appendChild(dt);
      dl.appendChild(dd);
    }
    panel.appendChild(dl);
    // Build history: decision timings for build-order mastery (Phase 20).
    if (s.history.length > 0) {
      panel.appendChild(el("h2", "", "ui.buildHistory"));
      const hist = document.createElement("div");
      hist.className = "chron-history";
      for (const h of s.history.slice(-14)) {
        const line = document.createElement("div");
        line.textContent = `${this.fmtTime(h.t)} · ${h.kind} · ${h.label}`;
        hist.appendChild(line);
      }
      panel.appendChild(hist);
    }
    const rowBtn = el("div", "btn-row");
    const copy = button("ui.copySeed", () => undefined);
    copy.addEventListener("click", () => void this.copySeed(copy));
    rowBtn.appendChild(copy);
    rowBtn.appendChild(button("ui.playAgain", () => {
      sessionStorage.setItem(TITLE_SEED_KEY, generateRandomSeed());
      sessionStorage.setItem(TITLE_ORIGIN_KEY, this.sim.state.originId);
      this.scene.restart();
    }, "btn primary"));
    rowBtn.appendChild(button("ui.quitToTitle", () => this.scene.start("title")));
    panel.appendChild(rowBtn);
    screen.appendChild(panel);
    root.appendChild(screen);
  }

  /** Clipboard truthfulness: success UI only after the promise resolves. */
  private async copySeed(btn: HTMLButtonElement): Promise<void> {
    try {
      if (!navigator.clipboard) throw new Error("no clipboard");
      await navigator.clipboard.writeText(this.masterSeed);
      btn.textContent = t("ui.copied");
    } catch {
      // Manual-copy fallback: selectable seed + accurate message.
      btn.textContent = t("ui.copySeed");
      const root = uiRoot();
      const d = document.createElement("div");
      d.className = "toast show";
      const inp = document.createElement("input");
      inp.value = this.masterSeed;
      inp.readOnly = true;
      inp.style.pointerEvents = "auto";
      inp.addEventListener("focus", () => inp.select());
      const msg = document.createElement("div");
      msg.className = "toast-sub";
      msg.textContent = t("ui.copyFail");
      d.appendChild(inp);
      d.appendChild(msg);
      root.appendChild(d);
      inp.focus();
      inp.select();
      setTimeout(() => d.remove(), 6000);
    }
  }

  /**
   * Blocking modal shell (choice or timed beat). Pauses stepping while up.
   * P1-02: a request arriving while another modal is visible is QUEUED as a
   * build thunk and shown on drain — surfaces never overlap, never overwrite.
   */
  private showBlocking(id: string, dur = 0, build?: (screen: HTMLElement) => void): void {
    if (this.blockingModal) {
      this.modalQueue.push(() => this.showBlockingFresh(id, dur, build));
      return;
    }
    this.showBlockingFresh(id, dur, build);
  }

  private showBlockingFresh(id: string, dur: number, build?: (screen: HTMLElement) => void): void {
    // Caller (or queue drain) guarantees no live modal; never re-enter drain.
    this.blockingModal?.remove();
    // Dismiss any active toasts to prevent overlapping presentation text
    document.querySelectorAll(".toast").forEach((t) => t.remove());
    const root = uiRoot();
    const screen = el("div", "screen");
    screen.id = id;
    root.appendChild(screen);
    this.blockingModal = screen;
    this.modalT = dur;
    if (dur > 0) {
      screen.addEventListener("click", () => this.closeBlocking());
    }
    if (build) build(screen);
  }

  private closeBlocking(): void {
    this.blockingModal?.remove();
    this.blockingModal = null;
    this.modalT = 0;
    // Drain exactly one queued modal (FIFO). showBlockingFresh never drains,
    // so no cascade: at most one new surface per close.
    const next = this.modalQueue.shift();
    if (next) next();
  }

  /** Short reward beat: breakthrough title + effects, distinct sting. */
  private showBreakthroughBeat(id: string): void {
    const b = BREAKTHROUGHS.find((x) => x.id === id);
    if (!b) return;
    this.showBlocking("beat-screen", 1.1, (screen) => {
      const panel = el("div", "panel panel-md");
      panel.appendChild(el("h2", "", b.titleKey as EnKeys));
      const d = document.createElement("p");
      d.textContent = t(b.descriptionKey as EnKeys);
      panel.appendChild(d);
      screen.appendChild(panel);
    });
    sfx.breakthrough();
  }

  /** Age transition payoff: name + granted spine + active weapon forms. */
  private showAgeTransition(age: AgeId): void {
    const s = this.sim.state;
    const idx = AGES.indexOf(age);
    this.showBlocking("age-screen", 1.1, (screen) => {
      const panel = el("div", "panel panel-md");
      panel.appendChild(el("h1", "logo", `age.${age}` as EnKeys));
      const spine = CRITICAL_SPINE.find((c) => c.age === age);
      if (spine) {
        const g = document.createElement("p");
        g.textContent = `${t(`tech.${spine.id}.name` as EnKeys)} — ${t(`tech.${spine.id}.description` as EnKeys)}`;
        panel.appendChild(g);
      }
      const forms = activeFamilies(s.originId, s.expansionFamily)
        .map((f) => t(getWeaponStage(f, idx).nameKey as EnKeys)).join(" · ");
      const w = document.createElement("div");
      w.className = "toast-sub";
      w.textContent = forms;
      panel.appendChild(w);
      const cont = button("ui.ageContinue", () => this.closeBlocking(), "btn primary");
      panel.appendChild(cont);
      screen.appendChild(panel);
    });
    sfx.ageSting();
  }

  private offerAscend(): void {
    const s = this.sim.state;
    if (s.over || !s.ascendReady) return;
    sfx.ascend();
    const root = uiRoot();
    const screen = el("div", "screen");
    screen.id = "ascend-screen";
    const panel = el("div", "panel panel-md");
    panel.appendChild(el("h1", "logo", "ui.ascendTitle"));
    panel.appendChild(el("div", "", undefined, `#${s.ascension + 1} → #${s.ascension + 2}`));
    const row = el("div", "btn-row");
    row.appendChild(button("ui.ascend", () => this.showLegacyPick(), "btn primary"));
    const stay = button("ui.resume", () => document.getElementById("ascend-screen")?.remove());
    row.appendChild(stay);
    panel.appendChild(row);
    screen.appendChild(panel);
    root.appendChild(screen);
  }

  /** Legacy choice modal (blocking): 1 of 3 deterministic candidates. */
  private showLegacyPick(): void {
    document.getElementById("ascend-screen")?.remove();
    const offers = this.sim.legacyOffers();
    if (offers.length === 0) return;
    this.showBlocking("legacy-screen", 0, (screen) => {
      const panel = el("div", "panel panel-lg");
      panel.appendChild(el("h2", "", "ui.legacyTitle"));
      panel.appendChild(el("div", "logo-sub", "ui.legacySub"));
      const cards = el("div", "cards");
      for (const o of offers) {
        const c = el("div", "card");
        c.setAttribute("role", "button");
        const h = document.createElement("h3");
        h.textContent = t(o.nameKey);
        const d = document.createElement("p");
        const reqTxt = o.requiredFamily
          ? ` ${t("ui.legacyRequires")} ${t(`family.${o.requiredFamily}` as EnKeys)}.`
          : "";
        d.textContent = t(o.descKey) + reqTxt;
        c.appendChild(h);
        c.appendChild(d);
        // Close-then-show: navigating modals must not queue behind themselves.
        c.addEventListener("click", () => {
          this.closeBlocking();
          this.showOriginPick(o.id);
        });
        cards.appendChild(c);
      }
      panel.appendChild(cards);
      screen.appendChild(panel);
    });
  }

  /** Origin choice modal for the child world (blocking). */
  private showOriginPick(legacyId: string): void {
    // P1-05: only Origins where the chosen Legacy functions are selectable,
    // with the requirement stated — never a dead pick.
    const req = this.sim.legacyOffers().find((d) => d.id === legacyId)?.requiredFamily;
    const choices = req
      ? ORIGINS.filter((o) => (o.families as readonly string[]).includes(req))
      : [...ORIGINS];
    if (choices.length === 0) return;
    this.showBlocking("origin-screen", 0, (screen) => {
      const panel = el("div", "panel panel-lg");
      panel.appendChild(el("h2", "", "ui.chooseOrigin"));
      if (req) {
        const note = document.createElement("div");
        note.className = "logo-sub";
        note.textContent = `${t("ui.legacyRequires")} ${t(`family.${req}` as EnKeys)}`;
        panel.appendChild(note);
      }
      const cards = el("div", "cards");
      for (const o of choices) {
        const c = el("div", "card");
        c.setAttribute("role", "button");
        const h = document.createElement("h3");
        h.textContent = t(o.nameKey);
        const d = document.createElement("p");
        d.textContent = `${t(o.descKey)} (${o.families.map((f) => t(`family.${f}` as EnKeys)).join("+")})`;
        c.appendChild(h);
        c.appendChild(d);
        c.addEventListener("click", () => this.doAscend(legacyId, o.id));
        cards.appendChild(c);
      }
      panel.appendChild(cards);
      screen.appendChild(panel);
    });
  }

  /** Expansion choice modal at Industrial (blocking until decided). */
  private showExpansionPick(families: [WeaponFamily, WeaponFamily]): void {
    const s = this.sim.state;
    this.showBlocking("expansion-screen", 0, (screen) => {
      const panel = el("div", "panel panel-lg");
      panel.appendChild(el("h2", "", "ui.expansionTitle"));
      panel.appendChild(el("div", "logo-sub", "ui.expansionSub"));
      const cards = el("div", "cards");
      for (const f of families) {
        const c = el("div", "card");
        c.setAttribute("role", "button");
        const h = document.createElement("h3");
        h.textContent = t(`family.${f}` as EnKeys);
        const d = document.createElement("p");
        d.textContent = t(getWeaponStage(f, s.ageIndex).nameKey as EnKeys);
        c.appendChild(h);
        c.appendChild(d);
        c.addEventListener("click", () => {
          const ev = this.sim.chooseExpansion(f);
          this.closeBlocking();
          this.handleEvents(ev);
          this.refreshHUD();
        });
        cards.appendChild(c);
      }
      panel.appendChild(cards);
      screen.appendChild(panel);
    });
    sfx.levelup();
  }

  private doAscend(legacyId: string, originId: string): void {
    document.getElementById("ascend-screen")?.remove();
    this.closeBlocking();
    const ev = this.sim.ascend(legacyId, originId);
    this.handleEvents(ev);
    this.lastGroundKey = "";
    this.refreshGround(true);
    this.refreshHUD();
  }

  // ------------------------------------------------------------- events→fx
  private handleEvents(ev: SimEvent[]): void {
    const s = this.sim.state;
    this.tutorial?.onSimEvents(ev);
    let killsThisFrame = 0;
    const save = loadSave(localStorage);
    for (const e of ev) {
      switch (e.type) {
        case "draft_opened":
          // UI appears via syncDraftUI (state-driven, exactly-one). Sound here.
          sfx.levelup();
          break;
        case "tech_selected":
          sfx.select();
          this.qa?.noteSimEvent("tech", e.techId);
          break;
        case "draft_reserved":
          sfx.select();
          this.qa?.noteSimEvent("draft_reserve", e.techId);
          break;
        case "draft_rerolled":
          sfx.select();
          this.qa?.noteSimEvent("draft_reroll", `${e.rerollsLeft} left`);
          break;
        case "draft_skipped":
          sfx.select();
          this.qa?.noteSimEvent("draft_skip", "skip");
          break;
        case "pin_set":
          sfx.select();
          this.qa?.noteSimEvent("pin", e.target);
          break;
        case "mission_complete":
          toast("ui.missionComplete", t(`age.${e.age}` as EnKeys));
          sfx.age();
          this.qa?.noteSimEvent("mission_complete", e.age);
          break;
        case "territory_claimed":
          toast("ui.poiFound", t(`poi.${e.poiType}.name` as EnKeys));
          sfx.select();
          this.spawnVfx("seed_claim_glow", s.px, s.py, 1.0, 0x53e0c8, 450, Phaser.BlendModes.ADD);
          this.qa?.noteSimEvent("territory_claimed", `${e.poiId}:${e.poiType}`);
          break;
        case "outpost_spec":
          toast(e.spec === "research" ? "ui.specResearch" : e.spec === "military" ? "ui.specMilitary" : "ui.specEconomy");
          sfx.select();
          this.qa?.noteSimEvent("outpost_spec", `${e.poiId}:${e.spec}`);
          break;
        case "outpost_upgraded":
          toast("ui.upgrade");
          sfx.age();
          this.qa?.noteSimEvent("outpost_upgraded", e.poiId);
          break;
        case "outpost_lost":
          toast("ui.outpostLost");
          sfx.hurt();
          this.qa?.noteSimEvent("outpost_lost", e.poiId);
          break;
        case "outpost_repaired":
          toast("ui.outpostRepaired");
          sfx.select();
          this.qa?.noteSimEvent("outpost_repaired", e.poiId);
          break;
        case "raid_incoming": {
          const terr = this.sim.state.territories.find((x) => x.poiId === e.poiId);
          const nm = terr ? t(`poi.${terr.poiType}.name` as EnKeys) : e.poiId;
          toast("ui.raidIncoming", `${nm} · ${Math.ceil(e.seconds)}s`);
          sfx.boss();
          this.spawnVfx("seed_raid_alert", s.px, s.py, 1.1, 0xff5533, 600, Phaser.BlendModes.ADD);
          this.qa?.noteSimEvent("raid_incoming", `${e.poiId}:${Math.ceil(e.seconds)}s`);
          break;
        }
        case "raid_repelled":
          toast("ui.raidRepelled");
          sfx.age();
          this.qa?.noteSimEvent("raid_repelled", e.poiId);
          break;
        case "squad_command":
          this.qa?.noteSimEvent("squad_command", e.mode);
          break;
        case "ability_used": {
          const abil = ORIGIN_ABILITY[originById(this.sim.state.originId).id];
          toast("ui.ability", t(abil.nameKey));
          sfx.select();
          this.qa?.noteSimEvent("ability_used", abil.id);
          break;
        }
        case "breakthrough": {
          this.showBreakthroughBeat(e.id);
          this.qa?.noteSimEvent("breakthrough", e.id);
          this.spawnVfx("seed_breakthrough_spark", s.px, s.py, 1.2, 0xd884ff, 500, Phaser.BlendModes.ADD);
          break;
        }
        case "age_reached":
          sfx.age();
          toast("ui.ageReached", t(`age.${e.age}` as EnKeys));
          if (save.settings.shake) this.cameras.main.shake(250, 0.008);
          this.lastGroundKey = "";
          this.showAgeTransition(e.age);
          this.qa?.noteSimEvent("age_reached", e.age);
          break;
        case "poi_discovered":
          sfx.age();
          toast("ui.poiFound", t(`poi.${e.poiType}.name` as EnKeys), `+${Math.floor(e.knowledge)} ${t("ui.knowledge")}`);
          this.qa?.noteSimEvent("poi_discovered", `${e.poiType}:+${Math.floor(e.knowledge)}`);
          break;
        case "poi_major":
          toast("ui.poiFound", t(`poi.${e.poiType}.name` as EnKeys));
          sfx.levelup();
          this.qa?.noteSimEvent("poi-major", e.poiType);
          break;
        case "expansion_offered":
          this.showExpansionPick(e.families);
          break;
        case "expansion_unlocked":
          toast("ui.expansionTitle", t(`family.${e.family}` as EnKeys));
          sfx.select();
          this.qa?.noteSimEvent("expansion", e.family);
          break;
        case "boss_warning":
          sfx.boss();
          toast("ui.bossWarning");
          this.qa?.noteSimEvent("boss_spawn", "");
          if (save.settings.shake) this.cameras.main.shake(400, 0.01);
          break;
        case "stronghold_revealed":
          sfx.boss();
          toast("ui.stronghold");
          this.qa?.noteSimEvent("stronghold", `${e.x},${e.y}`);
          break;
        case "boss_killed":
          sfx.ascend();
          this.qa?.noteSimEvent("boss_killed", "");
          break;
        case "ascension_ready":
          this.offerAscend();
          break;
        case "legacy_granted": {
          const def = legacyDefById(e.id);
          if (def) toast("ui.legacyTitle", t(def.nameKey));
          this.qa?.noteSimEvent("legacy", e.id);
          break;
        }
        case "ascended":
          toast("ui.ascendTitle", `#${e.ascension} · ${e.worldSeed}`);
          break;
        case "player_hurt":
          sfx.hurt();
          this.lastHurtT = performance.now() / 1000;
          this.dmgNums.push({ x: s.px, y: s.py - 24, txt: `-${Math.ceil(e.damage)}`, t: 0.9 });
          if (this.dmgNums.length > 12) this.dmgNums.shift();
          break;
        case "enemy_killed":
          killsThisFrame++;
          this.bursts.push({ x: e.x, y: e.y, t: e.boss ? 0.5 : 0.3, max: e.boss ? 0.5 : 0.3, big: e.boss });
          if (this.bursts.length > 24) this.bursts.shift();
          // Section 15: ordinary death uses procedural ring + sparks; reserve raster flash for boss/elite
          if (e.boss || e.elite) {
            this.spawnVfx("seed_hit_impact", e.x, e.y, e.boss ? 0.8 : 0.45, 0xffe08a, 220, Phaser.BlendModes.ADD);
          }
          if (e.boss && save.settings.shake) this.cameras.main.shake(400, 0.012);
          break;
        case "player_died":
          this.qa?.onPlayerDied();
          this.persistRunEnd();
          this.showChronicle();
          break;
      }
    }
    if (killsThisFrame > 0) sfx.kill();
    void s;
  }

  // ------------------------------------------------------------- frame
  private sampleMove(): void {
    let ix = 0;
    let iy = 0;
    if (this.keys.A?.isDown || this.keys.LEFT?.isDown) ix -= 1;
    if (this.keys.D?.isDown || this.keys.RIGHT?.isDown) ix += 1;
    if (this.keys.W?.isDown || this.keys.UP?.isDown) iy -= 1;
    if (this.keys.S?.isDown || this.keys.DOWN?.isDown) iy += 1;
    if (ix !== 0 || iy !== 0) this.playerFacing = Math.atan2(iy, ix);
    this.latch.setMove(ix, iy);
  }

  /** Density mode from UI scale + viewport (compact collapses secondary). */
  private applyHudDensity(): void {
    const root = document.getElementById("ui");
    if (!root) return;
    let scale = 1;
    try {
      scale = loadSave(localStorage).settings.uiScale ?? 1;
    } catch {
      scale = 1;
    }
    const narrow = window.innerWidth < 1400;
    const mode = scale >= 1.5 || narrow ? "compact" : "full";
    if (root.dataset.density !== mode) root.dataset.density = mode;
  }

  /** Presentation-only contrast preference (settings, never gameplay). */
  private highContrast(): boolean {
    try {
      return loadSave(localStorage).settings.contrast === "high";
    } catch {
      return false;
    }
  }

  private pushSample(arr: number[], v: number, cap = 240): void {
    arr.push(v);
    if (arr.length > cap) arr.shift();
  }

  update(_time: number, deltaMs: number): void {
    const dt = Math.min(Math.max(deltaMs / 1000, 0), 0.25);
    const frameT0 = performance.now();
    this.fpsEMA += (1 / Math.max(dt, 1e-4) - this.fpsEMA) * 0.05;
    this.pushSample(this.frameSamples, deltaMs);

    const s = this.sim.state;
    // Map overlays pause stepping (informational screens, not decisions).
    const stepping = !this.paused && !s.over && !s.draftOpen && !this.blockingModal && !this.techMapOpen && !this.civMapOpen;
    if (stepping) {
      this.sampleMove();
      const steps = this.acc.steps(dt);
      for (let i = 0; i < steps; i++) {
        // Edge-triggered dash only on the first consumed step; a zero-step
        // frame leaves the latch untouched (P1-02).
        const t0 = performance.now();
        const ev = this.sim.step(SIM_DT, this.latch.frameForStep(i));
        this.pushSample(this.simSamples, performance.now() - t0); // step-only
        if (ev.length > 0) this.handleEvents(ev);
        if (this.sim.state.over || this.sim.state.draftOpen) break;
      }
    }
    // P1-01: draft UI is a pure function of canonical sim state — exactly one
    // surface while draftOpen, zero otherwise. Never recursive ownership.
    this.syncDraftUI();
    this.tutorial?.update(dt, this.sim.state);
    // Timed beats auto-dismiss; choice modals wait for a decision.
    if (this.modalT > 0) {
      this.modalT -= dt;
      if (this.modalT <= 0) this.closeBlocking();
    }
    // Transient impact timers (presentation only).
    if (this.bursts.length > 0) {
      for (const burst of this.bursts) burst.t -= dt;
      this.bursts = this.bursts.filter((burst) => burst.t > 0);
    }

    this.drawFrame();
    this.hudT -= dt;
    if (this.hudT <= 0) {
      this.hudT = 0.15;
      this.refreshHUD();
    }
    // Ground follows chunk/age/POI discovery; CAMERA moves every frame (R4).
    const { cx, cy } = worldToChunk(s.px, s.py);
    const terrSig = s.territories.map((t) => `${t.poiId}:${t.spec}:${t.tier}:${t.disabled ? 0 : 1}`).join("|");
    const gk = `${s.worldNonce}:${cx},${cy}:a${s.ageIndex}:p${s.poisWorld.length}:t${terrSig}`;
    if (gk !== this.lastGroundKey) {
      this.lastGroundKey = gk;
      this.refreshGround(false);
    }
    if (this.showDebug) this.refreshDebug();
    // QA harness tick (no-op unless ?qa=1 session exists).
    if (this.qa) {
      this.qaScanT -= dt;
      if (this.qaScanT <= 0) {
        this.qaScanT = 1;
        this.scanQaWorld();
      }
      this.qa.tick();
      if (this.qaOverlay) this.drawQaOverlay();
    }
  }

  private refreshDebug(): void {
    const s = this.sim.state;
    let activeE = 0;
    for (const e of s.enemies) if (e.active) activeE++;
    let activeP = 0;
    for (const p of s.projs) if (p.active) activeP++;
    let activeK = 0;
    for (const k of s.pickups) if (k.active) activeK++;
    const simSorted = [...this.simSamples].sort((a, b) => a - b);
    const frameSorted = [...this.frameSamples].sort((a, b) => a - b);
    const budget = threatBudget(s.elapsed, s.ageIndex, s.ascension, s.difficultyMul);
    const { cx, cy } = worldToChunk(s.px, s.py);
    this.debugText.setText(
      `FPS ${this.fpsEMA.toFixed(0)}  sim-step p50 ${percentile(simSorted, 50).toFixed(2)}ms p95 ${percentile(simSorted, 95).toFixed(2)}ms\n` +
      `frame p95 ${percentile(frameSorted, 95).toFixed(2)}ms  enemies ${activeE}  proj ${activeP}  pickups ${activeK}/${s.pickups.length}\n` +
      `queries ${this.sim.queryCount}  buckets ${this.sim.spatialBucketCount}  chunk ${cx},${cy}  cache ${(this.sim.chunks.hitRate * 100).toFixed(0)}%\n` +
      `seed ${this.masterSeed}  wv${WORLDGEN_VERSION}  age ${AGES[s.ageIndex]}  budget ${budget.toFixed(1)}  asc ${s.ascension}`,
    );
  }

  // ------------------------------------------------------------- render (world space)
  private refreshGround(_full: boolean): void {
    const s = this.sim.state;
    const g = this.ground;
    if (!g) return;
    g.clear();
    const { cx, cy } = worldToChunk(s.px, s.py);
    // Visual radius extends one chunk beyond the simulated active radius.
    const R = ACTIVE_RADIUS_CHUNKS + 1;
    const civ = CIV_LAYER[AGES[s.ageIndex] as AgeId];
    const now = performance.now() / 1000;
    drawGround(g, {
      getChunk: (x, y) => this.sim.chunks.get(s.worldSeed, s.worldNonce, x, y),
      styleFor: (biome) => BIOME_STYLE[biome],
      civColor: civ.color,
      civDensity: civ.density,
      age: AGES[s.ageIndex] as AgeId,
      cx,
      cy,
      radius: R,
      worldSeed: s.worldSeed,
      time: now,
      highContrast: this.highContrast(),
    });
    // POI markers live in the ground pass (rebuilt on chunk/age/discovery change).
    // Claimed territories get age-dressing: the map grows a civilization.
    const terrByPoi = new Map(s.territories.map((t) => [t.poiId, t]));
    for (let ox = -R; ox <= R; ox++) {
      for (let oy = -R; oy <= R; oy++) {
        const desc = this.sim.chunks.get(s.worldSeed, s.worldNonce, cx + ox, cy + oy);
        for (const poi of desc.poi) {
          drawPoi(g, {
            wx: poi.wx,
            wy: poi.wy,
            type: poi.type,
            found: s.poisWorld.includes(poi.id),
            time: now,
            highContrast: this.highContrast(),
          });
          const terr = terrByPoi.get(poi.id);
          if (terr) {
            drawTerritoryDressing(g, {
              x: poi.wx, y: poi.wy,
              ageIndex: s.ageIndex, tier: terr.tier, disabled: terr.disabled,
            });
          }
        }
      }
    }
  }

  private drawFrame(): void {
    const s = this.sim.state;
    const g = this.gfx;
    g.clear();
    const cam = this.cameras.main;
    const vx0 = cam.scrollX - 60;
    const vy0 = cam.scrollY - 60;
    const vx1 = cam.scrollX + cam.width + 60;
    const vy1 = cam.scrollY + cam.height + 60;
    const vis = (x: number, y: number): boolean => x >= vx0 && y >= vy0 && x <= vx1 && y <= vy1;
    const now = performance.now() / 1000;
    const hc = this.highContrast();
    const wopts = { time: now, highContrast: hc };
    // Focused target = nearest foe to the player (HP bar while focused).
    let focus: (typeof s.enemies)[number] | null = null;
    let focusDist = 420;

    for (const k of s.pickups) {
      if (!k.active || !vis(k.x, k.y)) continue;
      drawKnowledge(g, k);
    }
    for (const m of s.mines) {
      if (!m.active || !vis(m.x, m.y)) continue;
      drawMine(g, m, wopts);
    }
    for (const e of s.enemies) {
      if (!e.active || !vis(e.x, e.y)) continue;
      // Focused target = nearest foe to the player (HP bar while focused).
      const fd = Math.hypot(e.x - s.px, e.y - s.py);
      if (fd < focusDist) {
        focusDist = fd;
        focus = e;
      }
    }
    for (const e of s.enemies) {
      if (!e.active || !vis(e.x, e.y)) continue;
      drawEnemy(g, e, {
        bodyColor: ENEMY_LINEAGE[e.family].color[AGES[s.ageIndex] as AgeId],
        facing: Math.atan2(s.py - e.y, s.px - e.x),
        time: now,
        highContrast: hc,
        hpBar: e.elite || e.boss || e.flash > 0 || e === focus,
        ageIndex: s.ageIndex,
      });
    }
    for (const p of s.projs) {
      if (!p.active || !vis(p.x, p.y)) continue;
      if (p.friendly) drawFriendlyProj(g, p);
      else drawHostileProj(g, p, wopts);
    }
    const b = s.build;
    const est = getWeaponStage("energy", s.weaponStage.energy);
    if (est.archetype === "aura" || b.bonusAura > 0) {
      drawAura(g, s.px, s.py, est.radius + b.bonusAura * 30, 0xffb03c);
    }
    const fst = getWeaponStage("field", s.weaponStage.field);
    if (fst.archetype === "orbit" || b.bonusOrbit > 0) {
      const blades = 2 + b.bonusOrbit;
      for (let i = 0; i < blades; i++) {
        const a = s.orbitAng + (i * Math.PI * 2) / Math.max(1, blades);
        drawOrbit(g, s.px, s.py, fst.radius || 110, 1, a, 0xb48cff, 8);
      }
    }
    const dst = getWeaponStage("defense", s.weaponStage.defense);
    if (dst.archetype === "orbit") {
      const blades = Math.max(1, dst.count + b.bonusOrbit);
      drawOrbit(g, s.px, s.py, dst.radius, blades, s.orbitAng, dst.color, 7);
    }
    const guardians = Math.min((dst.archetype === "summon" ? dst.count : 0) + b.bonusGuardians, 8);
    if (guardians > 0) {
      for (let i = 0; i < guardians; i++) {
        const a = s.guardianAng + (i * Math.PI * 2) / Math.max(1, guardians);
        drawSummon(g, s.px + Math.cos(a) * 80, s.py + Math.sin(a) * 80, 7, dst.color, s.px, s.py);
      }
    }
    if (s.beamFlash) {
      drawBeam(g, s.px, s.py, s.beamFlash.x2, s.beamFlash.y2, 6, 0xfff07f);
    }
    // Player: unique silhouette (camera still follows the invisible anchor).
    this.playerArc.setPosition(s.px, s.py);
    drawPlayer(g, s.px, s.py, 16, {
      facing: this.playerFacing,
      dashing: s.dashT > 0,
      iframe: s.iframe > 0,
      hurtFlash: now - this.lastHurtT < 0.25,
      time: now,
      highContrast: hc,
      originId: s.originId,
      ageIndex: s.ageIndex,
    });
    // Command squad renders as origin-identified allies with mode glyph.
    for (const a of s.squad) {
      if (!a.active || !vis(a.x, a.y)) continue;
      drawSummon(g, a.x, a.y, 7, 0x9fd8ff, s.px, s.py);
    }
    // Transient impact: death rings + floating damage numbers.
    for (const burst of this.bursts) {
      const f = burst.t / burst.max;
      g.lineStyle(burst.big ? 4 : 2, burst.big ? 0xff5533 : 0xffe08a, f);
      g.strokeCircle(burst.x, burst.y, (1 - f) * (burst.big ? 90 : 34) + 6);
    }
    for (const dn of this.dmgNums) {
      this.floatTextAt(dn.x, dn.y, dn.txt, "#ff6b6b");
    }
    this.dmgNums.length = 0;
    this.drawBossIndicator();
  }

  /** Pooled floating combat text (transient presentation, zero per-frame allocs). */
  private floatTextAt(x: number, y: number, txt: string, color: string): void {
    let t = this.floatText.find((o) => !o.visible);
    if (!t) {
      if (this.floatText.length >= 12) return;
      const created = this.add.text(0, 0, "", {
        fontSize: "14px", color, fontFamily: "monospace", backgroundColor: "rgba(0,0,0,0.55)",
      });
      created.setDepth(44);
      this.floatText.push(created);
      t = created;
    }
    t.setText(txt);
    t.setColor(color);
    t.setPosition(x - 18, y - 10);
    t.setAlpha(1);
    t.setVisible(true);
    const ref = t;
    this.time.delayedCall(700, () => ref.setVisible(false));
  }

  private drawBossIndicator(): void {
    const g = this.bossGfx;
    if (!g) return;
    g.clear();
    const s = this.sim.state;
    if (s.bossIndex < 0) return;
    const boss = s.enemies[s.bossIndex];
    if (!boss?.active) return;
    const cam = this.cameras.main;
    drawOffscreenIndicator(g, {
      scrollX: cam.scrollX,
      scrollY: cam.scrollY,
      width: cam.width,
      height: cam.height,
    }, boss.x, boss.y, 0xff2222, 12);
  }
}
