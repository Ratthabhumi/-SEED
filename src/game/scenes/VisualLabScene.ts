// Visual Language Lab (?visual=1) — presentation review only, never gameplay.
// Renders every visual token with the SAME render modules the game uses,
// on dark + light-ish backgrounds, with an EN/TH toggle for UI strings.
import Phaser from "phaser";
import { t, setLang, getLang } from "../../i18n/i18n";
import type { EnKeys } from "../../i18n/en";
import { ENEMY_LINEAGE, BIOME_STYLE } from "../../content/content";
import type { AgeId } from "../../core/tech/graph";
import type { BiomeId } from "../../core/world/biome";
import type { SimEnemy } from "../../core/sim/RunState";
import type { EnemyFamily, EliteAffix } from "../../core/director/director";
import type { POIType } from "../../core/world/poi";
import { drawEnemy } from "../render/EnemyRenderer";
import { drawPlayer } from "../render/PlayerRenderer";
import {
  drawFriendlyProj, drawHostileProj, drawBeam, drawAura, drawOrbit, drawSummon, drawMine, drawKnowledge,
} from "../render/ProjectileRenderer";
import { drawPoi } from "../render/WorldRenderer";
import { loadSave, storeSave } from "../../core/save/save";

const DARK_BG = 0x0b0e14;
const LIGHT_BG = 0x4a3d28; // light-ish arid-like wash for contrast review

function fakeEnemy(family: EnemyFamily, affix: EliteAffix | "" = "", boss = false): SimEnemy {
  return {
    active: true, x: 0, y: 0, hp: 50, maxHp: 100, shield: affix === "shielded" ? 10 : 0,
    family, speed: 100, dmg: 8, radius: boss ? 34 : 14, xp: 5,
    elite: affix !== "" || boss, affix, flash: 0, shootT: family === "ranged" ? 0.3 : 2,
    boss, hitCd: 0,
  };
}

export class VisualLabScene extends Phaser.Scene {
  constructor() {
    super("visual-lab");
  }

  create(): void {
    const save = loadSave(localStorage);
    setLang(save.settings.lang);
    this.buildToolbar();
    // Rows may exceed viewport height — wheel scrolls the review column.
    this.input.on("wheel", (pointer: Phaser.Input.Pointer, objs: unknown[], dx: number, dy: number) => {
      void pointer;
      void objs;
      void dx;
      this.cameras.main.scrollY = Math.max(0, this.cameras.main.scrollY + dy);
    });
    const g = this.add.graphics();
    let y = 76;
    y = this.row(g, "PLAYER — core + notch", y, (gg, x, yy, time) => {
      drawPlayer(gg, x, yy, 16, { facing: -0.5, dashing: false, iframe: false, hurtFlash: false, time, highContrast: false });
      drawPlayer(gg, x + 70, yy, 16, { facing: -0.5, dashing: true, iframe: false, hurtFlash: false, time, highContrast: false });
      drawPlayer(gg, x + 140, yy, 16, { facing: -0.5, dashing: false, iframe: true, hurtFlash: false, time, highContrast: false });
    });
    y = this.row(g, "ENEMIES — chaser / ranged(+aim) / tank / swarm", y, (gg, x, yy, time) => {
      const fams: EnemyFamily[] = ["chaser", "ranged", "tank", "swarm"];
      fams.forEach((f, i) => {
        const e = fakeEnemy(f);
        e.x = x + i * 70;
        e.y = yy;
        drawEnemy(gg, e, { bodyColor: ENEMY_LINEAGE[f].color["stone" as AgeId], facing: 0, time, highContrast: false });
      });
    });
    y = this.row(g, "ELITES — swift / armored / volatile / splitter / shielded", y, (gg, x, yy, time) => {
      const affs: EliteAffix[] = ["swift", "armored", "volatile", "splitter", "shielded"];
      affs.forEach((a, i) => {
        const e = fakeEnemy("chaser", a);
        e.x = x + i * 60;
        e.y = yy;
        drawEnemy(gg, e, { bodyColor: 0xb0653a, facing: 0, time, highContrast: false });
      });
    });
    y = this.row(g, "BOSS — hex + crown (never a big tank)", y, (gg, x, yy, time) => {
      const e = fakeEnemy("tank", "", true);
      e.x = x + 40;
      e.y = yy;
      drawEnemy(gg, e, { bodyColor: 0x5c2e8c, facing: 0, time, highContrast: false });
    });
    y = this.row(g, "SHOTS — friendly / hostile / knowledge / mine", y, (gg, x, yy, time) => {
      drawFriendlyProj(gg, { active: true, x, y: yy, vx: 400, vy: 0, dmg: 10, radius: 6, life: 1, friendly: true, color: 0x7fd4ff, src: "lab" });
      drawHostileProj(gg, { active: true, x: x + 60, y: yy, vx: -300, vy: 0, dmg: 8, radius: 6, life: 1, friendly: false, color: 0xff4444, src: "lab" }, { time, highContrast: false });
      drawKnowledge(gg, { active: true, x: x + 120, y: yy, value: 10 });
      drawMine(gg, { active: true, x: x + 180, y: yy, dmg: 20, radius: 60, life: 9 }, { time, highContrast: false });
    });
    y = this.row(g, "ARCHETYPES — beam / aura / orbit / summon", y, (gg, x, yy, time) => {
      drawBeam(gg, x - 40, yy, x + 40, yy - 20, 6, 0xfff07f);
      drawAura(gg, x + 110, yy, 26, 0xffb03c);
      drawOrbit(gg, x + 190, yy, 22, 3, time, 0xb48cff, 6);
      drawSummon(gg, x + 260, yy - 10, 7, 0x7fb8ff, x + 230, yy + 20);
    });
    y = this.row(g, "POI BEACONS — ruin / meteor / vault / signal / megasite / worldtree", y, (gg, x, yy, time) => {
      const types: POIType[] = ["ruin", "meteor", "vault", "signal", "megasite", "worldtree"];
      types.forEach((tp, i) => {
        drawPoi(gg, { wx: x + i * 48, wy: yy + 30, found: false, time, highContrast: false });
        void tp;
      });
    });
    y = this.row(g, "BIOMES — verdant / arid / tundra / badlands", y, (gg, x) => {
      const biomes: BiomeId[] = ["verdant", "arid", "tundra", "badlands"];
      biomes.forEach((b, i) => {
        gg.fillStyle(BIOME_STYLE[b].ground, 1);
        gg.fillRect(x + i * 70, y - 24, 62, 48);
        gg.fillStyle(BIOME_STYLE[b].groundAlt, 0.55);
        gg.fillEllipse(x + i * 70 + 31, y, 56, 40);
        gg.fillStyle(BIOME_STYLE[b].accent, 0.9);
        gg.fillCircle(x + i * 70 + 31, y, 6);
      });
    });
    this.buildStrings();
  }

  /** One review row: title + dark swatch + light swatch, returns next y. */
  private row(
    g: Phaser.GameObjects.Graphics, title: string, y: number,
    draw: (gg: Phaser.GameObjects.Graphics, x: number, yy: number, time: number) => void,
  ): number {
    const time = 1.2; // fixed clock → deterministic lab stills
    this.add.text(16, y, title, { fontSize: "14px", color: "#9aa7b5", fontFamily: "monospace" });
    const yy = y + 52;
    g.fillStyle(DARK_BG, 1);
    g.fillRect(16, yy - 34, 380, 76);
    g.lineStyle(1, 0x2a3444, 1);
    g.strokeRect(16, yy - 34, 380, 76);
    draw(g, 60, yy, time);
    g.fillStyle(LIGHT_BG, 1);
    g.fillRect(412, yy - 34, 380, 76);
    g.lineStyle(1, 0x2a3444, 1);
    g.strokeRect(412, yy - 34, 380, 76);
    draw(g, 456, yy, time);
    return y + 116;
  }

  private buildToolbar(): void {
    let bar = document.getElementById("visual-lab");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "visual-lab-bar";
      bar.style.cssText = "position:fixed;top:0;left:0;right:0;z-index:40;display:flex;gap:8px;align-items:center;padding:8px 12px;background:rgba(8,12,18,0.92);";
      const h = document.createElement("span");
      h.textContent = "VISUAL LANGUAGE LAB";
      h.style.cssText = "color:#ffd166;font-weight:800;";
      const en = document.createElement("button");
      en.className = "btn";
      en.textContent = "English";
      en.addEventListener("click", () => this.switchLabLang("en"));
      const th = document.createElement("button");
      th.className = "btn";
      th.textContent = "ไทย";
      th.addEventListener("click", () => this.switchLabLang("th"));
      bar.appendChild(h);
      bar.appendChild(en);
      bar.appendChild(th);
      document.body.appendChild(bar);
    }
  }

  private switchLabLang(code: "en" | "th"): void {
    const save = loadSave(localStorage);
    save.settings.lang = code;
    storeSave(localStorage, save);
    setLang(code);
    this.buildStrings();
  }

  /** Real localized player-facing strings — the TH readability proof surface. */
  private buildStrings(): void {
    let box = document.getElementById("visual-lab-strings");
    if (!box) {
      box = document.createElement("div");
      box.id = "visual-lab-strings";
      box.style.cssText = "position:fixed;right:16px;top:60px;bottom:16px;width:min(360px,40vw);overflow-y:auto;z-index:39;background:rgba(13,18,28,0.94);border:1px solid #2a3444;border-radius:10px;padding:10px 14px;";
      document.body.appendChild(box);
    }
    box.innerHTML = "";
    const lang = getLang() === "th" ? "ไทย" : "English";
    const head = document.createElement("h3");
    head.textContent = `UI STRINGS (${lang})`;
    head.style.cssText = "color:#9aa7b5;font-size:14px;margin:0 0 6px;";
    box.appendChild(head);
    const keys: EnKeys[] = [
      "age.stone", "age.bronze", "age.iron", "age.industrial", "age.atomic", "age.space",
      "rarity.common", "rarity.uncommon", "rarity.rare", "rarity.mythic",
      "ui.boss", "ui.ascend", "ui.chooseTech", "ui.pause", "ui.died",
      "poi.ruin.name", "poi.meteor.name", "poi.vault.name", "poi.signal.name",
      "objective.space", "hint.move", "hint.gated", "hint.poi",
      "tech.spine-orbital.name", "tech.anomaly.description",
    ];
    for (const k of keys) {
      const d = document.createElement("div");
      d.style.cssText = "color:#eef2f6;font-size:15px;line-height:1.8;border-bottom:1px solid #1c2534;";
      d.textContent = `${k}: ${t(k)}`;
      box.appendChild(d);
    }
  }
}
