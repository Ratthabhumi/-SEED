// Fixed-step input latch (P1-02).
//
// Edge-triggered actions (dash) must survive render frames that produce ZERO
// simulation steps. The browser sets the edge (pressDash); each rendered frame
// builds per-step InputFrames; the FIRST consumed step takes the edge exactly
// once. If a frame runs no steps, the edge stays latched for the next frame.
//
// One-shot DOM actions (draft picks, ascend clicks) are NOT latched: the
// adapter calls simulation methods directly while stepping is paused, so the
// fixed-step edge-loss class cannot apply — documented here by design.
import type { InputFrame } from "./InputFrame";

export class InputLatch {
  private moveX = 0;
  private moveY = 0;
  private dash = false;

  setMove(x: number, y: number): void {
    this.moveX = x;
    this.moveY = y;
  }

  /** Browser edge: Space keydown. Idempotent until consumed. */
  pressDash(): void {
    this.dash = true;
  }

  /**
   * Build the InputFrame for step `stepIndex` of the current frame.
   * Only the first consumed step sees the edge; the latch clears on consume.
   * Call ONLY when at least one step will run — otherwise the edge persists.
   */
  frameForStep(stepIndex: number): InputFrame {
    const dashPressed = stepIndex === 0 && this.dash;
    if (stepIndex === 0) this.dash = false;
    return { moveX: this.moveX, moveY: this.moveY, dashPressed };
  }

  /** For tests/adapter: is an unconsumed edge still latched? */
  get hasLatchedDash(): boolean {
    return this.dash;
  }
}
