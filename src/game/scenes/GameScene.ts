// GameScene: authoritative run simulation (fixed-step) + Phaser presentation.
// Rules/numbers come from core/* and content/*. This file owns NO canonical balance
// that core/tests don't know about — tuning lives in data modules.
import Phaser from "phaser";
import { normalizeSeedString, deriveUint32, generateRandomSeed } from "../../core/seed/hash";
import { Xoshiro128StarStar } from "../../core/seed/rng";
import { createStreamRng, deriveAscensionSeed } from "../../core/seed/streams";
import { WORLDGEN_VERSION, CONTENT_VERSION } from "../../core/seed/versions";
import { FixedAccumulator, SIM_DT, xpForLevel } from "../../core/sim/fixedStep";
import { getChunkDescriptor, worldToChunk, CHUNK_SIZE } from "../../core/world/chunks";
import { BIOME_STYLE, CIV_LAYER, ENEMY_LINEAGE } from "../../content/content";
import type { AgeId } from "../../core/tech/graph";
import { AGES } from "../../core/tech/graph";
import { generateTechGraph } from "../../core/tech/generator";
import { validateTechGraph } from "../../core/tech/validator";
import type { TechNode } from "../../core/tech/graph";
import { checkBreakthroughs } from "../../core/tech/synergy";
import { AGE_DEFS, canAdvanceAge, dwellFor } from "../../core/progression/ages";
import { threatBudget, composeFromBudget, eliteChance, ELITE_AFFIXES } from "../../core/director/director";
import type { EnemyFamily } from "../../core/director/director";
import { getWeaponStage } from "../../core/combat/weapons";
import type { WeaponFamily } from "../../core/combat/weapons";
import { poiTypeFor } from "../../core/world/poi";
import { t, setLang } from "../../i18n/i18n";
import { loadSave, storeSave } from "../../core/save/save";
import { sfx } from "../audio/sfx";
import { uiRoot, clearUI, el, button, toast } from "../ui";
import { TITLE_SEED_KEY } from "./TitleScene";

interface Enemy { active: boolean; x: number; y: number; hp: number; maxHp: number; family: EnemyFamily; speed: number; dmg: number; radius: number; xp: number; elite: boolean; affix: string; flash: number; shootT: number; boss: boolean; hitCd: number; }
interface Proj { active: boolean; x: number; y: number; vx: number; vy: number; dmg: number; radius: number; life: number; friendly: boolean; color: number; src: string; }
interface Pickup { active: boolean; x: number; y: number; value: number; }
interface Mine { active: boolean; x: number; y: number; dmg: number; radius: number; life: number; }

const MAX_ENEMIES = 650;
const MAX_PROJ = 1000;
const MAX_PICKUP = 400;
const MAX_MINES = 60;
const CELL = 128;

const OBJECTIVE_KILLS = [0, 25, 60, 120, 200, 0];

export class GameScene extends Phaser.Scene {
  private masterSeed = "EPOCH-GOLDEN-001";
  private worldSeed = "EPOCH-GOLDEN-001";
  private ascension = 0;
  private rng!: Xoshiro128StarStar;
  private enemyRng!: Xoshiro128StarStar;
  private draftRng!: Xoshiro128StarStar;

  private graph!: { nodes: TechNode[] };
  private owned = new Set<string>();
  private ownedTags = new Set<string>();
  private breakthroughs = new Set<string>();

  // Player build
  private px = 0; private py = 0;
  private hp = 100; private maxHp = 100;
  private speed = 220; private level = 1; private xp = 0; private xpNext = 10;
  private knowledge = 0; private regen = 0; private pickupR = 90;
  private damageMul = 1; private cooldownMul = 1;
  private bonusProjectiles = 0; private bonusGuardians = 0; private bonusAura = 0;
  private bonusOrbit = 0; private bonusMines = 0; private beamUnlocked = false;
  private dashT = 0; private dashCd = 0; private iframe = 0;
  private vx = 0; private vy = 0;

  private ageIndex = 0;
  private elapsed = 0; private ageElapsed = 0;
  private kills = 0; private ageKills = 0; private elites = 0; private bosses = 0;
  private techsTaken: string[] = [];
  private chunksVisited = new Set<string>();
  private poisFound = new Set<string>();
  private damageBySource = new Map<string, number>();

  private enemies: Enemy[] = [];
  private projs: Proj[] = [];
  private pickups: Pickup[] = [];
  private mines: Mine[] = [];
  private spatial = new Map<number, number[]>();
  private queryCount = 0;

  private weaponT: Record<WeaponFamily, number> = { kinetic: 0, energy: 0, defense: 0, field: 0 };
  private mineT = 0; private auraT = 0;
  private spawnT = 0; private eliteT = 60; private bossSpawned = false; private ascendReady = false;
  private pendingLevels = 0;
  private paused = false; private over = false; private draftOpen = false;
  private bossRef: Enemy | null = null;

  private acc = new FixedAccumulator();
  private gfx!: Phaser.GameObjects.Graphics;
  private ground!: Phaser.GameObjects.Graphics;
  private playerArc!: Phaser.GameObjects.Arc;
  private debugText!: Phaser.GameObjects.Text;
  private showDebug = false;
  private fpsEMA = 60; private simMs = 0;
  private lastChunk = "";
  private groundT = 0;
  private keys: Record<string, Phaser.Input.Keyboard.Key> = {};
  private hud: Record<string, HTMLElement> = {};
  private hudT = 0;

  constructor() { super("game"); }

  create(): void {
    const save = loadSave(localStorage);
    setLang(save.settings.lang);
    sfx.setVolume(save.settings.volume);

    const pending = sessionStorage.getItem(TITLE_SEED_KEY);
    this.masterSeed = normalizeSeedString(pending || generateRandomSeed()) || generateRandomSeed();
    sessionStorage.removeItem(TITLE_SEED_KEY);
    this.worldSeed = this.masterSeed;
    this.ascension = 0;
    this.resetRunState();

    this.ground = this.add.graphics();
    this.gfx = this.add.graphics();
    this.playerArc = this.add.circle(0, 0, 16, 0xffd166) as unknown as Phaser.GameObjects.Arc;
    this.playerArc.setStrokeStyle(3, 0x1a1405);
    this.playerArc.setDepth(10);

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
        SPACE: kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
        ESC: kb.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
        F3: kb.addKey(Phaser.Input.Keyboard.KeyCodes.F3),
        ONE: kb.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
        TWO: kb.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
        THREE: kb.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
      };
      kb.on("keydown-F3", () => { this.showDebug = !this.showDebug; this.debugText.setVisible(this.showDebug); });
      kb.on("keydown-ESC", () => { if (!this.over && !this.draftOpen) this.togglePause(); });
      kb.on("keydown-ONE", () => this.pickCard(0));
      kb.on("keydown-TWO", () => this.pickCard(1));
      kb.on("keydown-THREE", () => this.pickCard(2));
    }
    this.input.on("pointerdown", () => sfx.unlock());

    this.debugText = this.add.text(10, 0, "", { fontSize: "12px", color: "#7fff9f", fontFamily: "monospace" });
    this.debugText.setScrollFactor(0).setDepth(50).setVisible(false);

    document.addEventListener("visibilitychange", this.onHidden);
    this.buildHUD();
    this.refreshGround(true);
    toast("age.stone", t("age.stone"), t("objective.stone"));
  }

  private onHidden = (): void => {
    if (document.hidden && !this.over && !this.paused && !this.draftOpen) this.togglePause();
  };

  private resetRunState(): void {
    this.rng = createStreamRng(this.worldSeed, "event");
    this.enemyRng = createStreamRng(this.worldSeed, "enemy");
    this.draftRng = createStreamRng(this.worldSeed, "loot");
    const g = generateTechGraph(this.worldSeed, this.ascension);
    const v = validateTechGraph(g);
    if (!v.ok) console.warn("tech graph fallback", v.errors);
    this.graph = g;
    this.owned = new Set(["spine-tools"]);
    this.ownedTags = new Set(["spine", "stone"]);
    this.breakthroughs = new Set();
    this.applyNode(this.graph.nodes.find((n) => n.id === "spine-tools") ?? null);

    this.px = 0; this.py = 0;
    this.hp = 100; this.maxHp = 100; this.speed = 220;
    this.level = 1; this.xp = 0; this.xpNext = xpForLevel(1);
    this.knowledge = 0; this.regen = 0; this.pickupR = 90;
    this.damageMul = 1; this.cooldownMul = 1;
    this.bonusProjectiles = 0; this.bonusGuardians = 0; this.bonusAura = 0;
    this.bonusOrbit = 0; this.bonusMines = 0; this.beamUnlocked = false;
    this.ageIndex = 0; this.elapsed = 0; this.ageElapsed = 0;
    this.kills = 0; this.ageKills = 0; this.elites = 0; this.bosses = 0;
    this.techsTaken = []; this.chunksVisited = new Set(["0,0"]); this.poisFound = new Set();
    this.damageBySource = new Map();
    this.enemies = Array.from({ length: MAX_ENEMIES }, () => ({ active: false, x: 0, y: 0, hp: 1, maxHp: 1, family: "chaser" as EnemyFamily, speed: 100, dmg: 5, radius: 12, xp: 1, elite: false, affix: "", flash: 0, shootT: 0, boss: false, hitCd: 0 }));
    this.projs = Array.from({ length: MAX_PROJ }, () => ({ active: false, x: 0, y: 0, vx: 0, vy: 0, dmg: 1, radius: 5, life: 0, friendly: true, color: 0xffffff, src: "" }));
    this.pickups = Array.from({ length: MAX_PICKUP }, () => ({ active: false, x: 0, y: 0, value: 1 }));
    this.mines = Array.from({ length: MAX_MINES }, () => ({ active: false, x: 0, y: 0, dmg: 10, radius: 60, life: 0 }));
    this.pendingLevels = 0; this.paused = false; this.over = false; this.draftOpen = false;
    this.bossSpawned = false; this.ascendReady = false; this.bossRef = null;
    this.weaponT = { kinetic: 0, energy: 0, defense: 0, field: 0 };
    this.spawnT = 0; this.eliteT = 60;
  }

  // ---------- HUD (DOM, Thai-safe) ----------
  private draftChoices: TechNode[] = [];

  private buildHUD(): void {
    clearUI();
    const root = uiRoot();
    const hud = el("div", "hud");
    const top = el("div", "hud-top");
    const hpBar = el("div", "bar hp"); const hpFill = document.createElement("div"); hpBar.appendChild(hpFill);
    const xpBar = el("div", "bar xp"); const xpFill = document.createElement("div"); xpBar.appendChild(xpFill);
    top.appendChild(hpBar); top.appendChild(xpBar);
    const stats = el("div", "hud-stats");
    top.appendChild(stats);
    hud.appendChild(top);
    root.appendChild(hud);
    this.hud = { hpFill, xpFill, stats, hud };
    this.refreshHUD(true);
  }

  private refreshHUD(force = false): void {
    void force;
    const { hpFill, xpFill, stats } = this.hud;
    if (!hpFill || !xpFill || !stats) return;
    hpFill.style.width = `${Math.max(0, (this.hp / this.maxHp) * 100)}%`;
    xpFill.style.width = `${Math.min(100, (this.xp / this.xpNext) * 100)}%`;
    const ageId: AgeId = AGES[this.ageIndex] as AgeId;
    const mm = Math.floor(this.elapsed / 60);
    const ss = Math.floor(this.elapsed % 60).toString().padStart(2, "0");
    stats.innerHTML = "";
    const parts: [string, string][] = [
      [`${t("ui.level")} ${this.level}`, ""],
      [t(`age.${ageId}` as never) as string, ""],
      [`${mm}:${ss}`, ""],
      [`☠ ${this.kills}`, ""],
      [this.masterSeed, "hud-seed"],
    ];
    for (const [txt, cls] of parts) {
      const s = document.createElement("span");
      if (cls) s.className = cls;
      s.textContent = txt;
      stats.appendChild(s);
    }
    if (this.ascendReady) {
      const b = document.createElement("button");
      b.className = "btn primary";
      b.style.pointerEvents = "auto";
      b.textContent = t("ui.ascend");
      b.addEventListener("click", () => this.doAscend());
      stats.appendChild(b);
    }
    if (this.bossRef?.active) {
      const boss = document.createElement("span");
      boss.textContent = `BOSS ${Math.ceil((this.bossRef.hp / this.bossRef.maxHp) * 100)}%`;
      stats.appendChild(boss);
    }
  }

  // ---------- Draft ----------
  private availableNodes(): TechNode[] {
    const ageId = AGES[this.ageIndex] as AgeId;
    const ageRank = this.ageIndex;
    return this.graph.nodes.filter((n) => {
      if (this.owned.has(n.id)) return false;
      if (!n.prerequisites.every((p) => this.owned.has(p))) return false;
      if (n.exclusions.some((e) => this.owned.has(e))) return false;
      const rank = AGES.indexOf(n.age);
      if (rank > ageRank + 1) return false;
      void ageId;
      return true;
    });
  }

  private openDraft(): void {
    this.draftOpen = true;
    const pool = this.availableNodes();
    // Weighted seeded sample + category diversity (damage vs survival vs economy).
    const scored = pool.map((n) => ({ n, w: n.weight * (0.5 + this.draftRng.nextFloat()) }));
    scored.sort((a, b) => b.w - a.w);
    const picks: TechNode[] = [];
    const kinds = new Set<string>();
    for (const s of scored) {
      const k = s.n.effects[0]?.kind ?? "other";
      if (picks.length < 3 && (!kinds.has(k) || picks.length >= 2)) { picks.push(s.n); kinds.add(k); }
      if (picks.length >= 3) break;
    }
    // Fallback generic upgrades if graph is exhausted.
    const fallbacks: TechNode[] = [
      { id: `fb-dmg-${this.level}`, titleKey: "tech.precision.name", descriptionKey: "tech.precision.description", age: "stone", domain: "warfare", tags: ["offense"], prerequisites: [], exclusions: [], rarity: "common", weight: 1, effects: [{ kind: "damageMul", value: 0.1 }], synergyTags: [] },
      { id: `fb-hp-${this.level}`, titleKey: "tech.armor.name", descriptionKey: "tech.armor.description", age: "stone", domain: "warfare", tags: ["defense"], prerequisites: [], exclusions: [], rarity: "common", weight: 1, effects: [{ kind: "maxHpAdd", value: 25 }], synergyTags: [] },
      { id: `fb-spd-${this.level}`, titleKey: "tech.rail.name", descriptionKey: "tech.rail.description", age: "stone", domain: "industry", tags: ["mobility"], prerequisites: [], exclusions: [], rarity: "common", weight: 1, effects: [{ kind: "moveMul", value: 0.07 }], synergyTags: [] },
    ];
    while (picks.length < 3) picks.push(fallbacks[picks.length] as TechNode);
    this.draftChoices = picks;
    sfx.levelup();

    const root = uiRoot();
    const screen = el("div", "screen"); screen.id = "draft-screen";
    const title = el("h2", "", "ui.chooseTech");
    screen.appendChild(title);
    const cards = el("div", "cards");
    picks.forEach((n, i) => {
      const c = el("div", "card") as HTMLElement;
      c.setAttribute("role", "button");
      const key = el("div", "key", undefined, `[${i + 1}]`);
      const h = document.createElement("h3"); h.textContent = t(n.titleKey as never);
      const d = document.createElement("p"); d.textContent = t(n.descriptionKey as never);
      const r = el("div", `rarity rarity-${n.rarity}`, undefined, n.rarity);
      c.appendChild(key); c.appendChild(h); c.appendChild(d); c.appendChild(r);
      c.addEventListener("click", () => this.pickCard(i));
      cards.appendChild(c);
    });
    screen.appendChild(cards);
    root.appendChild(screen);
  }

  private pickCard(i: number): void {
    if (!this.draftOpen || this.over) return;
    const n = this.draftChoices[i];
    if (!n) return;
    this.draftOpen = false;
    document.getElementById("draft-screen")?.remove();
    this.owned.add(n.id);
    for (const tg of n.tags) this.ownedTags.add(tg);
    for (const st of n.synergyTags) this.ownedTags.add(st);
    this.applyNode(n);
    this.techsTaken.push(n.id);
    sfx.select();
    const fresh = checkBreakthroughs(this.ownedTags, this.breakthroughs);
    for (const b of fresh) {
      this.breakthroughs.add(b.id);
      // Interim (v0.1.1 refactor will route through RunSimulation): apply typed effects.
      this.applyNode({ effects: b.effects } as TechNode);
      toast("ui.breakthrough", t(b.titleKey as never), t(b.descriptionKey as never));
    }
    this.pendingLevels--;
    if (this.pendingLevels > 0) this.openDraft();
  }

  private applyNode(n: TechNode | null): void {
    if (!n) return;
    for (const e of n.effects) {
      switch (e.kind) {
        case "damageMul": this.damageMul *= 1 + e.value; break;
        case "maxHpAdd": this.maxHp += e.value; this.hp = Math.min(this.maxHp, this.hp + e.value); break;
        case "moveMul": this.speed *= 1 + e.value; break;
        case "pickupMul": this.pickupR *= 1 + e.value; break;
        case "cooldownMul": this.cooldownMul *= 1 + e.value; break;
        case "projectileAdd": this.bonusProjectiles += e.value; break;
        case "summonAdd": this.bonusGuardians += e.value; break;
        case "auraAdd": this.bonusAura += e.value; break;
        case "orbitAdd": this.bonusOrbit += e.value; break;
        case "mineAdd": this.bonusMines += e.value; break;
        case "beamAdd": this.beamUnlocked = true; break;
        case "regenAdd": this.regen += e.value; break;
        case "dashCdMul": break;
        case "knowledgeMul": break;
        case "weaponEvolve":
          this.weaponT = { kinetic: 5, energy: 5, defense: 5, field: 5 };
          break;
      }
    }
  }

  private knowledgeMul(): number {
    let m = 1;
    for (const id of this.owned) {
      const n = this.graph.nodes.find((x) => x.id === id);
      for (const e of n?.effects ?? []) if (e.kind === "knowledgeMul") m *= 1 + e.value;
    }
    return m;
  }

  // ---------- Pause / death / ascend ----------
  private togglePause(): void {
    this.paused = !this.paused;
    if (this.paused) {
      const root = uiRoot();
      const screen = el("div", "screen"); screen.id = "pause-screen";
      const panel = el("div", "panel");
      panel.appendChild(el("h2", "", "ui.pause"));
      const col = el("div", "btn-row");
      col.appendChild(button("ui.resume", () => this.togglePause(), "btn primary"));
      col.appendChild(button("ui.restart", () => { document.removeEventListener("visibilitychange", this.onHidden); this.scene.restart(); }));
      col.appendChild(button("ui.quitToTitle", () => { document.removeEventListener("visibilitychange", this.onHidden); this.scene.start("title"); }));
      col.appendChild(button("ui.resetSave", () => {
        if (confirm(t("ui.confirmReset"))) { localStorage.removeItem("seed-game-save-v1"); this.scene.restart(); }
      }, "btn danger"));
      panel.appendChild(col);
      screen.appendChild(panel);
      root.appendChild(screen);
    } else {
      document.getElementById("pause-screen")?.remove();
    }
  }

  private fmtTime(sec: number): string {
    return `${Math.floor(sec / 60)}:${Math.floor(sec % 60).toString().padStart(2, "0")}`;
  }

  private die(): void {
    if (this.over) return;
    this.over = true;
    document.getElementById("draft-screen")?.remove();
    const save = loadSave(localStorage);
    save.best.runs++;
    save.best.bestTimeSec = Math.max(save.best.bestTimeSec, Math.floor(this.elapsed));
    save.best.bestKills = Math.max(save.best.bestKills, this.kills);
    save.best.bestAscension = Math.max(save.best.bestAscension, this.ascension);
    const ageId = AGES[this.ageIndex] as AgeId;
    if (this.elapsed >= (save.best.bestTimeSec || 0)) save.best.bestAge = ageId;
    if (!save.history.includes(this.masterSeed)) save.history.unshift(this.masterSeed);
    save.history = save.history.slice(0, 50);
    storeSave(localStorage, save);

    let top = ""; let topV = -1;
    for (const [k, v] of this.damageBySource) if (v > topV) { topV = v; top = k; }

    const root = uiRoot();
    const screen = el("div", "screen");
    const panel = el("div", "panel");
    panel.appendChild(el("h2", "", "ui.died"));
    panel.appendChild(el("div", "", "ui.runChronicle"));
    const dl = document.createElement("dl");
    dl.className = "chron";
    const rows: [string, string][] = [
      [t("chronicle.seed"), `${this.masterSeed} · w${WORLDGEN_VERSION} · A${this.ascension}`],
      [t("chronicle.time"), this.fmtTime(this.elapsed)],
      [t("chronicle.age"), t(`age.${ageId}` as never)],
      [t("chronicle.kills"), String(this.kills)],
      [t("chronicle.elites"), String(this.elites)],
      [t("chronicle.bosses"), String(this.bosses)],
      [t("chronicle.techs"), String(this.techsTaken.length)],
      [t("chronicle.chunks"), String(this.chunksVisited.size)],
      [t("chronicle.poi"), String(this.poisFound.size)],
      ["Top", `${top || "-"} · v${CONTENT_VERSION}`],
    ];
    for (const [k, v] of rows) {
      const dt = document.createElement("dt"); dt.textContent = k;
      const dd = document.createElement("dd"); dd.textContent = v;
      dl.appendChild(dt); dl.appendChild(dd);
    }
    panel.appendChild(dl);
    const rowBtn = el("div", "btn-row");
    const copy = button("ui.copySeed", () => undefined);
    rowBtn.appendChild(copy);
    copy.addEventListener("click", () => {
      void navigator.clipboard?.writeText(this.masterSeed).catch(() => undefined);
      copy.textContent = t("ui.copied");
    });
    rowBtn.appendChild(button("ui.playAgain", () => {
      sessionStorage.setItem(TITLE_SEED_KEY, generateRandomSeed());
      document.removeEventListener("visibilitychange", this.onHidden);
      this.scene.restart();
    }, "btn primary"));
    rowBtn.appendChild(button("ui.quitToTitle", () => {
      document.removeEventListener("visibilitychange", this.onHidden);
      this.scene.start("title");
    }));
    panel.appendChild(rowBtn);
    screen.appendChild(panel);
    root.appendChild(screen);
  }

  private doAscend(): void {
    if (!this.ascendReady || this.over) return;
    this.ascension++;
    this.worldSeed = deriveAscensionSeed(this.masterSeed, this.ascension);
    sfx.ascend();
    // New Game+: keep build, fresh world + fresh graph, harder scaling.
    const keepOwned = new Set(this.owned);
    const keepTags = new Set(this.ownedTags);
    const g = generateTechGraph(this.worldSeed, this.ascension);
    this.graph = g;
    this.owned = keepOwned; this.ownedTags = keepTags;
    this.px = 0; this.py = 0;
    this.hp = this.maxHp;
    this.ageIndex = 0; this.ageElapsed = 0; this.ageKills = 0;
    this.bossSpawned = false; this.ascendReady = false; this.bossRef = null;
    for (const e of this.enemies) e.active = false;
    for (const p of this.projs) p.active = false;
    document.getElementById("ascend-screen")?.remove();
    this.refreshGround(true);
    toast("ui.breakthrough", `Ascension ${this.ascension}`, this.worldSeed);
    this.refreshHUD(true);
  }

  private offerAscend(): void {
    if (this.over || this.ascendReady) return;
    this.ascendReady = true;
    sfx.ascend();
    const root = uiRoot();
    const screen = el("div", "screen"); screen.id = "ascend-screen";
    const panel = el("div", "panel");
    panel.appendChild(el("h1", "logo", undefined, "ASCEND"));
    const p = el("div", "", undefined, `Planet ${this.ascension + 1} → Planet ${this.ascension + 2} · ${deriveAscensionSeed(this.masterSeed, this.ascension + 1)}`);
    panel.appendChild(p);
    const row = el("div", "btn-row");
    row.appendChild(button("ui.ascend", () => this.doAscend(), "btn primary"));
    const stay = el("button", "btn", undefined, "…");
    stay.textContent = t("ui.resume");
    stay.addEventListener("click", () => document.getElementById("ascend-screen")?.remove());
    row.appendChild(stay);
    panel.appendChild(row);
    screen.appendChild(panel);
    root.appendChild(screen);
    this.refreshHUD(true);
  }

  // ---------- Spawning ----------
  private allocEnemy(): Enemy | null {
    for (const e of this.enemies) if (!e.active) return e;
    return null;
  }
  private allocProj(): Proj | null {
    for (const p of this.projs) if (!p.active) return p;
    return null;
  }
  private allocPickup(): Pickup | null {
    for (const p of this.pickups) if (!p.active) return p;
    return null;
  }
  private allocMine(): Mine | null {
    for (const m of this.mines) if (!m.active) return m;
    return null;
  }

  private spawnEnemy(family: EnemyFamily, elite: boolean, boss: boolean, ang: number, dist: number): void {
    const e = this.allocEnemy();
    if (!e) return;
    const ageId = AGES[this.ageIndex] as AgeId;
    const line = ENEMY_LINEAGE[family];
    const diff = (1 + this.ageIndex * 0.28) * (1 + this.ascension * 0.35) * (1 + this.elapsed / 900);
    e.active = true;
    e.x = this.px + Math.cos(ang) * dist;
    e.y = this.py + Math.sin(ang) * dist;
    e.family = family;
    e.maxHp = line.hp * diff * (boss ? 40 : elite ? 6 : 1);
    e.hp = e.maxHp;
    e.speed = line.speed * (1 + this.ageIndex * 0.04) * (elite && this.enemyRng.nextFloat() < 0.5 ? 1.3 : 1);
    e.dmg = line.dmg * (1 + this.ageIndex * 0.15) * (1 + this.ascension * 0.2) * (boss ? 2 : elite ? 1.5 : 1);
    e.radius = line.radius * (boss ? 3 : elite ? 1.4 : 1);
    e.xp = (family === "tank" ? 4 : family === "ranged" ? 2 : 1) * (elite ? 5 : 1) * (boss ? 15 : 1);
    e.elite = elite; e.boss = boss;
    e.affix = elite ? String(ELITE_AFFIXES[this.enemyRng.nextInt(0, ELITE_AFFIXES.length)]) : "";
    e.flash = 0; e.shootT = 1 + this.enemyRng.nextFloat() * 2; e.hitCd = 0;
    void ageId;
    if (boss) { this.bossRef = e; toast("ui.bossWarning"); sfx.boss(); }
  }

  private director(dt: number): void {
    this.spawnT -= dt;
    if (this.spawnT <= 0) {
      const budget = threatBudget(this.elapsed, this.ageIndex, this.ascension, 1);
      const comp = composeFromBudget(Math.max(6, budget / 6), this.enemyRng, this.ageIndex);
      const total = comp.chaser + comp.ranged + comp.tank + comp.swarm;
      const spawnN = Math.min(24, 2 + Math.floor(total / 2));
      const famPool: EnemyFamily[] = [];
      for (let i = 0; i < comp.chaser; i++) famPool.push("chaser");
      for (let i = 0; i < comp.ranged; i++) famPool.push("ranged");
      for (let i = 0; i < comp.tank; i++) famPool.push("tank");
      for (let i = 0; i < comp.swarm; i++) famPool.push("swarm");
      const chance = eliteChance(this.ageIndex, this.ascension);
      for (let i = 0; i < spawnN; i++) {
        const fam = famPool.length ? famPool[this.enemyRng.nextInt(0, famPool.length)] as EnemyFamily : ("chaser" as EnemyFamily);
        this.spawnEnemy(fam, this.enemyRng.nextFloat() < chance, false, this.enemyRng.nextFloat() * Math.PI * 2, 700 + this.enemyRng.nextFloat() * 250);
      }
      this.spawnT = 2.2;
    }
    // Milestone elite packs + space boss.
    this.eliteT -= dt;
    if (this.eliteT <= 0) {
      this.eliteT = 75;
      for (let i = 0; i < 3; i++) {
        this.spawnEnemy((["chaser", "ranged", "tank"] as EnemyFamily[])[this.enemyRng.nextInt(0, 3)] as EnemyFamily, true, false, this.enemyRng.nextFloat() * Math.PI * 2, 750);
      }
    }
    const ageId = AGES[this.ageIndex] as AgeId;
    if (ageId === "space" && !this.bossSpawned && this.ageElapsed > 15) {
      this.bossSpawned = true;
      this.spawnEnemy("tank", true, true, Math.PI / 4, 800);
    }
  }

  // ---------- Combat helpers ----------
  private addDamage(src: string, v: number): void {
    this.damageBySource.set(src, (this.damageBySource.get(src) ?? 0) + v);
  }

  private nearestEnemy(x: number, y: number, maxD: number): Enemy | null {
    let best: Enemy | null = null; let bd = maxD;
    for (const e of this.enemies) {
      if (!e.active) continue;
      const d = Math.hypot(e.x - x, e.y - y);
      if (d < bd) { bd = d; best = e; }
    }
    return best;
  }

  private enemiesInRadius(x: number, y: number, r: number, out: Enemy[]): Enemy[] {
    out.length = 0;
    const x0 = Math.floor((x - r) / CELL); const x1 = Math.floor((x + r) / CELL);
    const y0 = Math.floor((y - r) / CELL); const y1 = Math.floor((y + r) / CELL);
    for (let cx = x0; cx <= x1; cx++) {
      for (let cy = y0; cy <= y1; cy++) {
        const bucket = this.spatial.get(cx * 73856093 ^ cy * 19349663);
        if (!bucket) continue;
        this.queryCount++;
        for (const idx of bucket) {
          const e = this.enemies[idx];
          if (e && e.active && Math.hypot(e.x - x, e.y - y) <= r + e.radius) out.push(e);
        }
      }
    }
    return out;
  }

  private rebuildSpatial(): void {
    this.spatial.clear();
    for (let i = 0; i < this.enemies.length; i++) {
      const e = this.enemies[i] as Enemy;
      if (!e.active) continue;
      const k = Math.floor(e.x / CELL) * 73856093 ^ Math.floor(e.y / CELL) * 19349663;
      let b = this.spatial.get(k);
      if (!b) { b = []; this.spatial.set(k, b); }
      b.push(i);
    }
  }

  private fireProjectile(x: number, y: number, tx: number, ty: number, speed: number, dmg: number, color: number, src: string, friendly: boolean, radius = 6): void {
    const p = this.allocProj();
    if (!p) return;
    const d = Math.max(1, Math.hypot(tx - x, ty - y));
    p.active = true; p.x = x; p.y = y;
    p.vx = ((tx - x) / d) * speed; p.vy = ((ty - y) / d) * speed;
    p.dmg = dmg; p.radius = radius; p.life = 2.2; p.friendly = friendly; p.color = color; p.src = src;
  }

  private hurtEnemy(e: Enemy, dmg: number, src: string, kx = 0, ky = 0): void {
    if (!e.active) return;
    e.hp -= dmg;
    e.flash = 0.08;
    e.x += kx; e.y += ky;
    this.addDamage(src, Math.min(dmg, Math.max(0, e.hp + dmg)));
    if (e.hp <= 0) {
      e.active = false;
      this.kills++; this.ageKills++;
      if (e.elite && !e.boss) this.elites++;
      if (e.boss) {
        this.bosses++; this.elites++;
        sfx.ascend();
        for (let i = 0; i < 12; i++) this.dropPickup(e.x + (this.rng.nextFloat() - 0.5) * 120, e.y + (this.rng.nextFloat() - 0.5) * 120, 3);
        this.offerAscend();
        if (this.bossRef === e) this.bossRef = null;
      } else {
        sfx.kill();
      }
      // Splitter affix: release two swarm at death position.
      if (e.affix === "splitter" && !e.boss) {
        for (let i = 0; i < 2; i++) {
          const s = this.allocEnemy();
          if (!s) break;
          const line = ENEMY_LINEAGE.swarm;
          s.active = true;
          s.x = e.x + (i === 0 ? -14 : 14); s.y = e.y;
          s.family = "swarm"; s.maxHp = line.hp; s.hp = line.hp;
          s.speed = line.speed; s.dmg = line.dmg; s.radius = line.radius;
          s.xp = 1; s.elite = false; s.boss = false; s.affix = "";
          s.flash = 0; s.shootT = 0; s.hitCd = 0;
        }
      }
      this.dropPickup(e.x, e.y, e.xp);
    }
  }

  private dropPickup(x: number, y: number, value: number): void {
    const p = this.allocPickup();
    if (!p) return;
    p.active = true; p.x = x; p.y = y; p.value = value;
  }

  private gainXp(v: number): void {
    this.xp += v * this.knowledgeMul();
    this.knowledge += v;
    sfx.pickup();
    while (this.xp >= this.xpNext) {
      this.xp -= this.xpNext;
      this.level++;
      this.xpNext = xpForLevel(this.level);
      this.pendingLevels++;
    }
    if (this.pendingLevels > 0 && !this.draftOpen && !this.over) this.openDraft();
  }

  // ---------- Fixed-step simulation ----------
  private simulate(dt: number): void {
    this.elapsed += dt; this.ageElapsed += dt;
    this.queryCount = 0;

    // --- input → velocity ---
    let ix = 0; let iy = 0;
    if (this.keys.A?.isDown || this.keys.LEFT?.isDown) ix -= 1;
    if (this.keys.D?.isDown || this.keys.RIGHT?.isDown) ix += 1;
    if (this.keys.W?.isDown || this.keys.UP?.isDown) iy -= 1;
    if (this.keys.S?.isDown || this.keys.DOWN?.isDown) iy += 1;
    const il = Math.hypot(ix, iy) || 1;
    const dashing = this.dashT > 0;
    const sp = this.speed * (dashing ? 3.1 : 1);
    this.vx = (ix / il) * sp; this.vy = (iy / il) * sp;
    if (ix === 0 && iy === 0 && !dashing) { this.vx = 0; this.vy = 0; }
    this.px += this.vx * dt; this.py += this.vy * dt;

    // --- dash ---
    this.dashCd -= dt; this.dashT -= dt; this.iframe -= dt;
    if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE) && this.dashCd <= 0 && (ix !== 0 || iy !== 0)) {
      this.dashCd = 2.2; this.dashT = 0.18; this.iframe = Math.max(this.iframe, 0.35);
      sfx.dash();
    }
    if (this.regen > 0) this.hp = Math.min(this.maxHp, this.hp + this.regen * dt);

    // --- age progression ---
    const next = this.ageIndex + 1;
    if (next < AGES.length) {
      const def = AGE_DEFS[next] as { minTimeSec: number; knowledgeThreshold: number };
      const need = OBJECTIVE_KILLS[next] ?? 0;
      const objectiveDone = this.ageKills >= need;
      if (canAdvanceAge(next, this.elapsed, this.ageElapsed, this.knowledge, objectiveDone)) {
        void def;
        this.ageIndex = next;
        this.ageElapsed = 0; this.ageKills = 0;
        this.weaponT = {
          kinetic: Math.max(this.weaponT.kinetic, this.ageIndex),
          energy: Math.max(this.weaponT.energy, this.ageIndex),
          defense: Math.max(this.weaponT.defense, this.ageIndex),
          field: Math.max(this.weaponT.field, this.ageIndex),
        };
        this.hp = Math.min(this.maxHp, this.hp + this.maxHp * 0.3);
        const ageId = AGES[this.ageIndex] as AgeId;
        sfx.age();
        toast("ui.ageReached", t(`age.${ageId}` as never));
        this.refreshGround(true);
        for (let i = 0; i < 3; i++) this.spawnEnemy("chaser", true, false, this.rng.nextFloat() * Math.PI * 2, 700);
        if (this.cameras.main && loadSave(localStorage).settings.shake) this.cameras.main.shake(250, 0.008);
      }
    }

    this.director(dt);
    this.rebuildSpatial();

    // --- weapons ---
    this.updateWeapons(dt);

    // --- enemies ---
    for (const e of this.enemies) {
      if (!e.active) continue;
      if (e.flash > 0) e.flash -= dt;
      const dx = this.px - e.x; const dy = this.py - e.y;
      const d = Math.max(1, Math.hypot(dx, dy));
      if (e.family === "ranged") {
        if (d > 420) { e.x += (dx / d) * e.speed * dt; e.y += (dy / d) * e.speed * dt; }
        else if (d < 280) { e.x -= (dx / d) * e.speed * dt; e.y -= (dy / d) * e.speed * dt; }
        e.shootT -= dt;
        if (e.shootT <= 0 && d < 640) {
          e.shootT = 2.2;
          this.fireProjectile(e.x, e.y, this.px, this.py, 260, e.dmg, 0xff5a5a, "enemy", false, 6);
        }
      } else {
        const slow = e.affix === "armored" ? 0.85 : 1;
        e.x += (dx / d) * e.speed * slow * dt;
        e.y += (dy / d) * e.speed * slow * dt;
      }
      // Touch damage.
      if (d < e.radius + 14 && this.iframe <= 0) {
        const mit = e.affix === "armored" ? 0.7 : 1;
        this.hp -= e.dmg * mit;
        this.iframe = 0.6;
        sfx.hurt();
        if (this.hp <= 0) { this.hp = 0; this.die(); return; }
      }
    }

    // --- projectiles ---
    for (const p of this.projs) {
      if (!p.active) continue;
      p.life -= dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.life <= 0 || Math.abs(p.x - this.px) > 1400 || Math.abs(p.y - this.py) > 1400) { p.active = false; continue; }
      if (p.friendly) {
        const hit = this.enemiesInRadius(p.x, p.y, p.radius + 6, GameScene.scratch);
        if (hit.length) {
          const e = hit[0] as Enemy;
          const kb = 14;
          const d = Math.max(1, Math.hypot(e.x - p.x, e.y - p.y));
          this.hurtEnemy(e, p.dmg, p.src, ((e.x - p.x) / d) * kb, ((e.y - p.y) / d) * kb);
          p.active = false;
          sfx.hit();
        }
      } else {
        if (Math.hypot(p.x - this.px, p.y - this.py) < p.radius + 14 && this.iframe <= 0) {
          this.hp -= p.dmg;
          this.iframe = 0.6;
          p.active = false;
          sfx.hurt();
          if (this.hp <= 0) { this.hp = 0; this.die(); return; }
        }
      }
    }

    // --- mines ---
    this.mineT -= dt;
    const mineCount = 1 + this.bonusMines;
    if (this.mineT <= 0) {
      this.mineT = 1.2;
      let placed = 0;
      for (const m of this.mines) {
        if (placed >= mineCount) break;
        if (!m.active) {
          const st = getWeaponStage("field", this.weaponT.field);
          m.active = true;
          m.x = this.px + (this.rng.nextFloat() - 0.5) * 300;
          m.y = this.py + (this.rng.nextFloat() - 0.5) * 300;
          m.dmg = st.damage * this.damageMul; m.radius = st.radius; m.life = 12;
          placed++;
        }
      }
    }
    for (const m of this.mines) {
      if (!m.active) continue;
      m.life -= dt;
      if (m.life <= 0) { m.active = false; continue; }
      const hit = this.enemiesInRadius(m.x, m.y, m.radius, GameScene.scratch);
      if (hit.length) {
        m.active = false;
        for (const e of hit.slice(0, 12)) this.hurtEnemy(e, m.dmg, "field");
        sfx.kill();
      }
    }

    // --- pickups (magnet + collect) ---
    for (const k of this.pickups) {
      if (!k.active) continue;
      const d = Math.hypot(k.x - this.px, k.y - this.py);
      if (d < 240) {
        const pull = d < this.pickupR ? 700 : 260;
        k.x += ((this.px - k.x) / Math.max(1, d)) * pull * dt;
        k.y += ((this.py - k.y) / Math.max(1, d)) * pull * dt;
      }
      if (d < 22) { k.active = false; this.gainXp(k.value); }
    }

    // --- POI discovery ---
    const { cx, cy } = worldToChunk(this.px, this.py);
    const key = `${cx},${cy}`;
    if (!this.chunksVisited.has(key)) {
      this.chunksVisited.add(key);
      if (this.chunksVisited.size % 8 === 0) this.refreshGround(false);
    }
    for (let ox = -1; ox <= 1; ox++) {
      for (let oy = -1; oy <= 1; oy++) {
        const desc = getChunkDescriptor(this.worldSeed, cx + ox, cy + oy);
        for (const poi of desc.poi) {
          if (this.poisFound.has(poi.id)) continue;
          if (Math.hypot(poi.wx - this.px, poi.wy - this.py) < 70) {
            this.poisFound.add(poi.id);
            const info = poiTypeFor(poi.type);
            const bonus = Math.floor(info.knowledge * this.knowledgeMul());
            this.gainXp(bonus);
            toast("ui.poiFound", poi.seedNote, `+${bonus} ${t("ui.knowledge")}`);
            sfx.age();
          }
        }
      }
    }
  }

  private static scratch: Enemy[] = [];

  private updateWeapons(dt: number): void {
    const dmgM = this.damageMul;
    const cdM = Math.max(0.3, this.cooldownMul);
    // Kinetic: projectiles at nearest.
    {
      const st = getWeaponStage("kinetic", this.weaponT.kinetic);
      this.cdTick("kinetic", st.cooldown * cdM, dt, () => {
        const n = st.count + this.bonusProjectiles;
        for (let i = 0; i < n; i++) {
          const tgt = this.nearestEnemy(this.px, this.py, 700);
          if (!tgt) return;
          const spread = (i - (n - 1) / 2) * 0.12;
          const dx = tgt.x - this.px; const dy = tgt.y - this.py;
          const base = Math.atan2(dy, dx) + spread;
          const p = this.allocProj();
          if (!p) return;
          p.active = true; p.x = this.px; p.y = this.py;
          p.vx = Math.cos(base) * st.speed; p.vy = Math.sin(base) * st.speed;
          p.dmg = st.damage * dmgM; p.radius = st.radius; p.life = 1.6;
          p.friendly = true; p.color = st.color; p.src = "kinetic";
        }
      });
    }
    // Energy: projectile or aura/beam by stage archetype.
    {
      const st = getWeaponStage("energy", this.weaponT.energy);
      if (st.archetype === "aura" || this.bonusAura > 0) {
        this.auraT -= dt;
        if (this.auraT <= 0) {
          this.auraT = 0.5;
          const r = st.radius + this.bonusAura * 30;
          const hit = this.enemiesInRadius(this.px, this.py, r, GameScene.scratch);
          for (const e of hit.slice(0, 30)) this.hurtEnemy(e, (st.archetype === "aura" ? st.damage : 10) * dmgM, "energy");
        }
      } else if (st.archetype === "beam" || this.beamUnlocked) {
        this.cdTick("energy", st.cooldown * cdM, dt, () => {
          const tgt = this.nearestEnemy(this.px, this.py, 800);
          if (!tgt) return;
          const hit = this.enemiesInRadius(tgt.x, tgt.y, 60 + st.radius * 0.3, GameScene.scratch);
          for (const e of hit.slice(0, 10)) this.hurtEnemy(e, st.damage * dmgM, "energy");
          this.beamFlash = { x2: tgt.x, y2: tgt.y, t: 0.12 };
        });
      } else {
        this.cdTick("energy", st.cooldown * cdM, dt, () => {
          const tgt = this.nearestEnemy(this.px, this.py, 640);
          if (!tgt) return;
          this.fireProjectile(this.px, this.py, tgt.x, tgt.y, st.speed || 380, st.damage * dmgM, st.color, "energy", true, st.radius * 0.8);
        });
      }
    }
    // Defense: guardians orbit + autofire.
    {
      const st = getWeaponStage("defense", this.weaponT.defense);
      const guardians = st.count + this.bonusGuardians;
      this.guardianAng = (this.guardianAng ?? 0) + dt * 2.6;
      this.guardians = guardians;
      this.cdTick("defense", st.cooldown * cdM * 1.6, dt, () => {
        for (let i = 0; i < Math.min(guardians, 6); i++) {
          const a = (this.guardianAng ?? 0) + (i * Math.PI * 2) / Math.max(1, guardians);
          const gx = this.px + Math.cos(a) * 80;
          const gy = this.py + Math.sin(a) * 80;
          const tgt = this.nearestEnemy(gx, gy, 520);
          if (tgt) this.fireProjectile(gx, gy, tgt.x, tgt.y, 420, st.damage * dmgM, st.color, "defense", true, 6);
        }
      });
    }
    // Field: orbit blades at high tiers.
    if (this.weaponT.field >= 4 || this.bonusOrbit > 0) {
      const st = getWeaponStage("field", this.weaponT.field);
      this.orbitAng = (this.orbitAng ?? 0) + dt * 2.0;
      const blades = 2 + this.bonusOrbit;
      for (let i = 0; i < blades; i++) {
        const a = (this.orbitAng ?? 0) + (i * Math.PI * 2) / blades;
        const bx = this.px + Math.cos(a) * (st.radius || 110);
        const by = this.py + Math.sin(a) * (st.radius || 110);
        const hit = this.enemiesInRadius(bx, by, 30, GameScene.scratch);
        for (const e of hit.slice(0, 4)) {
          e.hitCd -= dt;
          if (e.hitCd <= 0) { e.hitCd = 0.35; this.hurtEnemy(e, st.damage * dmgM * 0.4, "field"); }
        }
      }
    }
  }

  private beamFlash: { x2: number; y2: number; t: number } | null = null;
  private guardianAng = 0; private guardians = 1; private orbitAng = 0;
  private cds: Partial<Record<WeaponFamily, number>> = {};

  private cdTick(fam: WeaponFamily, cd: number, dt: number, fire: () => void): void {
    const left = (this.cds[fam] ?? 0) - dt;
    if (left <= 0) { this.cds[fam] = cd; fire(); }
    else this.cds[fam] = left;
  }

  // ---------- Ground rendering (chunk descriptors → shapes) ----------
  private refreshGround(_full: boolean): void {
    const g = this.ground;
    if (!g) return;
    g.clear();
    const W = this.scale.width; const H = this.scale.height;
    const { cx, cy } = worldToChunk(this.px, this.py);
    this.lastChunk = `${cx},${cy}`;
    const R = 3;
    const ageId = AGES[this.ageIndex] as AgeId;
    const civ = CIV_LAYER[ageId];
    for (let ox = -R; ox <= R; ox++) {
      for (let oy = -R; oy <= R; oy++) {
        const desc = getChunkDescriptor(this.worldSeed, cx + ox, cy + oy);
        const style = BIOME_STYLE[desc.biome];
        const sx = (cx + ox) * CHUNK_SIZE - this.px + W / 2;
        const sy = (cy + oy) * CHUNK_SIZE - this.py + H / 2;
        g.fillStyle(style.ground, 1);
        g.fillRect(sx, sy, CHUNK_SIZE, CHUNK_SIZE);
        g.fillStyle(style.groundAlt, 1);
        const hatch = deriveUint32(this.worldSeed, `hatch:${desc.x},${desc.y}`) % 4;
        for (let i = 0; i < 4; i++) {
          g.fillRect(sx + ((hatch * 130 + i * 170) % CHUNK_SIZE), sy + ((i * 190 + hatch * 70) % CHUNK_SIZE), 46, 46);
        }
        // Civ decor: seeded dots/shapes density grows with age.
        const du = deriveUint32(this.worldSeed, `civ:${desc.x},${desc.y}`);
        g.fillStyle(civ.color, 0.85);
        for (let i = 0; i < civ.density * 2; i++) {
          const hx = (du + i * 137) % CHUNK_SIZE;
          const hy = (du * 3 + i * 251) % CHUNK_SIZE;
          if (this.ageIndex <= 1) g.fillCircle(sx + hx, sy + hy, 3);
          else if (this.ageIndex <= 3) g.fillRect(sx + hx, sy + hy, 7, 7);
          else g.fillTriangle(sx + hx, sy + hy, sx + hx + 9, sy + hy, sx + hx + 4, sy + hy - 10);
        }
        // POIs: diamond markers.
        for (const poi of desc.poi) {
          const psx = poi.wx - this.px + W / 2;
          const psy = poi.wy - this.py + H / 2;
          const found = this.poisFound.has(poi.id);
          g.lineStyle(2, found ? 0x555555 : 0xffd166, 1);
          g.strokeCircle(psx, psy, 16);
          g.fillStyle(found ? 0x555555 : 0xffd166, 1);
          g.fillCircle(psx, psy, 5);
        }
      }
    }
  }

  // ---------- Frame ----------
  update(_time: number, deltaMs: number): void {
    const dt = deltaMs / 1000;
    this.fpsEMA += (1 / Math.max(dt, 1e-4) - this.fpsEMA) * 0.05;

    if (!this.paused && !this.over && !this.draftOpen) {
      const t0 = performance.now();
      const steps = this.acc.steps(dt);
      for (let i = 0; i < steps; i++) {
        this.simulate(SIM_DT);
        if (this.over) break;
      }
      this.simMs += (performance.now() - t0 - this.simMs) * 0.1;
    }

    // Space dash shortcut already handled; camera shake only if enabled.
    this.drawFrame(dt);

    this.hudT -= dt;
    if (this.hudT <= 0) { this.hudT = 0.15; this.refreshHUD(); }

    this.groundT -= dt;
    if (this.groundT <= 0) { this.groundT = 0.25; this.refreshGround(false); }

    if (this.showDebug) {
      const { cx, cy } = worldToChunk(this.px, this.py);
      let activeE = 0; for (const e of this.enemies) if (e.active) activeE++;
      let activeP = 0; for (const p of this.projs) if (p.active) activeP++;
      let activeK = 0; for (const k of this.pickups) if (k.active) activeK++;
      const budget = threatBudget(this.elapsed, this.ageIndex, this.ascension, 1);
      this.debugText.setText(
        `FPS ${this.fpsEMA.toFixed(0)}  sim ${this.simMs.toFixed(2)}ms\n` +
        `enemies ${activeE}  proj ${activeP}  pickups ${activeK}  queries ${this.queryCount}\n` +
        `buckets ${this.spatial.size}  chunk ${cx},${cy}  pools E${activeE}/${MAX_ENEMIES} P${activeP}/${MAX_PROJ}\n` +
        `seed ${this.masterSeed}  wv${WORLDGEN_VERSION}  age ${AGES[this.ageIndex]}  budget ${budget.toFixed(1)}  asc ${this.ascension}`,
      );
    }
    // Keep debug text pinned top-left under HUD.
    this.debugText.setPosition(10, 110);
  }

  private drawFrame(dt: number): void {
    const g = this.gfx;
    g.clear();
    const W = this.scale.width; const H = this.scale.height;
    const cx0 = W / 2; const cy0 = H / 2;
    const toSX = (wx: number): number => wx - this.px + cx0;
    const toSY = (wy: number): number => wy - this.py + cy0;

    // Pickups.
    for (const k of this.pickups) {
      if (!k.active) continue;
      const sx = toSX(k.x); const sy = toSY(k.y);
      if (sx < -20 || sy < -20 || sx > W + 20 || sy > H + 20) continue;
      g.fillStyle(0x53e0c8, 1);
      g.fillCircle(sx, sy, 4 + Math.min(3, k.value * 0.3));
    }
    // Mines.
    for (const m of this.mines) {
      if (!m.active) continue;
      const sx = toSX(m.x); const sy = toSY(m.y);
      if (sx < -40 || sy < -40 || sx > W + 40 || sy > H + 40) continue;
      g.lineStyle(1, 0xc9b458, 0.8);
      g.strokeCircle(sx, sy, 8);
    }
    // Enemies.
    for (const e of this.enemies) {
      if (!e.active) continue;
      const sx = toSX(e.x); const sy = toSY(e.y);
      if (sx < -60 || sy < -60 || sx > W + 60 || sy > H + 60) continue;
      const ageId = AGES[this.ageIndex] as AgeId;
      const base = ENEMY_LINEAGE[e.family].color[ageId];
      const col = e.flash > 0 ? 0xffffff : base;
      g.fillStyle(col, 1);
      g.fillCircle(sx, sy, e.radius);
      if (e.elite || e.boss) {
        g.lineStyle(e.boss ? 4 : 2, e.boss ? 0xff2222 : 0xffd166, 1);
        g.strokeCircle(sx, sy, e.radius + 4);
      }
      if (e.boss || e.elite) {
        const w = e.radius * 2;
        g.fillStyle(0x330000, 1);
        g.fillRect(sx - w / 2, sy - e.radius - 12, w, 5);
        g.fillStyle(0xff3333, 1);
        g.fillRect(sx - w / 2, sy - e.radius - 12, (w * Math.max(0, e.hp / e.maxHp)), 5);
      }
    }
    // Projectiles.
    for (const p of this.projs) {
      if (!p.active) continue;
      const sx = toSX(p.x); const sy = toSY(p.y);
      if (sx < -20 || sy < -20 || sx > W + 20 || sy > H + 20) continue;
      g.fillStyle(p.color, 1);
      g.fillCircle(sx, sy, p.radius);
    }
    // Aura + guardians + orbit blades.
    const est = getWeaponStage("energy", this.weaponT.energy);
    if (est.archetype === "aura" || this.bonusAura > 0) {
      g.lineStyle(2, 0xffb03c, 0.35);
      g.strokeCircle(cx0, cy0, est.radius + this.bonusAura * 30);
    }
    const fst = getWeaponStage("field", this.weaponT.field);
    if (this.weaponT.field >= 4 || this.bonusOrbit > 0) {
      g.fillStyle(0xb48cff, 1);
      const blades = 2 + this.bonusOrbit;
      for (let i = 0; i < blades; i++) {
        const a = this.orbitAng + (i * Math.PI * 2) / blades;
        g.fillCircle(cx0 + Math.cos(a) * (fst.radius || 110), cy0 + Math.sin(a) * (fst.radius || 110), 8);
      }
    }
    if (this.guardians > 0) {
      const dst = getWeaponStage("defense", this.weaponT.defense);
      g.fillStyle(dst.color, 1);
      for (let i = 0; i < Math.min(this.guardians, 8); i++) {
        const a = this.guardianAng + (i * Math.PI * 2) / Math.max(1, this.guardians);
        g.fillCircle(cx0 + Math.cos(a) * 80, cy0 + Math.sin(a) * 80, 7);
      }
    }
    // Beam flash.
    if (this.beamFlash) {
      this.beamFlash.t -= dt;
      g.lineStyle(6, 0xfff07f, 0.9);
      g.lineBetween(cx0, cy0, toSX(this.beamFlash.x2), toSY(this.beamFlash.y2));
      if (this.beamFlash.t <= 0) this.beamFlash = null;
    }
    // Player.
    this.playerArc.setPosition(cx0, cy0);
    this.playerArc.setFillStyle(this.iframe > 0 ? 0x9fd8ff : 0xffd166);
    void dwellFor;
  }
}
