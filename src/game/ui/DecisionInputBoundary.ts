/** Native input transition guard. Held gameplay keys must be released before
 * they can activate a newly focused decision. No timer-based activation delay. */
export class DecisionInputBoundary {
  private held = new Set<string>();
  private blocked = new Set<string>();
  private movement = new Set<string>();
  private static movementCodes = new Set(["KeyW","KeyA","KeyS","KeyD","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"]);
  private openedAt = -1;
  private disposed = false;
  private editable(target:EventTarget|null):boolean {
    return target instanceof Element && !!target.closest('input,textarea,select,[contenteditable="true"]');
  }
  private focus = (event:FocusEvent):void => { if(this.editable(event.target))this.enter(); };
  private down = (event: KeyboardEvent): void => {
    // Preserve native editing defaults while keeping Phaser shortcuts out.
    if(this.editable(event.target))event.stopImmediatePropagation();
    if ((event.code === "Space" && this.draftActive()) || this.blocked.has(event.code)) {
      event.preventDefault(); event.stopImmediatePropagation();
    }
    if (DecisionInputBoundary.movementCodes.has(event.code)) {
      if (this.gameplayActive() && !this.editable(event.target) && !this.blocked.has(event.code) && (!event.repeat || this.movement.has(event.code))) this.movement.add(event.code);
      else this.movement.delete(event.code);
    }
    this.held.add(event.code);
  };
  private up = (event: KeyboardEvent): void => {
    if(this.editable(event.target))event.stopImmediatePropagation();
    if ((event.code === "Space" && this.draftActive()) || this.blocked.has(event.code)) {
      event.preventDefault();
      // Phaser drops defaultPrevented keyups. Reset its adapter state explicitly
      // so the next fresh Space press is not mistaken for an old held key.
      this.clearGameplay();
    }
    this.movement.delete(event.code);
    this.held.delete(event.code); this.blocked.delete(event.code);
  };
  private blur = (): void => { this.held.clear(); this.blocked.clear(); this.movement.clear(); this.clearGameplay(); };
  private visibility = (): void => { if (document.hidden) this.blur(); };
  constructor(private gameplayActive = () => true, private draftActive = () => false, private clearGameplay = () => {}) {
    document.addEventListener("keydown", this.down, true);
    document.addEventListener("keyup", this.up, true);
    window.addEventListener("blur", this.blur);
    document.addEventListener("visibilitychange", this.visibility);
    document.addEventListener("focusin", this.focus);
  }
  enter(): void { this.blocked = new Set(this.held); this.movement.clear(); this.clearGameplay(); this.openedAt = performance.now(); }
  /** Native capture sees releases even when Phaser ignores a focused DOM control. */
  moving(code: string): boolean { return this.movement.has(code); }
  allows(event?: KeyboardEvent): boolean {
    return !event || (!event.repeat && !this.blocked.has(event.code) && event.timeStamp > this.openedAt);
  }
  dispose(): void {
    if (this.disposed) return; this.disposed = true;
    document.removeEventListener("keydown", this.down, true);
    document.removeEventListener("keyup", this.up, true);
    window.removeEventListener("blur", this.blur);
    document.removeEventListener("visibilitychange", this.visibility);
    document.removeEventListener("focusin", this.focus);
  }
}
