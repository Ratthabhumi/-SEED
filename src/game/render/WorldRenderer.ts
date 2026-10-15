// World ground + POI presentation — presentation only.
// Declutter rule: background = large soft low-contrast shapes; nothing
// gameplay-sized. Undiscovered POIs are beacon destinations, not debug rings.
import type Phaser from "phaser";
import { frontierDecoration } from "./frontierDecoration";
import { deriveUint32 } from "../../core/seed/hash";
import { CHUNK_SIZE } from "../../core/world/chunks";
import type { ChunkDescriptor } from "../../core/world/chunks";
import type { BiomeId } from "../../core/world/biome";
import type { AgeId } from "../../core/tech/graph";
import type { POIType } from "../../core/world/poi";
import { VL, poiGlyph } from "./VisualLanguage";
import { fillPoly, strokePoly } from "./paths";
import type { OutpostSpec } from "../../core/world/territory";
import { drawSpecializedOutpost } from "./OutpostVisualRegistry";
import { phaserColors as colors } from "../../theme/tokens";
import type {GroundBounds} from "./groundViewport";

export interface GroundDrawArgs {
  getChunk: (cx: number, cy: number) => ChunkDescriptor;
  styleFor: (biome: BiomeId) => { ground: number; groundAlt: number };
  civColor: number;
  civDensity: number;
  /** Current age selects the civilization geometry vocabulary. */
  age: AgeId;
  cx: number;
  cy: number;
  radius: number;
  worldSeed: string;
  time: number;
  highContrast: boolean;
  texturedGround?: boolean;
  bounds?:GroundBounds;
}

function chunkRand(worldSeed: string, cx: number, cy: number, salt: string, mod: number): number {
  return deriveUint32(worldSeed, `${salt}:${cx},${cy}`) % mod;
}

export function drawGround(g: Phaser.GameObjects.Graphics, a: GroundDrawArgs): void {
  for (let ox = -a.radius; ox <= a.radius; ox++) {
    for (let oy = -a.radius; oy <= a.radius; oy++) {
      const ccx = a.cx + ox;
      const ccy = a.cy + oy;
      if(a.bounds&&(ccx<a.bounds.left||ccx>a.bounds.right||ccy<a.bounds.top||ccy>a.bounds.bottom))continue;
      const desc = a.getChunk(ccx, ccy);
      // Authored blended floor replaces every legacy flat block/decor glyph.
      if(a.texturedGround&&!a.highContrast)continue;
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
      // Low-contrast, deterministic terrain silhouettes distinguish geography
      // without making decorative terrain look like collision obstacles.
      g.lineStyle(3, style.groundAlt, 0.55);
      if (desc.biome === "arid") {
        for (let i = 0; i < 3; i++) g.strokeEllipse(gx + 200, gy + 100 + i * 120, 320, 55);
      } else if (desc.biome === "tundra") {
        g.lineBetween(gx + 50, gy + 100, gx + 190, gy + 210);
        g.lineBetween(gx + 190, gy + 210, gx + 400, gy + 170);
      } else if (desc.biome === "badlands") {
        g.lineBetween(gx + 60, gy + 400, gx + 140, gy + 280);
        g.lineBetween(gx + 140, gy + 280, gx + 290, gy + 350);
        g.lineBetween(gx + 290, gy + 350, gx + 450, gy + 240);
      } else {
        g.strokeEllipse(gx + 150, gy + 340, 220, 130);
        g.strokeEllipse(gx + 380, gy + 150, 170, 110);
      }
      if (desc.biome === "verdant") {
        // Flat grass silhouettes, deliberately passable and below actor contrast.
        for (const p of frontierDecoration(a.worldSeed,ccx,ccy)) {
          g.fillStyle(style.groundAlt,0.48);
          g.fillTriangle(p.x-p.size,p.y+5,p.x,p.y-p.size/2,p.x+p.size,p.y+5);
          g.lineStyle(2,style.ground,0.6);g.lineBetween(p.x,p.y+5,p.x,p.y-p.size/3);
        }
        // Worn ground leads to actual sites; decorative, not a travel-cost promise.
        g.lineStyle(18,style.groundAlt,0.25);
        for (const poi of desc.poi) g.lineBetween(gx+CHUNK_SIZE/2,gy+CHUNK_SIZE/2,poi.wx,poi.wy);
      }
      // Civ layer per age (ADR-0006 Phase 9): sparse procedural marks BELOW
      // gameplay contrast. Seeded positions; bounded counts; never dots/discs.
      const du = deriveUint32(a.worldSeed, `civ:${ccx},${ccy}`);
      for (let i = 0; i < a.civDensity; i++) {
        const hx = gx + ((du + i * 173) % (CHUNK_SIZE - 40)) + 20;
        const hy = gy + ((du * 3 + i * 271) % (CHUNK_SIZE - 40)) + 20;
        const s = 7 + (i % 3) * 3;
        drawCivMark(g, a.age, hx, hy, s, a.civColor, 0.38);
      }
    }
  }
}

/** One age-vocabulary mark at (hx,hy), size class s. Presentation only. */
function drawCivMark(
  g: Phaser.GameObjects.Graphics, age: AgeId,
  hx: number, hy: number, s: number, color: number, alpha: number,
): void {
  g.lineStyle(2, color, alpha);
  if (age === "stone") {
    // Campfire tripod + tent triangle (alternate by parity for variety).
    if ((hx + hy) % 2 === 0) {
      g.lineBetween(hx - s, hy + s, hx, hy - s);
      g.lineBetween(hx + s, hy + s, hx, hy - s);
      g.lineBetween(hx - s, hy + s, hx + s, hy + s);
    } else {
      g.lineBetween(hx - s, hy + s * 0.6, hx, hy - s * 0.8);
      g.lineBetween(hx + s, hy + s * 0.6, hx, hy - s * 0.8);
      g.lineBetween(hx - s, hy + s * 0.6, hx + s, hy + s * 0.6);
    }
  } else if (age === "bronze") {
    // Wall segment + banner rect.
    g.lineBetween(hx - s, hy, hx + s, hy);
    g.lineBetween(hx - s, hy - s * 0.5, hx - s, hy + s * 0.5);
    g.lineBetween(hx + s, hy - s * 0.5, hx + s, hy + s * 0.5);
    g.strokeRect(hx + s * 0.2, hy - s * 1.1, s * 0.6, s * 0.5);
  } else if (age === "iron") {
    // Forge square + anvil L.
    g.strokeRect(hx - s * 0.7, hy - s * 0.7, s * 1.4, s * 1.4);
    g.lineBetween(hx - s, hy + s, hx + s * 0.4, hy + s);
    g.lineBetween(hx + s * 0.4, hy + s, hx + s * 0.4, hy + s * 0.2);
  } else if (age === "industrial") {
    // Twin rails + gear circle.
    g.lineBetween(hx - s, hy - s * 0.3, hx + s, hy - s * 0.3);
    g.lineBetween(hx - s, hy + s * 0.3, hx + s, hy + s * 0.3);
    g.strokeCircle(hx + s * 0.2, hy - s * 0.9, s * 0.45);
  } else if (age === "atomic") {
    // Reactor ring + core dot + radar sweep tick.
    g.strokeCircle(hx, hy, s * 0.8);
    g.fillStyle(color, alpha + 0.2);
    g.fillCircle(hx, hy, s * 0.22);
    g.lineBetween(hx, hy - s * 0.8, hx + s * 0.6, hy - s * 1.3);
  } else {
    // Satellite bus + orbital ellipse trace.
    g.strokeRect(hx - s * 0.5, hy - s * 0.3, s, s * 0.6);
    g.lineBetween(hx - s * 1.3, hy, hx - s * 0.5, hy);
    g.lineBetween(hx + s * 0.5, hy, hx + s * 1.3, hy);
    g.lineStyle(1, color, alpha * 0.7);
    g.strokeEllipse(hx, hy, s * 3.2, s * 1.6);
  }
}

export interface PoiDrawArgs {
  wx: number;
  wy: number;
  /** POI family — selects the unique primary destination glyph. */
  type: POIType;
  found: boolean;
  time: number;
  highContrast: boolean;
  painted?: boolean;
}

/** One glyph per family — the destination identity. Beacon stays secondary. */
function drawPoiGlyph(
  g: Phaser.GameObjects.Graphics, type: POIType, cx: number, cy: number, s: number, alpha: number,
): void {
  const glyph = poiGlyph(type);
  const fill = VL.beacon;
  const line = VL.outlineDark;
  if (glyph === "broken-arch") {
    // Ruin: two pillars + broken lintel with a gap.
    g.fillStyle(fill, alpha);
    g.fillRect(cx - s, cy - s * 0.4, s * 0.45, s * 1.4);
    g.fillRect(cx + s * 0.55, cy - s * 0.4, s * 0.45, s * 1.4);
    g.lineStyle(3, fill, alpha);
    g.lineBetween(cx - s, cy - s * 0.4, cx - s * 0.25, cy - s * 0.85);
    g.lineBetween(cx + s * 0.25, cy - s * 0.85, cx + s, cy - s * 0.4);
    g.lineStyle(2, line, alpha);
    g.strokeRect(cx - s, cy - s * 0.4, s * 0.45, s * 1.4);
    g.strokeRect(cx + s * 0.55, cy - s * 0.4, s * 0.45, s * 1.4);
  } else if (glyph === "impact-star") {
    // Meteor: four-point impact star.
    fillPoly(g, [
      [cx, cy - s * 1.2], [cx + s * 0.28, cy - s * 0.28],
      [cx + s * 1.2, cy], [cx + s * 0.28, cy + s * 0.28],
      [cx, cy + s * 1.2], [cx - s * 0.28, cy + s * 0.28],
      [cx - s * 1.2, cy], [cx - s * 0.28, cy - s * 0.28],
    ], fill, alpha);
    g.lineStyle(2, line, alpha);
    g.strokeCircle(cx, cy, s * 0.45);
  } else if (glyph === "vault-lock") {
    // Vault: square vault + inner lock.
    g.fillStyle(fill, alpha);
    g.fillRect(cx - s * 0.9, cy - s * 0.9, s * 1.8, s * 1.8);
    g.lineStyle(2, line, alpha);
    g.strokeRect(cx - s * 0.9, cy - s * 0.9, s * 1.8, s * 1.8);
    g.fillStyle(line, alpha);
    g.fillRect(cx - s * 0.3, cy - s * 0.3, s * 0.6, s * 0.6);
    g.fillStyle(fill, alpha);
    g.fillCircle(cx, cy, s * 0.14);
  } else if (glyph === "signal-wave") {
    // Signal: antenna mast + radiating arcs + tip dot.
    g.lineStyle(3, fill, alpha);
    g.lineBetween(cx, cy + s, cx, cy - s * 0.6);
    g.fillStyle(fill, alpha);
    g.fillCircle(cx, cy - s * 0.6, s * 0.22);
    g.lineStyle(2, fill, alpha * 0.9);
    for (let ring = 1; ring <= 2; ring++) {
      const rr = s * (0.5 + ring * 0.35);
      for (let i = 0; i <= 6; i++) {
        const a0 = -Math.PI / 3 + (i * Math.PI) / 9;
        const a1 = -Math.PI / 3 + ((i + 1) * Math.PI) / 9;
        g.lineBetween(cx + Math.cos(a0) * rr, cy - s * 0.6 + Math.sin(a0) * rr, cx + Math.cos(a1) * rr, cy - s * 0.6 + Math.sin(a1) * rr);
      }
    }
  } else if (glyph === "hex-complex") {
    // Megasite: large hex + structured inner nodes.
    const hex: Array<[number, number]> = [];
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      hex.push([cx + Math.cos(a) * s, cy + Math.sin(a) * s]);
    }
    fillPoly(g, hex, fill, alpha);
    strokePoly(g, hex, line, 2, alpha);
    g.fillStyle(line, alpha);
    g.fillCircle(cx - s * 0.35, cy, s * 0.16);
    g.fillCircle(cx + s * 0.35, cy, s * 0.16);
    g.fillCircle(cx, cy - s * 0.35, s * 0.16);
  } else {
    // World Tree: trunk + three branches + canopy nodes.
    g.lineStyle(3, fill, alpha);
    g.lineBetween(cx, cy + s, cx, cy - s * 0.5);
    g.lineBetween(cx, cy, cx - s * 0.7, cy - s * 0.7);
    g.lineBetween(cx, cy - s * 0.2, cx + s * 0.7, cy - s * 0.9);
    g.lineBetween(cx, cy - s * 0.5, cx + s * 0.1, cy - s * 1.1);
    g.fillStyle(fill, alpha);
    g.fillCircle(cx - s * 0.7, cy - s * 0.7, s * 0.22);
    g.fillCircle(cx + s * 0.7, cy - s * 0.9, s * 0.22);
    g.fillCircle(cx + s * 0.1, cy - s * 1.1, s * 0.22);
  }
}

/** POI marker: unique family glyph (primary) + beacon pillar (secondary). */
export function drawPoi(g: Phaser.GameObjects.Graphics, a: PoiDrawArgs): void {
  if(a.painted&&!a.highContrast){
      g.fillStyle(0x081016,.35);g.fillEllipse(a.wx,a.wy+8,70,18);
      if(a.found){g.lineStyle(2,VL.beacon,.8);g.lineBetween(a.wx-14,a.wy+15,a.wx-5,a.wy+23);g.lineBetween(a.wx-5,a.wy+23,a.wx+15,a.wy+7);}
      return;
  }
  if(a.type==="signal"){
    // A fractured alien monument. Uses the existing site's position and visibility only.
    g.fillStyle(colors.canvas,.9);g.fillEllipse(a.wx,a.wy+8,56,18);
    fillPoly(g,[[a.wx-15,a.wy+2],[a.wx-19,a.wy-55],[a.wx-3,a.wy-75],[a.wx+15,a.wy-58],[a.wx+13,a.wy+2]],colors.surface,1);
    g.lineStyle(2,colors.legacy,.9);
    g.lineBetween(a.wx-3,a.wy-75,a.wx+15,a.wy-58);g.lineBetween(a.wx+15,a.wy-58,a.wx+13,a.wy+2);
    g.lineStyle(3,colors.legacy,a.found?.65:.9);
    g.lineBetween(a.wx-8,a.wy-53,a.wx+5,a.wy-38);g.lineBetween(a.wx+5,a.wy-38,a.wx-6,a.wy-21);
    g.fillStyle(a.found?colors.friendly:colors.text,1);g.fillTriangle(a.wx-4,a.wy-65,a.wx+4,a.wy-65,a.wx,a.wy-58);
  }
  if (a.found) {
    g.lineStyle(1, 0x555555, 0.8);
    g.strokeCircle(a.wx, a.wy, 12);
    return;
  }
  const pulse = 0.6 + 0.4 * Math.sin(a.time * 3 + a.wx * 0.001);
  const alpha = a.highContrast ? 0.9 : 0.7;
  // Light pillar — visible from far, reads as "destination".
  g.fillStyle(VL.beacon, 0.3 * pulse + 0.16);
  g.fillRect(a.wx - 6, a.wy - 130, 12, 130);
  // Family glyph floats above the pillar — the identity, not a debug diamond.
  const gy = a.wy - 148 + Math.sin(a.time * 2 + a.wx * 0.01) * 4;
  drawPoiGlyph(g, a.type, a.wx, gy, 13, Math.min(1, alpha + 0.25));
  // Pulsing base ring.
  g.lineStyle(2, VL.beacon, 0.5 * pulse + 0.2);
  g.strokeCircle(a.wx, a.wy, 14 + 4 * pulse);
  g.fillStyle(VL.beacon, 0.9);
  g.fillCircle(a.wx, a.wy, 4);
}

export interface TerritoryDressingArgs {
  x: number;
  y: number;
  ageIndex: number;
  tier: 1 | 2;
  disabled: boolean;
  spec: OutpostSpec | "";
  repairing?: boolean;
  painted?: boolean;
}

/**
 * Actual specialization/era/tier/condition architecture. Free claims remain a
 * neutral pad until specialization; this function owns no gameplay state.
 */
export function drawTerritoryDressing(g: Phaser.GameObjects.Graphics, a: TerritoryDressingArgs): void {
  if(!a.painted||!a.spec)drawSpecializedOutpost(g,a);
}
