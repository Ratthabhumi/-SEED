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
export const WORLDGEN_VERSION = 2;
export const CONTENT_VERSION = 3;
export const SAVE_SCHEMA_VERSION = 1;

export const GOLDEN_SEEDS = ["EPOCH-GOLDEN-001", "EPOCH-GOLDEN-002", "EPOCH-STRESS-001"] as const;

export function seedIdentity(masterSeed: string, difficulty: string): string {
  return `${masterSeed}@w${WORLDGEN_VERSION}:c${CONTENT_VERSION}:${difficulty}`;
}
