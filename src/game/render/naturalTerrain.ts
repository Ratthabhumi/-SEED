/** Stable world coordinates, no mirrored motifs or random camera-state noise. */
export function naturalTerrainTexel(world:number,axis=0):number {
 const warped=world/2+21*Math.sin(world/(353+axis*37)+1.7)+9*Math.sin(world/(577+axis*61)+2.4);
 return ((Math.floor(warped)%256)+256)%256;
}
/** One-time Worker preparation: shifted cross-fade makes periodic source edges
 * continuous without mirroring or doing extra blend taps in the travel loop. */
export function periodicTerrainSource(source:Uint8ClampedArray):Uint8ClampedArray {
 const out=new Uint8ClampedArray(source.length),weights=Array.from({length:256},(_,i)=>Math.sin(i*Math.PI/256)**2);
 for(let y=0;y<256;y++)for(let x=0;x<256;x++){
  const fx=weights[x]!,fy=weights[y]!,dst=(y*256+x)*4;
  for(let n=0;n<3;n++){
   const a=source[(y*256+x)*4+n]!,b=source[(y*256+(x+128)%256)*4+n]!,c=source[(((y+128)%256)*256+x)*4+n]!,d=source[(((y+128)%256)*256+(x+128)%256)*4+n]!;
   out[dst+n]=a*fx*fy+b*(1-fx)*fy+c*fx*(1-fy)+d*(1-fx)*(1-fy);
  }out[dst+3]=255;
 }return out;
}
