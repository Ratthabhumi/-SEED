import type { BiomeId } from "./biome";
import type { OutpostSpec } from "./territory";

/** Content rules, independent of presentation. Location changes allocation value. */
export const BIOME_RULES: Record<BiomeId, { research: number; economy: number }> = {
  verdant: { research: 1, economy: 1.5 },
  arid: { research: 0.8, economy: 1.25 },
  tundra: { research: 1.5, economy: 0.75 },
  badlands: { research: 1.25, economy: 0.5 },
};

export function biomeSpecializationMultiplier(biome: BiomeId, spec: OutpostSpec): number {
  return spec === "military" ? 1 : BIOME_RULES[biome][spec];
}
