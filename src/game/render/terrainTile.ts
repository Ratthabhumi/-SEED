import {mirroredTexel,terrainCorners} from "./terrainBlend";
export const TERRAIN_CELL=252,TERRAIN_STRIDE=256,TERRAIN_PAD=2;
/** Presentation pixels only; runs in a Worker, with identical Content14 mixing.
 * Includes clamped gutters in the transferable buffer for partial GPU uploads.
 */
export function paintTerrainTile(cx:number,cy:number,ids:number[],sources:Uint8ClampedArray[]):Uint8ClampedArray{
 const cell=TERRAIN_CELL,stride=TERRAIN_STRIDE,pad=TERRAIN_PAD,out=new Uint8ClampedArray(stride*stride*4);
 const coords=Array.from({length:cell},(_,i)=>(i+.5)*512/cell);
 const xs=coords.map(x=>terrainCorners(cx*512+x,cy*512).cx-cx+1);
 const xf=coords.map(x=>terrainCorners(cx*512+x,cy*512).fx);
 const xt=coords.map(x=>Math.floor(mirroredTexel(cx*512+x)/2)*4);
 for(let y=0;y<cell;y++){
  const wy=cy*512+coords[y]!,corner=terrainCorners(cx*512,wy),j=corner.cy-cy+1,fy=corner.fy;
  const sy=Math.floor(mirroredTexel(wy)/2)*256*4;
  for(let x=0;x<cell;x++){
   const i=xs[x]!,fx=xf[x]!,src=sy+xt[x]!,dst=((y+pad)*stride+x+pad)*4;
   const a=sources[ids[i*3+j]!]!,b=sources[ids[(i+1)*3+j]!]!,c=sources[ids[i*3+j+1]!]!,d=sources[ids[(i+1)*3+j+1]!]!;
   const wa=(1-fx)*(1-fy),wb=fx*(1-fy),wc=(1-fx)*fy,wd=fx*fy;
   for(let n=0;n<3;n++)out[dst+n]=(a[src+n]!*wa+b[src+n]!*wb+c[src+n]!*wc+d[src+n]!*wd)*.72;
   out[dst+3]=255;
  }
 }
 for(let y=0;y<stride;y++)for(let x=0;x<stride;x++){
  if(x>=pad&&x<stride-pad&&y>=pad&&y<stride-pad)continue;
  const from=(Math.max(pad,Math.min(stride-pad-1,y))*stride+Math.max(pad,Math.min(stride-pad-1,x)))*4;
  const to=(y*stride+x)*4;for(let n=0;n<4;n++)out[to+n]=out[from+n]!;
 }
 return out;
}
