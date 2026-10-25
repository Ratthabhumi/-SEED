// v0.24 Enemy Ecology — layered archetypes with counterplay
// CHASSIS × ATTACK × MOBILITY × MODIFIER × ROLE

export type Chassis = "chaser" | "ranged" | "tank" | "swarm";
export type Attack = "melee" | "burst" | "beam" | "mine" | "summon";
export type Mobility = "rush" | "strafe" | "orbit" | "blink";
export type Modifier = "shielded" | "splitter" | "berserk" | "leech" | "emp" | "siege";
export type Role = "hunter" | "screen" | "artillery" | "breaker" | "raider";

export interface EnemyArchetype {
  id: string;
  chassis: Chassis;
  attack: Attack;
  mobility: Mobility;
  modifiers: Modifier[];
  role: Role;
  // Counterplay metadata
  counterplay: {
    weakTo: Attack[];
    resistantTo: Attack[];
    avoid: string[];
    priorityTarget: boolean;
  };
  // Visual identity
  silhouette: string;
  colorHint: string;
}

const CHASSIS_DEFS: Record<Chassis, { hpMul: number; speedMul: number; size: number }> = {
  chaser: { hpMul: 1.0, speedMul: 1.0, size: 1.0 },
  ranged: { hpMul: 0.7, speedMul: 1.0, size: 0.8 },
  tank: { hpMul: 2.5, speedMul: 0.5, size: 1.5 },
  swarm: { hpMul: 0.4, speedMul: 1.3, size: 0.5 },
};

const ATTACK_DEFS: Record<Attack, { range: number; dpsMul: number; tellTime: number }> = {
  melee: { range: 40, dpsMul: 1.2, tellTime: 0.3 },
  burst: { range: 300, dpsMul: 1.0, tellTime: 0.5 },
  beam: { range: 500, dpsMul: 0.8, tellTime: 1.0 },
  mine: { range: 0, dpsMul: 1.5, tellTime: 0.2 },
  summon: { range: 400, dpsMul: 0.6, tellTime: 1.5 },
};

const MOBILITY_DEFS: Record<Mobility, { speedMul: number; pattern: string }> = {
  rush: { speedMul: 1.5, pattern: "direct" },
  strafe: { speedMul: 1.0, pattern: "circle" },
  orbit: { speedMul: 0.8, pattern: "circle" },
  blink: { speedMul: 2.0, pattern: "teleport" },
};

const MODIFIER_DEFS: Record<Modifier, { effect: string; counterplay: string }> = {
  shielded: { effect: "blocks first hit per 2s", counterplay: "rapid fire / beam" },
  splitter: { effect: "splits on death", counterplay: "avoid killing near others" },
  berserk: { effect: "enrages at 30% HP", counterplay: "burst before threshold" },
  leech: { effect: "heals on hit", counterplay: "kite / burst" },
  emp: { effect: "disables energy/tech", counterplay: "kinetic/melee" },
  siege: { effect: "targets outposts", counterplay: "garrison / repair" },
};

const ROLE_DEFS: Record<Role, { behavior: string; priority: number }> = {
  hunter: { behavior: "chase player", priority: 1 },
  screen: { behavior: "protect allies", priority: 2 },
  artillery: { behavior: "long-range bombardment", priority: 3 },
  breaker: { behavior: "target outposts/structures", priority: 2 },
  raider: { behavior: "hit-and-run", priority: 1 },
};

// Incompatibility rules
const INCOMPATIBLE: Array<[string, string]> = [
  ["tank", "blink"],
  ["swarm", "artillery"],
  ["siege", "blink"],
  ["shielded", "emp"],
];

// World Law influence on ecology
export interface EcologyWeights {
  chassis: Record<string, number>;
  attack: Record<string, number>;
  mobility: Record<string, number>;
  modifier: Record<string, number>;
  role: Record<string, number>;
}

export function generateEcology(
  rng: ReturnType<typeof import("../seed/streams").createStreamRng>,
  laws: { domainBias: Record<string, number>; combatBias: Record<string, number> },
  worldAxes: { aggression: number; scarcity: number; anomaly: number; volatility: number; territoriality: number }
): {
  archetypes: Array<{
    id: string;
    chassis: string;
    attack: string;
    mobility: string;
    modifiers: string[];
    role: string;
  }>;
  weights: EcologyWeights;
} {
  // Build base weights
  const chassisWeights: Record<string, number> = { chaser: 1, ranged: 1, tank: 1, swarm: 1 };
  const attackWeights: Record<string, number> = { melee: 1, burst: 1, beam: 1, mine: 1, summon: 1 };
  const mobilityWeights: Record<string, number> = { rush: 1, strafe: 1, orbit: 1, blink: 1 };
  const modifierWeights: Record<string, number> = { shielded: 1, splitter: 1, berserk: 1, leech: 1, emp: 1, siege: 1 };
  const roleWeights: Record<string, number> = { hunter: 1, screen: 1, artillery: 1, breaker: 1, raider: 1 };

  // World Law influence
  // Aggression -> more rush/berserk/melee
  // Scarcity -> more siege/splitter/leech
  // Anomaly -> more blink/emp/summon
  // Volatility -> more blink/bomb/banshee
  // Territoriality -> more siege/screen/bastion

  return {
    archetypes: [], // Filled by generator
    weights: { chassis: {}, attack: {}, mobility: {}, modifier: {}, role: {} },
  };
}

export function generateArchetype(
  rng: ReturnType<typeof import("../seed/streams").createStreamRng>,
  weights: EcologyWeights
): string {
  // Deterministic archetype generation with incompatibility checking
  // Returns archetype ID
  return "";
}

export function composeEncounter(
  rng: ReturnType<typeof import("../seed/streams").createStreamRng>,
  ecology: { weights: EcologyWeights; archetypes: string[] },
  intent: "PRESSURE" | "SIEGE" | "AMBUSH" | "HUNT" | "DEFENSE" | "ANOMALY",
  budget: number,
  recentEncounters: Array<{ archetypes: string[]; intent: string }>
): Array<{ archetype: string; count: number }> {
  // Deterministic encounter composition
  return [];
}

export function getArchetypeCounterplay(archetype: { attack: string; modifiers: string[] }): {
  weakTo: string[];
  avoid: string[];
  priorityTarget: boolean;
} {
  // Return counterplay metadata for UI/tutorial
  return { weakTo: [], avoid: [], priorityTarget: false };
}