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
  | "PLAYER_DIED" | "RUN_END";

export interface QaCtx {
  simTime: number;
  wallTime: number;
  age: string;
  ascension: number;
}

export interface QaCheckpoint extends QaCtx {
  event: QaCheckpointName;
}

export interface QaAssertion extends QaCtx {
  id: string;
  name: string;
  pass: boolean;
  detail: string;
}

export interface QaFeedback extends QaCtx {
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

export interface QaPoolSaturation extends QaCtx {
  pool: string;
  used: number;
  cap: number;
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
  consoleEntries: QaConsoleEntry[];
  langSwitches: QaLangSwitch[];
  overflows: QaOverflow[];
  poolSaturations: QaPoolSaturation[];
  endReason: string;
  wallStart: number;
  wallEnd: number;
}

const MAX_ASSERTIONS = 500;
const MAX_FEEDBACK = 200;
const MAX_CONSOLE = 300;
const MAX_OVERFLOWS = 200;
const MAX_LANG = 40;

export class PlaytestRecorder {
  private checkpoints: QaCheckpoint[] = [];
  private seenCheckpoints = new Set<string>();
  private assertions: QaAssertion[] = [];
  private failedIds = new Set<string>();
  private feedback: QaFeedback[] = [];
  private consoleEntries: QaConsoleEntry[] = [];
  private langSwitches: QaLangSwitch[] = [];
  private overflows: QaOverflow[] = [];
  private overflowKeys = new Set<string>();
  private poolSaturations: QaPoolSaturation[] = [];
  private poolKeys = new Set<string>();
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
  checkpoint(name: QaCheckpointName, ctx: QaCtx): boolean {
    const repeatable = name === "CHILD_WORLD_STARTED";
    const key = repeatable ? `${name}#${ctx.ascension}` : name;
    if (this.seenCheckpoints.has(key)) return false;
    this.seenCheckpoints.add(key);
    this.checkpoints.push({ event: name, ...ctx });
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
    label: string, note: string,
    extra: { px: number; py: number; chunk: string; fps: number; enemies: number; projs: number; build: string },
    ctx: QaCtx,
  ): void {
    if (this.feedback.length >= MAX_FEEDBACK) return;
    this.feedback.push({ label, note, ...extra, ...ctx });
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
      consoleEntries: [...this.consoleEntries],
      langSwitches: [...this.langSwitches],
      overflows: [...this.overflows],
      poolSaturations: [...this.poolSaturations],
      endReason: this.endReason,
      wallStart: this.wallStart,
      wallEnd: this.wallEnd,
    };
  }
}
