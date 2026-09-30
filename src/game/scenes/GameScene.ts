// GameScene — ADAPTER (ADR 0003). Owns no canonical gameplay state.
// Browser input → InputFrame → RunSimulation.step() → state → Phaser render.
// SimEvent → DOM / audio / camera. Restart = NEW RunSimulation instance.
import Phaser from "phaser";
import { normalizeSeedString, generateRandomSeed } from "../../core/seed/hash";
import { WORLDGEN_VERSION, CONTENT_VERSION, SAVE_SCHEMA_VERSION } from "../../core/seed/versions";
import { FixedAccumulator, SIM_DT } from "../../core/sim/fixedStep";
import { InputLatch } from "../../core/sim/InputLatch";
import { RunSimulation, AGE_OBJECTIVE_KILLS } from "../../core/sim/RunSimulation";
import type { SimEvent } from "../../core/sim/SimEvent";
import { MAX_ENEMIES, MAX_PROJ, MAX_PICKUP } from "../../core/sim/RunState";
import { worldToChunk, CHUNK_SIZE, ACTIVE_RADIUS_CHUNKS } from "../../core/world/chunks";
import { BIOME_STYLE, CIV_LAYER, ENEMY_LINEAGE } from "../../content/content";
import type { AgeId } from "../../core/tech/graph";
import { AGES } from "../../core/tech/graph";
import { BREAKTHROUGHS, breakthroughProgress, nearestBreakthroughs, completingBreakthrough, tagDisplayKey } from "../../core/tech/synergy";
import { activeFamilies, ORIGINS, type OriginId } from "../../core/progression/origins";
import { legacyDefById } from "../../core/progression/legacies";
import type { WeaponFamily } from "../../core/combat/weapons";
import { CRITICAL_SPINE } from "../../core/tech/graph";
import { AGE_DEFS, dwellFor } from "../../core/progression/ages";
import { threatBudget } from "../../core/director/director";
import { getWeaponStage } from "../../core/combat/weapons";
import { t, setLang, getLang } from "../../i18n/i18n";
import type { EnKeys } from "../../i18n/en";
import { loadSave, storeSave } from "../../core/save/save";
import { sfx } from "../audio/sfx";
import { uiRoot, clearUI, el, button, toast } from "../ui";
import { TITLE_SEED_KEY, TITLE_ORIGIN_KEY } from "./TitleScene";
import { isQAMode, GOLDEN_QA_SEED } from "../../qa/qaMode";
import { QaSession, type QaFrameData, type QaPOIInfo } from "../../qa/qaPanel";
import { drawEnemy } from "../render/EnemyRenderer";
import { drawPlayer } from "../render/PlayerRenderer";
import {
  drawFriendlyProj, drawHostileProj, drawBeam, drawAura, drawOrbit, drawSummon, drawMine, drawKnowledge,
} from "../render/ProjectileRenderer";
import { drawGround, drawPoi } from "../render/WorldRenderer";
import { nearestInterest, drawOffscreenIndicator } from "../render/NavigationRenderer";
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
  private onboard: { done: Set<string>; active: string; until: number } = { done: new Set(), active: "", until: 0 };

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

  constructor() {
    super("game");
  }

  create(): void {
    const save = loadSave(localStorage);
    setLang(save.settings.lang);
    sfx.setVolume(save.settings.volume);

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
      on("keydown-ESC", () => {
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
    }
    this.input.on("pointerdown", this.unlockAudio);

    this.debugText = this.add.text(10, 110, "", {
      fontSize: "12px", color: "#7fff9f", fontFamily: "monospace", backgroundColor: "rgba(0,0,0,0.6)",
    });
    this.debugText.setScrollFactor(0).setDepth(50).setVisible(this.showDebug);

    document.addEventListener("visibilitychange", this.onHidden);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.onShutdown, this);

    this.buildHUD();
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
          // Test-only staging for the Industrial transition: sets genuine
          // preconditions; the age-up, events, and modal queue run real code.
          const s = this.sim.state;
          s.ageIndex = 2;
          s.elapsed = 400;
          s.ageElapsed = 100;
          s.knowledgeTotal = 2800;
          s.ageKills = 120;
          this.refreshHUD();
        },
        hash: () => this.sim.hash(),
        snapshot: () => this.sim.snapshot(),
        seed: () => this.masterSeed,
        setLang: (code: "en" | "th") => this.applyLanguage(code),
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
        ? {
          killsHave: s.ageKills,
          killsNeed: AGE_OBJECTIVE_KILLS[next] ?? 0,
          knowHave: Math.floor(s.knowledgeTotal),
          knowNeed: AGE_DEFS[next]?.knowledgeThreshold ?? 0,
          elapsedHave: Math.floor(s.elapsed),
          elapsedNeed: AGE_DEFS[next]?.minTimeSec ?? 0,
        }
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
    const top = el("div", "hud-top");
    const hpBar = el("div", "bar hp");
    const hpFill = document.createElement("div");
    hpBar.appendChild(hpFill);
    const xpBar = el("div", "bar xp");
    const xpFill = document.createElement("div");
    xpBar.appendChild(xpFill);
    top.appendChild(hpBar);
    top.appendChild(xpBar);
    const stats = el("div", "hud-stats");
    const age = el("div", "hud-objective");
    top.appendChild(stats);
    top.appendChild(age);
    // Build identity + nearest breakthrough goals (Phase 4, DOM only).
    const goals = el("div", "hud-goals");
    top.appendChild(goals);
    hud.appendChild(top);
    // Persistent action container OUTSIDE the wiped stats block: recreating
    // buttons every HUD refresh breaks focus/click stability (P1-01 class).
    const ascendWrap = el("div", "hud-ascend");
    hud.appendChild(ascendWrap);
    // Wayfinding compass (nearest interest) + persistent boss bar + hints.
    const compass = el("div", "nav-compass");
    hud.appendChild(compass);
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
    this.hud = { hpFill, xpFill, stats, age, goals, ascendWrap, compass, bossBar, bossFill, hint };
    this.refreshHUD();
  }

  private refreshHUD(): void {
    const s = this.sim.state;
    const { hpFill, xpFill, stats, age } = this.hud;
    if (!hpFill || !xpFill || !stats || !age) return;
    hpFill.style.width = `${Math.max(0, (s.build.hp / s.build.maxHp) * 100)}%`;
    xpFill.style.width = `${Math.min(100, (s.xp / s.xpNext) * 100)}%`;
    const ageId = AGES[s.ageIndex] as AgeId;
    const mm = Math.floor(s.runElapsed / 60);
    const ss = Math.floor(s.runElapsed % 60).toString().padStart(2, "0");
    stats.innerHTML = "";
    const add = (txt: string, cls = ""): void => {
      const span = document.createElement("span");
      if (cls) span.className = cls;
      span.textContent = txt;
      stats.appendChild(span);
    };
    add(`${t("ui.level")} ${s.level}`);
    add(t(`age.${ageId}` as EnKeys));
    add(`${mm}:${ss}`);
    add(`☠ ${s.stats.kills}`);
    add(this.masterSeed, "hud-seed");
    // Persistent Ascension entry (STAY dismisses the offer screen; this stays).
    // Created once, removed once — never rebuilt per refresh (P1-01 class).
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
    if (s.bossIndex >= 0) {
      const boss = s.enemies[s.bossIndex];
      if (boss?.active) add(`${t("ui.boss")} ${Math.ceil((boss.hp / boss.maxHp) * 100)}%`);
    }
    this.refreshBossBar();
    this.navT -= 0.15;
    if (this.navT <= 0) {
      this.navT = 1;
      this.updateCompass();
    }
    this.updateOnboard();
    // Age-progress block: why am I (not) advancing?
    const next = s.ageIndex + 1;
    if (next < AGES.length) {
      const def = AGE_DEFS[next]!;
      const needK = AGE_OBJECTIVE_KILLS[next] ?? 0;
      const dwell = dwellFor(next);
      const parts = [
        `${t("ui.progressKnowledge")} ${Math.floor(s.knowledgeTotal)} / ${def.knowledgeThreshold}`,
        `${t("ui.progressObjective")} ☠ ${Math.min(s.ageKills, needK)} / ${needK}`,
        `${Math.floor(s.elapsed)}s / ${def.minTimeSec}s · ⏳${Math.floor(s.ageElapsed)}s / ${dwell}s`,
      ];
      age.textContent = parts.join("   ");
    } else {
      age.textContent = `${t("ui.progressKnowledge")} ${Math.floor(s.knowledgeTotal)}`;
    }
    // Build identity + nearest breakthrough goals (Phase 4).
    const goals = this.hud.goals;
    if (goals) {
      const fams = activeFamilies(s.originId, s.expansionFamily)
        .map((f) => t(`family.${f}` as EnKeys)).join("+");
      const origin = ORIGINS.find((o) => o.id === s.originId);
      const near = nearestBreakthroughs([...s.ownedTags], [...s.breakthroughs], 2)
        .map((p) => `${t(p.titleKey)} ${p.have}/${p.need}`).join(" · ");
      goals.textContent = `${t("ui.origin")}: ${origin ? t(origin.nameKey) : s.originId} (${fams})` +
        (near !== "" ? `   ${t("ui.buildGoals")}: ${near}` : "");
    }
  }

  /** Persistent top-of-screen boss bar (localized label + fraction). */
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

  /** Compass strip: boss takes priority, else nearest undiscovered POI. */
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
    // Nearest undiscovered POI (presentation scan; throttled to 1 Hz).
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
    });
    screen.appendChild(cards);
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
    const panel = el("div", "panel");
    panel.appendChild(el("h2", "", "ui.pause"));
    // Language switch mid-run: rebuilds UI only, simulation untouched.
    const langRow = el("div", "settings-row");
    langRow.appendChild(el("span", "", "ui.language"));
    const langs = el("div", "lang-row");
    const save = loadSave(localStorage);
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

  private restartRun(): void {
    // P2-01: Restart = SAME master seed, clean simulation. (Play Again uses a
    // fresh random seed; Quit returns to title.) Origin choice is preserved.
    this.modalQueue = [];
    this.closeBlocking();
    document.getElementById("pause-screen")?.remove();
    document.getElementById("draft-screen")?.remove();
    document.getElementById("ascend-screen")?.remove();
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
    const panel = el("div", "panel");
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
      const panel = el("div", "panel");
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
      const panel = el("div", "panel");
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
    const panel = el("div", "panel");
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
      const panel = el("div", "panel");
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
      const panel = el("div", "panel");
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
      const panel = el("div", "panel");
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
          break;
        case "breakthrough": {
          this.showBreakthroughBeat(e.id);
          break;
        }
        case "age_reached":
          sfx.age();
          toast("ui.ageReached", t(`age.${e.age}` as EnKeys));
          if (save.settings.shake) this.cameras.main.shake(250, 0.008);
          this.lastGroundKey = "";
          this.showAgeTransition(e.age);
          break;
        case "poi_discovered":
          sfx.age();
          toast("ui.poiFound", t(`poi.${e.poiType}.name` as EnKeys), `+${Math.floor(e.knowledge)} ${t("ui.knowledge")}`);
          break;
        case "poi_major":
          toast("ui.poiFound", t(`poi.${e.poiType}.name` as EnKeys));
          sfx.levelup();
          break;
        case "expansion_offered":
          this.showExpansionPick(e.families);
          break;
        case "expansion_unlocked":
          toast("ui.expansionTitle", t(`family.${e.family}` as EnKeys));
          sfx.select();
          break;
        case "boss_warning":
          sfx.boss();
          toast("ui.bossWarning");
          if (save.settings.shake) this.cameras.main.shake(400, 0.01);
          break;
        case "boss_killed":
          sfx.ascend();
          break;
        case "ascension_ready":
          this.offerAscend();
          break;
        case "legacy_granted": {
          const def = legacyDefById(e.id);
          if (def) toast("ui.legacyTitle", t(def.nameKey));
          break;
        }
        case "ascended":
          toast("ui.ascendTitle", `#${e.ascension} · ${e.worldSeed}`);
          break;
        case "player_hurt":
          sfx.hurt();
          this.lastHurtT = performance.now() / 1000;
          break;
        case "enemy_killed":
          killsThisFrame++;
          break;
        case "player_died":
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
    if (!this.paused && !s.over && !s.draftOpen && !this.blockingModal) {
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
    // Timed beats auto-dismiss; choice modals wait for a decision.
    if (this.modalT > 0) {
      this.modalT -= dt;
      if (this.modalT <= 0) this.closeBlocking();
    }

    this.drawFrame();
    this.hudT -= dt;
    if (this.hudT <= 0) {
      this.hudT = 0.15;
      this.refreshHUD();
    }
    // Ground follows chunk/age/POI discovery; CAMERA moves every frame (R4).
    const { cx, cy } = worldToChunk(s.px, s.py);
    const gk = `${s.worldNonce}:${cx},${cy}:a${s.ageIndex}:p${s.poisWorld.length}`;
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
      drawEnemy(g, e, {
        bodyColor: ENEMY_LINEAGE[e.family].color[AGES[s.ageIndex] as AgeId],
        facing: Math.atan2(s.py - e.y, s.px - e.x),
        time: now,
        highContrast: hc,
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
    });
    this.drawBossIndicator();
  }

  /** Persistent off-screen boss indicator (screen space). */
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
