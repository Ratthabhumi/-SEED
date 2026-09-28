// Independent deterministic substreams: one mutable RNG per subsystem label.
// Adding a cosmetic RNG call in one stream never affects another stream.
import { deriveUint32, normalizeSeedString } from "./hash";
import { Xoshiro128StarStar } from "./rng";

export const STREAM_LABELS = [
  "terrain",
  "biome",
  "tech",
  "enemy",
  "event",
  "boss",
  "loot",
  "anomaly",
  "poi",
] as const;

export type StreamLabel = (typeof STREAM_LABELS)[number] | `ascension:${number}` | string;

/** Canonical derived seed string for a subsystem. */
export function deriveSeed(masterSeed: string, label: string): string {
  return `${normalizeSeedString(masterSeed)}::${label}`;
}

/** Create an independent RNG for (masterSeed, label). */
export function createStreamRng(masterSeed: string, label: string): Xoshiro128StarStar {
  return new Xoshiro128StarStar(deriveUint32(masterSeed, label));
}

/** Child seed for ascension N (1-based): H(master, "ascension:N"). */
export function deriveAscensionSeed(masterSeed: string, ascensionIndex: number): string {
  return deriveSeed(masterSeed, `ascension:${ascensionIndex}`);
}
