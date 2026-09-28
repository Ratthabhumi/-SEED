import { describe, it, expect } from "vitest";
import { generateTechGraph } from "../../src/core/tech/generator";
import { validateTechGraph } from "../../src/core/tech/validator";
import { GOLDEN_SEEDS } from "../../src/core/seed/versions";
import type { TechGraph } from "../../src/core/tech/graph";

describe("tech DAG", () => {
  for (const seed of GOLDEN_SEEDS) {
    it(`${seed}: deterministic graph generation`, () => {
      const a = generateTechGraph(seed, 0);
      const b = generateTechGraph(seed, 0);
      expect(a).toEqual(b);
    });

    it(`${seed}: generated graph validates`, () => {
      const g = generateTechGraph(seed, 0);
      const v = validateTechGraph(g);
      expect(v.errors).toEqual([]);
      expect(v.ok).toBe(true);
    });

    it(`${seed}: ascension graph differs but validates`, () => {
      const g = generateTechGraph(seed, 3);
      expect(validateTechGraph(g).ok).toBe(true);
      expect(g).not.toEqual(generateTechGraph(seed, 0));
    });
  }

  it("rejects missing prerequisites", () => {
    const g: TechGraph = {
      masterSeed: "t", ascension: 0,
      nodes: [{ id: "a", titleKey: "x", descriptionKey: "y", age: "stone", domain: "warfare", tags: [], prerequisites: ["ghost"], exclusions: [], rarity: "common", weight: 1, effects: [], synergyTags: [] }],
    };
    expect(validateTechGraph(g).ok).toBe(false);
  });

  it("rejects cycles", () => {
    const mk = (id: string, pre: string[]): TechGraph["nodes"][number] => ({
      id, titleKey: "x", descriptionKey: "y", age: "stone", domain: "warfare", tags: [],
      prerequisites: pre, exclusions: [], rarity: "common", weight: 1, effects: [], synergyTags: [],
    });
    const g: TechGraph = { masterSeed: "t", ascension: 0, nodes: [mk("a", ["b"]), mk("b", ["a"])] };
    const v = validateTechGraph(g);
    expect(v.ok).toBe(false);
    expect(v.errors.some((e) => e.includes("cycle"))).toBe(true);
  });
});
