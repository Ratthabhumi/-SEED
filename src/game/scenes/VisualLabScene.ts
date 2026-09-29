// Visual Language Lab (?visual=1) — presentation review only, never gameplay.
// Renders every visual token with the SAME render modules the game uses,
// plus deterministic composite stress scenes (LabSpec) and a contrast-matrix
// review against all four biome grounds. Fixed clock → deterministic stills.
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
import { contrastFilter, type LabContrastMode } from "../render/VisualLanguage";
import {
  LAB_SECTIONS, COMPOSITES, CONTRAST_MATRIX_TOKENS,
  type CompositeSpec, type CompositePlacement,
} from "../render/LabSpec";
import { loadSave, storeSave } from "../../core/save/save";

// Lab-local presentation state (module scope so a restart redraws the mode).
let labContrast: LabContrastMode = "normal";

function labHighContrast(): boolean {
  return labContrast === "high";
}

/** Apply the CSS grayscale diagnostic to the lab canvas (DOM only). */
function applyLabFilter(): void {
  const canvas = document.querySelector("#app canvas") as HTMLElement | null;
  if (canvas) canvas.style.filter = contrastFilter(labContrast);
}

const FAMILY_RADIUS: Record<EnemyFamily, number> = {
  chaser: 14,
  ranged: 12,
  tank: 20,
  swarm: 9,
};

function fakeEnemy(family: EnemyFamily, affix: EliteAffix | "" = "", boss = false, radius?: number): SimEnemy {
  return {
    active: true, x: 0, y: 0, hp: 50, maxHp: 100, shield: affix === "shielded" ? 10 : 0,
    family, speed: 100, dmg: 8, radius: radius ?? (boss ? 34 : 14), xp: 5,
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
    applyLabFilter();
    this.buildToolbar();
    // Rows may exceed viewport height — wheel scrolls the review column.
    this.input.on("wheel", (pointer: Phaser.Input.Pointer, objs: unknown[], dx: number, dy: number) => {
      void pointer;
      void objs;
      void dx;
      this.cameras.main.scrollY = Math.max(0, this.cameras.main.scrollY + dy);
    });
    const g = this.add.graphics();
    const time = 1.2; // fixed clock → deterministic lab stills
    const hc = labHighContrast();
    const W = this.scale.width;
    let y = 76;
    y = this.specRow(g, "PLAYER — 1x game scale + 2x inspection", y, W, time, [
      { label: "1x core", draw: (gg, x, yy) => drawPlayer(gg, x, yy, 16, { facing: -0.5, dashing: false, iframe: false, hurtFlash: false, time, highContrast: hc }) },
      { label: "1x dash", draw: (gg, x, yy) => drawPlayer(gg, x, yy, 16, { facing: -0.5, dashing: true, iframe: false, hurtFlash: false, time, highContrast: hc }) },
      { label: "2x core", draw: (gg, x, yy) => drawPlayer(gg, x, yy, 32, { facing: -0.5, dashing: false, iframe: false, hurtFlash: false, time, highContrast: hc }) },
    ]);
    y = this.specRow(g, "ENEMIES — 1x + 2x per family (chaser/ranged/tank/swarm)", y, W, time,
      (["chaser", "ranged", "tank", "swarm"] as EnemyFamily[]).flatMap((f) => [
        {
          label: `1x ${f}`,
          draw: (gg: Phaser.GameObjects.Graphics, x: number, yy: number) => {
            const e = fakeEnemy(f, "", false, FAMILY_RADIUS[f]);
            e.x = x;
            e.y = yy;
            drawEnemy(gg, e, { bodyColor: ENEMY_LINEAGE[f].color["stone" as AgeId], facing: 0, time, highContrast: hc });
          },
        },
        {
          label: `2x ${f}`,
          draw: (gg: Phaser.GameObjects.Graphics, x: number, yy: number) => {
            const e = fakeEnemy(f, "", false, FAMILY_RADIUS[f] * 2);
            e.x = x;
            e.y = yy;
            drawEnemy(gg, e, { bodyColor: ENEMY_LINEAGE[f].color["stone" as AgeId], facing: 0, time, highContrast: hc });
          },
        },
      ]),
    );
    y = this.specRow(g, "ELITES — swift / armored / volatile / splitter / shielded", y, W, time,
      (["swift", "armored", "volatile", "splitter", "shielded"] as EliteAffix[]).map((a) => ({
        label: a,
        draw: (gg: Phaser.GameObjects.Graphics, x: number, yy: number) => {
          const e = fakeEnemy("chaser", a);
          e.x = x;
          e.y = yy;
          drawEnemy(gg, e, { bodyColor: 0xb0653a, facing: 0, time, highContrast: hc });
        },
      })),
    );
    y = this.specRow(g, "BOSS — hex + crown, 1x + 2x (never a big tank)", y, W, time, [
      {
        label: "1x",
        draw: (gg, x, yy) => {
          const e = fakeEnemy("tank", "", true);
          e.x = x;
          e.y = yy;
          drawEnemy(gg, e, { bodyColor: 0x5c2e8c, facing: 0, time, highContrast: hc });
        },
      },
      {
        label: "2x",
        draw: (gg, x, yy) => {
          const e = fakeEnemy("tank", "", true, 68);
          e.x = x;
          e.y = yy;
          drawEnemy(gg, e, { bodyColor: 0x5c2e8c, facing: 0, time, highContrast: hc });
        },
      },
    ], 60);
    y = this.specRow(g, "SHOTS — friendly / hostile / knowledge / mine (1x + 2x)", y, W, time, [
      {
        label: "1x friendly",
        draw: (gg, x, yy) => drawFriendlyProj(gg, { active: true, x, y: yy, vx: 400, vy: 0, dmg: 10, radius: 6, life: 1, friendly: true, color: 0x7fd4ff, src: "lab" }),
      },
      {
        label: "1x hostile",
        draw: (gg, x, yy) => drawHostileProj(gg, { active: true, x, y: yy, vx: -300, vy: 0, dmg: 8, radius: 6, life: 1, friendly: false, color: 0xff4444, src: "lab" }, { time, highContrast: hc }),
      },
      {
        label: "1x knowledge",
        draw: (gg, x, yy) => drawKnowledge(gg, { active: true, x, y: yy, value: 10 }),
      },
      {
        label: "2x hostile",
        draw: (gg, x, yy) => drawHostileProj(gg, { active: true, x, y: yy, vx: -300, vy: 0, dmg: 8, radius: 12, life: 1, friendly: false, color: 0xff4444, src: "lab" }, { time, highContrast: hc }),
      },
      {
        label: "2x knowledge",
        draw: (gg, x, yy) => drawKnowledge(gg, { active: true, x, y: yy, value: 40 }),
      },
      {
        label: "mine",
        draw: (gg, x, yy) => drawMine(gg, { active: true, x, y: yy, dmg: 20, radius: 60, life: 9 }, { time, highContrast: hc }),
      },
    ]);
    y = this.specRow(g, "ARCHETYPES — beam / aura / orbit / summon", y, W, time, [
      { label: "beam", draw: (gg, x, yy) => drawBeam(gg, x - 40, yy, x + 40, yy - 20, 6, 0xfff07f) },
      { label: "aura", draw: (gg, x, yy) => drawAura(gg, x, yy, 26, 0xffb03c) },
      { label: "orbit", draw: (gg, x, yy) => drawOrbit(gg, x, yy, 22, 3, time, 0xb48cff, 6) },
      { label: "summon", draw: (gg, x, yy) => drawSummon(gg, x, yy - 10, 7, 0x7fb8ff, x - 30, yy + 20) },
    ]);
    y = this.poiRow(g, y, W, time, hc);
    y = this.biomeRow(g, y, W);
    y = this.contrastMatrix(g, y, W, time, hc);
    for (const spec of COMPOSITES) {
      y = this.compositePanel(g, spec, y, W, time, hc);
    }
    void LAB_SECTIONS;
    this.buildStrings();
  }

  /** Specimen row: title + labeled cells at responsive width. Returns next y. */
  private specRow(
    g: Phaser.GameObjects.Graphics, title: string, y: number, W: number, time: number,
    cells: Array<{ label: string; draw: (gg: Phaser.GameObjects.Graphics, x: number, yy: number) => void }>,
    headroom = 0,
  ): number {
    void time;
    const pad = 16;
    const panelW = Math.min(880, W - pad * 2);
    const cellW = 150;
    const perRow = Math.max(2, Math.floor(panelW / cellW));
    const rows = Math.ceil(cells.length / perRow);
    const h = rows * 104 + 30 + headroom;
    this.add.text(pad, y, title, { fontSize: "14px", color: "#9aa7b5", fontFamily: "monospace" });
    g.fillStyle(0x0b0e14, 1);
    g.fillRect(pad, y + 24, panelW, h);
    g.lineStyle(1, 0x2a3444, 1);
    g.strokeRect(pad, y + 24, panelW, h);
    cells.forEach((c, i) => {
      const cx = pad + (i % perRow) * cellW + cellW / 2;
      const cy = y + 24 + headroom + Math.floor(i / perRow) * 104 + 62;
      this.add.text(cx - cellW / 2 + 8, cy - 44, c.label, { fontSize: "11px", color: "#66788c", fontFamily: "monospace" });
      c.draw(g, cx, cy);
    });
    return y + 24 + h + 14;
  }

  /** POI row: unique glyph + localized family name per implemented POI id. */
  private poiRow(g: Phaser.GameObjects.Graphics, y: number, W: number, time: number, hc: boolean): number {
    const types: POIType[] = ["ruin", "meteor", "vault", "signal", "megasite", "worldtree"];
    const pad = 16;
    const panelW = Math.min(880, W - pad * 2);
    const cols = 3;
    const cellW = panelW / cols;
    const cellH = 200;
    const rows = Math.ceil(types.length / cols);
    const h = rows * cellH + 10;
    this.add.text(pad, y, "POI — unique destination glyph per family + localized name", { fontSize: "14px", color: "#9aa7b5", fontFamily: "monospace" });
    g.fillStyle(0x0b0e14, 1);
    g.fillRect(pad, y + 24, panelW, h);
    g.lineStyle(1, 0x2a3444, 1);
    g.strokeRect(pad, y + 24, panelW, h);
    types.forEach((tp, i) => {
      const cx = pad + (i % cols) * cellW + cellW / 2 - 30;
      const cy = y + 24 + Math.floor(i / cols) * cellH + 168;
      drawPoi(g, { wx: cx, wy: cy, type: tp, found: false, time, highContrast: hc });
      this.add.text(cx - cellW / 2 + 40, cy + 16, t(`poi.${tp}.name` as EnKeys), { fontSize: "13px", color: "#eef2f6" });
      // Discovered state, small, beside the beacon base.
      drawPoi(g, { wx: cx + 70, wy: cy, type: tp, found: true, time, highContrast: hc });
    });
    return y + 24 + h + 14;
  }

  private biomeRow(g: Phaser.GameObjects.Graphics, y: number, W: number): number {
    const pad = 16;
    const panelW = Math.min(880, W - pad * 2);
    this.add.text(pad, y, "BIOMES — verdant / arid / tundra / badlands", { fontSize: "14px", color: "#9aa7b5", fontFamily: "monospace" });
    const biomes: BiomeId[] = ["verdant", "arid", "tundra", "badlands"];
    biomes.forEach((b, i) => {
      const bx = pad + i * 120;
      g.fillStyle(BIOME_STYLE[b].ground, 1);
      g.fillRect(bx, y + 24, 112, 48);
      g.fillStyle(BIOME_STYLE[b].groundAlt, 0.55);
      g.fillEllipse(bx + 56, y + 48, 100, 40);
      g.fillStyle(BIOME_STYLE[b].accent, 0.9);
      g.fillCircle(bx + 56, y + 48, 6);
      this.add.text(bx + 4, y + 76, b, { fontSize: "11px", color: "#66788c", fontFamily: "monospace" });
    });
    void panelW;
    return y + 110;
  }

  /** R8 evidence: every critical token painted on every biome ground. */
  private contrastMatrix(
    g: Phaser.GameObjects.Graphics, y: number, W: number, time: number, hc: boolean,
  ): number {
    const pad = 16;
    const biomes: BiomeId[] = ["verdant", "arid", "tundra", "badlands"];
    const tokens = [...CONTRAST_MATRIX_TOKENS];
    const cellW = 120;
    const panelW = Math.min(880, W - pad * 2);
    const h = biomes.length * 64 + 30;
    this.add.text(pad, y, "CONTRAST MATRIX — critical tokens × all biome grounds", { fontSize: "14px", color: "#9aa7b5", fontFamily: "monospace" });
    g.fillStyle(0x0b0e14, 1);
    g.fillRect(pad, y + 24, panelW, h);
    g.lineStyle(1, 0x2a3444, 1);
    g.strokeRect(pad, y + 24, panelW, h);
    biomes.forEach((b, bi) => {
      const by = y + 24 + 30 + bi * 64 + 24;
      this.add.text(pad + 6, by - 22, b, { fontSize: "11px", color: "#66788c", fontFamily: "monospace" });
      tokens.forEach((tok, ti) => {
        const cx = pad + 90 + ti * cellW;
        g.fillStyle(BIOME_STYLE[b].ground, 1);
        g.fillRect(cx - 26, by - 24, 104, 48);
        this.drawMatrixToken(g, tok, cx + 26, by, time, hc);
      });
    });
    return y + 24 + h + 14;
  }

  private drawMatrixToken(
    g: Phaser.GameObjects.Graphics, tok: string, x: number, y: number, time: number, hc: boolean,
  ): void {
    if (tok === "player") {
      drawPlayer(g, x, y, 12, { facing: 0, dashing: false, iframe: false, hurtFlash: false, time, highContrast: hc });
    } else if (tok === "chaser" || tok === "swarm") {
      const e = fakeEnemy(tok as EnemyFamily, "", false, tok === "swarm" ? 9 : 14);
      e.x = x;
      e.y = y;
      drawEnemy(g, e, { bodyColor: 0xb0653a, facing: 0, time, highContrast: hc });
    } else if (tok === "friendly") {
      drawFriendlyProj(g, { active: true, x, y, vx: 400, vy: 0, dmg: 10, radius: 5, life: 1, friendly: true, color: 0x7fd4ff, src: "lab" });
    } else if (tok === "hostile") {
      drawHostileProj(g, { active: true, x, y, vx: -300, vy: 0, dmg: 8, radius: 5, life: 1, friendly: false, color: 0xff4444, src: "lab" }, { time, highContrast: hc });
    } else if (tok === "knowledge") {
      drawKnowledge(g, { active: true, x, y, value: 8 });
    } else if (tok === "mine") {
      drawMine(g, { active: true, x, y, dmg: 20, radius: 40, life: 9 }, { time, highContrast: hc });
    }
  }

  /** R4: deterministic composite clash — the combined-readability proof. */
  private compositePanel(
    g: Phaser.GameObjects.Graphics, spec: CompositeSpec, y: number, W: number, time: number, hc: boolean,
  ): number {
    const pad = 16;
    const panelW = Math.min(880, W - pad * 2);
    const panelH = 470;
    const cx = pad + panelW / 2;
    const cy = y + 30 + panelH / 2;
    const counts = new Map<string, number>();
    for (const p of spec.placements) {
      const key = p.kind === "enemy" || p.kind === "elite" ? `${p.kind}:${p.family}` : p.kind;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    const caption = [...counts.entries()].map(([k, n]) => `${n}×${k}`).join("  ");
    this.add.text(pad, y, `COMPOSITE — ${spec.biome} clash (1x game scale, deterministic)`, { fontSize: "14px", color: "#ffd166", fontFamily: "monospace" });
    this.add.text(pad, y + 30 + panelH + 4, caption, { fontSize: "11px", color: "#66788c", fontFamily: "monospace" });
    g.fillStyle(BIOME_STYLE[spec.biome].ground, 1);
    g.fillRect(pad, y + 30, panelW, panelH);
    g.lineStyle(1, 0x2a3444, 1);
    g.strokeRect(pad, y + 30, panelW, panelH);
    g.fillStyle(BIOME_STYLE[spec.biome].groundAlt, 0.5);
    g.fillEllipse(cx, cy, 420, 300);
    for (const p of spec.placements) {
      this.drawCompositePlacement(g, spec, p, cx, cy, time, hc);
    }
    return y + 30 + panelH + 26;
  }

  private drawCompositePlacement(
    g: Phaser.GameObjects.Graphics, spec: CompositeSpec, p: CompositePlacement,
    cx: number, cy: number, time: number, hc: boolean,
  ): void {
    void spec;
    const x = cx + p.dx;
    const y = cy + p.dy;
    const facing = Math.atan2(-p.dy, -p.dx); // toward the player
    if (p.kind === "player") {
      drawPlayer(g, x, y, 16, { facing: 0, dashing: false, iframe: false, hurtFlash: false, time, highContrast: hc });
    } else if (p.kind === "enemy" || p.kind === "elite") {
      const fam = p.family ?? "chaser";
      const e = fakeEnemy(fam, p.affix ?? "", false, FAMILY_RADIUS[fam]);
      e.x = x;
      e.y = y;
      drawEnemy(g, e, { bodyColor: ENEMY_LINEAGE[fam].color["stone" as AgeId], facing, time, highContrast: hc });
    } else if (p.kind === "friendly") {
      drawFriendlyProj(g, { active: true, x, y, vx: 400, vy: -80, dmg: 10, radius: 6, life: 1, friendly: true, color: 0x7fd4ff, src: "lab" });
    } else if (p.kind === "hostile") {
      const d = Math.max(1, Math.hypot(cx - x, cy - y));
      drawHostileProj(g, { active: true, x, y, vx: ((cx - x) / d) * 300, vy: ((cy - y) / d) * 300, dmg: 8, radius: 6, life: 1, friendly: false, color: 0xff4444, src: "lab" }, { time, highContrast: hc });
    } else if (p.kind === "knowledge") {
      drawKnowledge(g, { active: true, x, y, value: p.value ?? 5 });
    } else if (p.kind === "mine") {
      drawMine(g, { active: true, x, y, dmg: 20, radius: 60, life: 9 }, { time, highContrast: hc });
    } else if (p.kind === "poi" && p.poi) {
      drawPoi(g, { wx: x, wy: y, type: p.poi, found: false, time, highContrast: hc });
    }
  }

  private buildToolbar(): void {
    let bar = document.getElementById("visual-lab-bar");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "visual-lab-bar";
      bar.style.cssText = "position:fixed;top:0;left:0;right:0;z-index:40;display:flex;gap:8px;align-items:center;padding:8px 12px;background:rgba(8,12,18,0.92);flex-wrap:wrap;";
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
      const normal = document.createElement("button");
      normal.id = "lab-mode-normal";
      normal.className = "btn";
      normal.textContent = "Normal";
      normal.addEventListener("click", () => this.switchLabContrast("normal"));
      const gray = document.createElement("button");
      gray.id = "lab-mode-grayscale";
      gray.className = "btn";
      gray.textContent = "Grayscale";
      gray.addEventListener("click", () => this.switchLabContrast("grayscale"));
      const high = document.createElement("button");
      high.id = "lab-mode-high";
      high.className = "btn";
      high.textContent = "High contrast";
      high.addEventListener("click", () => this.switchLabContrast("high"));
      bar.appendChild(h);
      bar.appendChild(en);
      bar.appendChild(th);
      bar.appendChild(normal);
      bar.appendChild(gray);
      bar.appendChild(high);
      document.body.appendChild(bar);
    }
  }

  private switchLabContrast(mode: LabContrastMode): void {
    labContrast = mode;
    applyLabFilter();
    // High-contrast changes draw weights → redraw the whole lab.
    this.scene.restart();
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
      "poi.megasite.name", "poi.worldtree.name",
      "objective.space", "hint.move", "hint.gated", "hint.poi",
      "tech.spine-orbital.name", "tech.anomaly.description",
    ];
    for (const k of keys) {
      const d = document.createElement("div");
      d.style.cssText = "color:#eef2f6;font-size:15px;line-height:1.8;border-bottom:1px solid #1c2534;";
      d.textContent = `${k}: ${t(k)}`;
      box.appendChild(d);
    }
    // Narrow wrap-review box using real gameplay text rules (card width).
    const wrapHead = document.createElement("h3");
    wrapHead.textContent = "TH WRAP (300px, gameplay rules)";
    wrapHead.style.cssText = "color:#9aa7b5;font-size:14px;margin:10px 0 6px;";
    box.appendChild(wrapHead);
    const wrap = document.createElement("div");
    wrap.id = "visual-lab-wrap";
    wrap.style.cssText = "width:300px;max-width:100%;color:#eef2f6;font-size:15px;line-height:1.8;overflow-wrap:break-word;";
    const longKeys: EnKeys[] = ["tech.anomaly.description", "hint.gated", "objective.space", "tech.spine-orbital.description"];
    for (const k of longKeys) {
      const d = document.createElement("div");
      d.style.cssText = "border:1px solid #2a3444;border-radius:8px;padding:8px 10px;margin-bottom:8px;";
      d.textContent = t(k);
      wrap.appendChild(d);
    }
    box.appendChild(wrap);
  }
}