import { describe, it, expect } from "vitest";
import { FixedAccumulator } from "../../src/core/sim/fixedStep";
import { InputLatch } from "../../src/core/sim/InputLatch";

// P1-02: a single Space edge ⇒ exactly one dash across render-frame patterns.
// Adapter loop model: steps = acc.steps(dt); step 0 takes the latched edge.
function dashesForPattern(patternMs: number[]): number {
  const acc = new FixedAccumulator();
  const latch = new InputLatch();
  latch.pressDash();
  let dashes = 0;
  for (const ms of patternMs) {
    const steps = acc.steps(ms / 1000);
    for (let i = 0; i < steps; i++) {
      if (latch.frameForStep(i).dashPressed) dashes++;
    }
  }
  return dashes;
}

describe("fixed-step input latch", () => {
  it.each([
    [[8, 9]],
    [[17]],
    [[4, 4, 9]],
    [[33]],
    [[16, 16, 16]],
    [[100]],
  ])("pattern %j latches exactly one dash", (pattern) => {
    expect(dashesForPattern(pattern as number[])).toBe(1);
  });

  it("edge survives zero-step frames (not sampled away)", () => {
    const acc = new FixedAccumulator();
    const latch = new InputLatch();
    latch.pressDash();
    expect(acc.steps(0.008)).toBe(0);
    expect(latch.hasLatchedDash).toBe(true); // nothing consumed it
    expect(acc.steps(0.009)).toBe(1);
    expect(latch.frameForStep(0).dashPressed).toBe(true);
    expect(latch.hasLatchedDash).toBe(false);
  });

  it("no press ⇒ no dash; double press ⇒ still one edge until consumed", () => {
    const latch = new InputLatch();
    expect(latch.frameForStep(0).dashPressed).toBe(false);
    latch.pressDash();
    latch.pressDash();
    expect(latch.frameForStep(0).dashPressed).toBe(true);
    expect(latch.frameForStep(1).dashPressed).toBe(false);
  });
});
