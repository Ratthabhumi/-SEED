import { describe, it, expect } from "vitest";
import {
  familyShape,
  affixMarker,
  bossShapeId,
  friendlyProjectileToken,
  hostileProjectileToken,
  pickupToken,
  poiToken,
  weaponVisual,
} from "../../src/game/render/VisualLanguage";
import { nearestInterest, isOffscreen } from "../../src/game/render/NavigationRenderer";
import { isVisualMode, isQAMode } from "../../src/qa/qaMode";
import { en } from "../../src/i18n/en";
import { th } from "../../src/i18n/th";

// Visual vocabulary contracts (docs/VISUAL_LANGUAGE.md): identity must never
// depend on color alone, and families/affixes/channels must stay distinct.
describe("visual language tokens", () => {
  it("maps every enemy family to a distinct stable shape", () => {
    const shapes = (["chaser", "ranged", "tank", "swarm"] as const).map(familyShape);
    expect(new Set(shapes).size).toBe(4);
    expect(familyShape("chaser")).toBe("triangle");
    expect(familyShape("ranged")).toBe("diamond");
    expect(familyShape("tank")).toBe("square");
    expect(familyShape("swarm")).toBe("paired-dot");
  });

  it("gives every elite affix a distinct non-text marker", () => {
    const markers = (["swift", "armored", "volatile", "splitter", "shielded"] as const).map(affixMarker);
    expect(new Set(markers).size).toBe(5);
    expect(markers).not.toContain("none");
    expect(affixMarker("")).toBe("none");
  });

  it("keeps boss silhouette distinct from the tank profile", () => {
    expect(bossShapeId()).not.toBe(familyShape("tank"));
  });

  it("separates friendly/hostile/pickup/POI channels", () => {
    expect(friendlyProjectileToken()).not.toBe(hostileProjectileToken());
    expect(pickupToken()).toBe("shard");
    expect(poiToken(false)).toBe("beacon");
    expect(poiToken(true)).toBe("ring-dim");
    expect(poiToken(false)).not.toBe(poiToken(true));
  });

  it("covers every weapon archetype visually", () => {
    expect(weaponVisual("projectile")).toBe("projectile");
    expect(weaponVisual("beam")).toBe("beam");
    expect(weaponVisual("aura")).toBe("aura");
    expect(weaponVisual("orbit")).toBe("orbit");
    expect(weaponVisual("summon")).toBe("summon");
    expect(weaponVisual("mine")).toBe("mine");
  });
});

describe("navigation math", () => {
  it("picks the nearest interest and reports angle/dist", () => {
    expect(nearestInterest(0, 0, [])).toBeNull();
    const hit = nearestInterest(0, 0, [
      { x: 300, y: 0, label: "far" },
      { x: 0, y: -100, label: "near" },
    ]);
    expect(hit?.label).toBe("near");
    expect(hit?.dist).toBe(100);
    expect(hit?.angleRad).toBeCloseTo(-Math.PI / 2);
  });

  it("detects off-screen targets with margin", () => {
    const view = { scrollX: 0, scrollY: 0, width: 800, height: 600 };
    expect(isOffscreen(view, 400, 300)).toBe(false);
    expect(isOffscreen(view, 900, 300)).toBe(true);
    expect(isOffscreen(view, -100, 300)).toBe(true);
    expect(isOffscreen(view, 400, 700)).toBe(true);
  });
});

describe("mode gating", () => {
  it("keeps visual-lab and QA dormant without their flags", () => {
    expect(isVisualMode("")).toBe(false);
    expect(isVisualMode("?qa=1")).toBe(false);
    expect(isVisualMode("?visual=1")).toBe(true);
    expect(isQAMode("?visual=1")).toBe(false);
    expect(isQAMode("?qa=1")).toBe(true);
  });

  it("keys every readability-critical label in EN and TH", () => {
    const keys = [
      "ui.boss", "ui.ascend", "ui.chooseTech", "ui.pause", "ui.died",
      "ui.contrast", "ui.contrastNormal", "ui.contrastHigh",
      "hint.move", "hint.auto", "hint.knowledge", "hint.draft", "hint.gated", "hint.poi",
      "poi.ruin.name", "poi.meteor.name", "poi.vault.name", "poi.signal.name",
      "age.stone", "age.space", "objective.space",
      "rarity.common", "rarity.mythic",
    ] as const;
    for (const k of keys) {
      expect(en[k], `en missing ${k}`).toBeTruthy();
      expect(th[k as keyof typeof th], `th missing ${k}`).toBeTruthy();
    }
  });
});
