// Title screen: seed input + language + animated backdrop. DOM for text (Thai-safe).
import Phaser from "phaser";
import { t, setLang, getLang } from "../../i18n/i18n";
import { uiRoot, clearUI, el, button } from "../ui";
import { loadSave, storeSave } from "../../core/save/save";
import { generateRandomSeed } from "../../core/seed/hash";
import { sfx } from "../audio/sfx";
import { isQAMode, GOLDEN_QA_SEED } from "../../qa/qaMode";
import { ORIGINS, DEFAULT_ORIGIN, type OriginId } from "../../core/progression/origins";
import type { WeaponFamily } from "../../core/combat/weapons";

export const TITLE_SEED_KEY = "seed-game:pending-seed";
export const TITLE_ORIGIN_KEY = "seed-game:pending-origin";

export class TitleScene extends Phaser.Scene {
  private stars: { x: number; y: number; s: number; v: number }[] = [];

  constructor() {
    super("title");
  }

  create(): void {
    const save = loadSave(localStorage);
    setLang(save.settings.lang);
    sfx.setVolume(save.settings.volume);

    // COSMETIC-ONLY Math.random: title starfield never touches sim/worldgen state.
    const { width, height } = this.scale;
    this.stars = Array.from({ length: 160 }, () => ({
      x: Math.random() * width, y: Math.random() * height,
      s: Math.random() * 2 + 0.5, v: Math.random() * 24 + 6,
    }));
    this.renderStars();

    clearUI();
    const root = uiRoot();
    const screen = el("div", "screen");
    const panel = el("div", "panel");

    const logo = el("div", "logo", undefined, "-SEED");
    panel.appendChild(logo);
    // QA gate (?qa=1 only): one-click golden-seed start. Normal flow untouched.
    if (isQAMode(window.location.search)) {
      const gate = el("div", "qa-gate");
      gate.id = "qa-gate";
      const gh = document.createElement("div");
      gh.className = "qa-gate-title";
      gh.textContent = "-SEED HUMAN GATE A";
      gate.appendChild(gh);
      const gs = document.createElement("div");
      gs.className = "qa-gate-sub";
      gs.textContent = `Seed ${GOLDEN_QA_SEED} · Stone → Space → Boss → Ascension`;
      gate.appendChild(gs);
      const gn = document.createElement("div");
      gn.className = "qa-gate-sub";
      gn.textContent = "You only need to play. Everything else is recorded automatically. / แค่เล่น ที่เหลือระบบจดให้";
      gate.appendChild(gn);
      // P1-01: QA runs must use the HUMAN-selected Origin (never forced).
      let qaOrigin: OriginId = DEFAULT_ORIGIN;
      const qoRow = document.createElement("div");
      qoRow.className = "qa-origin-row";
      const qoBtns: HTMLButtonElement[] = [];
      for (const o of ORIGINS) {
        const b = document.createElement("button");
        b.id = `qa-origin-${o.id}`;
        b.className = "btn qa-origin-btn" + (o.id === qaOrigin ? " active" : "");
        b.textContent = `${t(o.nameKey)} (${o.families.map((f: WeaponFamily) => t(`family.${f}` as never)).join("+")})`;
        b.addEventListener("click", () => {
          sfx.unlock(); sfx.select();
          qaOrigin = o.id;
          for (const x of qoBtns) x.classList.remove("active");
          b.classList.add("active");
        });
        qoRow.appendChild(b);
        qoBtns.push(b);
      }
      gate.appendChild(qoRow);
      const startQa = document.createElement("button");
      startQa.id = "qa-start-playtest";
      startQa.className = "btn primary";
      startQa.textContent = "START PLAYTEST";
      startQa.addEventListener("click", () => {
        sfx.unlock(); sfx.select();
        sessionStorage.setItem(TITLE_SEED_KEY, GOLDEN_QA_SEED);
        sessionStorage.setItem(TITLE_ORIGIN_KEY, qaOrigin);
        this.scene.start("game");
      });
      gate.appendChild(startQa);
      panel.insertBefore(gate, panel.firstChild);
    }    const sub = el("div", "title-th", undefined, getLang() === "th" ? "เมล็ดพันธุ์แห่งอารยธรรม" : "-SEED");
    panel.appendChild(sub);
    const tag = el("div", "logo-sub", "app.tagline");
    panel.appendChild(tag);

    const seedRow = el("div", "seed-row");
    const input = document.createElement("input");
    input.id = "seed-input";
    input.placeholder = t("ui.seedPlaceholder");
    input.maxLength = 64;
    input.spellcheck = false;
    seedRow.appendChild(input);
    const dice = button("ui.randomSeed", () => {
      sfx.unlock(); sfx.select();
      input.value = generateRandomSeed();
    });
    seedRow.appendChild(dice);
    panel.appendChild(seedRow);

    // Civilization Origin: two starting weapon families (ADR-0006 Decision 1).
    let pickedOrigin: OriginId = DEFAULT_ORIGIN;
    panel.appendChild(el("div", "origin-title", "ui.chooseOrigin"));
    const descLine = el("div", "logo-sub", ORIGINS[0]!.descKey as never);
    const oRow = el("div", "btn-row");
    const oBtns: HTMLButtonElement[] = [];
    for (const o of ORIGINS) {
      const b = document.createElement("button");
      b.className = "btn" + (o.id === pickedOrigin ? " active" : "");
      b.textContent = `${t(o.nameKey)} (${o.families.map((f: WeaponFamily) => t(`family.${f}` as never)).join("+")})`;
      b.addEventListener("click", () => {
        sfx.unlock(); sfx.select();
        pickedOrigin = o.id;
        for (const x of oBtns) x.classList.remove("active");
        b.classList.add("active");
        descLine.textContent = t(o.descKey);
      });
      oRow.appendChild(b);
      oBtns.push(b);
    }
    panel.appendChild(oRow);
    panel.appendChild(descLine);

    const start = button("ui.startGame", () => {
      sfx.unlock(); sfx.select();
      const raw = input.value.trim() || generateRandomSeed();
      sessionStorage.setItem(TITLE_SEED_KEY, raw);
      sessionStorage.setItem(TITLE_ORIGIN_KEY, pickedOrigin);
      this.scene.start("game");
    }, "btn primary");
    start.style.width = "100%";
    panel.appendChild(start);

    const row = el("div", "btn-row");
    row.appendChild(button("ui.settings", () => this.showSettings()));
    const langBtn = document.createElement("button");
    langBtn.className = "btn";
    langBtn.textContent = getLang() === "th" ? "English" : "ไทย";
    langBtn.addEventListener("click", () => {
      const save2 = loadSave(localStorage);
      save2.settings.lang = getLang() === "th" ? "en" : "th";
      storeSave(localStorage, save2);
      setLang(save2.settings.lang);
      this.scene.restart();
    });
    row.appendChild(langBtn);
    panel.appendChild(row);

    screen.appendChild(panel);
    root.appendChild(screen);
  }

  private renderStars(): void {
    const g = this.add.graphics();
    const draw = (): void => {
      g.clear();
      g.fillStyle(0x0b0e14, 1);
      g.fillRect(0, 0, this.scale.width, this.scale.height);
      g.fillStyle(0xffffff, 1);
      for (const s of this.stars) g.fillCircle(s.x, s.y, s.s);
    };
    draw();
    this.time.addEvent({
      delay: 50, loop: true,
      callback: () => {
        const dt = 0.05;
        for (const s of this.stars) {
          s.y += s.v * dt;
          if (s.y > this.scale.height) { s.y = -4; s.x = Math.random() * this.scale.width; }
        }
        draw();
      },
    });
  }

  private showSettings(): void {
    const save = loadSave(localStorage);
    clearUI();
    const root = uiRoot();
    const screen = el("div", "screen");
    const panel = el("div", "panel");
    panel.appendChild(el("h2", "", "ui.settings"));

    const volRow = el("div", "settings-row");
    volRow.appendChild(el("span", "", "ui.volume"));
    const vol = document.createElement("input");
    vol.type = "range"; vol.min = "0"; vol.max = "100";
    vol.value = String(Math.round(save.settings.volume * 100));
    vol.addEventListener("input", () => {
      save.settings.volume = Number(vol.value) / 100;
      sfx.setVolume(save.settings.volume);
      storeSave(localStorage, save);
    });
    volRow.appendChild(vol);
    panel.appendChild(volRow);

    const shakeRow = el("div", "settings-row");
    shakeRow.appendChild(el("span", "", "ui.shake"));
    const sh = document.createElement("input");
    sh.type = "checkbox"; sh.checked = save.settings.shake;
    sh.addEventListener("change", () => {
      save.settings.shake = sh.checked;
      storeSave(localStorage, save);
    });
    shakeRow.appendChild(sh);
    panel.appendChild(shakeRow);

    const contrastRow = el("div", "settings-row");
    contrastRow.appendChild(el("span", "", "ui.contrast"));
    const contrasts = el("div", "lang-row");
    const bNormal = document.createElement("button");
    bNormal.className = "btn" + (save.settings.contrast === "normal" ? " active" : "");
    bNormal.textContent = t("ui.contrastNormal");
    bNormal.addEventListener("click", () => {
      save.settings.contrast = "normal"; storeSave(localStorage, save); this.scene.restart();
    });
    const bHigh = document.createElement("button");
    bHigh.className = "btn" + (save.settings.contrast === "high" ? " active" : "");
    bHigh.textContent = t("ui.contrastHigh");
    bHigh.addEventListener("click", () => {
      save.settings.contrast = "high"; storeSave(localStorage, save); this.scene.restart();
    });
    contrasts.appendChild(bNormal); contrasts.appendChild(bHigh);
    contrastRow.appendChild(contrasts);
    panel.appendChild(contrastRow);

    const langRow = el("div", "settings-row");
    langRow.appendChild(el("span", "", "ui.language"));
    const langs = el("div", "lang-row");
    const bEn = document.createElement("button");
    bEn.className = "btn" + (save.settings.lang === "en" ? " active" : "");
    bEn.textContent = "English";
    bEn.addEventListener("click", () => {
      save.settings.lang = "en"; storeSave(localStorage, save); setLang("en"); this.scene.restart();
    });
    const bTh = document.createElement("button");
    bTh.className = "btn" + (save.settings.lang === "th" ? " active" : "");
    bTh.textContent = "ไทย";
    bTh.addEventListener("click", () => {
      save.settings.lang = "th"; storeSave(localStorage, save); setLang("th"); this.scene.restart();
    });
    langs.appendChild(bEn); langs.appendChild(bTh);
    langRow.appendChild(langs);
    panel.appendChild(langRow);

    panel.appendChild(button("ui.back", () => this.scene.restart()));
    screen.appendChild(panel);
    root.appendChild(screen);
  }

  update(): void { /* starfield redrawn on timer */ }
}
