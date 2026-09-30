// Enemy + boss canvas rendering — presentation only, never canonical state.
// Family identity = SHAPE (stable across ages) + motion + size + color accent.
// Elite identity layers OVER the family shape; boss is never a big tank.
import type Phaser from "phaser";
import type { SimEnemy } from "../../core/sim/RunState";
import type { EnemyFamily, EliteAffix } from "../../core/director/director";
import { familyShape, affixMarker, VL, shouldShowHpBar, enemyTrim } from "./VisualLanguage";
import { fillPoly, strokePoly, type Pt } from "./paths";

export interface EnemyDrawOpts {
  /** Base body color (age-skinned lineage color). */
  bodyColor: number;
  /** Facing angle in radians (adapter: toward player). */
  facing: number;
  /** Seconds clock for telegraph pulses. */
  time: number;
  /** High-contrast setting raises outline weights. */
  highContrast: boolean;
  /**
   * Show the compact HP bar. Adapter rule: damaged recently (flash), focused
   * target, or elite/boss (always). Undefined keeps the legacy elite/boss rule.
   */
  hpBar?: boolean;
  /** World age: iron+ adds plating, atomic+ adds energy trim (family kept). */
  ageIndex?: number;
}

/** Ranged aim tell: fires when shootT hits 0 (sim), so <0.5s reads as "aiming". */
export const AIM_TELL_SEC = 0.5;

function poly(g: Phaser.GameObjects.Graphics, pts: Array<[number, number]>, fill: number, alpha: number): void {
  fillPoly(g, pts as Pt[], fill, alpha);
}

function polyOutline(
  g: Phaser.GameObjects.Graphics, pts: Array<[number, number]>, color: number, width: number, alpha = 1,
): void {
  strokePoly(g, pts as Pt[], color, width, alpha);
}

function familyBody(
  g: Phaser.GameObjects.Graphics, family: EnemyFamily, x: number, y: number, r: number, facing: number, fill: number,
): void {
  const shape = familyShape(family);
  if (shape === "triangle") {
    // Aggressive forward triangle, nose toward the player.
    const nose: [number, number] = [x + Math.cos(facing) * r * 1.35, y + Math.sin(facing) * r * 1.35];
    const back1: [number, number] = [x + Math.cos(facing + 2.5) * r, y + Math.sin(facing + 2.5) * r];
    const back2: [number, number] = [x + Math.cos(facing - 2.5) * r, y + Math.sin(facing - 2.5) * r];
    poly(g, [nose, back1, back2], fill, 1);
    polyOutline(g, [nose, back1, back2], VL.outlineDark, 2);
  } else if (shape === "diamond") {
    const dx = Math.cos(facing);
    const dy = Math.sin(facing);
    const px = -dy;
    const py = dx;
    const pts: Array<[number, number]> = [
      [x + dx * r * 1.25, y + dy * r * 1.25],
      [x + px * r * 0.8, y + py * r * 0.8],
      [x - dx * r * 1.25, y - dy * r * 1.25],
      [x - px * r * 0.8, y - py * r * 0.8],
    ];
    poly(g, pts, fill, 1);
    polyOutline(g, pts, VL.outlineDark, 2);
  } else if (shape === "square") {
    g.fillStyle(fill, 1);
    g.fillRect(x - r, y - r, r * 2, r * 2);
    g.lineStyle(3, VL.outlineDark, 1);
    g.strokeRect(x - r, y - r, r * 2, r * 2);
    g.lineStyle(1, VL.outlineLight, 0.55);
    g.strokeRect(x - r + 4, y - r + 4, r * 2 - 8, r * 2 - 8);
  } else {
    // Swarm tri-cluster: leader body + two trailer wings + wake tick.
    // Reads as "small hostile pack converging", never decor or a lone disc.
    const lead: [number, number] = [x + Math.cos(facing) * r * 0.3, y + Math.sin(facing) * r * 0.3];
    const wl: [number, number] = [x - Math.cos(facing) * r * 0.55 - Math.sin(facing) * r * 0.5, y - Math.sin(facing) * r * 0.55 + Math.cos(facing) * r * 0.5];
    const wr: [number, number] = [x - Math.cos(facing) * r * 0.55 + Math.sin(facing) * r * 0.5, y - Math.sin(facing) * r * 0.55 - Math.cos(facing) * r * 0.5];
    g.fillStyle(fill, 1);
    g.fillCircle(lead[0], lead[1], r * 0.62);
    g.fillCircle(wl[0], wl[1], r * 0.42);
    g.fillCircle(wr[0], wr[1], r * 0.42);
    g.lineStyle(1, VL.outlineDark, 1);
    g.strokeCircle(lead[0], lead[1], r * 0.62);
    g.strokeCircle(wl[0], wl[1], r * 0.42);
    g.strokeCircle(wr[0], wr[1], r * 0.42);
    // Wake tick behind the pack — motion/hostility cue decor never has.
    g.lineStyle(2, VL.outlineDark, 0.9);
    g.lineBetween(x - Math.cos(facing) * r * 0.9, y - Math.sin(facing) * r * 0.9, x - Math.cos(facing) * r * 1.5, y - Math.sin(facing) * r * 1.5);
  }
}

function affixGlyph(
  g: Phaser.GameObjects.Graphics, affix: EliteAffix, x: number, y: number, r: number, time: number,
): void {
  const marker = affixMarker(affix);
  const c = 0xffffff;
  if (marker === "chevrons") {
    // Swift: speed chevrons trailing above.
    g.lineStyle(2, c, 1);
    for (let i = 0; i < 2; i++) {
      const yy = y - r - 6 - i * 6;
      g.lineBetween(x - 5, yy + 4, x, yy);
      g.lineBetween(x + 5, yy + 4, x, yy);
    }
  } else if (marker === "brackets") {
    // Armored: square brackets flanking the body.
    g.lineStyle(3, c, 1);
    g.lineBetween(x - r - 7, y - r, x - r - 7, y + r);
    g.lineBetween(x - r - 7, y - r, x - r - 3, y - r);
    g.lineBetween(x - r - 7, y + r, x - r - 3, y + r);
    g.lineBetween(x + r + 7, y - r, x + r + 7, y + r);
    g.lineBetween(x + r + 7, y - r, x + r + 3, y - r);
    g.lineBetween(x + r + 7, y + r, x + r + 3, y + r);
  } else if (marker === "spokes") {
    // Volatile: pulsing hazard spokes — reads as "will explode".
    const pulse = 0.55 + 0.45 * Math.sin(time * 7);
    g.lineStyle(2, 0xff4444, pulse);
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2 + Math.PI / 4;
      g.lineBetween(x + Math.cos(a) * (r + 3), y + Math.sin(a) * (r + 3), x + Math.cos(a) * (r + 9), y + Math.sin(a) * (r + 9));
    }
  } else if (marker === "lobes") {
    // Splitter: two-lobe mark.
    g.fillStyle(c, 1);
    g.fillCircle(x - r - 5, y, 3.5);
    g.fillCircle(x + r + 5, y, 3.5);
  } else if (marker === "shield-ring") {
    // Shielded: unambiguous cyan shield ring (always, not only when shield>0).
    g.lineStyle(2, 0x53e0c8, 0.95);
    g.strokeCircle(x, y, r + 9);
  }
}

export function drawEnemy(
  g: Phaser.GameObjects.Graphics, e: SimEnemy, opts: EnemyDrawOpts,
): void {
  const fill = e.flash > 0 ? 0xffffff : opts.bodyColor;
  const r = e.radius;
  if (e.boss) {
    drawBoss(g, e.x, e.y, r, bossHpFraction(e.hp, e.maxHp), opts, e.flash > 0);
    return;
  }
  familyBody(g, e.family, e.x, e.y, r, opts.facing, fill);
  // Age extras layer over the family silhouette (never instead of it).
  const trim = enemyTrim(opts.ageIndex ?? 0);
  if (trim.plating && e.family === "tank") {
    g.lineStyle(2, 0xc8ccd2, 0.9);
    g.strokeRect(e.x - r * 0.55, e.y - r * 0.55, r * 1.1, r * 1.1);
  } else if (trim.plating) {
    g.lineStyle(2, 0xc8ccd2, 0.85);
    g.strokeCircle(e.x, e.y, r * 0.55);
  }
  if (trim.energy) {
    g.fillStyle(0x53e0c8, 0.95);
    g.fillCircle(e.x, e.y - r - 4, 2.5);
  }
  if (e.family === "ranged" && e.shootT < AIM_TELL_SEC && e.flash <= 0) {
    // Pre-fire aiming tell along the facing (toward player).
    g.lineStyle(2, VL.aimTick, 0.9);
    g.lineBetween(e.x, e.y, e.x + Math.cos(opts.facing) * (r + 14), e.y + Math.sin(opts.facing) * (r + 14));
  }
  const showBar = opts.hpBar ?? shouldShowHpBar({ elite: e.elite, boss: e.boss, flash: e.flash, focused: false });
  if (showBar) drawHpBar(g, e.x, e.y - r - 14, r * 2, bossHpFraction(e.hp, e.maxHp));
  if (e.elite) {
    const w = opts.highContrast ? 4 : 3;
    g.lineStyle(w, VL.eliteRing, 1);
    g.strokeCircle(e.x, e.y, r + 5);
    g.lineStyle(1, VL.eliteRingInner, 0.8);
    g.strokeCircle(e.x, e.y, r + 8);
    if (e.affix !== "") affixGlyph(g, e.affix, e.x, e.y, r, opts.time);
  } else if (e.shield > 0) {
    g.lineStyle(1, 0x7fb8ff, 0.9);
    g.strokeCircle(e.x, e.y, r + 8);
  }
}

function drawBoss(
  g: Phaser.GameObjects.Graphics, x: number, y: number, r: number, hpFrac: number, opts: EnemyDrawOpts, flashed: boolean,
): void {
  // Hex + crown spikes + red/white outline: never confusable with a tank square.
  const hex: Array<[number, number]> = [];
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3 + Math.PI / 6;
    hex.push([x + Math.cos(a) * r, y + Math.sin(a) * r]);
  }
  poly(g, hex, flashed ? 0xffffff : opts.bodyColor, 1);
  polyOutline(g, hex, VL.boss, opts.highContrast ? 6 : 4);
  const inner: Array<[number, number]> = hex.map(([px, py]) => [x + (px - x) * 0.62, y + (py - y) * 0.62]);
  polyOutline(g, inner, VL.bossInner, 2, 0.9);
  // Crown spikes on top.
  const spikes: Array<[number, number]> = [];
  for (let i = -1; i <= 1; i++) {
    const bx = x + i * r * 0.5;
    spikes.push([bx - r * 0.16, y - r * 0.86], [bx, y - r * 1.3], [bx + r * 0.16, y - r * 0.86]);
  }
  poly(g, spikes, VL.boss, 1);
  drawHpBar(g, x, y - r - 22, r * 2.4, hpFrac);
}

function drawHpBar(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, frac: number): void {
  g.fillStyle(0x1a0505, 1);
  g.fillRect(x - w / 2, y, w, 5);
  g.fillStyle(VL.danger, 1);
  g.fillRect(x - w / 2, y, w * Math.max(0, Math.min(1, frac)), 5);
}

/** Boss canvas HP bar uses the sim fraction — adapter passes it explicitly. */
export function bossHpFraction(hp: number, maxHp: number): number {
  return maxHp > 0 ? Math.max(0, Math.min(1, hp / maxHp)) : 0;
}
