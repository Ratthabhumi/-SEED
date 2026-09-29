// Weapon / projectile / pickup rendering — presentation only.
// Strict channels: player-side = round + light core; hostile = angular + dark
// outline. Knowledge is always the teal shard; mines are ground devices.
import type Phaser from "phaser";
import type { SimProj, SimPickup, SimMine } from "../../core/sim/RunState";
import { VL } from "./VisualLanguage";
import { fillPoly, strokePoly } from "./paths";

export interface WeaponDrawOpts {
  time: number;
  highContrast: boolean;
}

/** Player projectile: capsule along velocity with a light core. */
export function drawFriendlyProj(g: Phaser.GameObjects.Graphics, p: SimProj): void {
  const speed = Math.hypot(p.vx, p.vy);
  if (speed < 1) {
    g.fillStyle(p.color, 1);
    g.fillCircle(p.x, p.y, p.radius);
    return;
  }
  const nx = p.vx / speed;
  const ny = p.vy / speed;
  const tail = p.radius * 2.2;
  g.lineStyle(Math.max(3, p.radius * 1.6), p.color, 1);
  g.lineBetween(p.x - nx * tail, p.y - ny * tail, p.x + nx * tail, p.y + ny * tail);
  g.fillStyle(VL.friendlyCore, 1);
  g.fillCircle(p.x, p.y, Math.max(2, p.radius * 0.55));
}

/** Hostile projectile: sharp diamond with dark outline — never a pickup. */
export function drawHostileProj(g: Phaser.GameObjects.Graphics, p: SimProj, opts: WeaponDrawOpts): void {
  const speed = Math.hypot(p.vx, p.vy) || 1;
  const dx = p.vx / speed;
  const dy = p.vy / speed;
  const px = -dy;
  const py = dx;
  const r = p.radius * 1.25;
  const pts: Array<[number, number]> = [
    [p.x + dx * r, p.y + dy * r],
    [p.x + px * r * 0.7, p.y + py * r * 0.7],
    [p.x - dx * r, p.y - dy * r],
    [p.x - px * r * 0.7, p.y - py * r * 0.7],
  ];
  fillPoly(g, pts, p.color, 1);
  strokePoly(g, pts, VL.hostileOutline, opts.highContrast ? 3 : 2, 1);
}

/** Beam: origin → target bar with a bright core. */
export function drawBeam(
  g: Phaser.GameObjects.Graphics, x1: number, y1: number, x2: number, y2: number, width: number, color: number,
): void {
  g.lineStyle(Math.max(3, width), color, 0.85);
  g.lineBetween(x1, y1, x2, y2);
  g.lineStyle(Math.max(2, width * 0.4), 0xffffff, 0.95);
  g.lineBetween(x1, y1, x2, y2);
}

/** Aura: thin translucent edge — area readability without opaque noise. */
export function drawAura(g: Phaser.GameObjects.Graphics, x: number, y: number, radius: number, color: number): void {
  g.fillStyle(color, 0.05);
  g.fillCircle(x, y, radius);
  g.lineStyle(2, color, 0.45);
  g.strokeCircle(x, y, radius);
}

/** Orbit blades with a visible tether to the player. */
export function drawOrbit(
  g: Phaser.GameObjects.Graphics, px: number, py: number, radius: number,
  blades: number, angle: number, color: number, bladeR: number,
): void {
  for (let i = 0; i < blades; i++) {
    const a = angle + (i * Math.PI * 2) / Math.max(1, blades);
    const bx = px + Math.cos(a) * radius;
    const by = py + Math.sin(a) * radius;
    g.lineStyle(1, color, 0.4);
    g.lineBetween(px, py, bx, by);
    g.fillStyle(color, 1);
    g.fillCircle(bx, by, bladeR);
    g.lineStyle(1, VL.friendlyCore, 0.9);
    g.strokeCircle(bx, by, bladeR);
  }
}

/** Allied summon: round body, cyan outline, tether to the player. */
export function drawSummon(
  g: Phaser.GameObjects.Graphics, x: number, y: number, r: number, color: number, px: number, py: number,
): void {
  g.lineStyle(1, VL.summon, 0.35);
  g.lineBetween(px, py, x, y);
  g.fillStyle(color, 1);
  g.fillCircle(x, y, r);
  g.lineStyle(2, VL.summon, 1);
  g.strokeCircle(x, y, r);
}

/** Mine: recognizable ground device — base plate + blinking core. */
export function drawMine(g: Phaser.GameObjects.Graphics, m: SimMine, opts: WeaponDrawOpts): void {
  const blink = 0.55 + 0.45 * Math.sin(opts.time * 5 + m.x * 0.01 + m.y * 0.01);
  g.fillStyle(0x2a2416, 1);
  g.fillRect(m.x - 7, m.y - 7, 14, 14);
  g.lineStyle(2, 0xc9b458, 1);
  g.strokeRect(m.x - 7, m.y - 7, 14, 14);
  g.fillStyle(0xff6b4a, blink);
  g.fillCircle(m.x, m.y, 4);
  g.lineStyle(1, 0xc9b458, 0.22);
  g.strokeCircle(m.x, m.y, m.radius);
}

/** Knowledge: the teal shard — the one and only progression-currency shape. */
export function drawKnowledge(g: Phaser.GameObjects.Graphics, k: SimPickup): void {
  const r = 5 + Math.min(4, k.value * 0.25);
  fillPoly(g, [
    [k.x, k.y - r],
    [k.x + r * 0.7, k.y],
    [k.x, k.y + r],
    [k.x - r * 0.7, k.y],
  ], VL.knowledge, 1);
  g.lineStyle(1, VL.outlineDark, 1);
  g.strokeCircle(k.x, k.y, r * 0.8);
  g.fillStyle(VL.knowledgeCore, 1);
  g.fillCircle(k.x, k.y, Math.max(1.5, r * 0.35));
}
