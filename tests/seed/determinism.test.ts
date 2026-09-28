import { describe, it, expect } from "vitest";
import { fnv1a32, deriveUint32, hash2D, featureFloat01, FeatureSalt, generateReadableSeed } from "../../src/core/seed/hash";
import { Xoshiro128StarStar } from "../../src/core/seed/rng";
import { createStreamRng, deriveSeed, deriveAscensionSeed } from "../../src/core/seed/streams";

describe("seed determinism", () => {
  it("same seed → same first PRNG sequence", () => {
    const a = new Xoshiro128StarStar(deriveUint32("EPOCH-GOLDEN-001", "tech"));
    const b = new Xoshiro128StarStar(deriveUint32("EPOCH-GOLDEN-001", "tech"));
    for (let i = 0; i < 50; i++) expect(a.nextUint32()).toBe(b.nextUint32());
  });

  it("different seeds produce meaningful differences", () => {
    const a = new Xoshiro128StarStar(deriveUint32("EPOCH-GOLDEN-001", "tech"));
    const b = new Xoshiro128StarStar(deriveUint32("EPOCH-GOLDEN-002", "tech"));
    const sa = Array.from({ length: 20 }, () => a.nextUint32());
    const sb = Array.from({ length: 20 }, () => b.nextUint32());
    expect(sa).not.toEqual(sb);
  });

  it("stream independence: cosmetic loot draws never change tech stream", () => {
    const techBefore = createStreamRng("EPOCH-GOLDEN-001", "tech").nextUint32();
    const loot = createStreamRng("EPOCH-GOLDEN-001", "loot");
    for (let i = 0; i < 1000; i++) loot.nextUint32(); // cosmetic spam
    expect(createStreamRng("EPOCH-GOLDEN-001", "tech").nextUint32()).toBe(techBefore);
  });

  it("derived seeds are stable and distinct per label", () => {
    expect(deriveSeed("EPOCH-X", "tech")).toBe(deriveSeed("EPOCH-X", "tech"));
    expect(deriveSeed("EPOCH-X", "tech")).not.toBe(deriveSeed("EPOCH-X", "enemy"));
    expect(deriveAscensionSeed("EPOCH-X", 1)).not.toBe(deriveAscensionSeed("EPOCH-X", 2));
  });

  it("stateless spatial hash is order-independent and stable", () => {
    const s = deriveUint32("EPOCH-GOLDEN-001", "terrain");
    const v1 = hash2D(s, 402, -193, FeatureSalt.poi);
    // query other coords in between — result must not change
    hash2D(s, 1, 2, FeatureSalt.poi);
    hash2D(s, -50, 999, FeatureSalt.poi);
    expect(hash2D(s, 402, -193, FeatureSalt.poi)).toBe(v1);
    expect(featureFloat01(s, 402, -193, FeatureSalt.poi)).toBeGreaterThanOrEqual(0);
    expect(featureFloat01(s, 402, -193, FeatureSalt.poi)).toBeLessThan(1);
  });

  it("serialization snapshot does not alter sequence", () => {
    const rng = new Xoshiro128StarStar(fnv1a32("EPOCH-GOLDEN-001"));
    rng.nextUint32(); rng.nextUint32();
    const snap = rng.snapshot();
    const after = rng.nextUint32();
    const restored = new Xoshiro128StarStar(0);
    (restored as unknown as { s: number[] }).s = [...snap];
    expect(restored.nextUint32()).toBe(after);
  });

  it("readable seeds match shareable format", () => {
    let n = 0.123456789;
    const s = generateReadableSeed(() => { n = (n * 9301 + 49297) % 233280; return n / 233280; });
    expect(s).toMatch(/^EPOCH-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  });
});
