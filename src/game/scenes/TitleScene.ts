import {legacyCollectionPanel} from '../legacyCollectionPanel';
import {settingsControls} from '../ui/settingsControls';
import {menuNavigation} from '../ui/menuNavigation';
import {showGuide} from '../ui/guidePanel';
// Title screen: seed input + language + animated backdrop. DOM for text (Thai-safe).
import Phaser from "phaser";
import {heroPortrait} from "../ui/heroPortrait";
import { ARCHIVE_REWARDS, purchaseArchive } from "../../core/progression/archiveLedger";
import { t, setLang, getLang } from "../../i18n/i18n";
import { uiRoot, clearUI, el, button, applyUiScale } from "../ui";
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
  private titleSeed = '';
  private titleOrigin: OriginId = DEFAULT_ORIGIN;
  private returnToSettings = false;

  constructor() {
    super("title");
  }

  create(): void {
    const save = loadSave(localStorage);
    setLang(save.settings.lang);
    applyUiScale(save.settings.uiScale);
    document.documentElement.dataset.contrast = save.settings.contrast;
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
    const screen = el("div", "screen title-screen");
    const layout = el("main", "title-layout");
    const panel = el("section", "panel title-play");
    const content = el("div", "title-content");
    panel.append(content);

    const logo = el("div", "logo", undefined, "-SEED");
    content.appendChild(logo);
    // Civilization Origin: two starting weapon families (ADR-0006 Decision 1).
    // ONE shared selector — QA mode reuses it (no duplicated start UI).
    let pickedOrigin: OriginId = this.titleOrigin;
    // QA gate (?qa=1 only): small testing banner + one-click golden-seed start.
    if (isQAMode(window.location.search)) {
      // Optional explicit QA seed: ?qa=1&seed=EPOCH-AET4-3SFC (recorder stores
      // the actual seed; golden regression tests keep EPOCH-GOLDEN-001).
      const qaSeedParam = new URLSearchParams(window.location.search).get("seed");
      const qaSeed = qaSeedParam && qaSeedParam.trim() !== "" ? qaSeedParam.trim() : GOLDEN_QA_SEED;
      const gate = el("div", "qa-gate");
      gate.id = "qa-gate";
      const gh = document.createElement("div");
      gh.className = "qa-gate-title";
      gh.textContent = t("qa.banner");
      gate.appendChild(gh);
      const gn = document.createElement("div");
      gn.className = "qa-gate-sub";
      gn.textContent = t("qa.recorded");
      gate.appendChild(gn);
      const gs = document.createElement("div");
      gs.className = "qa-gate-sub";
      gs.textContent = `seed: ${qaSeed}`;
      gate.appendChild(gs);
      const startQa = document.createElement("button");
      startQa.id = "qa-start-playtest";
      startQa.className = "btn primary";
      startQa.textContent = "START PLAYTEST";
      startQa.addEventListener("click", () => {
        sfx.unlock(); sfx.select();
        sessionStorage.setItem(TITLE_SEED_KEY, qaSeed);
        sessionStorage.setItem(TITLE_ORIGIN_KEY, pickedOrigin);
        this.scene.start("game");
      });
      gate.appendChild(startQa);
      content.insertBefore(gate, content.firstChild);
    }    const sub = el("div", "title-th", undefined, getLang() === "th" ? "เมล็ดพันธุ์แห่งอารยธรรม" : "-SEED");
    content.appendChild(sub);
    const tag = el("div", "logo-sub", "app.tagline");
    content.appendChild(tag);

    const seedRow = el("div", "seed-row");
    const input = document.createElement("input");
    input.id = "seed-input"; input.setAttribute("aria-label", t("ui.seedPlaceholder"));
    input.placeholder = t("ui.seedPlaceholder");
    input.maxLength = 64;
    input.value = this.titleSeed;
    input.addEventListener('input',()=>{this.titleSeed=input.value;});
    input.spellcheck = false;
    seedRow.appendChild(input);
    const dice = button("ui.randomSeed", () => {
      sfx.unlock(); sfx.select();
      input.value = generateRandomSeed();
      this.titleSeed = input.value;
    });
    seedRow.appendChild(dice);
    content.appendChild(seedRow);

    // Shared Origin selector (normal + QA flows read pickedOrigin).
    const formatOriginDesc = (o: typeof ORIGINS[0]) =>
      `${t(o.descKey)} · [F] ${t(o.ability.nameKey)} (${o.ability.cooldown}s) · ${t(o.strategyKey)}`;
    const descLine = document.createElement("div");
    descLine.className = "logo-sub";
    descLine.textContent = formatOriginDesc(ORIGINS.find(o=>o.id===pickedOrigin)!);
    const oRow = el("div", "origin-grid");
    const oBtns: HTMLButtonElement[] = [];
    for (const o of ORIGINS) {
      const b = document.createElement("button");
      b.className = "btn origin-choice" + (o.id === pickedOrigin ? " active" : "");
      // Stable hook for automation; the selector itself stays shared.
      if (isQAMode(window.location.search)) b.id = `qa-origin-${o.id}`;
      b.textContent = `${t(o.nameKey)} (${o.families.map((f: WeaponFamily) => t(`family.${f}` as never)).join("+")})`;
      b.setAttribute("aria-pressed", String(o.id === pickedOrigin));
      const portrait = heroPortrait(o.id);
      // Strip is cropped to the first anchored pose, never squashed into a portrait.
      const crop = el("span", "origin-portrait-crop"); crop.append(portrait); b.prepend(crop);
      b.addEventListener("click", () => {
        sfx.unlock(); sfx.select();
        for (const x of oBtns) x.setAttribute("aria-pressed", "false");
        b.setAttribute("aria-pressed", "true");
        pickedOrigin = o.id;
        this.titleOrigin = o.id;
        for (const x of oBtns) x.classList.remove("active");
        b.classList.add("active");
        descLine.textContent = formatOriginDesc(o);
      });
      oRow.appendChild(b);
      oBtns.push(b);
    }
    content.appendChild(oRow);
    const originInfo=document.createElement('details');originInfo.className='title-origin-info';
    const originSummary=document.createElement('summary');originSummary.textContent=t('ui.originStrategy');originInfo.append(originSummary,descLine);content.append(originInfo);

    const start = button("ui.startGame", () => {
      sfx.unlock(); sfx.select();
      const raw = input.value.trim() || generateRandomSeed();
      sessionStorage.setItem(TITLE_SEED_KEY, raw);
      sessionStorage.setItem(TITLE_ORIGIN_KEY, pickedOrigin);
      this.scene.start("game");
    }, "btn primary");
    start.id = "start-btn";
    start.style.width = "100%";
    const footer = el("div", "title-actions"); footer.appendChild(start); panel.appendChild(footer);
    const archive = document.createElement("details"); archive.id = "archive-panel";
    const summary = document.createElement("summary"); archive.appendChild(summary);
    const choices = el("div", "archive-choices"); archive.appendChild(choices);
    const renderArchive = () => {
      const saved = loadSave(localStorage);
      summary.textContent = t("meta.title") + ' · ' + t("meta.insight") + ': ' + saved.meta.insight;
      choices.replaceChildren();
      for (const option of ARCHIVE_REWARDS) {
        const row = el("div", "archive-item");
        row.append(el("h3", "", option.titleKey), el("p", "", option.descKey));
        const buy = button("meta.buy", () => {
          const fresh = loadSave(localStorage); fresh.meta = purchaseArchive(fresh.meta, option.id);
          if (storeSave(localStorage, fresh)) renderArchive(); else row.append(el("p", "", "meta.storage"));
        });
        buy.dataset.archiveId = option.id;
        const owned = saved.meta.purchased.includes(option.id);
        buy.textContent = owned ? t("meta.owned") : t("meta.buy") + ' · ' + option.cost + ' ' + t("meta.insight");
        buy.disabled = owned || saved.meta.insight < option.cost; row.append(buy); choices.append(row);
      }
      if (saved.meta.purchased.includes("energy-kit")) {
        const label = document.createElement("label"); const choice = document.createElement("input");
        choice.type = "checkbox"; choice.checked = saved.meta.energyStart; choice.id = "archive-energy-start";
        choice.addEventListener("change", () => { const fresh = loadSave(localStorage); fresh.meta.energyStart = choice.checked; if (!storeSave(localStorage, fresh)) { choice.checked = saved.meta.energyStart; label.append(t("meta.storage")); } });
        label.append(choice, t("meta.energyStart")); choices.append(label);
      }
    };
    renderArchive();
    const legacy=el('aside','title-legacy');
    const collection=legacyCollectionPanel();collection.setAttribute('open','');
    legacy.append(collection,archive);layout.append(legacy);

    const row = el("div", "btn-row");
    const settings=button("ui.settings", () => this.showSettings());settings.id='title-settings-btn';row.append(settings);
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
    const help=button('ui.guide',()=>showGuide(help));help.id='title-help-btn';row.append(help);
    footer.appendChild(row);

    layout.prepend(panel); screen.appendChild(layout);
    root.appendChild(screen);
    if(this.returnToSettings){this.returnToSettings=false;settings.focus();}
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
    clearUI();const screen=el('div','screen');screen.id='title-settings';
    const panel=el('section','panel panel-lg settings-panel');panel.append(el('h2','','ui.settings'));
    panel.append(settingsControls('title',key=>{
      if(key==='lang'){setLang(loadSave(localStorage).settings.lang);this.showSettings();}
    }));
    const tutorial=button('ui.resetTutorial',()=>{const fresh=loadSave(localStorage);fresh.settings.tutorialCompleted=false;
      if(storeSave(localStorage,fresh)){tutorial.textContent='✓ '+t('ui.tutorialResetDone');tutorial.disabled=true;}
    });
    const back=()=>{this.returnToSettings=true;this.scene.restart();};
    const actions=el('div','dialog-actions');actions.append(tutorial,button('ui.back',back,'btn primary'));panel.append(actions);
    screen.append(panel);uiRoot().append(screen);menuNavigation(screen,back);
  }

  update(): void { /* starfield redrawn on timer */ }
}
