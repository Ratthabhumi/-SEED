/** Retain every nontransparent texel and two sampling gutters; empty glyphs
 * fall back to vectors. Computed once on the CPU raster, never per frame. */
export function glyphBounds(data:ArrayLike<number>,cell:number){
 let left=cell,top=cell,right=-1,bottom=-1;
 for(let y=0;y<cell;y++)for(let x=0;x<cell;x++)if(data[(y*cell+x)*4+3]!>0){
  left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);
 }
 if(right<0)return undefined;
 left=Math.max(0,left-2);top=Math.max(0,top-2);right=Math.min(cell-1,right+2);bottom=Math.min(cell-1,bottom+2);
 return {x:left,y:top,w:right-left+1,h:bottom-top+1,cell};
}
