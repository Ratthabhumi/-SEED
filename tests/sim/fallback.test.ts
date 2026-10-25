import { describe, it, expect } from "vitest";
import { fallbackCards } from "../../src/core/sim/RunSimulation";
import { en, type EnKeys } from "../../src/i18n/en";
import { th } from "../../src/i18n/th";

// Localization contract: fallback display numbers match mechanics exactly.
describe("fallback card text/effect consistency", () => {
  it("uses dedicated keys (never reuses another tech's description)", () => {
    for (const c of fallbackCards(3)) {
      expect(c.titleKey.startsWith("tech.fallback."), c.id).toBe(true);
      expect(c.descriptionKey.startsWith("tech.fallback."), c.id).toBe(true);
    }
  });

  it("displayed numbers equal effect values, EN + TH", () => {
    const [dmg, hp, spd] = fallbackCards(3);
    expect(en[dmg!.descriptionKey as EnKeys]).toContain("10%");
    expect(dmg!.effects[0]).toMatchObject({ kind: "damageMul", value: 0.1 });
    expect(en[hp!.descriptionKey as EnKeys]).toContain("25");
    expect(hp!.effects[0]).toMatchObject({ kind: "maxHpAdd", value: 25 });
    expect(en[spd!.descriptionKey as EnKeys]).toContain("7%");
    expect(spd!.effects[0]).toMatchObject({ kind: "moveMul", value: 0.07 });
    for (const c of [dmg!, hp!, spd!]) {
      expect(th[c.titleKey as EnKeys].length).toBeGreaterThan(0);
      expect(th[c.descriptionKey as EnKeys].length).toBeGreaterThan(0);
    }
  });
});
