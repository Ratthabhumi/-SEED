import { describe, it, expect } from "vitest";
import { en } from "../../src/i18n/en";
import { th } from "../../src/i18n/th";
import { t, ulen } from "../../src/i18n/i18n";

describe("localization parity (release-blocking)", () => {
  it("every EN key exists in TH", () => {
    for (const k of Object.keys(en)) {
      expect(th[k as keyof typeof en], `missing TH key: ${k}`).toBeDefined();
    }
  });

  it("every TH key exists in EN (no orphans)", () => {
    for (const k of Object.keys(th)) {
      expect((en as Record<string, string>)[k], `orphan TH key: ${k}`).toBeDefined();
    }
  });

  it("no empty translations", () => {
    for (const [k, v] of Object.entries(th)) {
      expect(v.trim().length, `empty TH value: ${k}`).toBeGreaterThan(0);
    }
    for (const [k, v] of Object.entries(en)) {
      expect(v.trim().length, `empty EN value: ${k}`).toBeGreaterThan(0);
    }
  });

  it("no undefined translation is rendered for known keys", () => {
    for (const k of Object.keys(en)) {
      const v = t(k as keyof typeof en);
      expect(v).not.toBe("undefined");
      expect(v.length).toBeGreaterThan(0);
    }
  });

  it("Thai strings survive Unicode-safe iteration (no UTF-16 splitting)", () => {
    const thai = th["age.stone"];
    expect(ulen(thai)).toBeGreaterThan(0);
    expect(Array.from(thai).join("")).toBe(thai);
    // Combining marks preserved: re-join must equal original for all TH values
    for (const v of Object.values(th)) {
      expect(Array.from(v).join("")).toBe(v);
    }
  });
});
