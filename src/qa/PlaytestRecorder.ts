// Framework-independent human-playtest recorder — pure data, no DOM/Phaser.
// The adapter (GameScene) feeds plain-data observations; this class owns the
// evidence log, exactly-once checkpoint semantics, and bounded buffers.
import { PerformanceSampler, type PerfSampleInput, type CheckpointStats } from "./PerformanceSampler";

export type QaCheckpointName =
  | "RUN_START" | "STONE_START"
  | "BRONZE_REACHED" | "IRON_REACHED" | "INDUSTRIAL_REACHED"
  | "ATOMIC_REACHED" | "SPACE_REACHED"
  | "BOSS_SPAWNED" | "BOSS_KILLED"
  | "ASCENSION_OFFERED" | "ASCENSION_STARTED" | "CHILD_WORLD_STARTED"
  | "POST_ASCENSION_30S" | "POST_ASCENSION_60S" | "POST_ASCENSION_120S"
  | "PLAYER_DIED" | "RUN_END";

export interface QaCtx {
  simTime: number;
  wallTime: number;
  age: string;
  ascension: number;
}

export interface QaCheckpoint extends QaCtx {
  event: QaCheckpointName;
  /** Optional machine-readable context (knowledge at age, child-world state). */
  data?: Record<string, string | number>;
}

export interface QaAssertion extends QaCtx {
  id: string;
  name: string;
  pass: boolean;
  detail: string;
}

export interface QaFeedback extends QaCtx {
  /** Unambiguous event category (read/feel/balance/positive/note). */
  category: string;
  label: string;
  note: string;
  px: number;
  py: number;
  chunk: string;
  fps: number;
  enemies: number;
  projs: number;
  build: string;
}

export interface QaConsoleEntry extends QaCtx {
  level: "error" | "warn";
  message: string;
  stack: string;
}

export interface QaLangSwitch extends QaCtx {
  from: string;
  to: string;
  unchanged: boolean;
}

export interface QaOverflow {
  selector: string;
  lang: string;
  viewport: string;
  kind: string;
  overBy: number;
  simTime: number;
  wallTime: number;
}

export interface QaSimMark extends QaCtx {
  kind: string;
  detail: string;
}

export interface QaPoolSaturation extends QaCtx {
  pool: string;
  used: number;
  cap: number;
}

export interface QaRating extends QaCtx {
  question: string;
  score: number;
}

export interface QaAgeKnowledge extends QaCtx {
  knowledge: number;
}

export interface QaEngagement extends QaCtx {
  origin: string;
  families: string;
  techs: number;
  breakthroughs: string[];
  legacies: string[];
  poiClaims: string[];
  knowledge: number;
  level: number;
  weapons: string;
}

export interface QaEnvironment {
  userAgent: string;
  viewport: string;
  devicePixelRatio: number;
  screen: string;
  refreshHz: string;
  hardwareConcurrency: number;
  deviceMemory: string;
  webgl: string;
}

export interface QaVersions {
  packageVersion: string;
  worldgen: number;
  content: number;
  saveSchema: number;
}

export interface RecorderSnapshot {
  seed: string;
  versions: QaVersions;
  environment: QaEnvironment | null;
  checkpoints: QaCheckpoint[];
  perfCheckpoints: CheckpointStats[];
  perfSamples: number;
  assertions: QaAssertion[];
  feedback: QaFeedback[];
  ratings: QaRating[];
  ageKnowledge: QaAgeKnowledge[];
  engagement: QaEngagement[];
  consoleEntries: QaConsoleEntry[];
  langSwitches: QaLangSwitch[];
  overflows: QaOverflow[];
  poolSaturations: QaPoolSaturation[];
  simMarks: QaSimMark[];
  endReason: string;
  wallStart: number;
  wallEnd: number;
}

const MAX_ASSERTIONS = 500;
const MAX_FEEDBACK = 200;
const MAX_CONSOLE = 300;
const MAX_OVERFLOWS = 200;
const MAX_LANG = 40;
const MAX_RATINGS = 25;
const MAX_ENGAGEMENT = 60;
const MAX_SIMMARKS = 400;

export class PlaytestRecorder {
  private checkpoints: QaCheckpoint[] = [];
  private seenCheckpoints = new Set<string>();
  private assertions: QaAssertion[] = [];
  private failedIds = new Set<string>();
  private feedback: QaFeedback[] = [];
  private ratings: QaRating[] = [];
  private ratedQuestions = new Set<string>();
  private ageKnowledge: QaAgeKnowledge[] = [];
  private ageKnowledgeKeys = new Set<string>();
  private engagement: QaEngagement[] = [];
  private consoleEntries: QaConsoleEntry[] = [];
  private langSwitches: QaLangSwitch[] = [];
  private overflows: QaOverflow[] = [];
  private overflowKeys = new Set<string>();
  private poolSaturations: QaPoolSaturation[] = [];
  private poolKeys = new Set<string>();
  private simMarks: QaSimMark[] = [];
  private perfCheckpoints: CheckpointStats[] = [];
  private environment: QaEnvironment | null = null;
  private endReason = "";
  private wallEnd = 0;

  readonly sampler = new PerformanceSampler();

  constructor(
    readonly seed: string,
    readonly versions: QaVersions,
    readonly wallStart: number,
    readonly ageOrder: readonly string[],
  ) {}

  setEnvironment(env: QaEnvironment): void {
    this.environment = env;
  }

  /** Exactly-once per checkpoint name (+ascension for repeatable ones). */
  checkpoint(name: QaCheckpointName, ctx: QaCtx, data?: Record<string, string | number>): boolean {
    const repeatable =
      name === "CHILD_WORLD_STARTED" ||
      name === "POST_ASCENSION_30S" ||
      name === "POST_ASCENSION_60S" ||
      name === "POST_ASCENSION_120S";
    const key = repeatable ? `${name}#${ctx.ascension}` : name;
    if (this.seenCheckpoints.has(key)) return false;
    this.seenCheckpoints.add(key);
    this.checkpoints.push({ event: name, ...ctx, ...(data ? { data } : {}) });
    return true;
  }

  hasCheckpoint(name: QaCheckpointName): boolean {
    return this.checkpoints.some((c) => c.event === name);
  }

  pushPerf(s: PerfSampleInput): void {
    this.sampler.push(s);
  }

  perfSnapshot(label: string, ctx: QaCtx): CheckpointStats | null {
    const s = this.sampler.snapshot(label, ctx.simTime, ctx.wallTime);
    if (s) this.perfCheckpoints.push(s);
    return s;
  }

  assert(id: string, name: string, pass: boolean, detail: string, ctx: QaCtx): void {
    if (!pass) {
      // One FAIL record per id+detail — a stuck condition must not flood the log.
      const key = `${id}::${detail}`;
      if (this.failedIds.has(key)) return;
      this.failedIds.add(key);
    }
    if (this.assertions.length >= MAX_ASSERTIONS) return;
    this.assertions.push({ id, name, pass, detail, ...ctx });
  }

  hasFail(id: string): boolean {
    return this.assertions.some((a) => a.id === id && !a.pass);
  }

  feedbackMark(
    category: string,
    label: string, note: string,
    extra: { px: number; py: number; chunk: string; fps: number; enemies: number; projs: number; build: string },
    ctx: QaCtx,
  ): void {
    if (this.feedback.length >= MAX_FEEDBACK) return;
    this.feedback.push({ category, label, note, ...extra, ...ctx });
  }

  /** Explicit 1–5 human rating (one value per question; latest wins). */
  rate(question: string, score: number, ctx: QaCtx): void {
    const s = Math.max(1, Math.min(5, Math.round(score)));
    this.ratings = this.ratings.filter((r) => r.question !== question);
    if (this.ratings.length >= MAX_RATINGS) return;
    this.ratings.push({ question, score: s, ...ctx });
    this.ratedQuestions.add(question);
  }

  /** Knowledge total observed at an age transition (bounded, deduped). */
  recordAgeKnowledge(age: string, knowledge: number, ctx: QaCtx): void {
    const key = `${age}#${ctx.ascension}`;
    if (this.ageKnowledgeKeys.has(key)) return;
    this.ageKnowledgeKeys.add(key);
    this.ageKnowledge.push({ knowledge: Math.floor(knowledge), ...ctx });
  }

  /** Engagement identity snapshot (bounded; called at age/boss/ascend/end). */
  recordEngagement(e: Omit<QaEngagement, "simTime" | "wallTime" | "age" | "ascension">, ctx: QaCtx): void {
    if (this.engagement.length >= MAX_ENGAGEMENT) return;
    this.engagement.push({ ...e, ...ctx });
  }

  console(level: "error" | "warn", message: string, stack: string, ctx: QaCtx): void {
    if (this.consoleEntries.length >= MAX_CONSOLE) return;
    this.consoleEntries.push({ level, message: message.slice(0, 500), stack: stack.slice(0, 1000), ...ctx });
  }

  langSwitch(from: string, to: string, unchanged: boolean, ctx: QaCtx): void {
    if (this.langSwitches.length >= MAX_LANG) return;
    this.langSwitches.push({ from, to, unchanged, ...ctx });
  }

  overflow(o: QaOverflow): void {
    const key = `${o.selector}::${o.lang}::${o.viewport}::${o.kind}`;
    if (this.overflowKeys.has(key)) return;
    this.overflowKeys.add(key);
    if (this.overflows.length >= MAX_OVERFLOWS) return;
    this.overflows.push(o);
  }

  poolSaturation(pool: string, used: number, cap: number, ctx: QaCtx): void {
    const key = `${pool}#${ctx.ascension}`;
    if (this.poolKeys.has(key)) return;
    this.poolKeys.add(key);
    this.poolSaturations.push({ pool, used, cap, ...ctx });
  }

  /** Ordered sim-decision marks (tech picks, breakthroughs, POI majors, ...). */
  simMark(kind: string, detail: string, ctx: QaCtx): void {
    if (this.simMarks.length >= MAX_SIMMARKS) return;
    this.simMarks.push({ kind, detail, ...ctx });
  }

  /**
   * Target-complete predicate for zero-friction auto-finalization:
   * ascended at least once, child world started, 120s post-Ascension evidence.
   * Pure function of recorded checkpoints — unit-tested, no DOM.
   */
  isTargetComplete(): boolean {
    if (!this.hasCheckpoint("CHILD_WORLD_STARTED")) return false;
    return this.hasCheckpoint("POST_ASCENSION_120S") || this.perfCheckpoints.some((p) => p.label === "post-ascension+120s");
  }

  finish(reason: string, wallTime: number): void {
    this.endReason = reason;
    this.wallEnd = wallTime;
  }

  /** Machine-checkable verdict only — NEVER a human-gate PASS. */
  autoResult(): "AUTOMATED_CHECKS_PASS" | "AUTOMATED_CHECKS_FAIL" {
    const fail = this.assertions.some((a) => !a.pass);
    const err = this.consoleEntries.some((c) => c.level === "error");
    return fail || err ? "AUTOMATED_CHECKS_FAIL" : "AUTOMATED_CHECKS_PASS";
  }

  errorCount(): number {
    return this.consoleEntries.filter((c) => c.level === "error").length;
  }

  warnCount(): number {
    return this.consoleEntries.filter((c) => c.level === "warn").length;
  }

  failCount(): number {
    return this.assertions.filter((a) => !a.pass).length;
  }

  snapshot(): RecorderSnapshot {
    return {
      seed: this.seed,
      versions: this.versions,
      environment: this.environment,
      checkpoints: [...this.checkpoints],
      perfCheckpoints: [...this.perfCheckpoints],
      perfSamples: this.sampler.count,
      assertions: [...this.assertions],
      feedback: [...this.feedback],
      ratings: [...this.ratings],
      ageKnowledge: [...this.ageKnowledge],
      engagement: [...this.engagement],
      consoleEntries: [...this.consoleEntries],
      langSwitches: [...this.langSwitches],
      overflows: [...this.overflows],
      poolSaturations: [...this.poolSaturations],
      simMarks: [...this.simMarks],
      endReason: this.endReason,
      wallStart: this.wallStart,
      wallEnd: this.wallEnd,
    };
  }
}
