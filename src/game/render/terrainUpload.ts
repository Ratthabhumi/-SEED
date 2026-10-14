/** Typed-array WebGL uploads ignore UNPACK_FLIP_Y. Reverse rows off-thread to
 * match the existing Canvas upload orientation; preserve the backing pixels. */
export function terrainUploadPixels(pixels:Uint8ClampedArray,stride:number):Uint8Array {
 const bytes=stride*4,out=new Uint8Array(pixels.length);
 for(let y=0;y<stride;y++)out.set(pixels.subarray(y*bytes,(y+1)*bytes),(stride-1-y)*bytes);
 return out;
}
