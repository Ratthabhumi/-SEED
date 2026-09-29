// Breakthroughs: deterministic tag-combination bonuses. Data-driven, typed effects.
// Applied through the SAME canonical effect system as technologies (progression.ts).
import type { TechEffect } from "./graph";
import type { EnKeys } from "../../i18n/en";

export interface Breakthrough {
  id: string;
  requires: string[];
  titleKey: EnKeys;
  descriptionKey: EnKeys;
  effects: TechEffect[];
}

export const BREAKTHROUGHS: Breakthrough[] = [
  {
    id: "metallurgy", requires: ["fire", "tools"],
    titleKey: "breakthrough.metallurgy", descriptionKey: "breakthrough.metallurgy.description",
    effects: [{ kind: "damageMul", value: 0.15 }, { kind: "knowledgeMul", value: 0.1 }],
  },
  {
    id: "war-machine", requires: ["ballistics", "rotary"],
    titleKey: "breakthrough.warmachine", descriptionKey: "breakthrough.warmachine.description",
    effects: [{ kind: "projectileAdd", value: 1 }, { kind: "cooldownMul", value: -0.1 }],
  },
  {
    id: "bioforge", requires: ["medicine", "breeding"],
    titleKey: "breakthrough.bioforge", descriptionKey: "breakthrough.bioforge.description",
    effects: [{ kind: "regenAdd", value: 1.5 }, { kind: "maxHpAdd", value: 30 }],
  },
  {
    id: "grid", requires: ["tesla", "reactor"],
    titleKey: "breakthrough.grid", descriptionKey: "breakthrough.grid.description",
    effects: [{ kind: "auraAdd", value: 1 }, { kind: "damageMul", value: 0.15 }],
  },
  {
    id: "fortress", requires: ["fort", "armor"],
    titleKey: "breakthrough.fortress", descriptionKey: "breakthrough.fortress.description",
    effects: [{ kind: "maxHpAdd", value: 60 }, { kind: "summonAdd", value: 1 }],
  },
];

/** Return breakthroughs whose required tags are all present in ownedTags. */
export function checkBreakthroughs(ownedTags: Set<string>, unlocked: Set<string>): Breakthrough[] {
  return BREAKTHROUGHS.filter((b) => !unlocked.has(b.id) && b.requires.every((t) => ownedTags.has(t)));
}

/** Tags with localized display names (used by synergy progress UI). */
const DISPLAY_TAGS = [
  "fire", "tools", "ballistics", "rotary", "medicine",
  "breeding", "tesla", "reactor", "fort", "armor",
] as const;

/** i18n key for a tag, or null when the tag has no display name. */
export function tagDisplayKey(tag: string): EnKeys | null {
  return (DISPLAY_TAGS as readonly string[]).includes(tag) ? (`tag.${tag}` as EnKeys) : null;
}

export interface SynergyProgress {
  id: string;
  titleKey: EnKeys;
  have: number;
  need: number;
  missing: string[];
}

/** Progress of every un-unlocked breakthrough, sorted nearest-first (stable). */
export function breakthroughProgress(ownedTags: readonly string[], unlocked: readonly string[]): SynergyProgress[] {
  const owned = new Set(ownedTags);
  const done = new Set(unlocked);
  return BREAKTHROUGHS
    .filter((b) => !done.has(b.id))
    .map((b) => {
      const missing = b.requires.filter((t) => !owned.has(t));
      return { id: b.id, titleKey: b.titleKey, have: b.requires.length - missing.length, need: b.requires.length, missing };
    })
    .sort((a, b) => (a.need - a.have) - (b.need - b.have));
}

/** Nearest N breakthrough goals for the HUD build panel. */
export function nearestBreakthroughs(ownedTags: readonly string[], unlocked: readonly string[], n = 2): SynergyProgress[] {
  return breakthroughProgress(ownedTags, unlocked).slice(0, Math.max(0, n));
}

/**
 * Which (single) breakthrough would `node` complete right now, if any?
 * Truth contract: the UI COMPLETES preview must match actual unlock —
 * node tags + owned tags must cover requires, and it must not be unlocked.
 */
export function completingBreakthrough(
  nodeTags: readonly string[],
  ownedTags: readonly string[],
  unlocked: readonly string[],
): Breakthrough | null {
  const combined = new Set([...ownedTags, ...nodeTags]);
  const done = new Set(unlocked);
  for (const b of BREAKTHROUGHS) {
    if (done.has(b.id)) continue;
    if (b.requires.every((t) => combined.has(t))) return b;
  }
  return null;
}
