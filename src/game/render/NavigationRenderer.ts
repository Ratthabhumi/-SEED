// Navigation aids — pure interest math + screen-space indicator drawing.
// Infinite world + finite attention: the world is unbounded, but the UI always
// answers "where is the nearest thing that matters?" No minimap in this pass.
import type Phaser from "phaser";

export interface Interest {
  x: number;
  y: number;
  kind: "poi" | "boss";
  label: string;
}

/** Nearest undiscovered POI by distance (adapter pre-filters found state). */
export function nearestInterest(
  px: number, py: number, pois: Array<{ x: number; y: number; label: string }>,
): { angleRad: number; dist: number; label: string } | null {
  let best: { angleRad: number; dist: number; label: string } | null = null;
  for (const p of pois) {
    const dx = p.x - px;
    const dy = p.y - py;
    const dist = Math.hypot(dx, dy);
    if (!best || dist < best.dist) best = { angleRad: Math.atan2(dy, dx), dist, label: p.label };
  }
  return best;
}

export interface CameraView {
  scrollX: number;
  scrollY: number;
  width: number;
  height: number;
}

/** True when the world point is outside the current view (with margin). */
export function isOffscreen(view: CameraView, wx: number, wy: number, margin = 40): boolean {
  return (
    wx < view.scrollX - margin ||
    wy < view.scrollY - margin ||
    wx > view.scrollX + view.width + margin ||
    wy > view.scrollY + view.height + margin
  );
}

/**
 * Screen-space edge indicator: clamped triangle pointing toward the target.
 * Drawn on a scrollFactor-0 graphics object (screen coordinates).
 */
export function drawOffscreenIndicator(
  g: Phaser.GameObjects.Graphics, view: CameraView, wx: number, wy: number, color: number, size: number,
): void {
  if (!isOffscreen(view, wx, wy)) return;
  const m = 34;
  const sx = wx - view.scrollX;
  const sy = wy - view.scrollY;
  const cx = Math.max(m, Math.min(view.width - m, sx));
  const cy = Math.max(m, Math.min(view.height - m, sy));
  const ang = Math.atan2(sy - cy, sx - cx);
  const s = size;
  g.fillStyle(0x0a0d13, 0.85);
  g.fillCircle(cx, cy, s + 3);
  g.fillStyle(color, 1);
  g.fillTriangle(
    cx + Math.cos(ang) * (s + 2), cy + Math.sin(ang) * (s + 2),
    cx + Math.cos(ang + 2.5) * s, cy + Math.sin(ang + 2.5) * s,
    cx + Math.cos(ang - 2.5) * s, cy + Math.sin(ang - 2.5) * s,
  );
}
