// Single owner of every mutable gameplay RNG stream in a run.
// Streams are (re)created ONLY here, from the canonical world seed —
// never carried across Ascension, never shared between subsystems.
import { deriveUint32 } from "./hash";
import { Xoshiro128StarStar } from "./rng";

export interface RunRngStreams {
  /** World ambience / POI rolls / misc event randomness. */
  event: Xoshiro128StarStar;
  /** Spawn director + enemy rolls. */
  enemy: Xoshiro128StarStar;
  /** Level-up draft selection. Never shared with loot. */
  draft: Xoshiro128StarStar;
  /** Loot/pickup variance. Cosmetic-adjacent; must never move draft/world. */
  loot: Xoshiro128StarStar;
  /** Boss selection/behavior rolls. */
  boss: Xoshiro128StarStar;
}

/** Fresh independent streams for exactly one world. Call on run start AND Ascension. */
export function initRunRng(worldSeed: string): RunRngStreams {
  return {
    event: new Xoshiro128StarStar(deriveUint32(worldSeed, "event")),
    enemy: new Xoshiro128StarStar(deriveUint32(worldSeed, "enemy")),
    draft: new Xoshiro128StarStar(deriveUint32(worldSeed, "draft")),
    loot: new Xoshiro128StarStar(deriveUint32(worldSeed, "loot")),
    boss: new Xoshiro128StarStar(deriveUint32(worldSeed, "boss")),
  };
}
