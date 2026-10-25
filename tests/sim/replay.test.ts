import { describe, it, expect } from "vitest";
import { RunSimulation } from "../../src/core/sim/RunSimulation";
import type { InputFrame } from "../../src/core/sim/InputFrame";

/** Scripted trace: circle-strafe + periodic dash. Deterministic by construction. */
function trace(n: number): InputFrame[] {
  return Array.from({ length: n }, (_, i) => ({
    moveX: Math.cos(i / 25),
    moveY: Math.sin(i / 25),
    dashPressed: i % 90 === 0,
  }));
}

function play(seed: string, frames: InputFrame[]): { hash: string; over: boolean; kills: number } {
  const sim = new RunSimulation({ masterSeed: seed });
  for (const f of frames) {
    const ev = sim.step(1 / 60, f);
    for (const e of ev) if (e.type === "draft_opened") sim.chooseDraft(0);
    if (sim.state.over) break;
  }
  return { hash: sim.hash(), over: sim.state.over, kills: sim.state.stats.kills };
}

describe("deterministic replay contract", () => {
  const frames = trace(900);

  it("same seed + same inputs → same final hash", () => {
    expect(play("EPOCH-GOLDEN-001", frames).hash).toBe(play("EPOCH-GOLDEN-001", frames).hash);
  });

  it("fresh instance == restart (no leaked transient state)", () => {
    // A "restart" is a NEW RunSimulation — this test pins that equivalence.
    const a = play("EPOCH-GOLDEN-002", frames);
    const b = play("EPOCH-GOLDEN-002", frames);
    expect(a.hash).toBe(b.hash);
    expect(a.kills).toBe(b.kills);
  });

  it("different inputs → different state (hash is sensitive)", () => {
    const other = trace(900).map((f, i) => (i % 2 === 0 ? { ...f, moveX: -f.moveX } : f));
    expect(play("EPOCH-GOLDEN-001", frames).hash).not.toBe(play("EPOCH-GOLDEN-001", other).hash);
  });

  it("different seeds → different trajectories", () => {
    expect(play("EPOCH-GOLDEN-001", frames).hash).not.toBe(play("EPOCH-GOLDEN-002", frames).hash);
  });

  it("long trace stays finite and bounded", () => {
    const sim = new RunSimulation({ masterSeed: "EPOCH-STRESS-001" });
    for (const f of trace(3600)) {
      const ev = sim.step(1 / 60, f);
      for (const e of ev) if (e.type === "draft_opened") sim.chooseDraft(1 % 3);
      if (sim.state.over) break;
    }
    const h = sim.hash();
    expect(h).toMatch(/^[0-9a-f]{8}$/);
    expect(Number.isFinite(sim.state.px)).toBe(true);
    expect(sim.state.stats.kills).toBeGreaterThanOrEqual(0);
  });
});
