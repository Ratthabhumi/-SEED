/** Two bounded child experiments, derived from canonical index without RNG. */
export type ChildCondition = "none" | "scarce" | "frontier";
export function childCondition(ascension: number): ChildCondition {
  return ascension <= 0 ? "none" : ascension % 2 === 1 ? "scarce" : "frontier";
}
export function childResearchBonusScale(ascension: number): number {
  return childCondition(ascension) === "scarce" ? 2 : 1;
}
export function childKnowledgeFactor(ascension: number, researchBonus: number): number {
  // Scarcity is recoverable through research placement: .8 with no base,
  // .96 with a normal tier-one base, 1.04 with a tundra tier-one base.
  return childCondition(ascension) === "scarce" ? .8 * (1 + childResearchBonusScale(ascension) * researchBonus) : 1 + researchBonus;
}
export function childRaidInterval(ascension: number, normal: number): number {
  return childCondition(ascension) === "frontier" ? normal * .75 : normal;
}
