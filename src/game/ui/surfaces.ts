// SurfaceCoordinator — presentation-only UI surface policy (v0.23.1).
//
// Categories:
//   BLOCKING     — draft / age transition / expansion / outpost specialization /
//                  Legacy / Ascension / pause. Exactly ONE at a time (FIFO).
//   CONTEXT      — tutorial coachmark, claim prompt, interaction hints. Live in
//                  ONE stacked container (#context-stack) so they can never
//                  overlap each other; suspended while BLOCKING is up.
//   NOTIFICATION — toasts, raid warnings, breakthroughs (transient, pass-through).
//   PERMANENT    — HUD docks (always laid out in fixed zones).
//
// Context safe zones (never covered by CONTEXT): Knowledge bar, Player Command
// Dock, Minimap, Next Age card. The #context-stack container is anchored in the
// left-center lane, clear of all four zones.
//
// This manager NEVER touches canonical simulation state: it only shows/hides
// DOM and asks the scene to re-evaluate contextual content on resume.

export type SurfaceLayer = "blocking" | "context" | "notification" | "permanent";

export class SurfaceCoordinator {
  private blockingId: string | null = null;
  private queue: Array<{ id: string; show: () => void }> = [];
  private contextSuspended = false;
  private stackEl: HTMLElement | null = null;
  private reevaluate: () => void = () => {};

  /** Scene wires the context container + a re-evaluation callback once. */
  bindContext(stackEl: HTMLElement, reevaluate: () => void): void {
    this.stackEl = stackEl;
    this.reevaluate = reevaluate;
    this.applyStackVisibility();
  }

  get activeBlocking(): string | null {
    return this.blockingId;
  }

  get queuedBlocking(): number {
    return this.queue.length;
  }

  /** Exactly-one BLOCKING invariant: extra requests queue FIFO. */
  requestBlocking(id: string, show: () => void): void {
    if (this.blockingId !== null) {
      if (!this.queue.some((q) => q.id === id)) this.queue.push({ id, show });
      return;
    }
    this.blockingId = id;
    this.suspendContext();
    show();
  }

  /**
   * Release a BLOCKING surface. Drains exactly one queued surface; context
   * resumes only when nothing blocking remains.
   */
  releaseBlocking(id: string): void {
    if (this.blockingId !== id) {
      const i = this.queue.findIndex((q) => q.id === id);
      if (i >= 0) this.queue.splice(i, 1);
      return;
    }
    this.blockingId = null;
    const next = this.queue.shift();
    if (next) {
      this.blockingId = next.id;
      next.show();
      return;
    }
    this.resumeContext();
  }

  /** Drop all queued (never-shown) blocking requests, e.g. on run restart. */
  clearQueue(): void {
    this.queue = [];
  }

  /** Full reset: forget blocking + queue (scene removes DOM itself). */
  reset(): void {
    this.blockingId = null;
    this.queue = [];
    this.resumeContext();
  }

  suspendContext(): void {
    this.contextSuspended = true;
    this.applyStackVisibility();
  }

  resumeContext(): void {
    if (this.blockingId !== null) return;
    if (!this.contextSuspended) return;
    this.contextSuspended = false;
    this.applyStackVisibility();
    this.reevaluate();
  }

  get isContextSuspended(): boolean {
    return this.contextSuspended;
  }

  private applyStackVisibility(): void {
    if (!this.stackEl) return;
    this.stackEl.style.display = this.contextSuspended ? "none" : "";
  }
}
