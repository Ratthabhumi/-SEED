import {it,expect} from "vitest";
import {PaintedQuadBatch} from "../../src/game/render/PaintedQuadBatch";
import bounds from "../../src/game/assets/combatFrameBounds.json";
it("ordered atlas quad preserves position, aim, UVs and bounded reset without display objects per shot",()=>{
 let mesh:any;let objects=0;
 const scene:any={add:{mesh2d:(_x:number,_y:number,_t:string,vertices:number[])=>{
  objects++;mesh={vertices,setDepth(){return this;},setUseOrderedIndices(){return this;},setVisible(v:boolean){this.visible=v;return this;}};return mesh;
 }}};
 const batch=new PaintedQuadBatch(scene,"shots",2,6),frame:any={u0:.25,v0:.75,u1:.5,v1:.5};
 batch.begin();batch.draw(frame,100,200,40,10,0);batch.draw(frame,-100,-200,40,10,Math.PI/2);batch.draw(frame,999,999,40,10);batch.end();
 expect(objects).toBe(1);expect(mesh.indicesOrdered.length).toBe(16);
 expect(Array.from(mesh.vertices.slice(0,16))).toEqual([80,195,.25,.75,80,205,.25,.5,120,195,.5,.75,120,205,.5,.5]);
 expect(mesh.vertices[16]).toBeCloseTo(-95);expect(mesh.vertices[17]).toBeCloseTo(-220);
 expect(mesh.indicesOrdered.slice(0,8)).toEqual(new Uint16Array([0,1,2,0,1,2,3,0]));
 const buffer=mesh.vertices.buffer;
 batch.begin();batch.end();expect(mesh.visible).toBe(false);expect(mesh.indicesOrdered.length).toBe(0);
 batch.begin();batch.draw(frame,0,0,10,10);batch.end();expect(mesh.vertices.buffer).toBe(buffer);expect(mesh.indicesOrdered.length).toBe(8);expect(objects).toBe(1);
});
it("alpha bounds correspond to exact shipped bitmaps and stay inside their frames",()=>{
 for(const box of [...bounds.shots,...bounds.props]){
  expect(box.x).toBeGreaterThanOrEqual(0);expect(box.y).toBeGreaterThanOrEqual(0);expect(box.w).toBeGreaterThan(0);expect(box.h).toBeGreaterThan(0);
  expect(box.x+box.w).toBeLessThanOrEqual(box.cell);expect(box.y+box.h).toBeLessThanOrEqual(box.cell);
 }
});
it("transparent-margin trimming preserves the visible artwork scale and atlas sampling",()=>{
 let mesh:any;const scene:any={add:{mesh2d:(_x:number,_y:number,_t:string,vertices:number[])=>{mesh={vertices,setDepth(){return this;},setUseOrderedIndices(){return this;},setVisible(){return this;}};return mesh;}}};
 const batch=new PaintedQuadBatch(scene,"shots",1,6),frame:any={u0:.25,v0:.75,u1:.5,v1:.5};
 batch.begin();batch.draw(frame,100,200,40,10,0,{x:12,y:30,w:72,h:36,cell:96});batch.end();
 expect(mesh.vertices[0]).toBe(85);expect(mesh.vertices[1]).toBe(198.125);expect(mesh.vertices[12]).toBe(115);expect(mesh.vertices[13]).toBe(201.875);
 expect(mesh.vertices[2]).toBe(.28125);expect(mesh.vertices[3]).toBe(.671875);expect(mesh.vertices[14]).toBe(.46875);expect(mesh.vertices[15]).toBe(.578125);
});
