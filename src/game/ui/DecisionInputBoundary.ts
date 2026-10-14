/** Native input transition guard. Held gameplay keys must be released before
 * they can activate a newly focused decision. No timer-based activation delay. */
export class DecisionInputBoundary {
  private held = new Set<string>();
  private blocked = new Set<string>();
  private openedAt = -1;
  private disposed = false;
  private down = (event: KeyboardEvent): void => {
    if (this.blocked.has(event.code)) {
      event.preventDefault(); event.stopImmediatePropagation();
    }
    this.held.add(event.code);
  };
  private up = (event: KeyboardEvent): void => {
    if (this.blocked.has(event.code)) {
      event.preventDefault();
    }
    this.held.delete(event.code); this.blocked.delete(event.code);
  };
  private blur = (): void => { this.held.clear(); this.blocked.clear(); };
  constructor() {
    document.addEventListener("keydown", this.down, true);
    document.addEventListener("keyup", this.up, true);
    window.addEventListener("blur", this.blur);
  }
  enter(): void { this.blocked = new Set(this.held); this.openedAt = performance.now(); }
  allows(event?: KeyboardEvent): boolean {
    return !event || (!event.repeat && !this.blocked.has(event.code) && event.timeStamp > this.openedAt);
  }
  dispose(): void {
    if (this.disposed) return; this.disposed = true;
    document.removeEventListener("keydown", this.down, true);
    document.removeEventListener("keyup", this.up, true);
    window.removeEventListener("blur", this.blur);
  }
}
