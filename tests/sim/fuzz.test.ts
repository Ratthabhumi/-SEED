import { describe, it, expect } from "vitest";
import { generateTechGraph } from "../../src/core/tech/generator";
import { validateTechGraph } from "../../src/core/tech/validator";
import { getChunkDescriptor } from "../../src/core/world/chunks";
import { threatBudget, composeFromBudget } from "../../src/core/director/director";
import { Xoshiro128StarStar } from "../../src/core/seed/rng";

// Deterministic generated corpus: hundreds of seeds, cheap enough for CI.
// Failure output prints the exact seed for reproduction.
function corpus(n: number): string[] {
  const out: string[] = [];
  let s = 0x12345678;
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  for (let i = 0; i < n; i++) {
    let a = "";
    let b = "";
    for (let k = 0; k < 4; k++) {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      a += alphabet[s % alphabet.length];
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      b += alphabet[s % alphabet.length];
    }
    out.push(`EPOCH-${a}-${b}`);
  }
  return out;
}

describe("generated corpus (300 seeds)", () => {
  const seeds = corpus(300);

  it("every generated tech graph validates", () => {
    for (const seed of seeds) {
      const v = validateTechGraph(generateTechGraph(seed, 0));
      expect(v.errors, seed).toEqual([]);
    }
  });

  it("every seed yields finite world + threat data", () => {
    for (const seed of seeds) {
      const d = getChunkDescriptor(seed, 5, -3);
      expect(Number.isFinite(d.elevation), seed).toBe(true);
      const rng = new Xoshiro128StarStar(42);
      const c = composeFromBudget(threatBudget(300, 2, 0) / 6, rng, 2);
      expect(c.chaser + c.ranged + c.tank + c.swarm + c.elite, seed).toBeGreaterThan(0);
    }
  });
});
