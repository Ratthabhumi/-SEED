// World validation helpers.
import type { ChunkDescriptor } from "./chunks";

/** Spawn chunk must be walkable: not extreme anomaly, has no POI. */
export function isSafeSpawn(d: ChunkDescriptor): boolean {
  return d.anomaly < 0.85 && d.poi.length === 0;
}
