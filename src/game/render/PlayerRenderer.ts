// Player identity rendering — presentation only.
// Bright core + dark outline + directional notch: readable at peripheral
// vision, never confusable with pickups/projectiles/enemies. Origin glyph +
// age trim give every origin a recognizable visual lineage per age.
import type Phaser from "phaser";
import { VL, originGlyph, playerTrim } from "./VisualLanguage";

export interface PlayerDrawOpts {
  facing: number;
  dashing: boolean;
  iframe: boolean;
  hurtFlash: boolean;
  time: number;
  highContrast: boolean;
  originId: string;
  ageIndex: number;
}

function drawOriginGlyph(
  g: Phaser.GameObjects.Graphics, x: number, y: number, r: number, originId: string,
): void {
  const glyph = originGlyph(originId);
  const gx = x - r - 8;
  const gy = y - r - 8;
  g.lineStyle(2, VL.outlineLight, 0.95);
  if (glyph === "chevron") {
    g.lineBetween(gx - 4, gy + 3, gx, gy - 1);
    g.lineBetween(gx + 4, gy + 3, gx, gy - 1);
  } else if (glyph === "square") {
    g.strokeRect(gx - 4, gy - 4, 8, 8);
  } else if (glyph === "ring") {
    g.strokeCircle(gx, gy, 4);
  } else {
    g.fillStyle(VL.outlineLight, 0.95);
    g.fillTriangle(gx - 4, gy + 3, gx + 4, gy + 3, gx, gy - 3);
  }
}

function drawAgeTrim(
  g: Phaser.GameObjects.Graphics, x: number, y: number, r: number, ageIndex: number, time: number,
): void {
  const trim = playerTrim(ageIndex);
  if (trim === "none") return;
  const c = VL.playerCore;
  if (trim === "frame") {
    g.lineStyle(2, c, 0.9);
    g.strokeCircle(x, y, r + 6);
  } else if (trim === "rig") {
    g.lineStyle(3, c, 0.9);
    g.lineBetween(x - r - 4, y - r + 2, x + r + 4, y - r + 2);
    g.lineBetween(x - r - 4, y + r - 2, x + r + 4, y + r - 2);
  } else if (trim === "pack") {
    g.fillStyle(c, 0.9);
    g.fillRect(x - r - 8, y - 6, 6, 12);
    g.fillRect(x + r + 2, y - 6, 6, 12);
  } else if (trim === "exo") {
    g.lineStyle(2, c, 0.9);
    g.strokeRect(x - r - 4, y - r - 4, (r + 4) * 2, (r + 4) * 2);
    g.fillStyle(c, 0.9);
    g.fillCircle(x, y - r - 8, 2.5);
  } else {
    // Orbital command rig: slow satellite ticks circling the core.
    for (let i = 0; i < 3; i++) {
      const a = time * 0.8 + (i * Math.PI * 2) / 3;
      g.fillStyle(c, 0.95);
      g.fillCircle(x + Math.cos(a) * (r + 9), y + Math.sin(a) * (r + 9), 2.5);
    }
  }
}

export function drawPlayer(
  g: Phaser.GameObjects.Graphics, x: number, y: number, r: number, opts: PlayerDrawOpts,
): void {
  const outlineW = opts.highContrast ? 5 : 3;
  // Dark halo guarantees contrast on any biome.
  g.fillStyle(VL.outlineDark, 0.9);
  g.fillCircle(x, y, r + outlineW + 1);
  // Mid ring + bright core.
  g.fillStyle(VL.playerMid, 1);
  g.fillCircle(x, y, r + 1);
  g.fillStyle(opts.iframe ? 0x9fd8ff : VL.playerCore, 1);
  g.fillCircle(x, y, Math.max(2, r - 4));
  // Directional notch (chevron toward facing).
  const a = opts.facing;
  const nx = x + Math.cos(a) * (r - 2);
  const ny = y + Math.sin(a) * (r - 2);
  g.fillStyle(VL.playerNotch, 1);
  g.fillTriangle(
    nx + Math.cos(a) * 7, ny + Math.sin(a) * 7,
    nx + Math.cos(a + 2.6) * 6, ny + Math.sin(a + 2.6) * 6,
    nx + Math.cos(a - 2.6) * 6, ny + Math.sin(a - 2.6) * 6,
  );
  if (opts.dashing) {
    // Motion chevrons trailing behind the dash.
    g.lineStyle(3, VL.outlineLight, 0.9);
    for (let i = 1; i <= 2; i++) {
      const bx = x - Math.cos(a) * (r + i * 10);
      const by = y - Math.sin(a) * (r + i * 10);
      g.lineBetween(bx - 6, by + 5, bx, by);
      g.lineBetween(bx + 6, by + 5, bx, by);
    }
  }
  if (opts.hurtFlash) {
    g.lineStyle(3, VL.danger, 1);
    g.strokeCircle(x, y, r + outlineW + 4);
  }
  drawOriginGlyph(g, x, y, r, opts.originId);
  drawAgeTrim(g, x, y, r, opts.ageIndex, opts.time);
}
