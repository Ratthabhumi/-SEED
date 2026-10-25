import { describe, it, expect } from "vitest";
import { RunSimulation } from "../../src/core/sim/RunSimulation";
import type { InputFrame } from "../../src/core/sim/InputFrame";

// P1-05: the canonical snapshot must cover gameplay state and nothing cosmetic.
describe("canonical state contract", () => {
  it("same state → same snapshot; same trace → same snapshot", () => {
    const a = new RunSimulation({ masterSeed: "EPOCH-GOLDEN-001" });
    const b = new RunSimulation({ masterSeed: "EPOCH-GOLDEN-001" });
    expect(a.snapshot()).toBe(b.snapshot());
    const f: InputFrame = { moveX: 1, moveY: 0, dashPressed: false };
    for (let i = 0; i < 120; i++) { a.step(1 / 60, f); b.step(1 / 60, f); }
    expect(a.snapshot()).toBe(b.snapshot());
    expect(a.hash()).toBe(b.hash());
  });

  it("one gameplay mine changed → different snapshot", () => {
    const a = new RunSimulation({ masterSeed: "EPOCH-GOLDEN-001" });
    const b = new RunSimulation({ masterSeed: "EPOCH-GOLDEN-001" });
    b.dropPickup(10, 10, 1); // control: pickups covered…
    const c = new RunSimulation({ masterSeed: "EPOCH-GOLDEN-001" });
    c.state.mines[0] = { active: true, x: 5, y: 5, dmg: 9, radius: 9, life: 9 };
    expect(a.snapshot()).not.toBe(c.snapshot());
    expect(a.snapshot()).not.toBe(b.snapshot());
  });

  it("one gameplay RNG stream changed → different snapshot", () => {
    const a = new RunSimulation({ masterSeed: "EPOCH-GOLDEN-001" });
    const before = a.snapshot();
    a.streams.event.nextUint32();
    expect(a.snapshot()).not.toBe(before);
  });

  it("cosmetic-only state changed → same canonical snapshot", () => {
    const a = new RunSimulation({ masterSeed: "EPOCH-GOLDEN-001" });
    const before = a.snapshot();
    a.state.beamFlash = { x2: 1, y2: 2, t: 0.1 }; // render-only
    expect(a.snapshot()).toBe(before);
  });

  it("pending draft state is covered (choices included)", () => {
    const a = new RunSimulation({ masterSeed: "EPOCH-GOLDEN-001" });
    const b = new RunSimulation({ masterSeed: "EPOCH-GOLDEN-001" });
    const ev: never[] = [];
    a.gainKnowledge(500, "test", ev);
    expect(a.state.draftOpen).toBe(true);
    expect(a.snapshot()).not.toBe(b.snapshot());
  });
});
