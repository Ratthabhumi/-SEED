// Version constants — seed identity = masterSeed + worldgenVersion + difficulty.
export const WORLDGEN_VERSION = 1;
export const CONTENT_VERSION = 1;
export const SAVE_SCHEMA_VERSION = 1;

export const GOLDEN_SEEDS = ["EPOCH-GOLDEN-001", "EPOCH-GOLDEN-002", "EPOCH-STRESS-001"] as const;

export function seedIdentity(masterSeed: string, difficulty: string): string {
  return `${masterSeed}@w${WORLDGEN_VERSION}:c${CONTENT_VERSION}:${difficulty}`;
}
