// Biome fields + classifier. Deterministic from (masterSeed, world coords).
import { deriveUint32 } from "../seed/hash";
import { warpedFbm2D } from "./noise";

export type BiomeId = "verdant" | "arid" | "tundra" | "badlands";

export interface WorldFields {
  elevation: number;
  moisture: number;
  temperature: number;
  anomaly: number;
  civPotential: number;
}

/** Sample the five scalar fields at world coords (units). Scale: ~1 biome per 1400 units. */
export function sampleFields(masterSeed: string, x: number, y: number): WorldFields {
  const s = (label: string): number => deriveUint32(masterSeed, `terrain:${label}`);
  const nx = x / 1400;
  const ny = y / 1400;
  const elevation = warpedFbm2D(s("elevation"), 11, nx, ny);
  const moisture = warpedFbm2D(s("moisture"), 77, nx + 51.3, ny + 9.7);
  const temperature = warpedFbm2D(s("temperature"), 133, nx + 91.1, ny + 47.2);
  const anomaly = warpedFbm2D(s("anomaly"), 199, nx * 1.7 + 7.7, ny * 1.7 + 3.1);
  const civPotential = warpedFbm2D(s("civ"), 241, nx * 0.6 + 3.3, ny * 0.6 + 71.7);
  return { elevation, moisture, temperature, anomaly, civPotential };
}

export function classifyBiome(f: WorldFields): BiomeId {
  if (f.temperature < 0.32) return "tundra";
  if (f.moisture < 0.34 && f.temperature >= 0.42) return "arid";
  if (f.elevation > 0.62 && f.moisture < 0.45) return "badlands";
  return "verdant";
}

export function sampleBiome(masterSeed: string, x: number, y: number): BiomeId {
  return classifyBiome(sampleFields(masterSeed, x, y));
}
