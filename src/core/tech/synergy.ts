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
