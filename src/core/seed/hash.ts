// Deterministic string hashing + stateless spatial hashing.
// No Math.random() anywhere in this module. All functions are pure.

/** FNV-1a 32-bit. Stable across platforms for UTF-16 code units of ASCII seeds. */
export function fnv1a32(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Normalize a user-entered seed: NFC + trim + collapse inner whitespace. Case is preserved. */
export function normalizeSeedString(raw: string): string {
  return raw
    .normalize("NFC")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 64);
}

/** Derive a deterministic uint32 for (masterSeed, label). Independent per label. */
export function deriveUint32(masterSeed: string, label: string): number {
  return fnv1a32(`${normalizeSeedString(masterSeed)}::${label}`);
}

/** Convert uint32 -> float in [0, 1). */
export function uint32ToFloat01(u: number): number {
  return (u >>> 0) / 4294967296;
}

/**
 * Stateless 2D integer hash: feature(seedU32, x, y, saltU32) -> uint32.
 * Uses only Math.imul / shifts (no Math.sin). Order-independent.
 */
export function hash2D(seedU32: number, x: number, y: number, saltU32: number): number {
  let h = (seedU32 ^ saltU32) >>> 0;
  h = Math.imul(h ^ (Math.imul(x | 0, 0x85ebca6b) >>> 0), 0xc2b2ae35);
  h = Math.imul(h ^ (Math.imul(y | 0, 0x27d4eb2f) >>> 0), 0x165667b1);
  h ^= h >>> 15;
  h = Math.imul(h, 0x2c1b3c6d);
  h ^= h >>> 12;
  h = Math.imul(h, 0x297a2d39);
  h ^= h >>> 15;
  return h >>> 0;
}

/** Stateless float in [0,1) for a coordinate-addressable feature. */
export function featureFloat01(seedU32: number, x: number, y: number, featureSalt: number): number {
  return uint32ToFloat01(hash2D(seedU32, x, y, featureSalt));
}

/** Feature salting labels — stable integers, never change values after v1. */
export const FeatureSalt = {
  terrain: 0x9e3779b9,
  biome: 0x85ebca6b,
  poi: 0xc2b2ae35,
  anomaly: 0x27d4eb2f,
  ruin: 0x165667b1,
} as const;

/** Generate a human-readable shareable seed: EPOCH-XXXX-XXXX (A-Z, 2-9, no confusables). */
export function generateReadableSeed(rngFloat: () => number): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const pick = (n: number): string => {
    let s = "";
    for (let i = 0; i < n; i++) s += alphabet[Math.floor(rngFloat() * alphabet.length) % alphabet.length];
    return s;
  };
  return `EPOCH-${pick(4)}-${pick(4)}`;
}

/**
 * New random master seed for "Random Seed" buttons / empty input.
 * This is user-facing entropy (choosing WHICH deterministic world to play),
 * not simulation randomness — everything after this point stays deterministic.
 */
export function generateRandomSeed(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const buf = new Uint32Array(8);
  crypto.getRandomValues(buf);
  let a = "";
  let b = "";
  for (let i = 0; i < 4; i++) {
    a += alphabet[(buf[i] as number) % alphabet.length];
    b += alphabet[(buf[i + 4] as number) % alphabet.length];
  }
  return `EPOCH-${a}-${b}`;
}
