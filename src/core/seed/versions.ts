// Version constants — seed identity = masterSeed + worldgenVersion + difficulty.
//
// v0.1.1 compatibility notes:
// - WORLDGEN_VERSION 1 -> 2: seed normalization gained Unicode NFC, so some
//   non-ASCII seeds map differently. All ASCII seeds (incl. every EPOCH-* seed)
//   are byte-identical under NFC and generate identical worlds.
// - CONTENT_VERSION 1 -> 2: Tech DAG side branches attach directly to their
//   age's spine node (wide draft frontier) and age transitions auto-grant the
//   age spine node. Generated graphs for identical seeds differ from v0.1.
//
// v0.2 compatibility notes (ADR-0006):
// - WORLDGEN_VERSION stays 2: world generation positions unchanged.
// - CONTENT_VERSION 2 -> 3: identical seeds now have different Tech
//   availability (origin-gated drafts), POI reward semantics (major first
//   discoveries), and Ascension progression (legacy prestige reset).
//   Worlds look the same; what you can build in them differs.
//
// v0.2.1 civilization-command loop:
// - WORLDGEN_VERSION stays 2: chunk/POI coordinates and types unchanged
//   (territories reference generated POI ids; generation itself untouched).
// - CONTENT_VERSION 3 -> 4: three-gate age contract (no global time gate),
//   age missions, draft agency (pin/reserve/reroll/skip), territory/outpost/
//   raid systems, command squads + origin abilities. Same seed + same player
//   decisions still replay identically; old decision traces diverge by design.
//
// v0.23 frontier purpose:
// - WORLDGEN_VERSION stays 2: chunk/POI placement unchanged (stronghold is a
//   derived site over existing worldgen, never new generation).
// - CONTENT_VERSION 4 -> 5: stabilization timer replaced by the Dominion
//   territorial-control gate, boss spawns as the consequence of approaching
//   the revealed Stronghold. Same seed + same decisions replay identically.
// v0.23.1 interaction clarity + territory economy:
  // - WORLDGEN_VERSION stays 2: chunk/POI placement unchanged.
  // - CONTENT_VERSION 5 -> 6: Tech DAG side branches form deterministic
  //   progressive mini-paths (spine -> foundation -> specialization) instead of
  //   the wide frontier; outpost capacity + Knowledge upgrade costs gate the
  //   territory economy. Same seed + same decisions replay identically; old
  //   decision traces diverge by design.
  //
  // v0.24 emergent seed core:
  // - WORLDGEN_VERSION stays 2: chunk/POI placement unchanged.
  // - CONTENT_VERSION 6 -> 7: World Laws (domain bias, combat bias, world axes)
  //   and Offer Engine (Gumbel-Top-k, quality sampling, anti-pattern penalties)
  //   integrated into canonical runtime. Enemy ecology and emergence director
  //   remain experimental scaffolds. Same seed + same decisions replay identically.
  //
  // v0.25 player-visible emergence:
  // - WORLDGEN_VERSION stays 2: chunk/POI placement unchanged.
  // - CONTENT_VERSION 7 -> 8: Offer Engine two-stage separation (Stage 1 Gumbel-Top-k
  //   tech selection without quality coupling; Stage 2 quality sampling across all
  //   qualities in all ages without age clamping). Laws combatBias wired to combat-family
  //   tech score. Authoritative origin identity legibility and deterministic player-visible
  //   World Traits derived from domainBias and combatBias.
export const WORLDGEN_VERSION = 2;
export const CONTENT_VERSION = 8;
export const SAVE_SCHEMA_VERSION = 1;

export const GOLDEN_SEEDS = ["EPOCH-GOLDEN-001", "EPOCH-GOLDEN-002", "EPOCH-STRESS-001"] as const;

export function seedIdentity(masterSeed: string, difficulty: string): string {
  return `${masterSeed}@w${WORLDGEN_VERSION}:c${CONTENT_VERSION}:${difficulty}`;
}
