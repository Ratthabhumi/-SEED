// Deterministic POI candidates + spacing/constraint filter. Stateless per chunk.
import { deriveUint32, featureFloat01, FeatureSalt } from "../seed/hash";
import type { TechNode } from "../tech/graph";
import {classifyBiome,sampleFields,type BiomeId} from "./biome";

export type POIType = "ruin" | "meteor" | "vault" | "signal" | "megasite" | "worldtree";

export interface POI {
  id: string;
  type: POIType;
  /** Local offset inside chunk, world units relative to chunk origin. */
  lx: number;
  ly: number;
  /** World coords. */
  wx: number;
  wy: number;
  seedNote: string;
}

const POI_FAMILIES: POIType[] = ["ruin", "meteor", "vault", "signal"];
/** All mission families retain positive support; only type affinity changes. */
export const BIOME_POI_WEIGHTS:Record<BiomeId,readonly number[]>={
 verdant:[5,1,2,2], arid:[2,5,2,2], tundra:[3,1,5,2], badlands:[2,3,4,2],
};
export function biomePOIType(biome:BiomeId,roll:number):POIType {
 const weights=BIOME_POI_WEIGHTS[biome],total=weights.reduce((a,b)=>a+b,0);
 let target=Math.min(1-Number.EPSILON,Math.max(0,roll))*total;
 for(let i=0;i<weights.length;i++){target-=weights[i]!;if(target<0)return POI_FAMILIES[i]!;}
 return "signal";
}

/**
 * Families the world generator can actually place (P2-02 truth).
 * megasite/worldtree are authored, unit-tested and visualized but NOT
 * worldgen-integrated in v0.2 — integrating them would change seeded POI
 * type distribution (needs a deliberate versioning decision).
 */
export const WORLDGEN_POI_FAMILIES: POIType[] = [...POI_FAMILIES];

export function poiTypeFor(type: POIType): { knowledge: number; note: string } {
  switch (type) {
    case "ruin": return { knowledge: 25, note: "ANCIENT_RUIN" };
    case "meteor": return { knowledge: 30, note: "FALLEN_METEOR" };
    case "vault": return { knowledge: 40, note: "MACHINE_VAULT" };
    case "signal": return { knowledge: 50, note: "ALIEN_SIGNAL" };
    case "megasite": return { knowledge: 45, note: "RESOURCE_MEGASITE" };
    case "worldtree": return { knowledge: 60, note: "WORLD_TREE" };
  }
}

/**
 * First-discovery reward contract per POI family (ADR-0006 Decision 5).
 * "draft" families open a themed discovery draft; "cache" pays Knowledge +
 * full repair with no modal. Positions/visuals untouched.
 */
export const POI_MAJOR_KIND: Record<POIType, "draft" | "cache"> = {
  ruin: "draft",
  meteor: "draft",
  vault: "draft",
  signal: "draft",
  megasite: "cache",
  worldtree: "draft",
};

/** Themed discovery-draft filters — the per-family distinct reward contract. */
export const POI_DRAFT_FILTERS: Record<POIType, (n: TechNode) => boolean> = {
  ruin: (n) => n.domain === "science" || n.domain === "culture",
  meteor: (n) =>
    n.domain === "warfare" || n.synergyTags.includes("kinetic") || n.synergyTags.includes("energy"),
  vault: (n) => n.domain === "industry" || n.tags.includes("defense"),
  signal: (n) => n.rarity === "rare" || n.rarity === "mythic",
  megasite: () => true, // unreachable: megasite never opens a modal
  worldtree: (n) => n.effects.some((e) => e.kind === "regenAdd" || e.kind === "maxHpAdd"),
};

/**
 * 0–1 POIs per chunk (rarely 2 in high-anomaly chunks).
 * Origin chunk (0,0) never has a hostile POI — safe spawn guarantee.
 * IDs are world-scoped: the same coordinates on different ascension worlds
 * MUST NOT collide (worldNonce changes per ascension).
 */
export function getPOIsForChunk(masterSeed: string, cx: number, cy: number, anomaly: number, worldNonce = "w1"): POI[] {
  const terrainU32 = deriveUint32(masterSeed, "terrain");
  if (cx === 0 && cy === 0) return [];
  const density = 0.10 + anomaly * 0.25;
  const roll = featureFloat01(terrainU32, cx, cy, FeatureSalt.poi);
  if (roll > density) return [];
  const typeRoll = featureFloat01(terrainU32, cx, cy, FeatureSalt.ruin);
  const biome=classifyBiome(sampleFields(masterSeed,(cx+.5)*512,(cy+.5)*512));
  const type = biomePOIType(biome,typeRoll);
  const ox = featureFloat01(terrainU32, cx, cy, FeatureSalt.anomaly);
  const oy = featureFloat01(terrainU32, cy, cx, FeatureSalt.biome);
  const lx = 64 + ox * 384;
  const ly = 64 + oy * 384;
  const CH = 512;
  return [
    {
      id: `poi-${worldNonce}-${cx}-${cy}-0`,
      type,
      lx, ly,
      wx: cx * CH + lx,
      wy: cy * CH + ly,
      seedNote: poiTypeFor(type).note,
    },
  ];
}
