// Tech DAG schema.
export type AgeId = "stone" | "bronze" | "iron" | "industrial" | "atomic" | "space";
export type Domain = "warfare" | "industry" | "science" | "culture";
export type Rarity = "common" | "uncommon" | "rare" | "mythic";

export interface TechEffect {
  kind:
    | "damageMul" | "maxHpAdd" | "moveMul" | "pickupMul" | "cooldownMul"
    | "projectileAdd" | "auraAdd" | "orbitAdd" | "summonAdd" | "mineAdd"
    | "beamAdd" | "regenAdd" | "dashCdMul" | "knowledgeMul" | "weaponEvolve";
  value: number;
  family?: "kinetic" | "energy" | "defense" | "field";
}

export interface TechNode {
  id: string;
  titleKey: string;
  descriptionKey: string;
  age: AgeId;
  domain: Domain;
  tags: string[];
  prerequisites: string[];
  exclusions: string[];
  rarity: Rarity;
  weight: number;
  effects: TechEffect[];
  synergyTags: string[];
}

export interface TechGraph {
  masterSeed: string;
  ascension: number;
  nodes: TechNode[];
}

export const AGES: AgeId[] = ["stone", "bronze", "iron", "industrial", "atomic", "space"];

/** Fixed critical spine — every generated graph must contain these ids in order. */
export const CRITICAL_SPINE: { id: string; age: AgeId }[] = [
  { id: "spine-tools", age: "stone" },
  { id: "spine-metallurgy", age: "bronze" },
  { id: "spine-ironwork", age: "iron" },
  { id: "spine-steam", age: "industrial" },
  { id: "spine-fission", age: "atomic" },
  { id: "spine-orbital", age: "space" },
];
