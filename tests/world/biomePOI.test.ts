import {it,expect} from "vitest";
import {biomePOIType,BIOME_POI_WEIGHTS,getPOIsForChunk} from "../../src/core/world/poi";
import {getChunkDescriptor} from "../../src/core/world/chunks";
it("biome affinity favors identity without excluding Signal or other mission families",()=>{
 for(const biome of Object.keys(BIOME_POI_WEIGHTS) as Array<keyof typeof BIOME_POI_WEIGHTS>){
  const counts={ruin:0,meteor:0,vault:0,signal:0,megasite:0,worldtree:0};
  for(let i=0;i<11000;i++)counts[biomePOIType(biome,(i+.5)/11000)]++;
  for(const family of ["ruin","meteor","vault","signal"] as const)expect(counts[family]).toBeGreaterThan(900);
  const dominant=biome==="verdant"?"ruin":biome==="arid"?"meteor":"vault";
  expect(counts[dominant]).toBe(Math.max(...Object.values(counts)));
 }
});
it("actual chunks and direct generation agree, are world-scoped and repeatable",()=>{
 for(let x=-15;x<=15;x++)for(let y=-15;y<=15;y++){
  const a=getChunkDescriptor("EPOCH-GOLDEN-001",x,y,"w2");
  expect(a.poi).toEqual(getPOIsForChunk("EPOCH-GOLDEN-001",x,y,a.anomaly,"w2"));
  expect(a).toEqual(getChunkDescriptor("EPOCH-GOLDEN-001",x,y,"w2"));
  for(const p of a.poi){expect(p.id).toContain("w2");expect(p.wx).toBeGreaterThanOrEqual(x*512+64);expect(p.wx).toBeLessThan(x*512+448);}
 }
});
