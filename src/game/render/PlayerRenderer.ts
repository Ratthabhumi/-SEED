// Player identity rendering — presentation only.
// Bright core + dark outline + directional notch: readable at peripheral
// vision, never confusable with pickups/projectiles/enemies.
import type Phaser from "phaser";
import { VL } from "./VisualLanguage";

export interface PlayerDrawOpts {
  facing: number;
  dashing: boolean;
  iframe: boolean;
  hurtFlash: boolean;
  time: number;
  highContrast: boolean;
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
}
