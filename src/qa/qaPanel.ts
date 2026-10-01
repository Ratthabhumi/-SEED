// QA session glue — BROWSER-ONLY (DOM/window/performance). Never imported by
// src/core. Observes the adapter read-only: no XP, no kills, no teleports,
// no balance changes. Dormant unless the scene creates it in ?qa=1 mode.
import {
  PlaytestRecorder,
  type QaCtx,
  type QaEnvironment,
  type QaVersions,
} from "./PlaytestRecorder";
import { renderMarkdown, renderJSON } from "./PlaytestReport";
import { collectRects, analyzeRects, OVERFLOW_SELECTORS } from "./VisualChecks";
import { GOLDEN_QA_SEED } from "./qaMode";
// Note: GOLDEN_QA_SEED is only the DEFAULT session seed (?qa=1 with no
// &seed=). The recorder is retargeted to the actual session seed in start().
import { t } from "../i18n/i18n";
import type { EnKeys } from "../i18n/en";

export interface QaObjective {
  killsHave: number;
  killsNeed: number;
  knowHave: number;
  knowNeed: number;
  elapsedHave: number;
  elapsedNeed: number;
}

export interface QaPOIInfo {
  dx: number;
  dy: number;
  dist: number;
  poiType: string;
  found: boolean;
}

export interface QaFrameData {
  simTime: number;
  runElapsed: number;
  age: string;
  ageIndex: number;
  ascension: number;
  masterSeed: string;
  worldSeed: string;
  px: number;
  py: number;
  over: boolean;
  draftOpen: boolean;
  enemies: number;
  projs: number;
  pickups: number;
  mines: number;
  enemyCap: number;
  projCap: number;
  pickupCap: number;
  bossSpawned: boolean;
  bossIndex: number;
  bossActive: boolean;
  bossKills: number;
  ascendReady: boolean;
  runKills: number;
  runHighestAge: string;
  level: number;
  owned: string[];
  // Engagement contract state (Phase 16 auto-record).
  originId: string;
  activeFamilies: string[];
  breakthroughs: string[];
  legacies: string[];
  poiClaims: string[];
  knowledgeTotal: number;
  weaponStages: string;
  techsTaken: number;
  fps: number;
  frameMs: number;
  simMsAvg: number;
  queries: number;
  buckets: number;
  chunkHits: number;
  chunkMisses: number;
  chunkCx: number;
  chunkCy: number;
  biome: string;
  objective: QaObjective | null;
  nearestPOI: QaPOIInfo | null;
  buildSummary: string;
}

export interface QaAdapter {
  frame(): QaFrameData;
  snapshot(): string;
  lang(): string;
  versions(): QaVersions;
  ageOrder(): readonly string[];
}

/**
 * Unambiguous feedback events (ADR-0006 Phase 2). Each press means exactly
 * what its category + label say — no mixed positive/negative phrasing.
 * Labels stay authored Thai (QA dev-tool surface); chrome is localized.
 */
const FEEDBACK_GROUPS: Array<{ cat: EnKeys; key: string; labels: string[] }> = [
  { cat: "qa.catRead", key: "read", labels: ["ภาพอ่านยาก", "หลงทาง / ไม่รู้ไปไหน", "ศัตรูแยกยาก", "กระสุนแยกยาก", "ไทยอ่านยาก"] },
  { cat: "qa.catFeel", key: "feel", labels: ["น่าเบื่อ", "จังหวะขาด", "upgrade ไม่รู้สึกแรง", "reward ไม่รู้สึกคุ้ม"] },
  { cat: "qa.catBalance", key: "balance", labels: ["ยากเกิน", "ง่ายเกิน"] },
  { cat: "qa.catPositive", key: "positive", labels: ["อ่านสนามง่าย", "build เริ่มชัด", "upgrade นี้สนุก", "อยากเล่นต่อ"] },
];

const RATING_QUESTIONS: EnKeys[] = [
  "qa.rateCombat", "qa.rateBuild", "qa.rateDecision", "qa.rateReward", "qa.rateDesire",
];

function download(filename: string, text: string, mime: string): void {
  try {
    const blob = new Blob([text], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 2000);
  } catch {
    // QA must never break gameplay.
  }
}

export class QaSession {
  recorder: PlaytestRecorder;
  lastFrame: QaFrameData | null = null;
  private wallStart = 0;
  private tickCount = 0;
  private panel: HTMLElement | null = null;
  private listBox: HTMLElement | null = null;
  private ended = false;
  private disposed = false;
  /** Compact by default during gameplay; recording never depends on it. */
  private collapsed = true;
  // Transition memory (previous tick).
  private prevAgeIndex = 0;
  private prevAscension = 0;
  private prevBossSpawned = false;
  private prevBossKills = 0;
  private prevDraftOpen = false;
  private prevOver = false;
  private prevAscendReady = false;
  private seenBossActive = false;
  private seedFailLogged = false;
  private draftFailOpen = false;
  private postAscWall = 0;
  private postAscSim = 0;
  private post30Done = false;
  private post60Done = false;
  private post120Done = false;
  private persistedTerminal = false;
  private errorPersisted = false;
  private lastAutosave = 0;
  private origError: typeof console.error | null = null;
  private origWarn: typeof console.warn | null = null;
  private onWinError: ((e: ErrorEvent) => void) | null = null;
  private onUnhandled: ((e: PromiseRejectionEvent) => void) | null = null;
  private refreshSamples: number[] = [];
  readonly sessionId: string;
  private reportSequence = 0;

  constructor(private readonly adapter: QaAdapter, sessionId?: string) {
    this.wallStart = performance.now();
    this.sessionId = sessionId || `qa-${Math.floor(this.wallStart)}-${Math.random().toString(36).slice(2, 8)}`;
    // Placeholder seed: ?qa=1 defaults to the golden seed, but start()
    // retargets the recorder to the ACTUAL session seed (?qa=1&seed=X truth).
    this.recorder = new PlaytestRecorder(
      GOLDEN_QA_SEED,
      adapter.versions(),
      this.wallStart,
      adapter.ageOrder(),
      this.sessionId,
    );
  }

  private wallNow(): number {
    return (performance.now() - this.wallStart) / 1000;
  }

  private ctx(f: QaFrameData): QaCtx {
    return { simTime: f.simTime, wallTime: this.wallNow(), age: f.age, ascension: f.ascension };
  }

  /** Engagement identity snapshot from the current frame (bounded upstream). */
  private recordEngagement(f: QaFrameData, ctx: QaCtx): void {
    this.recorder.recordEngagement({
      origin: f.originId,
      families: [...f.activeFamilies].sort().join("+"),
      techs: f.techsTaken,
      breakthroughs: [...f.breakthroughs].sort(),
      legacies: [...f.legacies].sort(),
      poiClaims: [...f.poiClaims].sort(),
      knowledge: f.knowledgeTotal,
      level: f.level,
      weapons: f.weaponStages,
    }, ctx);
  }

  /** Adapter hook: record ordered sim decisions (tech picks, beats, ...). */
  noteSimEvent(type: string, detail: string): void {
    const f = this.lastFrame ?? this.adapter.frame();
    this.recorder.simMark(type, detail, this.ctx(f));
  }

  /** Zero-friction auto-finalization: target-complete ends the session. */
  private maybeAutoFinalize(): void {
    if (this.disposed || this.ended) return;
    if (!this.recorder.isTargetComplete()) return;
    this.end("target-complete");
    this.persistReports("target-complete", true);
    this.showComplete();
  }

  start(): void {
    const f = this.adapter.frame();
    this.lastFrame = f;
    // A2: retarget to the ACTUAL session seed (?qa=1&seed=X truth).
    // ?qa=1 alone defaults to EPOCH-GOLDEN-001 via the title gate.
    this.wallStart = performance.now();
    this.recorder = new PlaytestRecorder(
      f.masterSeed,
      this.adapter.versions(),
      this.wallStart,
      this.adapter.ageOrder(),
      this.sessionId,
    );
    this.prevAgeIndex = f.ageIndex;
    this.prevAscension = f.ascension;
    this.prevBossKills = f.bossKills;
    const ctx = this.ctx(f);
    this.recorder.checkpoint("RUN_START", ctx);
    this.recorder.checkpoint("STONE_START", ctx);
    this.recordEngagement(f, ctx);
    this.recorder.perfSnapshot("run-start", ctx);
    // Session invariant: the seed must remain the SESSION seed (whatever it
    // was at start — golden by default, custom via ?qa=1&seed=X).
    const sessionSeed = this.recorder.seed;
    this.recorder.assert("seed", "Seed invariant", f.masterSeed === sessionSeed,
      f.masterSeed === sessionSeed ? `masterSeed=${f.masterSeed}` : `masterSeed changed to ${f.masterSeed} (session ${sessionSeed})`, ctx);
    if (f.masterSeed !== sessionSeed) this.seedFailLogged = true;
    this.captureEnvironment();
    this.attachConsole();
    this.buildPanel();
    this.scanOverflow();
  }

  // ------------------------------------------------------------ per-frame
  /** Called every RAF update; internally throttled (transitions ~4Hz, perf 2Hz, panel 1Hz). */
  tick(): void {
    if (this.disposed || this.ended) return;
    let f: QaFrameData;
    try {
      f = this.adapter.frame();
    } catch {
      return;
    }
    const prev = this.lastFrame;
    this.lastFrame = f;
    this.tickCount++;
    const n = this.tickCount;
    if (n % 15 === 0) this.checkTransitions(f, prev);
    if (n % 30 === 0) this.samplePerf(f);
    if (n % 300 === 0) this.scanOverflow();
    if (n % 60 === 0) this.refreshPanel();
    this.maybeAutoFinalize();
  }

  private checkTransitions(f: QaFrameData, prev: QaFrameData | null): void {
    const ctx = this.ctx(f);
    // Seed invariant (FAIL once): stability of the SESSION seed.
    if (!this.seedFailLogged && f.masterSeed !== this.recorder.seed) {
      this.seedFailLogged = true;
      this.recorder.assert("seed", "Seed invariant", false, `masterSeed changed to ${f.masterSeed} (session ${this.recorder.seed})`, ctx);
    }
    // Draft lifecycle invariant (FAIL once per stuck-open episode).
    const surfaces = document.querySelectorAll("#draft-screen").length;
    if (f.draftOpen && surfaces !== 1) {
      if (!this.draftFailOpen) {
        this.draftFailOpen = true;
        this.recorder.assert("draft", "Draft lifecycle", false, `draftOpen=true but surfaces=${surfaces}`, ctx);
      }
    } else if (!f.draftOpen && surfaces !== 0) {
      if (!this.draftFailOpen) {
        this.draftFailOpen = true;
        this.recorder.assert("draft", "Draft lifecycle", false, `draftOpen=false but surfaces=${surfaces}`, ctx);
      }
    } else if (this.draftFailOpen && ((f.draftOpen && surfaces === 1) || (!f.draftOpen && surfaces === 0))) {
      this.draftFailOpen = false;
      this.recorder.assert("draft", "Draft lifecycle", true, "surface count recovered", ctx);
    }
    if (f.draftOpen !== this.prevDraftOpen) this.prevDraftOpen = f.draftOpen;
    // Age transitions (monotonic +1, or reset to stone on ascension).
    if (f.ageIndex !== this.prevAgeIndex || f.ascension !== this.prevAscension) {
      const order = this.adapter.ageOrder();
      if (f.ascension === this.prevAscension) {
        if (f.ageIndex === this.prevAgeIndex + 1) {
          const ageUpper = order[f.ageIndex] ?? f.age;
          const map: Record<string, "BRONZE_REACHED" | "IRON_REACHED" | "INDUSTRIAL_REACHED" | "ATOMIC_REACHED" | "SPACE_REACHED"> = {
            bronze: "BRONZE_REACHED", iron: "IRON_REACHED", industrial: "INDUSTRIAL_REACHED",
            atomic: "ATOMIC_REACHED", space: "SPACE_REACHED",
          };
          const cp = map[ageUpper];
          if (cp && this.recorder.checkpoint(cp, ctx)) this.recorder.perfSnapshot(ageUpper, ctx);
          this.recorder.recordAgeKnowledge(ageUpper, f.knowledgeTotal, ctx);
          this.recordEngagement(f, ctx);
          this.recorder.assert("age", "Age progression", true, `${order[this.prevAgeIndex] ?? "?"} → ${ageUpper}`, ctx);
        } else {
          this.recorder.assert("age", "Age progression", false,
            `unexpected jump ${this.prevAgeIndex} → ${f.ageIndex} (asc ${f.ascension})`, ctx);
        }
      } else if (f.ascension === this.prevAscension + 1) {
        // Ascension: child-world contract.
        const base = prev;
        const orderIdx = (a: string): number => Math.max(0, order.indexOf(a));
        const okSeed = f.masterSeed === this.recorder.seed;
        const okWorld = base !== null && f.worldSeed !== base.worldSeed;
        const okTime = base !== null && f.runElapsed >= base.runElapsed;
        const okKills = base !== null && f.runKills >= base.runKills;
        const okAge = base !== null && orderIdx(f.runHighestAge) >= orderIdx(base.runHighestAge);
        const pass = okSeed && okWorld && okTime && okKills && okAge;
        this.recorder.assert("ascension", "Ascension contract", pass,
          `seed:${okSeed} worldChanged:${okWorld} time:${okTime} kills:${okKills} age:${okAge}`, ctx);
        this.recorder.checkpoint("ASCENSION_STARTED", ctx);
        this.recordEngagement(f, ctx);
        this.recorder.checkpoint("CHILD_WORLD_STARTED", ctx, {
          weapons: f.weaponStages,
          origin: f.originId,
          legacies: f.legacies.join("+") || "-",
          knowledge: f.knowledgeTotal,
        });
        this.recorder.perfSnapshot("post-ascension", ctx);
        this.postAscWall = this.wallNow();
        this.postAscSim = f.simTime;
        this.post30Done = false;
        this.post60Done = false;
        this.post120Done = false;
        this.prevAscension = f.ascension;
      } else {
        this.recorder.assert("ascension", "Ascension contract", false,
          `unexpected ascension jump ${this.prevAscension} → ${f.ascension}`, ctx);
        this.prevAscension = f.ascension;
      }
      this.prevAgeIndex = f.ageIndex;
    }
    // Boss lifecycle.
    if (f.bossSpawned && !this.prevBossSpawned) {
      this.prevBossSpawned = true;
      this.prevBossKills = f.bossKills;
      if (this.recorder.checkpoint("BOSS_SPAWNED", ctx)) this.recorder.perfSnapshot("boss-spawn", ctx);
    }
    if (f.bossActive) this.seenBossActive = true;
    if (f.bossKills > this.prevBossKills) {
      this.prevBossKills = f.bossKills;
      if (this.recorder.checkpoint("BOSS_KILLED", ctx)) this.recorder.perfSnapshot("boss-fight", ctx);
      this.recordEngagement(f, ctx);
    }
    if (this.seenBossActive && f.bossSpawned && f.bossIndex === -1 && f.bossKills === this.prevBossKills && !f.ascendReady) {
      this.recorder.assert("boss", "Boss entity integrity", false, "boss was active but vanished without a kill", ctx);
      this.seenBossActive = false; // log once per episode
    }
    // Ascension offer.
    if (f.ascendReady && !this.prevAscendReady) {
      this.prevAscendReady = true;
      this.recorder.checkpoint("ASCENSION_OFFERED", ctx);
    } else if (!f.ascendReady && this.prevAscendReady && f.ascension === this.prevAscension) {
      this.prevAscendReady = false;
    }
    // Post-ascension +30/+60/+120s perf snapshots (120s = engagement target).
    if (this.postAscWall > 0) {
      if (!this.post30Done && (this.wallNow() - this.postAscWall >= 30 || f.simTime - this.postAscSim >= 30)) {
        this.post30Done = true;
        this.samplePerf(f);
        this.recorder.checkpoint("POST_ASCENSION_30S", ctx);
        this.recorder.perfSnapshot("post-ascension+30s", ctx);
      }
      if (!this.post60Done && (this.wallNow() - this.postAscWall >= 60 || f.simTime - this.postAscSim >= 60)) {
        this.post60Done = true;
        this.samplePerf(f);
        this.recorder.checkpoint("POST_ASCENSION_60S", ctx);
        this.recorder.perfSnapshot("post-ascension+60s", ctx);
      }
      if (!this.post120Done && (this.wallNow() - this.postAscWall >= 120 || f.simTime - this.postAscSim >= 120)) {
        this.post120Done = true;
        this.samplePerf(f);
        this.recorder.checkpoint("POST_ASCENSION_120S", ctx);
        this.recorder.perfSnapshot("post-ascension+120s", ctx);
      }
    }
    // Death / run end.
    if (f.over && !this.prevOver) {
      this.prevOver = true;
      this.recorder.checkpoint("PLAYER_DIED", ctx);
      this.recorder.checkpoint("RUN_END", ctx);
      this.recordEngagement(f, ctx);
      this.recorder.perfSnapshot("run-end", ctx);
      this.end("player-died");
    }
    // Pool saturation (once per pool per ascension world).
    if (f.enemies >= f.enemyCap) this.recorder.poolSaturation("enemies", f.enemies, f.enemyCap, ctx);
    if (f.projs >= f.projCap) this.recorder.poolSaturation("projectiles", f.projs, f.projCap, ctx);
    if (f.pickups >= f.pickupCap) this.recorder.poolSaturation("pickups", f.pickups, f.pickupCap, ctx);
    // Checkpoint autosave (throttled inside): evidence survives browser close.
    this.autosaveReports();
  }

  private samplePerf(f: QaFrameData): void {
    this.recorder.pushPerf({
      fps: f.fps,
      frameMs: f.frameMs,
      simMs: f.simMsAvg,
      enemies: f.enemies,
      projs: f.projs,
      pickups: f.pickups,
      mines: f.mines,
      enemyPoolUsed: f.enemies,
      projPoolUsed: f.projs,
      pickupPoolUsed: f.pickups,
      queries: f.queries,
      buckets: f.buckets,
      chunkHits: f.chunkHits,
      chunkMisses: f.chunkMisses,
    });
  }

  // ------------------------------------------------------------ language
  beforeLangSwitch(): string {
    try {
      return this.adapter.snapshot();
    } catch {
      return "";
    }
  }

  afterLangSwitch(before: string, from: string, to: string): void {
    const f = this.lastFrame;
    if (!f) return;
    let after = "";
    try {
      after = this.adapter.snapshot();
    } catch {
      after = "";
    }
    const unchanged = before !== "" && before === after;
    this.recorder.langSwitch(from, to, unchanged, this.ctx(f));
    this.scanOverflow();
    this.refreshPanel();
  }

  // ------------------------------------------------------------ console
  private attachConsole(): void {
    const rec = this.recorder;
    const ctxOf = (): QaCtx => {
      const f = this.lastFrame;
      return f
        ? this.ctx(f)
        : { simTime: 0, wallTime: this.wallNow(), age: "?", ascension: 0 };
    };
    this.onWinError = (e: ErrorEvent) => {
      rec.console("error", String(e.message || "window.onerror"), String((e.error as Error | undefined)?.stack || ""), ctxOf());
      if (!this.errorPersisted) {
        this.errorPersisted = true;
        this.persistReports("runtime-error", false);
      }
    };
    this.onUnhandled = (e: PromiseRejectionEvent) => {
      const r = e.reason as unknown;
      rec.console("error", `unhandledrejection: ${r instanceof Error ? r.message : String(r)}`,
        r instanceof Error ? String(r.stack || "") : "", ctxOf());
      if (!this.errorPersisted) {
        this.errorPersisted = true;
        this.persistReports("runtime-error", false);
      }
    };
    window.addEventListener("error", this.onWinError);
    window.addEventListener("unhandledrejection", this.onUnhandled);
    this.origError = console.error.bind(console);
    this.origWarn = console.warn.bind(console);
    const origE = this.origError;
    const origW = this.origWarn;
    console.error = (...args: unknown[]) => {
      origE(...args);
      try {
        rec.console("error", args.map(String).join(" ").slice(0, 500), "", ctxOf());
      } catch { /* never break gameplay */ }
    };
    console.warn = (...args: unknown[]) => {
      origW(...args);
      try {
        rec.console("warn", args.map(String).join(" ").slice(0, 500), "", ctxOf());
      } catch { /* never break gameplay */ }
    };
  }

  // ------------------------------------------------------------ environment
  private captureEnvironment(): void {
    const nav = window.navigator;
    let webgl = "unavailable automatically";
    try {
      const cv = document.createElement("canvas");
      const gl = cv.getContext("webgl") as WebGLRenderingContext | null;
      if (gl) {
        const ext = gl.getExtension("WEBGL_debug_renderer_info") as {
          UNMASKED_RENDERER_WEBGL: number;
        } | null;
        if (ext) {
          const r = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) as unknown;
          if (typeof r === "string" && r.length > 0) webgl = r.slice(0, 120);
          else webgl = "webgl-present";
        } else {
          webgl = "webgl-present";
        }
      }
    } catch { /* keep fallback */ }
    const dm = (nav as Navigator & { deviceMemory?: number }).deviceMemory;
    const env: QaEnvironment = {
      userAgent: nav.userAgent.slice(0, 300),
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      devicePixelRatio: window.devicePixelRatio || 1,
      screen: `${window.screen.width}x${window.screen.height}`,
      refreshHz: "measuring…",
      hardwareConcurrency: nav.hardwareConcurrency || 0,
      deviceMemory: typeof dm === "number" ? `${dm}GB` : "unavailable automatically",
      webgl,
    };
    this.recorder.setEnvironment(env);
    // Refresh-rate estimate: median of up to 120 rAF deltas, then patch env.
    const deltas: number[] = [];
    let last = 0;
    const step = (now: number): void => {
      if (this.disposed) return;
      if (last > 0) deltas.push(now - last);
      last = now;
      if (deltas.length < 120) {
        requestAnimationFrame(step);
      } else {
        const sorted = [...deltas].sort((a, b) => a - b);
        const med = sorted[Math.floor(sorted.length / 2)] ?? 0;
        const hz = med > 0 ? Math.round(1000 / med) : 0;
        const snap = this.recorder.snapshot();
        if (snap.environment) {
          this.recorder.setEnvironment({ ...snap.environment, refreshHz: hz > 0 ? `~${hz}Hz` : "unavailable automatically" });
        }
      }
    };
    requestAnimationFrame(step);
  }

  // ------------------------------------------------------------ overflow
  private scanOverflow(): void {
    const f = this.lastFrame;
    if (!f) return;
    try {
      const entries = collectRects(document, OVERFLOW_SELECTORS, this.adapter.lang());
      const vw = document.documentElement.clientWidth;
      const vh = document.documentElement.clientHeight;
      for (const hit of analyzeRects(entries, { w: vw, h: vh })) {
        this.recorder.overflow({
          selector: hit.selector,
          lang: hit.lang,
          viewport: hit.viewport,
          kind: hit.kind,
          overBy: hit.overBy,
          simTime: f.simTime,
          wallTime: this.wallNow(),
        });
      }
    } catch { /* never break gameplay */ }
  }

  // ------------------------------------------------------------ panel
  private buildPanel(): void {
    const root = document.getElementById("ui") ?? document.body;
    root.classList.add("has-qa");

    // Unobtrusive minimal indicator pill
    const indicator = document.createElement("div");
    indicator.id = "qa-rec-indicator";
    indicator.title = "QA Session Active — Click or press F10 to toggle Inspector";
    indicator.innerHTML = '<span class="qa-rec-dot"></span><span>REC ●</span>';
    indicator.addEventListener("click", () => this.toggleInspector());
    root.appendChild(indicator);

    const panel = document.createElement("div");
    panel.id = "qa-panel";
    panel.className = "qa-hidden"; // Default HIDDEN to avoid UX contamination
    root.appendChild(panel);
    this.panel = panel;
    this.refreshPanel();
  }

  public toggleInspector(): void {
    if (!this.panel) return;
    this.panel.classList.toggle("qa-hidden");
  }

  private routeRows(): string {
    const r = this.recorder;
    const has = (n: Parameters<PlaytestRecorder["hasCheckpoint"]>[0]): boolean => r.hasCheckpoint(n);
    const rows: Array<[string, boolean]> = [
      [`Seed ${this.recorder.seed}`, has("RUN_START")],
      ["Stone", has("STONE_START")],
      ["Bronze", has("BRONZE_REACHED")],
      ["Iron", has("IRON_REACHED")],
      ["Industrial", has("INDUSTRIAL_REACHED")],
      ["Atomic", has("ATOMIC_REACHED")],
      ["Space", has("SPACE_REACHED")],
      ["Boss", has("BOSS_KILLED")],
      ["Ascension", has("CHILD_WORLD_STARTED")],
      ["Post-Ascension 120s", this.post120Done],
    ];
    return rows.map(([label, done]) => `<div class="qa-row">${done ? "✓" : "○"} ${label}</div>`).join("");
  }

  private autoRows(): string {
    const r = this.recorder;
    const noFail = (id: string): string =>
      r.hasFail(id) ? "✗ FAIL" : r.snapshot().assertions.some((a) => a.id === id) ? "✓" : "○ pending";
    const errs = r.errorCount();
    const errTxt = errs > 0 ? `✗ ${errs} errors` : r.snapshot().consoleEntries.length > 0 ? "✓ warnings only" : "○ pending";
    const langSwitched = r.snapshot().langSwitches.length > 0;
    const langTxt = langSwitched
      ? (r.snapshot().langSwitches.every((s) => s.unchanged) ? "✓ invariant" : "✗ CHANGED")
      : "○ not switched yet";
    return `<div class="qa-row">Draft lifecycle: ${noFail("draft")}</div>` +
      `<div class="qa-row">Seed invariant: ${noFail("seed")}</div>` +
      `<div class="qa-row">JS errors: ${errTxt}</div>` +
      `<div class="qa-row">Boss integrity: ${noFail("boss")}</div>` +
      `<div class="qa-row">Ascension contract: ${noFail("ascension")}</div>` +
      `<div class="qa-row">EN/TH invariant: ${langTxt}</div>`;
  }

  private refreshPanel(): void {
    if (!this.panel || this.disposed) return;
    const f = this.lastFrame;
    const simT = f ? f.simTime.toFixed(0) : "?";
    const age = f ? f.age : "?";
    if (!this.panel.dataset.built) {
      this.panel.dataset.built = "1";
      this.panel.innerHTML = "";
      const mk = (tag: string, cls: string, text: string): HTMLElement => {
        const e = document.createElement(tag);
        e.className = cls;
        e.textContent = text;
        return e;
      };
      const head = document.createElement("div");
      head.className = "qa-head";
      head.appendChild(mk("span", "qa-title", "HUMAN GATE A — auto-recording"));
      const toggle = document.createElement("button");
      toggle.className = "btn qa-toggle";
      toggle.textContent = t(this.collapsed ? "qa.expand" : "qa.collapse");
      toggle.addEventListener("click", () => {
        this.collapsed = !this.collapsed;
        delete this.panel?.dataset.built;
        this.refreshPanel();
      });
      head.appendChild(toggle);
      this.panel.appendChild(head);
      this.panel.appendChild(mk("div", "qa-sub", "Seed EPOCH-GOLDEN-001 · Stone → Space → Boss → Ascension · แค่เล่น ที่เหลือระบบจดให้"));
      if (this.collapsed) {
        const line = document.createElement("div");
        line.className = "qa-list";
        this.listBox = line;
        this.panel.appendChild(line);
        const btnRow = document.createElement("div");
        btnRow.className = "qa-btn-row";
        const end = document.createElement("button");
        end.className = "btn";
        end.textContent = "END PLAYTEST";
        end.addEventListener("click", () => this.end("human-ended"));
        btnRow.appendChild(end);
        this.panel.appendChild(btnRow);
        const dl = document.createElement("div");
        dl.id = "qa-downloads";
        dl.className = "qa-dl";
        this.panel.appendChild(dl);
      } else {
        const list = document.createElement("div");
        list.className = "qa-list";
        this.panel.appendChild(list);
        this.listBox = list;
        const fbTitle = mk("div", "qa-title2", "บอกความรู้สึก (กดได้เลย ไม่ต้องพิมพ์)");
        this.panel.appendChild(fbTitle);
        for (const group of FEEDBACK_GROUPS) {
          this.panel.appendChild(mk("div", "qa-cat", t(group.cat)));
          const fbWrap = document.createElement("div");
          fbWrap.className = "qa-fb";
          for (const label of group.labels) {
            const b = document.createElement("button");
            b.className = "btn qa-fb-btn";
            b.textContent = label;
            b.addEventListener("click", () => this.sendFeedback(group.key, label, ""));
            fbWrap.appendChild(b);
          }
          this.panel.appendChild(fbWrap);
        }
        const noteRow = document.createElement("div");
        noteRow.className = "qa-note-row";
        const inp = document.createElement("input");
        inp.id = "qa-note";
        inp.maxLength = 200;
        inp.placeholder = "อื่นๆ… (พิมพ์สั้นๆ ได้)";
        const send = document.createElement("button");
        send.className = "btn";
        send.textContent = "ส่ง";
        send.addEventListener("click", () => {
          this.sendFeedback("note", "อื่นๆ", inp.value.trim());
          inp.value = "";
        });
        noteRow.appendChild(inp);
        noteRow.appendChild(send);
        this.panel.appendChild(noteRow);
        const btnRow = document.createElement("div");
        btnRow.className = "qa-btn-row";
        const copy = document.createElement("button");
        copy.className = "btn";
        copy.textContent = "COPY QA SNAPSHOT";
        copy.addEventListener("click", () => void this.copySnapshot(copy));
        const end = document.createElement("button");
        end.className = "btn";
        end.textContent = "END PLAYTEST";
        end.addEventListener("click", () => this.end("human-ended"));
        btnRow.appendChild(copy);
        btnRow.appendChild(end);
        this.panel.appendChild(btnRow);
        const dl = document.createElement("div");
        dl.id = "qa-downloads";
        dl.className = "qa-dl";
        this.panel.appendChild(dl);
      }
    }
    if (this.listBox) {
      this.listBox.innerHTML =
        this.collapsed
          ? `<div class="qa-sec">t=${simT}s · age ${age} · rec ●</div>`
          : `<div class="qa-sec">t=${simT}s · age ${age}</div>` + this.routeRows() +
          `<div class="qa-sec">Auto checks</div>` + this.autoRows() +
          `<div class="qa-sec">F4 = QA overlay · F3 = perf</div>`;
    }
    if (this.ended) this.showDownloads();
  }

  private sendFeedback(category: string, label: string, note: string): void {
    const f = this.lastFrame;
    if (!f) return;
    this.recorder.feedbackMark(category, label, note, {
      px: f.px, py: f.py,
      chunk: `${f.chunkCx},${f.chunkCy}`,
      fps: f.fps,
      enemies: f.enemies,
      projs: f.projs,
      build: f.buildSummary,
    }, this.ctx(f));
  }

  private compactSnapshot(): string {
    const f = this.lastFrame;
    if (!f) return "QA: no frame yet";
    return [
      `Seed: ${f.masterSeed}`,
      `Age: ${f.age} (asc ${f.ascension})`,
      `Time: sim ${f.simTime.toFixed(1)}s / run ${f.runElapsed.toFixed(1)}s`,
      `FPS: ${f.fps.toFixed(0)} simAvg ${f.simMsAvg.toFixed(2)}ms frame ${f.frameMs.toFixed(1)}ms`,
      `Enemies: ${f.enemies} Projectiles: ${f.projs} Pickups: ${f.pickups}`,
      `Chunk: ${f.chunkCx},${f.chunkCy} (${f.biome})`,
      `Nearest POI: ${f.nearestPOI ? `${f.nearestPOI.poiType} ${f.nearestPOI.dist.toFixed(0)}u ${f.nearestPOI.found ? "(found)" : ""}` : "none"}`,
    ].join("\n");
  }

  private async copySnapshot(btn: HTMLButtonElement): Promise<void> {
    const text = this.compactSnapshot();
    try {
      await navigator.clipboard.writeText(text);
      btn.textContent = "COPIED ✓";
      setTimeout(() => { btn.textContent = "COPY QA SNAPSHOT"; }, 2000);
    } catch {
      btn.textContent = "COPY BLOCKED — screenshot instead";
      setTimeout(() => { btn.textContent = "COPY QA SNAPSHOT"; }, 3000);
    }
  }

  onPlayerDied(): void {
    if (this.disposed || this.ended) return;
    const f = this.lastFrame ?? this.adapter.frame();
    const ctx = this.ctx(f);
    this.recorder.checkpoint("PLAYER_DIED", ctx);
    this.recorder.checkpoint("RUN_END", ctx);
    this.recordEngagement(f, ctx);
    this.recorder.perfSnapshot("run-end", ctx);
    this.end("player-died");
  }

  /** Finalize + reveal report downloads. Safe to call twice. */
  end(reason: string): void {
    if (this.ended) {
      this.showDownloads();
      return;
    }
    this.ended = true;
    const f = this.lastFrame;
    if (f) {
      const ctx = this.ctx(f);
      if (!this.recorder.hasCheckpoint("RUN_END")) {
        this.recorder.checkpoint("RUN_END", ctx);
        this.recorder.perfSnapshot("end", ctx);
      }
    }
    this.recorder.finish(reason, this.wallNow());
    this.persistReports(reason, true);
    this.refreshPanel();
  }

  /**
   * POST the current report to the local dev-only QA sink
   * (POST /__seed_qa/report). Fire-and-forget: a missing sink (production
   * build, plain dev server) must NEVER break gameplay — failures are silent.
   */
  private persistReports(reason: string, terminal: boolean): void {
    if (terminal) {
      if (this.persistedTerminal) return;
      this.persistedTerminal = true;
    }
    try {
      const snap = this.recorder.snapshot();
      const payload = {
        kind: "qa-report",
        sessionId: snap.sessionId,
        reportSequence: this.reportSequence++,
        wallStart: snap.wallStart,
        seed: snap.seed,
        reason,
        terminal,
        savedAt: new Date().toISOString(),
        markdown: renderMarkdown(snap),
        data: snap,
      };
      const text = JSON.stringify(payload);
      void fetch("/__seed_qa/report", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: text,
      }).catch(() => undefined);
    } catch {
      // Never break gameplay.
    }
  }

  /** Checkpoint autosave (throttled): protects evidence on browser close. */
  private autosaveReports(): void {
    const now = this.wallNow();
    if (now - this.lastAutosave < 5) return;
    this.lastAutosave = now;
    if (!this.ended) this.persistReports("autosave", false);
  }

  /** Non-blocking completion message. Game keeps running; human is done. */
  private showComplete(): void {
    if (document.getElementById("qa-complete")) return;
    const d = document.createElement("div");
    d.id = "qa-complete";
    d.className = "qa-complete-banner";

    const title = document.createElement("div");
    title.className = "qa-complete-title";
    title.textContent = "PLAYTEST COMPLETE — Evidence saved automatically. You can stop playing.";
    d.appendChild(title);

    const commentBox = document.createElement("div");
    commentBox.className = "qa-comment-box";
    const label = document.createElement("span");
    label.className = "qa-comment-label";
    label.textContent = "มีอะไรที่จำได้หรือรู้สึกชัดเป็นพิเศษไหม?";
    const input = document.createElement("input");
    input.type = "text";
    input.maxLength = 200;
    input.placeholder = "พิมพ์สั้น ๆ (ไม่บังคับ)...";
    input.className = "qa-comment-input";
    const saveBtn = document.createElement("button");
    saveBtn.className = "btn primary qa-comment-btn";
    saveBtn.textContent = "บันทึก";
    const skipBtn = document.createElement("button");
    skipBtn.className = "btn qa-comment-btn";
    skipBtn.textContent = "ข้าม (SKIP)";

    const finishComment = (val: string | null) => {
      this.recorder.setHumanComment(val);
      this.persistReports("target-complete", true);
      commentBox.remove();
    };

    saveBtn.addEventListener("click", () => {
      const val = input.value.trim();
      finishComment(val.length > 0 ? val : null);
    });
    skipBtn.addEventListener("click", () => finishComment(null));

    commentBox.appendChild(label);
    commentBox.appendChild(input);
    commentBox.appendChild(saveBtn);
    commentBox.appendChild(skipBtn);
    d.appendChild(commentBox);

    document.getElementById("ui")?.appendChild(d) ?? document.body.appendChild(d);
    this.refreshPanel();
  }

  private showDownloads(): void {
    if (!this.panel || this.disposed) return;
    const box = this.panel.querySelector("#qa-downloads");
    if (!box || box.childElementCount > 0) return;
    const snap = this.recorder.snapshot();
    // NOTE: perfCheckpoints live inside the recorder; snapshot() carries them.
    // Explicit 1–5 engagement ratings (human judgment, recorded not inferred).
    const rateTitle = document.createElement("div");
    rateTitle.className = "qa-title2";
    rateTitle.textContent = t("qa.ratingsTitle");
    box.appendChild(rateTitle);
    for (const q of RATING_QUESTIONS) {
      const row = document.createElement("div");
      row.className = "qa-rate-row";
      const lab = document.createElement("span");
      lab.textContent = t(q);
      row.appendChild(lab);
      const picked = snap.ratings.find((r) => r.question === q)?.score ?? 0;
      for (let v = 1; v <= 5; v++) {
        const b = document.createElement("button");
        b.className = "btn qa-rate" + (picked === v ? " active" : "");
        b.textContent = String(v);
        b.addEventListener("click", () => {
          const f = this.lastFrame;
          if (!f) return;
          this.recorder.rate(q, v, this.ctx(f));
          box.innerHTML = "";
          this.showDownloads();
        });
        row.appendChild(b);
      }
      box.appendChild(row);
    }
    const mkBtn = (label: string, filename: string, text: string, mime: string): HTMLButtonElement => {
      const b = document.createElement("button");
      b.className = "btn primary";
      b.textContent = label;
      b.addEventListener("click", () => download(filename, text, mime));
      return b;
    };
    // Re-snapshot perf checkpoints: they accumulate in the sampler window, so
    // flush a final window slice labeled by end reason.
    const f = this.lastFrame;
    if (f) this.recorder.perfSnapshot(`final-${this.recorder.snapshot().endReason || "end"}`, this.ctx(f));
    const full = this.recorder.snapshot();
    box.appendChild(mkBtn("DOWNLOAD QA REPORT (.md)", "playtest-report.md", renderMarkdown(full), "text/markdown"));
    box.appendChild(mkBtn("DOWNLOAD QA DATA (.json)", "playtest-report.json", renderJSON(full), "application/json"));
    void snap;
  }

  dispose(): void {
    this.disposed = true;
    if (this.onWinError) window.removeEventListener("error", this.onWinError);
    if (this.onUnhandled) window.removeEventListener("unhandledrejection", this.onUnhandled);
    if (this.origError) console.error = this.origError;
    if (this.origWarn) console.warn = this.origWarn;
    const root = document.getElementById("ui") ?? document.body;
    root.classList.remove("has-qa");
    this.panel?.remove();
    this.panel = null;
  }
}
