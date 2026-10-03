// v0.24 World Laws — deterministic seed-derived universe rules
// Derived ONLY from masterSeed, WORLDGEN_VERSION, CONTENT_VERSION
// using isolated seeded streams. No Math.random.

import { createStreamRng } from "../seed/streams";
import { WORLDGEN_VERSION, CONTENT_VERSION } from "../seed/versions";

export interface WorldLaws {
  // Domain biases (sum to 1.0)
  domainBias: Record<string, number>;
  // Combat family biases (sum to 1.0)
  combatBias: Record<string, number>;
  // Continuous world axes
  aggression: number;
  scarcity: number;
  anomaly: number;
  volatility: number;
  territoriality: number;
  // Identity
  seedIdentity: string;
}

const DOMAINS = ["warfare", "industry", "science", "culture"];
const COMBAT_FAMILIES = ["kinetic", "energy", "defense", "field"];

function softmax(z: number[], temp = 1.0): number[] {
  const maxZ = Math.max(...z);
  const exps = z.map((v) => Math.exp((v - maxZ) / temp));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((v) => v / sum);
}

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

export function generateWorldLaws(
  masterSeed: string,
  worldgenVersion = WORLDGEN_VERSION,
  contentVersion = CONTENT_VERSION
): WorldLaws {
  // Derive a dedicated stream for world laws (never collides with other streams)
  const label = `world-laws:v${worldgenVersion}:c${contentVersion}`;
  const rng = createStreamRng(masterSeed, label);

  // Sample independent normal variables via Box-Muller for each axis
  const nextNormal = (): number => {
    let u = 0, v = 0;
    while (u === 0) u = rng.nextFloat();
    while (v === 0) v = rng.nextFloat();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  };

  // Domain bias: raw normal -> softmax
  const domainRaw = DOMAINS.map(() => nextNormal());
  const domainBiasArr = softmax(domainRaw, 1.0);
  const domainBias: Record<string, number> = {};
  DOMAINS.forEach((d, i) => { domainBias[d] = domainBiasArr[i]; });

  // Combat family bias
  const combatRaw = COMBAT_FAMILIES.map(() => nextNormal());
  const combatBiasArr = softmax(combatRaw, 1.0);
  const combatBias: Record<string, number> = {};
  COMBAT_FAMILIES.forEach((f, i) => { combatBias[f] = combatBiasArr[i]; });

  // World axes via sigmoid (bounded 0..1)
  const aggression = sigmoid(nextNormal());
  const scarcity = sigmoid(nextNormal());
  const anomaly = sigmoid(nextNormal());
  const volatility = sigmoid(nextNormal());
  const territoriality = sigmoid(nextNormal());

  // Identity string for debugging/audit
  const seedIdentity = `${masterSeed}@w${worldgenVersion}:c${contentVersion}:laws`;

  return {
    domainBias,
    combatBias,
    aggression,
    scarcity,
    anomaly,
    volatility,
    territoriality,
    seedIdentity,
  };
}

export function worldLawsAffix(world: WorldLaws): string[] {
  const tags: string[] = [];
  const maxBias = Math.max(...Object.values(world.domainBias));
  const dominantDomain = Object.keys(world.domainBias).find((k) => world.domainBias[k] === maxBias);
  if (dominantDomain) tags.push(`dominant:${dominantDomain}`);
  if (world.aggression > 0.7) tags.push("high-aggression");
  if (world.scarcity > 0.7) tags.push("high-scarcity");
  if (world.anomaly > 0.7) tags.push("high-anomaly");
  if (world.volatility > 0.7) tags.push("high-volatility");
  if (world.territoriality > 0.7) tags.push("high-territoriality");
  return tags;
}