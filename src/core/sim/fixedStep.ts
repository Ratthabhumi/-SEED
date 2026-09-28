// Fixed-step accumulator (60 Hz). Rendering never drives simulation state.
export const SIM_HZ = 60;
export const SIM_DT = 1 / SIM_HZ;
export const MAX_CATCHUP_STEPS = 5;

export class FixedAccumulator {
  private acc = 0;
  /** Returns number of sim steps to run for frame delta (seconds), capped. */
  steps(deltaSec: number): number {
    const d = Math.min(Math.max(deltaSec, 0), 0.25);
    this.acc += d;
    let n = 0;
    while (this.acc >= SIM_DT && n < MAX_CATCHUP_STEPS) {
      this.acc -= SIM_DT;
      n++;
    }
    if (n === MAX_CATCHUP_STEPS) this.acc = 0; // avoid spiral of death
    return n;
  }
}

/** XP curve: knowledge to go from level L to L+1. */
export function xpForLevel(level: number): number {
  return Math.floor(8 + level * 7 + level * level * 0.6);
}
