// Polygon path helpers — avoids Phaser.Math.Vector2 allocations in hot loops.
import type Phaser from "phaser";

export type Pt = [number, number];

export function fillPoly(g: Phaser.GameObjects.Graphics, pts: Pt[], fill: number, alpha: number): void {
  if (pts.length === 0) return;
  g.fillStyle(fill, alpha);
  g.beginPath();
  g.moveTo(pts[0]![0], pts[0]![1]);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i]![0], pts[i]![1]);
  g.closePath();
  g.fillPath();
}

export function strokePoly(
  g: Phaser.GameObjects.Graphics, pts: Pt[], color: number, width: number, alpha = 1,
): void {
  if (pts.length === 0) return;
  g.lineStyle(width, color, alpha);
  g.beginPath();
  g.moveTo(pts[0]![0], pts[0]![1]);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i]![0], pts[i]![1]);
  g.closePath();
  g.strokePath();
}
