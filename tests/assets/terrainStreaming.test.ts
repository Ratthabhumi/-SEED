import {describe,it,expect} from "vitest";
import {paintTerrainTile,TERRAIN_CELL as CELL,TERRAIN_STRIDE as STRIDE,TERRAIN_PAD as PAD} from "../../src/game/render/terrainTile";
import {mirroredTexel,terrainCorners} from "../../src/game/render/terrainBlend";
import {equipmentFrame,projectileFrame} from "../../src/game/render/combatSpriteIdentity";
import type {SimProj} from "../../src/core/sim/RunState";
describe("worker terrain presentation",()=>{
 const sources=Array.from({length:4},(_,id)=>Uint8ClampedArray.from({length:256*256*4},(_,i)=>i%4===3?255:(i*7+id*61)%256));
 const ids=[0,1,2,3,0,1,2,3,0];
 for(const [cx,cy] of [[0,0],[-3,5],[40,-60]])it(`matches every original CPU pixel at ${cx},${cy} including negative world`,()=>{
  const actual=paintTerrainTile(cx!,cy!,ids,sources);
  const expectedAll=new Uint8ClampedArray(CELL*CELL*3),actualAll=new Uint8ClampedArray(CELL*CELL*3);
  for(let y=0;y<CELL;y++)for(let x=0;x<CELL;x++){
   const wx=cx!*512+(x+.5)*512/CELL,wy=cy!*512+(y+.5)*512/CELL,c=terrainCorners(wx,wy),i=c.cx-cx!+1,j=c.cy-cy!+1;
   const src=(Math.floor(mirroredTexel(wy)/2)*256+Math.floor(mirroredTexel(wx)/2))*4,dst=((y+PAD)*STRIDE+x+PAD)*4;
   const a=sources[ids[i*3+j]!]!,b=sources[ids[(i+1)*3+j]!]!,d=sources[ids[i*3+j+1]!]!,e=sources[ids[(i+1)*3+j+1]!]!;
   const expected=new Uint8ClampedArray(3);
   const wa=(1-c.fx)*(1-c.fy),wb=c.fx*(1-c.fy),wd=(1-c.fx)*c.fy,we=c.fx*c.fy;
   for(let n=0;n<3;n++)expected[n]=(a[src+n]!*wa+b[src+n]!*wb+d[src+n]!*wd+e[src+n]!*we)*.72;
   // Avoid rounding-order changes: compare final encoded bytes, not approximate colors.
   expectedAll.set(expected,(y*CELL+x)*3);actualAll.set(actual.subarray(dst,dst+3),(y*CELL+x)*3);
  }
  expect(actualAll).toEqual(expectedAll);
  expect(actual.slice(0,4)).toEqual(actual.slice((PAD*STRIDE+PAD)*4,(PAD*STRIDE+PAD)*4+4));
  expect(actual).toEqual(paintTerrainTile(cx!,cy!,ids,sources));
 });
});
it("four Origins map actual projectile roles and all six canonical equipment tiers",()=>{
 const origins=["hunters","engineers","resonant","sentinels"];
 for(let i=0;i<origins.length;i++){
  for(let tier=0;tier<6;tier++)expect(equipmentFrame(origins[i]!,tier)).toBe(i*6+tier);
  expect(projectileFrame(origins[i]!,{src:"kinetic"} as SimProj)).toBe(i);
  expect(projectileFrame(origins[i]!,{src:"energy"} as SimProj)).toBe(i+4);
  for(const src of ["defense","squad"])expect(projectileFrame(origins[i]!,{src} as SimProj)).toBe(i+8);
 }
});
