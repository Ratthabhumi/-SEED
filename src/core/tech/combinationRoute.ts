import type { TechNode } from "./graph";
import { eligibleTech } from "./web";
import { BREAKTHROUGHS } from "./synergy";

/** Guaranteed universal route. Advice and draft reservation use the SAME predicate.
 * No RNG, effects, free tags, age advancement or persistent state here. */
export function combinationRoute(nodes: readonly TechNode[], owned: readonly string[], tags: readonly string[],
  unlocked: readonly string[], ageIndex: number, families: ReadonlySet<string>) {
  const recipe = BREAKTHROUGHS.find(b => b.id === "metallurgy")!;
  const complete = unlocked.includes(recipe.id);
  const ingredients = recipe.requires.map(tag => {
    const node = nodes.find(n => n.id === `stone-${tag}`);
    const acquired = tags.includes(tag);
    return { tag, node, acquired, available: !!node && !acquired && eligibleTech(node, new Set(owned), ageIndex, families) };
  });
  return { recipe, complete, ingredients, next: complete ? undefined : ingredients.find(i => i.available)?.node };
}
