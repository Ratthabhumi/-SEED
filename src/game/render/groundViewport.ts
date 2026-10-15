import {CHUNK_SIZE} from "../../core/world/chunks";
export interface GroundBounds {left:number;right:number;top:number;bottom:number;}
/** Extra chunk protects decoration overhang and one-frame camera lag.
 * Quantized bounds rebuild only at edges; no texture or canonical-world cache. */
export function groundViewport(scrollX:number,scrollY:number,width:number,height:number,zoom:number,focus?:{x:number;y:number}):GroundBounds {
 const cx=scrollX+width/2,cy=scrollY+height/2,hw=width/zoom/2,hh=height/zoom/2;
 // World2/teleport can move the followed actor before Camera.preRender catches
 // up. Keep both views until then; still intersect the original7x7 neighborhood.
 return {left:Math.floor((Math.min(cx,focus?.x??cx)-hw)/CHUNK_SIZE)-1,right:Math.floor((Math.max(cx,focus?.x??cx)+hw)/CHUNK_SIZE)+1,
  top:Math.floor((Math.min(cy,focus?.y??cy)-hh)/CHUNK_SIZE)-1,bottom:Math.floor((Math.max(cy,focus?.y??cy)+hh)/CHUNK_SIZE)+1};
}
export const groundBoundsKey=(b:GroundBounds)=>`${b.left},${b.right},${b.top},${b.bottom}`;
