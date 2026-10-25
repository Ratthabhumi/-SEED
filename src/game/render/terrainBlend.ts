import type {BiomeId} from "../../core/world/biome";
import {CHUNK_SIZE} from "../../core/world/chunks";
/** Smooth presentation only. Canonical biome classification and movement stay chunk-based. */
export function terrainCorners(wx:number,wy:number){
  const gx=wx/CHUNK_SIZE-.5,gy=wy/CHUNK_SIZE-.5,cx=Math.floor(gx),cy=Math.floor(gy);
  return {cx,cy,fx:gx-cx,fy:gy-cy};
}
export function biomeWeights(wx:number,wy:number,at:(x:number,y:number)=>BiomeId):Record<BiomeId,number>{
  const {cx,cy,fx,fy}=terrainCorners(wx,wy);
  const weights:Record<BiomeId,number>={verdant:0,arid:0,tundra:0,badlands:0};
  weights[at(cx,cy)]+=(1-fx)*(1-fy);weights[at(cx+1,cy)]+=fx*(1-fy);
  weights[at(cx,cy+1)]+=(1-fx)*fy;weights[at(cx+1,cy+1)]+=fx*fy;
  return weights;
}
/** Mirror at every world-tile edge; neighboring pixels share the same source edge. */
export function mirroredTexel(world:number,size=512){const t=((Math.floor(world)%(size*2))+size*2)%(size*2);return t<size?t:size*2-1-t;}
