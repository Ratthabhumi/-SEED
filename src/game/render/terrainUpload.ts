/** Reverse rows off-thread, then upload with unpack flipping disabled. WebGL1
 * can flip typed arrays too: reversing AND enabling flipY would flip twice. */
export const TERRAIN_TYPED_UNPACK={flipY:false,premultiplyAlpha:false} as const;
export function terrainUploadPixels(pixels:Uint8ClampedArray,stride:number):Uint8Array {
 const bytes=stride*4,out=new Uint8Array(pixels.length);
 for(let y=0;y<stride;y++)out.set(pixels.subarray(y*bytes,(y+1)*bytes),(stride-1-y)*bytes);
 return out;
}
