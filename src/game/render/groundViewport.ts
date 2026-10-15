import {CHUNK_SIZE} from "../../core/world/chunks";
export interface GroundBounds {left:number;right:number;top:number;bottom:number;}
/** Extra chunk protects decoration overhang and one-frame camera lag.
 * Quantized bounds rebuild only at edges; no texture or canonical-world cache. */
export function groundViewport(scrollX:number,scrollY:number,width:number,height:number,zoom:number):GroundBounds {
 const cx=scrollX+width/2,cy=scrollY+height/2,hw=width/zoom/2,hh=height/zoom/2;
 return {left:Math.floor((cx-hw)/CHUNK_SIZE)-1,right:Math.floor((cx+hw)/CHUNK_SIZE)+1,
  top:Math.floor((cy-hh)/CHUNK_SIZE)-1,bottom:Math.floor((cy+hh)/CHUNK_SIZE)+1};
}
export const groundBoundsKey=(b:GroundBounds)=>`${b.left},${b.right},${b.top},${b.bottom}`;
