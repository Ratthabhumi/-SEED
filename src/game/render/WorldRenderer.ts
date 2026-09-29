// World ground + POI presentation — presentation only.
// Declutter rule: background = large soft low-contrast shapes; nothing
// gameplay-sized. Undiscovered POIs are beacon destinations, not debug rings.
import type Phaser from "phaser";
import { deriveUint32 } from "../../core/seed/hash";
import { CHUNK_SIZE } from "../../core/world/chunks";
import type { ChunkDescriptor } from "../../core/world/chunks";
import type { BiomeId } from "../../core/world/biome";
import { VL } from "./VisualLanguage";
import { fillPoly } from "./paths";

export interface GroundDrawArgs {
  getChunk: (cx: number, cy: number) => ChunkDescriptor;
  styleFor: (biome: BiomeId) => { ground: number; groundAlt: number };
  civColor: number;
  civDensity: number;
  cx: number;
  cy: number;
  radius: number;
  worldSeed: string;
  time: number;
  highContrast: boolean;
}

function chunkRand(worldSeed: string, cx: number, cy: number, salt: string, mod: number): number {
  return deriveUint32(worldSeed, `${salt}:${cx},${cy}`) % mod;
}

export function drawGround(g: Phaser.GameObjects.Graphics, a: GroundDrawArgs): void {
  for (let ox = -a.radius; ox <= a.radius; ox++) {
    for (let oy = -a.radius; oy <= a.radius; oy++) {
      const ccx = a.cx + ox;
      const ccy = a.cy + oy;
      const desc = a.getChunk(ccx, ccy);
      const style = a.styleFor(desc.biome);
      const gx = ccx * CHUNK_SIZE;
      const gy = ccy * CHUNK_SIZE;
      g.fillStyle(style.ground, 1);
      g.fillRect(gx, gy, CHUNK_SIZE, CHUNK_SIZE);
      // ONE large soft tonal patch per chunk (low frequency, never entity-sized).
      const px = gx + chunkRand(a.worldSeed, ccx, ccy, "vl-patch-x", 300);
      const py = gy + chunkRand(a.worldSeed, ccx, ccy, "vl-patch-y", 300);
      g.fillStyle(style.groundAlt, 0.55);
      g.fillEllipse(px + 100, py + 100, 300, 220);
      // Civ layer: sparse plus-marks (never dots/discs — those read as entities).
      const du = deriveUint32(a.worldSeed, `civ:${ccx},${ccy}`);
      g.lineStyle(2, a.civColor, 0.38);
      for (let i = 0; i < a.civDensity; i++) {
        const hx = gx + ((du + i * 173) % (CHUNK_SIZE - 40)) + 20;
        const hy = gy + ((du * 3 + i * 271) % (CHUNK_SIZE - 40)) + 20;
        const s = 7 + (i % 3) * 3;
        g.lineBetween(hx - s, hy, hx + s, hy);
        g.lineBetween(hx, hy - s, hx, hy + s);
      }
    }
  }
}

export interface PoiDrawArgs {
  wx: number;
  wy: number;
  found: boolean;
  time: number;
  highContrast: boolean;
}

/** POI marker: beacon pillar + floating diamond (undiscovered) or dim ring. */
export function drawPoi(g: Phaser.GameObjects.Graphics, a: PoiDrawArgs): void {
  if (a.found) {
    g.lineStyle(1, 0x555555, 0.8);
    g.strokeCircle(a.wx, a.wy, 12);
    return;
  }
  const pulse = 0.6 + 0.4 * Math.sin(a.time * 3 + a.wx * 0.001);
  const alpha = a.highContrast ? 0.85 : 0.6;
  // Light pillar — visible from far, reads as "destination".
  g.fillStyle(VL.beacon, 0.16 * pulse + 0.08);
  g.fillRect(a.wx - 5, a.wy - 130, 10, 130);
  // Floating diamond icon.
  const dy = a.wy - 140 + Math.sin(a.time * 2 + a.wx * 0.01) * 4;
  fillPoly(g, [
    [a.wx, dy - 10],
    [a.wx + 7, dy],
    [a.wx, dy + 10],
    [a.wx - 7, dy],
  ], VL.beacon, alpha);
  // Pulsing base ring.
  g.lineStyle(2, VL.beacon, 0.5 * pulse + 0.2);
  g.strokeCircle(a.wx, a.wy, 14 + 4 * pulse);
  g.fillStyle(VL.beacon, 0.9);
  g.fillCircle(a.wx, a.wy, 4);
}
