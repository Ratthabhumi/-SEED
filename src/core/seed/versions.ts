// Version constants — seed identity = masterSeed + worldgenVersion + difficulty.
//
// v0.1.1 compatibility notes:
// - WORLDGEN_VERSION 1 -> 2: seed normalization gained Unicode NFC, so some
//   non-ASCII seeds map differently. All ASCII seeds (incl. every EPOCH-* seed)
//   are byte-identical under NFC and generate identical worlds.
// - CONTENT_VERSION 1 -> 2: Tech DAG side branches attach directly to their
//   age's spine node (wide draft frontier) and age transitions auto-grant the
//   age spine node. Generated graphs for identical seeds differ from v0.1.
export const WORLDGEN_VERSION = 2;
export const CONTENT_VERSION = 2;
export const SAVE_SCHEMA_VERSION = 1;

export const GOLDEN_SEEDS = ["EPOCH-GOLDEN-001", "EPOCH-GOLDEN-002", "EPOCH-STRESS-001"] as const;

export function seedIdentity(masterSeed: string, difficulty: string): string {
  return `${masterSeed}@w${WORLDGEN_VERSION}:c${CONTENT_VERSION}:${difficulty}`;
}
