// GameScene — ADAPTER (ADR 0003). Owns no canonical gameplay state.
// Browser input → InputFrame → RunSimulation.step() → state → Phaser render.
// SimEvent → DOM / audio / camera. Restart = NEW RunSimulation instance.
import Phaser from "phaser";
import { normalizeSeedString, deriveUint32, generateRandomSeed } from "../../core/seed/hash";
import { WORLDGEN_VERSION, CONTENT_VERSION } from "../../core/seed/versions";
import { FixedAccumulator, SIM_DT } from "../../core/sim/fixedStep";
import { InputLatch } from "../../core/sim/InputLatch";
import { RunSimulation, AGE_OBJECTIVE_KILLS } from "../../core/sim/RunSimulation";
import type { SimEvent } from "../../core/sim/SimEvent";
import { worldToChunk, CHUNK_SIZE, ACTIVE_RADIUS_CHUNKS } from "../../core/world/chunks";
import { BIOME_STYLE, CIV_LAYER, ENEMY_LINEAGE } from "../../content/content";
import type { AgeId } from "../../core/tech/graph";
import { AGES } from "../../core/tech/graph";
import { BREAKTHROUGHS } from "../../core/tech/synergy";
import { AGE_DEFS, dwellFor } from "../../core/progression/ages";
import { threatBudget } from "../../core/director/director";
import { getWeaponStage } from "../../core/combat/weapons";
import { t, setLang } from "../../i18n/i18n";
import type { EnKeys } from "../../i18n/en";
import { loadSave, storeSave } from "../../core/save/save";
import { sfx } from "../audio/sfx";
import { uiRoot, clearUI, el, button, toast } from "../ui";
import { TITLE_SEED_KEY } from "./TitleScene";

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
    this.sim = new RunSimulation({ masterSeed: seed });
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
    this.playerArc.setStrokeStyle(3, 0x1a1405);
    this.playerArc.setDepth(10);
    this.cameras.main.startFollow(this.playerArc, false, 0.14, 0.14);

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
        hash: () => this.sim.hash(),
        snapshot: () => this.sim.snapshot(),
        seed: () => this.masterSeed,
        setLang: (code: "en" | "th") => this.applyLanguage(code),
      };
    }
  }

  /** Language switch: DOM text only — sim/RNG/state untouched (tested). */
  private applyLanguage(code: "en" | "th"): void {
    const sv = loadSave(localStorage);
    sv.settings.lang = code;
    storeSave(localStorage, sv);
    setLang(code);
    document.getElementById("pause-screen")?.remove();
    this.buildHUD();
    if (this.paused) this.showPause();
  }

  private unlockAudio = (): void => {
    sfx.unlock();
  };

  private onHidden = (): void => {
    const s = this.sim?.state;
    if (s && document.hidden && !this.paused && !s.over && !s.draftOpen) this.togglePause();
  };

  private onShutdown(): void {
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
    hud.appendChild(top);
    root.appendChild(hud);
    this.hud = { hpFill, xpFill, stats, age };
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
    if (s.ascendReady) {
      const b = document.createElement("button");
      b.className = "btn primary";
      b.style.pointerEvents = "auto";
      b.textContent = t("ui.ascend");
      b.addEventListener("click", () => this.doAscend());
      stats.appendChild(b);
    }
    if (s.bossIndex >= 0) {
      const boss = s.enemies[s.bossIndex];
      if (boss?.active) add(`${t("ui.boss")} ${Math.ceil((boss.hp / boss.maxHp) * 100)}%`);
    }
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
    screen.appendChild(el("h2", "", "ui.chooseTech"));
    const cards = el("div", "cards");
    s.draftChoices.forEach((n, i) => {
      const c = el("div", "card");
      c.setAttribute("role", "button");
      c.appendChild(el("div", "key", undefined, `[${i + 1}]`));
      const h = document.createElement("h3");
      h.textContent = t(n.titleKey as EnKeys);
      const d = document.createElement("p");
      d.textContent = t(n.descriptionKey as EnKeys);
      const r = el("div", `rarity rarity-${n.rarity}`, undefined, t(`rarity.${n.rarity}` as EnKeys));
      c.appendChild(h);
      c.appendChild(d);
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
    // fresh random seed; Quit returns to title.)
    document.getElementById("pause-screen")?.remove();
    document.getElementById("draft-screen")?.remove();
    document.getElementById("ascend-screen")?.remove();
    sessionStorage.setItem(TITLE_SEED_KEY, this.masterSeed);
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
    row.appendChild(button("ui.ascend", () => this.doAscend(), "btn primary"));
    const stay = button("ui.resume", () => document.getElementById("ascend-screen")?.remove());
    row.appendChild(stay);
    panel.appendChild(row);
    screen.appendChild(panel);
    root.appendChild(screen);
  }

  private doAscend(): void {
    document.getElementById("ascend-screen")?.remove();
    const ev = this.sim.ascend();
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
          const b = BREAKTHROUGHS.find((x) => x.id === e.id);
          if (b) toast("ui.breakthrough", t(b.titleKey), t(b.descriptionKey));
          sfx.age();
          break;
        }
        case "age_reached":
          sfx.age();
          toast("ui.ageReached", t(`age.${e.age}` as EnKeys));
          if (save.settings.shake) this.cameras.main.shake(250, 0.008);
          this.lastGroundKey = "";
          break;
        case "poi_discovered":
          sfx.age();
          toast("ui.poiFound", t(`poi.${e.poiType}.name` as EnKeys), `+${Math.floor(e.knowledge)} ${t("ui.knowledge")}`);
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
        case "ascended":
          toast("ui.ascendTitle", `#${e.ascension} · ${e.worldSeed}`);
          break;
        case "player_hurt":
          sfx.hurt();
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
    this.latch.setMove(ix, iy);
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
    if (!this.paused && !s.over && !s.draftOpen) {
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
    const ageId = AGES[s.ageIndex] as AgeId;
    const civ = CIV_LAYER[ageId];
    for (let ox = -R; ox <= R; ox++) {
      for (let oy = -R; oy <= R; oy++) {
        const desc = this.sim.chunks.get(s.worldSeed, s.worldNonce, cx + ox, cy + oy);
        const style = BIOME_STYLE[desc.biome];
        const gx = (cx + ox) * CHUNK_SIZE;
        const gy = (cy + oy) * CHUNK_SIZE;
        g.fillStyle(style.ground, 1);
        g.fillRect(gx, gy, CHUNK_SIZE, CHUNK_SIZE);
        g.fillStyle(style.groundAlt, 1);
        const hatch = deriveUint32(s.worldSeed, `hatch:${desc.x},${desc.y}`) % 4;
        for (let i = 0; i < 4; i++) {
          g.fillRect(gx + ((hatch * 130 + i * 170) % CHUNK_SIZE), gy + ((i * 190 + hatch * 70) % CHUNK_SIZE), 46, 46);
        }
        const du = deriveUint32(s.worldSeed, `civ:${desc.x},${desc.y}`);
        g.fillStyle(civ.color, 0.85);
        for (let i = 0; i < civ.density * 2; i++) {
          const hx = (du + i * 137) % CHUNK_SIZE;
          const hy = (du * 3 + i * 251) % CHUNK_SIZE;
          if (s.ageIndex <= 1) g.fillCircle(gx + hx, gy + hy, 3);
          else if (s.ageIndex <= 3) g.fillRect(gx + hx, gy + hy, 7, 7);
          else g.fillTriangle(gx + hx, gy + hy, gx + hx + 9, gy + hy, gx + hx + 4, gy + hy - 10);
        }
        for (const poi of desc.poi) {
          const found = s.poisWorld.includes(poi.id);
          g.lineStyle(2, found ? 0x555555 : 0xffd166, 1);
          g.strokeCircle(poi.wx, poi.wy, 16);
          g.fillStyle(found ? 0x555555 : 0xffd166, 1);
          g.fillCircle(poi.wx, poi.wy, 5);
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

    for (const k of s.pickups) {
      if (!k.active || !vis(k.x, k.y)) continue;
      g.fillStyle(0x53e0c8, 1);
      g.fillCircle(k.x, k.y, 4 + Math.min(3, k.value * 0.3));
    }
    for (const m of s.mines) {
      if (!m.active || !vis(m.x, m.y)) continue;
      g.lineStyle(1, 0xc9b458, 0.8);
      g.strokeCircle(m.x, m.y, 8);
    }
    const ageId = AGES[s.ageIndex] as AgeId;
    for (const e of s.enemies) {
      if (!e.active || !vis(e.x, e.y)) continue;
      const base = ENEMY_LINEAGE[e.family].color[ageId];
      g.fillStyle(e.flash > 0 ? 0xffffff : base, 1);
      g.fillCircle(e.x, e.y, e.radius);
      if (e.elite || e.boss) {
        // Affix telegraph ring: volatile pulses red, shielded cyan, armored gray.
        const ring = e.affix === "volatile" ? 0xff2222 : e.affix === "shielded" ? 0x53e0c8 : e.boss ? 0xff2222 : 0xffd166;
        g.lineStyle(e.boss ? 4 : 2, ring, 1);
        g.strokeCircle(e.x, e.y, e.radius + 4);
        if (e.shield > 0) {
          g.lineStyle(1, 0x7fb8ff, 0.9);
          g.strokeCircle(e.x, e.y, e.radius + 8);
        }
        const w = e.radius * 2;
        g.fillStyle(0x330000, 1);
        g.fillRect(e.x - w / 2, e.y - e.radius - 12, w, 5);
        g.fillStyle(0xff3333, 1);
        g.fillRect(e.x - w / 2, e.y - e.radius - 12, w * Math.max(0, e.hp / e.maxHp), 5);
      }
    }
    for (const p of s.projs) {
      if (!p.active || !vis(p.x, p.y)) continue;
      g.fillStyle(p.color, 1);
      g.fillCircle(p.x, p.y, p.radius);
    }
    const b = s.build;
    const est = getWeaponStage("energy", s.weaponStage.energy);
    if (est.archetype === "aura" || b.bonusAura > 0) {
      g.lineStyle(2, 0xffb03c, 0.35);
      g.strokeCircle(s.px, s.py, est.radius + b.bonusAura * 30);
    }
    const fst = getWeaponStage("field", s.weaponStage.field);
    if (fst.archetype === "orbit" || b.bonusOrbit > 0) {
      g.fillStyle(0xb48cff, 1);
      const blades = 2 + b.bonusOrbit;
      for (let i = 0; i < blades; i++) {
        const a = s.orbitAng + (i * Math.PI * 2) / Math.max(1, blades);
        g.fillCircle(s.px + Math.cos(a) * (fst.radius || 110), s.py + Math.sin(a) * (fst.radius || 110), 8);
      }
    }
    const dst = getWeaponStage("defense", s.weaponStage.defense);
    if (dst.archetype === "orbit") {
      g.fillStyle(dst.color, 1);
      const blades = Math.max(1, dst.count + b.bonusOrbit);
      for (let i = 0; i < blades; i++) {
        const a = s.orbitAng + (i * Math.PI * 2) / Math.max(1, blades);
        g.fillCircle(s.px + Math.cos(a) * dst.radius, s.py + Math.sin(a) * dst.radius, 7);
      }
    }
    const guardians = Math.min((dst.archetype === "summon" ? dst.count : 0) + b.bonusGuardians, 8);
    if (guardians > 0) {
      g.fillStyle(dst.color, 1);
      for (let i = 0; i < guardians; i++) {
        const a = s.guardianAng + (i * Math.PI * 2) / Math.max(1, guardians);
        g.fillCircle(s.px + Math.cos(a) * 80, s.py + Math.sin(a) * 80, 7);
      }
    }
    if (s.beamFlash) {
      g.lineStyle(6, 0xfff07f, 0.9);
      g.lineBetween(s.px, s.py, s.beamFlash.x2, s.beamFlash.y2);
    }
    this.playerArc.setPosition(s.px, s.py);
    this.playerArc.setFillStyle(s.iframe > 0 ? 0x9fd8ff : 0xffd166);
  }
}
