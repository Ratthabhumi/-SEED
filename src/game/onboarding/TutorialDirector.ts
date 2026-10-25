/**
 * TutorialDirector — Contextual, progressive first-run onboarding system.
 *
 * Strict architectural boundaries:
 * - Presentation layer ONLY: lives under src/game/onboarding/
 * - Observes canonical simulation state without ever mutating RunState
 * - Never alters enemy stats, damage, knowledge drops, worldgen, or RNG
 * - Can pause simulation only while an explicit blocking modal is displayed
 * - Safe persistence: remembers tutorial completion in user settings
 */
import type { GameScene } from "../scenes/GameScene";
import type { RunSimulation } from "../../core/sim/RunSimulation";
import type { SimEvent } from "../../core/sim/SimEvent";
import { t } from "../../i18n/i18n";
import { uiRoot, el, button } from "../ui";
import { loadSave, storeSave } from "../../core/save/save";

export type TutorialStepId =
  | "intro"
  | "move"
  | "dash"
  | "knowledge"
  | "age_gate"
  | "first_draft"
  | "tech_map"
  | "poi_territory"
  | "outpost"
  | "command"
  | "civ_map"
  | "completed";

export class TutorialDirector {
  private completed: boolean;
  private currentStep: TutorialStepId = "intro";
  private bannerEl: HTMLElement | null = null;
  private stepTimer = 0;
  private stepDone = new Set<string>();

  constructor(completed = false) {
    this.completed = completed;
    if (completed) {
      this.currentStep = "completed";
    }
  }

  dispose(): void {
    this.hideBanner();
    document.getElementById("tutorial-intro-screen")?.remove();
  }

  reset(): void {
    this.resetTutorial();
  }

  get isCompleted(): boolean {
    return this.completed;
  }

  /**
   * Start onboarding. If first time ever, shows the 2-part intro modal.
   * If tutorial was already completed or skipped, starts in passive mode.
   */
  start(): void {
    if (this.completed) return;
    this.showIntroModal();
  }

  /** Short 2-part introductory modal on first run. */
  private showIntroModal(): void {
    const root = uiRoot();
    const screen = el("div", "screen");
    screen.id = "tutorial-intro-screen";

    const modal = el("div", "panel panel-md tutorial-intro-modal");

    // Part 1
    const title = el("h2", "", "tutorial.intro1.title");
    const body = el("p", "", "tutorial.intro1.body");
    body.style.fontSize = "var(--font-body)";
    body.style.lineHeight = "1.8";
    body.style.margin = "16px 0 24px";

    const btnRow = el("div", "btn-row");
    const nextBtn = button("tutorial.intro2.title", () => {
      // Transition to Part 2: same modal, but the button's semantic contract
      // changes (Next → Start), so its stable ID changes with it.
      title.textContent = t("tutorial.intro2.title");
      body.textContent = t("tutorial.intro2.body");
      nextBtn.textContent = t("tutorial.btn.start");
      nextBtn.id = "tutorial-start-btn";
      nextBtn.onclick = (e) => {
        e.stopPropagation();
        screen.remove();
        this.currentStep = "move";
        this.showBanner(t("tutorial.step.move"), 10);
      };
    }, "btn primary");
    // Part 1 contract: advances the intro, does NOT start the run.
    nextBtn.id = "tutorial-next-btn";

    const skipBtn = button("tutorial.btn.skip", () => {
      this.skipTutorial();
      screen.remove();
    }, "tutorial-skip-btn");

    btnRow.appendChild(nextBtn);
    btnRow.appendChild(skipBtn);

    modal.appendChild(title);
    modal.appendChild(body);
    modal.appendChild(btnRow);
    screen.appendChild(modal);
    root.appendChild(screen);
  }

  public skipTutorial(): void {
    this.completed = true;
    this.currentStep = "completed";
    this.hideBanner();
    const save = loadSave(localStorage);
    save.settings.tutorialCompleted = true;
    storeSave(localStorage, save);
  }

  public resetTutorial(): void {
    this.completed = false;
    this.currentStep = "intro";
    this.stepDone.clear();
    const save = loadSave(localStorage);
    save.settings.tutorialCompleted = false;
    storeSave(localStorage, save);
  }

  /** Frame update: checks progressive contextual triggers. */
  update(dt: number, simOrState: RunSimulation | import("../../core/sim/RunState").RunState): void {
    if (this.completed || this.currentStep === "completed") return;

    if (this.stepTimer > 0) {
      this.stepTimer -= dt;
      if (this.stepTimer <= 0) {
        this.hideBanner();
      }
    }

    const s = "state" in simOrState ? simOrState.state : simOrState;
    if (s.over) {
      this.hideBanner();
      return;
    }

    const distMoved = Math.hypot(s.px, s.py);

    switch (this.currentStep) {
      case "move":
        if (distMoved > 60) {
          this.advanceStep("dash", t("tutorial.step.dash"), 8);
        }
        break;

      case "dash":
        if (s.knowledgeTotal > 0 || s.pickups.some((k) => !k.active)) {
          this.advanceStep("knowledge", t("tutorial.step.knowledge"), 9);
        }
        break;

      case "knowledge":
        if (s.knowledgeTotal >= 50 || s.ageElapsed > 20) {
          this.advanceStep("age_gate", t("tutorial.step.ageGate"), 9);
        }
        break;

      case "age_gate":
        if (s.draftOpen || s.owned.length > 0) {
          this.advanceStep("first_draft", t("tutorial.step.draft"), 10);
        }
        break;

      case "first_draft":
        if (s.owned.length >= 1 && !s.draftOpen) {
          this.advanceStep("tech_map", t("tutorial.step.techMap"), 10);
        }
        break;

      case "tech_map":
        // Advanced when Tech Map is opened (see onTechMapOpened)
        break;

      case "poi_territory":
        if (s.territories.length > 0) {
          this.advanceStep("outpost", t("tutorial.step.outpost"), 10);
        }
        break;

      case "outpost":
        if (s.territories.some((t) => t.spec !== "")) {
          this.advanceStep("command", t("tutorial.step.command"), 10);
        }
        break;

      case "command":
        // Advanced on squad command or after time
        break;

      case "civ_map":
        // Advanced when Civ Map is opened
        break;
    }
  }

  /** Hooked to simulation events outside RunSimulation. */
  onSimEvents(events: readonly SimEvent[]): void {
    if (this.completed) return;

    for (const e of events) {
      if (e.type === "poi_discovered" && this.currentStep !== "completed") {
        if (!this.stepDone.has("poi_territory")) {
          this.advanceStep("poi_territory", t("tutorial.step.territory"), 10);
        }
      }
      if (e.type === "territory_claimed" && this.currentStep === "poi_territory") {
        this.advanceStep("outpost", t("tutorial.step.outpost"), 10);
      }
      if (e.type === "squad_command" && this.currentStep === "command") {
        this.advanceStep("civ_map", t("tutorial.step.civMap"), 10);
      }
    }
  }

  onDraftOpened(): void {
    if (this.completed) return;
    if (!this.stepDone.has("first_draft")) {
      this.stepDone.add("first_draft");
      this.showBanner(t("tutorial.step.draft"), 12);
    }
  }

  onTechMapOpened(): void {
    if (this.completed) return;
    if (this.currentStep === "tech_map") {
      this.stepDone.add("tech_map");
      this.advanceStep("poi_territory", t("tutorial.step.territory"), 10);
    }
  }

  onCivMapOpened(): void {
    if (this.completed) return;
    if (this.currentStep === "civ_map") {
      this.currentStep = "completed";
      this.completed = true;
      const save = loadSave(localStorage);
      save.settings.tutorialCompleted = true;
      storeSave(localStorage, save);
      this.hideBanner();
    }
  }

  private advanceStep(next: TutorialStepId, message: string, durationSeconds: number): void {
    this.currentStep = next;
    this.stepDone.add(next);
    this.showBanner(message, durationSeconds);
  }

  private showBanner(message: string, durationSeconds: number): void {
    this.hideBanner();

    // Contextual coachmarks live in the shared #context-stack lane (left of
    // play, clear of HUD safe zones) — never floating over the Knowledge bar.
    const root = document.getElementById("context-stack") ?? uiRoot();
    const banner = el("div", "tutorial-step-banner");
    banner.id = "tutorial-banner";

    const text = document.createElement("span");
    text.textContent = message;
    banner.appendChild(text);

    const skip = document.createElement("button");
    skip.className = "tutorial-skip-btn";
    skip.textContent = t("tutorial.btn.skip");
    skip.addEventListener("click", () => {
      this.skipTutorial();
    });
    banner.appendChild(skip);

    root.appendChild(banner);
    this.bannerEl = banner;
    this.stepTimer = durationSeconds;
  }

  private hideBanner(): void {
    if (this.bannerEl) {
      this.bannerEl.remove();
      this.bannerEl = null;
    }
    document.getElementById("tutorial-banner")?.remove();
  }
}
