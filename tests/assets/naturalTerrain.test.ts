import {it,expect} from "vitest";
import {naturalTerrainTexel,periodicTerrainSource} from "../../src/game/render/naturalTerrain";
it("natural coordinates are bounded, stable and do not mirror neighboring chunks",()=>{
 for(const axis of [0,1])for(let x=-5000;x<=5000;x+=13){expect(naturalTerrainTexel(x,axis)).toBe(naturalTerrainTexel(x,axis));expect(naturalTerrainTexel(x,axis)).toBeGreaterThanOrEqual(0);expect(naturalTerrainTexel(x,axis)).toBeLessThan(256);}
 const a=Array.from({length:252},(_,x)=>naturalTerrainTexel(x*2));const b=Array.from({length:252},(_,x)=>naturalTerrainTexel(1024-x*2));expect(a).not.toEqual(b);
});
it("one-time periodic preparation removes opposed hard edges and preserves uniform colors",()=>{
 const source=new Uint8ClampedArray(256*256*4);
 for(let y=0;y<256;y++)for(let x=0;x<256;x++){const i=(y*256+x)*4;source[i]=x;source[i+1]=y;source[i+2]=90;source[i+3]=255;}
 const out=periodicTerrainSource(source);
 for(let y=0;y<256;y++)expect(Math.abs(out[y*256*4]!-out[(y*256+255)*4]!)).toBeLessThanOrEqual(2);
 for(let x=0;x<256;x++)expect(Math.abs(out[x*4+1]!-out[(255*256+x)*4+1]!)).toBeLessThanOrEqual(2);
 expect(out[2]).toBe(90);expect(out[3]).toBe(255);
});
