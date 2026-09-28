// Chunk-addressable infinite world. Descriptors only — rendering derives from them.
import type { BiomeId } from "./biome";
import { sampleFields, classifyBiome } from "./biome";
import { deriveUint32 } from "../seed/hash";
import { featureFloat01, FeatureSalt } from "../seed/hash";
import { getPOIsForChunk } from "./poi";
import type { POI } from "./poi";

export const CHUNK_SIZE = 512;
export const ACTIVE_RADIUS_CHUNKS = 2; // 5x5 active neighborhood

export interface ChunkDescriptor {
  x: number;
  y: number;
  biome: BiomeId;
  elevation: number;
  temperature: number;
  moisture: number;
  anomaly: number;
  civilizationInfluence: number;
  poi: POI[];
}

export function worldToChunk(wx: number, wy: number): { cx: number; cy: number } {
  return { cx: Math.floor(wx / CHUNK_SIZE), cy: Math.floor(wy / CHUNK_SIZE) };
}

export function chunkCenter(cx: number, cy: number): { x: number; y: number } {
  return { x: (cx + 0.5) * CHUNK_SIZE, y: (cy + 0.5) * CHUNK_SIZE };
}

/** Deterministic descriptor — same (masterSeed, nonce, cx, cy) always yields the same result. */
export function getChunkDescriptor(masterSeed: string, cx: number, cy: number, worldNonce = "w1"): ChunkDescriptor {
  const c = chunkCenter(cx, cy);
  const f = sampleFields(masterSeed, c.x, c.y);
  const terrainU32 = deriveUint32(masterSeed, "terrain");
  const civJitter = featureFloat01(terrainU32, cx, cy, FeatureSalt.terrain);
  const civilizationInfluence = Math.min(1, Math.max(0, f.civPotential * 0.85 + civJitter * 0.15));
  return {
    x: cx,
    y: cy,
    biome: classifyBiome(f),
    elevation: f.elevation,
    temperature: f.temperature,
    moisture: f.moisture,
    anomaly: f.anomaly,
    civilizationInfluence,
    poi: getPOIsForChunk(masterSeed, cx, cy, f.anomaly, worldNonce),
  };
}
