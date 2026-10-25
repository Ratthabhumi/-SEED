// Bounded chunk-descriptor cache. Performance-only: identical results to
// direct computation. Keyed by world identity so Ascension worlds never collide.
import { getChunkDescriptor } from "../world/chunks";
import type { ChunkDescriptor } from "../world/chunks";

export class ChunkCache {
  private map = new Map<string, ChunkDescriptor>();
  private cap: number;
  hits = 0;
  misses = 0;

  constructor(cap = 256) {
    this.cap = cap;
  }

  get(masterSeed: string, worldNonce: string, cx: number, cy: number): ChunkDescriptor {
    const key = `${worldNonce}:${cx},${cy}`;
    const hit = this.map.get(key);
    if (hit) { this.hits++; return hit; }
    this.misses++;
    const d = getChunkDescriptor(masterSeed, cx, cy, worldNonce);
    if (this.map.size >= this.cap) {
      const oldest = this.map.keys().next().value as string | undefined;
      if (oldest !== undefined) this.map.delete(oldest);
    }
    this.map.set(key, d);
    return d;
  }

  get size(): number {
    return this.map.size;
  }

  get hitRate(): number {
    const t = this.hits + this.misses;
    return t === 0 ? 1 : this.hits / t;
  }
}
