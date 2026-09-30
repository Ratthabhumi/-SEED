// Bounded rolling performance sampler — pure, framework-free.
// Fed at ~2 Hz by the adapter; never serializes per frame; all buffers capped.
export interface PerfSampleInput {
  fps: number;
  frameMs: number;
  simMs: number;
  enemies: number;
  projs: number;
  pickups: number;
  mines: number;
  enemyPoolUsed: number;
  projPoolUsed: number;
  pickupPoolUsed: number;
  queries: number;
  buckets: number;
  chunkHits: number;
  chunkMisses: number;
}

export interface CheckpointStats {
  label: string;
  simTime: number;
  wallTime: number;
  samples: number;
  fpsMin: number;
  frameP50: number;
  frameP95: number;
  frameP99: number;
  simP50: number;
  simP95: number;
  simP99: number;
  enemiesMax: number;
  projsMax: number;
  pickupsMax: number;
  minesMax: number;
  enemyPoolMax: number;
  projPoolMax: number;
  pickupPoolMax: number;
  queriesMax: number;
  bucketsMax: number;
  chunkHitRate: number;
  worstFrameMs: number;
  worstSimMs: number;
  over33ms: number;
  over50ms: number;
  over100ms: number;
}

export function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  return sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))] as number;
}

const MAX_SAMPLES = 2400; // 2 Hz × 20 min — hard bound, oldest dropped first.

interface Stored extends PerfSampleInput {
  chunkHitRate: number;
}

export class PerformanceSampler {
  private samples: Stored[] = [];
  private sinceMark = 0; // index into samples[] where the current window starts
  private worstFrameMs = 0;
  private worstSimMs = 0;
  private over33ms = 0;
  private over50ms = 0;
  private over100ms = 0;
  private fpsMin = Number.POSITIVE_INFINITY;

  get count(): number {
    return this.samples.length;
  }

  push(s: PerfSampleInput): void {
    const total = s.chunkHits + s.chunkMisses;
    this.samples.push({ ...s, chunkHitRate: total > 0 ? s.chunkHits / total : 1 });
    if (this.samples.length > MAX_SAMPLES) {
      this.samples.shift();
      this.sinceMark = Math.max(0, this.sinceMark - 1);
    }
    if (s.frameMs > this.worstFrameMs) this.worstFrameMs = s.frameMs;
    if (s.simMs > this.worstSimMs) this.worstSimMs = s.simMs;
    if (s.frameMs > 33) this.over33ms++;
    if (s.frameMs > 50) this.over50ms++;
    if (s.frameMs > 100) this.over100ms++;
    if (s.fps < this.fpsMin) this.fpsMin = s.fps;
  }

  /** Aggregate samples since the last snapshot (or all, first call). */
  snapshot(label: string, simTime: number, wallTime: number): CheckpointStats | null {
    const win = this.samples.slice(this.sinceMark);
    this.sinceMark = this.samples.length;
    if (win.length === 0) return null;
    const frames = win.map((s) => s.frameMs).sort((a, b) => a - b);
    const sims = win.map((s) => s.simMs).sort((a, b) => a - b);
    const last = win[win.length - 1] as Stored;
    return {
      label,
      simTime,
      wallTime,
      samples: win.length,
      fpsMin: win.reduce((m, s) => Math.min(m, s.fps), Number.POSITIVE_INFINITY),
      frameP50: percentile(frames, 50),
      frameP95: percentile(frames, 95),
      frameP99: percentile(frames, 99),
      simP50: percentile(sims, 50),
      simP95: percentile(sims, 95),
      simP99: percentile(sims, 99),
      enemiesMax: win.reduce((m, s) => Math.max(m, s.enemies), 0),
      projsMax: win.reduce((m, s) => Math.max(m, s.projs), 0),
      pickupsMax: win.reduce((m, s) => Math.max(m, s.pickups), 0),
      minesMax: win.reduce((m, s) => Math.max(m, s.mines), 0),
      enemyPoolMax: win.reduce((m, s) => Math.max(m, s.enemyPoolUsed), 0),
      projPoolMax: win.reduce((m, s) => Math.max(m, s.projPoolUsed), 0),
      pickupPoolMax: win.reduce((m, s) => Math.max(m, s.pickupPoolUsed), 0),
      queriesMax: win.reduce((m, s) => Math.max(m, s.queries), 0),
      bucketsMax: win.reduce((m, s) => Math.max(m, s.buckets), 0),
      chunkHitRate: last.chunkHitRate,
      worstFrameMs: this.worstFrameMs,
      worstSimMs: this.worstSimMs,
      over33ms: this.over33ms,
      over50ms: this.over50ms,
      over100ms: this.over100ms,
    };
  }
}
