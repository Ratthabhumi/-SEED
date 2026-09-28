// Threat Budget Director: B(t,a) = B0 * (1 + ka*a) * (1 + kt*S(t)).
import type { Xoshiro128StarStar } from "../seed/rng";

export type EnemyFamily = "chaser" | "ranged" | "tank" | "swarm";

export interface Composition { chaser: number; ranged: number; tank: number; swarm: number; elite: number; }

export const THREAT_COST: Record<string, number> = { swarm: 1, chaser: 1, ranged: 2, tank: 4, elite: 8 };

export function smoothstep01(x: number): number {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
}

/** Budget scales smoothly with elapsed seconds, age index, ascension, difficulty. */
export function threatBudget(elapsedSec: number, ageIndex: number, ascension: number, difficultyMul = 1): number {
  const B0 = 10;
  const ka = 0.55;
  const kt = 2.2;
  const s = smoothstep01(elapsedSec / 720); // full pressure at ~12 min
  const asc = 1 + ascension * 0.35;
  return B0 * (1 + ka * ageIndex) * (1 + kt * s) * asc * difficultyMul;
}

/** Spend budget on enemy families with seeded weights; era-gated (tanks later, etc). */
export function composeFromBudget(budget: number, rng: Xoshiro128StarStar, ageIndex: number): Composition {
  const comp: Composition = { chaser: 0, ranged: 0, tank: 0, swarm: 0, elite: 0 };
  let b = Math.floor(budget);
  const allowRanged = ageIndex >= 0;
  const allowTank = ageIndex >= 1;
  const allowSwarm = true;
  let guard = 200;
  while (b >= 1 && guard-- > 0) {
    const r = rng.nextFloat();
    if (b >= 4 && allowTank && (r < 0.18 || ageIndex >= 3)) { comp.tank++; b -= 4; }
    else if (b >= 2 && allowRanged && r < 0.5) { comp.ranged++; b -= 2; }
    else if (allowSwarm && r < 0.72) { comp.swarm++; b -= 1; }
    else { comp.chaser++; b -= 1; }
  }
  return comp;
}

/** Elite chance grows with age + ascension, bounded. */
export function eliteChance(ageIndex: number, ascension: number): number {
  return Math.min(0.22, 0.03 + ageIndex * 0.02 + ascension * 0.02);
}

export const ELITE_AFFIXES = ["swift", "armored", "volatile", "splitter", "shielded"] as const;
export type EliteAffix = (typeof ELITE_AFFIXES)[number];
