import { describe, it, expect } from "vitest";
import { getChunkDescriptor, worldToChunk, CHUNK_SIZE } from "../../src/core/world/chunks";
import { sampleBiome, sampleFields } from "../../src/core/world/biome";
import { getPOIsForChunk } from "../../src/core/world/poi";
import { isSafeSpawn } from "../../src/core/world/validator";
import { GOLDEN_SEEDS } from "../../src/core/seed/versions";

describe("world determinism", () => {
  for (const seed of GOLDEN_SEEDS) {
    it(`${seed}: same chunk descriptor twice`, () => {
      const a = getChunkDescriptor(seed, 3, -7);
      const b = getChunkDescriptor(seed, 3, -7);
      expect(a).toEqual(b);
    });

    it(`${seed}: same biome sample`, () => {
      expect(sampleBiome(seed, 1200, -450)).toBe(sampleBiome(seed, 1200, -450));
    });

    it(`${seed}: same POI decisions`, () => {
      const f = sampleFields(seed, 512 * 5.5, 512 * 2.5);
      expect(getPOIsForChunk(seed, 5, 2, f.anomaly)).toEqual(getPOIsForChunk(seed, 5, 2, f.anomaly));
    });

    it(`${seed}: safe spawn at origin`, () => {
      const d = getChunkDescriptor(seed, 0, 0);
      expect(d.poi).toHaveLength(0);
      expect(isSafeSpawn(d)).toBe(true);
    });
  }

  it("different seeds produce meaningful world differences", () => {
    const a = getChunkDescriptor("EPOCH-GOLDEN-001", 4, 4);
    const b = getChunkDescriptor("EPOCH-GOLDEN-002", 4, 4);
    expect(a).not.toEqual(b);
  });

  it("chunk math is consistent", () => {
    expect(CHUNK_SIZE).toBe(512);
    expect(worldToChunk(0, 0)).toEqual({ cx: 0, cy: 0 });
    expect(worldToChunk(511, 511)).toEqual({ cx: 0, cy: 0 });
    expect(worldToChunk(512, -1)).toEqual({ cx: 1, cy: -1 });
  });

  it("fields contain no NaN across a wide area", () => {
    for (let x = -4000; x <= 4000; x += 1000) {
      for (let y = -4000; y <= 4000; y += 1000) {
        const f = sampleFields("EPOCH-STRESS-001", x, y);
        for (const v of Object.values(f)) {
          expect(Number.isFinite(v)).toBe(true);
          expect(v).toBeGreaterThanOrEqual(0);
          expect(v).toBeLessThanOrEqual(1);
        }
      }
    }
  });
});
