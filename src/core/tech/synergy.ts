// Breakthroughs: deterministic tag-combination bonuses. Data-driven.
export interface Breakthrough {
  id: string;
  requires: string[];
  titleKey: string;
  description: string;
}

export const BREAKTHROUGHS: Breakthrough[] = [
  { id: "metallurgy", requires: ["fire", "tools"], titleKey: "breakthrough.metallurgy", description: "+15% damage, +10% knowledge" },
  { id: "war-machine", requires: ["ballistics", "rotary"], titleKey: "breakthrough.warmachine", description: "+1 projectile, -10% cooldown" },
  { id: "bioforge", requires: ["medicine", "breeding"], titleKey: "breakthrough.bioforge", description: "+2 HP/s regen, +15% max HP" },
  { id: "grid", requires: ["tesla", "reactor"], titleKey: "breakthrough.grid", description: "Aura +1, +20% damage" },
  { id: "fortress", requires: ["fort", "armor"], titleKey: "breakthrough.fortress", description: "+60 max HP, +1 summon" },
];

/** Return breakthroughs whose required tags are all present in ownedTags. */
export function checkBreakthroughs(ownedTags: Set<string>, unlocked: Set<string>): Breakthrough[] {
  return BREAKTHROUGHS.filter((b) => !unlocked.has(b.id) && b.requires.every((t) => ownedTags.has(t)));
}
