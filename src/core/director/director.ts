// Threat Budget Director: B(t,a) = B0 * (1 + ka*a) * (1 + kt*S(t)).
// Era-gated composition via explicit bounded weights (never tank-dominated).
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

// ---------------------------------------------------------------------------
// Elite affixes — data-first contract. An affix in the pool MUST have behavior.
// ---------------------------------------------------------------------------

export const ELITE_AFFIXES = ["swift", "armored", "volatile", "splitter", "shielded"] as const;
export type EliteAffix = (typeof ELITE_AFFIXES)[number];

export interface EliteAffixDef {
  id: EliteAffixId;
  /** Outgoing contact/shoot damage multiplier (armored does NOT deal less). */
  outgoingDamageMul: number;
  /** Damage taken multiplier. */
  incomingDamageMul: number;
  speedMul: number;
  maxHpMul: number;
  /** Absorbing shield as fraction of max HP (depleted before HP). */
  shieldFrac: number;
  /** Death explosion vs the PLAYER (0 = none). Fair: telegraphed, dash avoids. */
  volatileRadius: number;
  volatileDamage: number;
  /** Minions released at death position. */
  splitterCount: number;
}

export type EliteAffixId = EliteAffix;

export const ELITE_AFFIX_DEFS: Record<EliteAffixId, EliteAffixDef> = {
  swift: { id: "swift", outgoingDamageMul: 1, incomingDamageMul: 1, speedMul: 1.35, maxHpMul: 0.8, shieldFrac: 0, volatileRadius: 0, volatileDamage: 0, splitterCount: 0 },
  armored: { id: "armored", outgoingDamageMul: 1, incomingDamageMul: 0.65, speedMul: 0.85, maxHpMul: 1.6, shieldFrac: 0, volatileRadius: 0, volatileDamage: 0, splitterCount: 0 },
  volatile: { id: "volatile", outgoingDamageMul: 1, incomingDamageMul: 1, speedMul: 1.1, maxHpMul: 1, shieldFrac: 0, volatileRadius: 110, volatileDamage: 12, splitterCount: 0 },
  splitter: { id: "splitter", outgoingDamageMul: 1, incomingDamageMul: 1, speedMul: 1, maxHpMul: 1.2, shieldFrac: 0, volatileRadius: 0, volatileDamage: 0, splitterCount: 2 },
  shielded: { id: "shielded", outgoingDamageMul: 1, incomingDamageMul: 1, speedMul: 0.95, maxHpMul: 1, shieldFrac: 0.35, volatileRadius: 0, volatileDamage: 0, splitterCount: 0 },
};

// ---------------------------------------------------------------------------
// Composition — explicit per-era weights. Tanks locked until Bronze (age >= 1).
// ---------------------------------------------------------------------------

/** [swarm, chaser, ranged, tank] weights per age index (clamped to known eras). */
const ERA_WEIGHTS: [number, number, number, number][] = [
  [35, 40, 25, 0],   // stone: no tanks
  [25, 35, 25, 15],  // bronze
  [20, 30, 25, 25],  // iron
  [20, 25, 27, 28],  // industrial
  [18, 24, 28, 30],  // atomic
  [18, 22, 28, 32],  // space
];

const ERA_COSTS: [EnemyFamily, number][] = [
  ["swarm", 1], ["chaser", 1], ["ranged", 2], ["tank", 4],
];

/** Weighted single-family pick for an era (single-sourced through eligibleFamilies). */
export function pickFamily(rng: Xoshiro128StarStar, ageIndex: number): EnemyFamily {
  const allowed = eligibleFamilies(ageIndex, "ordinary");
  const w = ERA_WEIGHTS[Math.max(0, Math.min(ERA_WEIGHTS.length - 1, ageIndex))];
  const table: [EnemyFamily, number][] = [
    ["swarm", w[0] as number], ["chaser", w[1] as number],
    ["ranged", w[2] as number], ["tank", w[3] as number],
  ];
  const open = table.filter(([f]) => allowed.includes(f));
  const total = open.reduce((a, [, x]) => a + x, 0);
  let r = rng.nextFloat() * total;
  for (const [f, x] of open) {
    r -= x;
    if (r <= 0) return f;
  }
  return open[0]?.[0] ?? "chaser";
}

/**
 * Spend budget: elites first (each consumes THREAT_COST.elite from the same
 * budget), then weighted families. Elites never free-ride on top of the wave.
 */
export function composeFromBudget(budget: number, rng: Xoshiro128StarStar, ageIndex: number): Composition {
  const comp: Composition = { chaser: 0, ranged: 0, tank: 0, swarm: 0, elite: 0 };
  let b = Math.floor(budget);
  const chance = eliteChance(ageIndex, 0);
  let eliteGuard = 4;
  while (b >= THREAT_COST.elite && eliteGuard-- > 0 && rng.nextFloat() < chance * 2) {
    comp.elite++;
    b -= THREAT_COST.elite;
  }
  let guard = 200;
  while (b >= 1 && guard-- > 0) {
    const fam = pickFamily(rng, ageIndex);
    const cost = fam === "swarm" || fam === "chaser" ? 1 : fam === "ranged" ? 2 : 4;
    if (cost > b) {
      // Fall back to a cost-1 family so budget is never stranded.
      const cheap = fam === "tank" || fam === "ranged" ? (rng.nextFloat() < 0.5 ? "swarm" : "chaser") : fam;
      void ERA_COSTS;
      comp[cheap as "swarm" | "chaser"]++;
      b -= 1;
      continue;
    }
    comp[fam]++;
    b -= cost;
  }
  return comp;
}

/** Elite chance grows with age + ascension, bounded. */
export function eliteChance(ageIndex: number, ascension: number): number {
  return Math.min(0.22, 0.03 + ageIndex * 0.02 + ascension * 0.02);
}

// ---------------------------------------------------------------------------
// Era eligibility — the ONE canonical gate every spawn pathway must use.
// ---------------------------------------------------------------------------

export type EncounterType = "ordinary" | "milestone";

/**
 * Families allowed for (age, encounter). Tanks are locked until Bronze in ALL
 * pathways — milestone packs included (no special-encounter exception in v0.1.1).
 */
export function eligibleFamilies(ageIndex: number, _encounter: EncounterType): EnemyFamily[] {
  void _encounter;
  if (ageIndex < 1) return ["swarm", "chaser", "ranged"];
  return ["swarm", "chaser", "ranged", "tank"];
}
