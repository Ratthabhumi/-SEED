import { describe, it, expect } from "vitest";
import {
  familyShape,
  affixMarker,
  bossShapeId,
  friendlyProjectileToken,
  hostileProjectileToken,
  pickupToken,
  decorationToken,
  poiToken,
  poiGlyph,
  weaponVisual,
  contrastFilter,
} from "../../src/game/render/VisualLanguage";
import {
  LAB_SECTIONS,
  COMPOSITES,
  CONTRAST_MATRIX_TOKENS,
  countPlacements,
} from "../../src/game/render/LabSpec";
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
    expect(familyShape("swarm")).toBe("tri-cluster");
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
    // Round 2: hostile is an arrowhead spike, knowledge a crystal shard —
    // distinguishable without color.
    expect(hostileProjectileToken()).toBe("arrowhead-spike");
    expect(pickupToken()).toBe("crystal-shard");
    expect(hostileProjectileToken()).not.toBe(pickupToken());
    expect(poiToken(false)).toBe("beacon");
    expect(poiToken(true)).toBe("ring-dim");
    expect(poiToken(false)).not.toBe(poiToken(true));
  });

  it("keeps gameplay tokens distinct from background decoration", () => {
    expect(decorationToken()).toBe("plus-mark");
    expect(pickupToken()).not.toBe(decorationToken());
    expect(familyShape("swarm")).not.toBe(decorationToken());
    expect(hostileProjectileToken()).not.toBe(decorationToken());
  });

  it("gives every POI family a unique destination glyph", () => {
    const glyphs = (["ruin", "meteor", "vault", "signal", "megasite", "worldtree"] as const).map(poiGlyph);
    expect(new Set(glyphs).size).toBe(6);
  });

  it("exposes a grayscale diagnostic filter for the lab", () => {
    expect(contrastFilter("normal")).toBe("");
    expect(contrastFilter("grayscale")).toBe("grayscale(1)");
    expect(contrastFilter("high")).toBe("");
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

describe("visual lab coverage", () => {
  it("registers specimen, matrix, and composite sections", () => {
    expect(LAB_SECTIONS).toContain("contrast-matrix");
    expect(LAB_SECTIONS).toContain("composite-verdant");
    expect(LAB_SECTIONS).toContain("composite-arid");
  });

  it("builds dense deterministic composites (verdant)", () => {
    const spec = COMPOSITES.find((c) => c.id === "composite-verdant");
    expect(spec?.biome).toBe("verdant");
    expect(countPlacements(spec!, "enemy", "chaser")).toBe(8);
    expect(countPlacements(spec!, "enemy", "ranged")).toBe(4);
    expect(countPlacements(spec!, "enemy", "tank")).toBe(2);
    expect(countPlacements(spec!, "enemy", "swarm")).toBe(10);
    expect(countPlacements(spec!, "elite")).toBe(1);
    expect(countPlacements(spec!, "friendly")).toBeGreaterThanOrEqual(3);
    expect(countPlacements(spec!, "hostile")).toBeGreaterThanOrEqual(3);
    expect(countPlacements(spec!, "knowledge")).toBeGreaterThanOrEqual(3);
    expect(countPlacements(spec!, "mine")).toBe(1);
    expect(countPlacements(spec!, "poi")).toBe(1);
  });

  it("builds dense deterministic composites (arid)", () => {
    const spec = COMPOSITES.find((c) => c.id === "composite-arid");
    expect(spec?.biome).toBe("arid");
    expect(countPlacements(spec!, "enemy", "chaser")).toBe(8);
    expect(countPlacements(spec!, "enemy", "ranged")).toBe(4);
    expect(countPlacements(spec!, "enemy", "tank")).toBe(2);
    expect(countPlacements(spec!, "enemy", "swarm")).toBe(8);
    expect(countPlacements(spec!, "elite")).toBe(1);
    expect(countPlacements(spec!, "mine")).toBe(1);
    expect(countPlacements(spec!, "poi")).toBe(1);
  });

  it("reviews critical tokens for the contrast matrix", () => {
    for (const t of ["player", "chaser", "swarm", "friendly", "hostile", "knowledge", "mine"] as const) {
      expect(CONTRAST_MATRIX_TOKENS).toContain(t);
    }
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
