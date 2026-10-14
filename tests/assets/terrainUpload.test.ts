import {test,expect} from "vitest";
import {terrainUploadPixels} from "../../src/game/render/terrainUpload";
test("typed terrain upload reverses rows without altering backing pixels or RGBA channels",()=>{
 const pixels=new Uint8ClampedArray([1,2,3,255,4,5,6,255,7,8,9,255,10,11,12,255]);
 const original=new Uint8ClampedArray(pixels),gpu=terrainUploadPixels(pixels,2);
 expect([...gpu]).toEqual([7,8,9,255,10,11,12,255,1,2,3,255,4,5,6,255]);
 expect(pixels).toEqual(original);
 expect([...terrainUploadPixels(new Uint8ClampedArray(gpu),2)]).toEqual([...original]);
});
