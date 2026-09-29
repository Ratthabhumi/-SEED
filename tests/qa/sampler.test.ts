import { describe, it, expect } from "vitest";
import { PerformanceSampler, percentile, type PerfSampleInput } from "../../src/qa/PerformanceSampler";

function sample(fps = 60, frameMs = 16.6, simMs = 1.2): PerfSampleInput {
  return {
    fps, frameMs, simMs, enemies: 10, projs: 20, pickups: 5, mines: 1,
    enemyPoolUsed: 10, projPoolUsed: 20, pickupPoolUsed: 5,
    queries: 3, buckets: 12, chunkHits: 9, chunkMisses: 1,
  };
}

describe("percentile", () => {
  it("returns 0 for empty input and real order statistics otherwise", () => {
    expect(percentile([], 95)).toBe(0);
    const s = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    expect(percentile(s, 50)).toBe(6);
    expect(percentile(s, 95)).toBe(10);
    expect(percentile(s, 99)).toBe(10);
  });
});

describe("performance sampler", () => {
  it("aggregates a window and resets the window on snapshot", () => {
    const ps = new PerformanceSampler();
    expect(ps.snapshot("empty", 0, 0)).toBeNull();
    for (let i = 0; i < 10; i++) ps.push(sample());
    const a = ps.snapshot("stone", 60, 61);
    expect(a?.samples).toBe(10);
    expect(a?.frameP50).toBeCloseTo(16.6);
    expect(a?.enemiesMax).toBe(10);
    // Window consumed — second snapshot without new samples is null.
    expect(ps.snapshot("again", 61, 62)).toBeNull();
  });

  it("tracks worst cases and slow-frame counters", () => {
    const ps = new PerformanceSampler();
    ps.push(sample(60, 16, 1));
    ps.push(sample(20, 55, 8));
    ps.push(sample(10, 120, 30));
    const a = ps.snapshot("boss", 600, 620);
    expect(a?.worstFrameMs).toBe(120);
    expect(a?.worstSimMs).toBe(30);
    expect(a?.over33ms).toBe(2);
    expect(a?.over50ms).toBe(2);
    expect(a?.over100ms).toBe(1);
    expect(a?.fpsMin).toBe(10);
  });

  it("bounds memory under sustained sampling", () => {
    const ps = new PerformanceSampler();
    for (let i = 0; i < 5000; i++) ps.push(sample());
    expect(ps.count).toBeLessThanOrEqual(2400);
    expect(ps.snapshot("late", 9999, 9999)?.samples).toBeLessThanOrEqual(2400);
  });
});
