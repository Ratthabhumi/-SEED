// Deterministic POI candidates + spacing/constraint filter. Stateless per chunk.
import { deriveUint32, featureFloat01, FeatureSalt } from "../seed/hash";

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
  const type = POI_FAMILIES[Math.floor(typeRoll * POI_FAMILIES.length) % POI_FAMILIES.length] as POIType;
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
