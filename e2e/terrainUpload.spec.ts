import {test,expect} from "@playwright/test";
import {terrainUploadPixels,TERRAIN_TYPED_UNPACK} from "../src/game/render/terrainUpload";
for(const api of ["webgl","webgl2"] as const)test(`terrain typed upload matches Canvas orientation ${api}`,async({page})=>{
 const source=[201,31,72,255,12,193,57,255,41,62,215,255,227,183,13,255];
 const upload=Array.from(terrainUploadPixels(new Uint8ClampedArray(source),2));
 const result=await page.evaluate(({api,source,upload,flags})=>{
  const gl=document.createElement("canvas").getContext(api) as WebGLRenderingContext;
  if(!gl)throw Error(`${api} unavailable`);
  const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,2,2,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
  const canvas=document.createElement("canvas");canvas.width=canvas.height=2;
  canvas.getContext("2d")!.putImageData(new ImageData(new Uint8ClampedArray(source),2,2),0,0);
  const fb=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,fb);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tex,0);
  const pixels=()=>{const data=new Uint8Array(16);gl.readPixels(0,0,2,2,gl.RGBA,gl.UNSIGNED_BYTE,data);return [...data];};
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,gl.RGBA,gl.UNSIGNED_BYTE,canvas);const reference=pixels();
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,flags.flipY);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,flags.premultiplyAlpha);
  gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,2,2,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array(upload));
  const typed=pixels(),error=gl.getError();gl.deleteFramebuffer(fb);gl.deleteTexture(tex);return {reference,typed,error};
 },{api,source,upload,flags:TERRAIN_TYPED_UNPACK});
 expect(result.error).toBe(0);expect(result.typed).toEqual(result.reference);
 expect(result.typed).toEqual([41,62,215,255,227,183,13,255,201,31,72,255,12,193,57,255]);
});
