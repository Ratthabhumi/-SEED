import type Phaser from "phaser";
import type {SimProj} from "../../core/sim/RunState";
import {PaintedQuadBatch} from "./PaintedQuadBatch";
import {drawFriendlyProj,type WeaponDrawOpts} from "./ProjectileRenderer";
import {glyphBounds} from "./glyphBounds";
const KEY="friendly-contrast-glyphs",CELL=96,MAX=64;
/** Bake the existing HC geometry, including its outline/trail, once per identity.
 * Gameplay density and threat presentation stay intact. Overflow/Canvas fall back. */
export class FriendlyProjectileBatch {
 private static nextGeneration=0;
 private generation=++FriendlyProjectileBatch.nextGeneration;
 private disposed=false;
 private atlas?:Phaser.Textures.CanvasTexture;private batch?:PaintedQuadBatch;
 private graphics?:Phaser.GameObjects.Graphics;private canvas?:HTMLCanvasElement;
 private frames=new Map<string,number>();private dirty=false;
 private bounds:Array<NonNullable<ReturnType<typeof glyphBounds>>>=[];
 constructor(private scene:Phaser.Scene,private crop=true){
  scene.events.once("shutdown",()=>{
   this.disposed=true;this.frames.clear();this.bounds=[];this.dirty=false;
   this.graphics?.destroy();this.graphics=undefined;this.canvas=undefined;
   // The texture manager owns the shared atlas; Scene owns the mesh.
   this.batch=undefined;this.atlas=undefined;
  });
 }
 private prepare(){
  const scene=this.scene;
  if(this.disposed||this.batch||!("gl" in scene.game.renderer))return;
  this.atlas=(scene.textures.exists(KEY)?scene.textures.get(KEY):scene.textures.createCanvas(KEY,CELL*8,CELL*8)) as Phaser.Textures.CanvasTexture;
  this.batch=new PaintedQuadBatch(scene,KEY,1000,6);
  this.graphics=scene.make.graphics({x:0,y:0});this.canvas=document.createElement("canvas");this.canvas.width=this.canvas.height=CELL;
  this.canvas.getContext("2d",{willReadFrequently:true}); // CPU raster: one-time alpha scan, no GPU readback
 }
 begin(){this.batch?.begin();}
 draw(p:SimProj,opts:WeaponDrawOpts):boolean{
  this.prepare();
  if(!this.batch||!this.atlas||!this.graphics||!this.canvas||p.radius>12||(!p.vx&&!p.vy))return false;
  const key=`${p.radius}:${p.color}:${p.src}:${p.visualTier}:${opts.origin}:${opts.reducedEffects}`;let frame=this.frames.get(key);
  if(frame===undefined){
   if(this.frames.size===MAX)return false;
   frame=this.frames.size;this.frames.set(key,frame);
   this.canvas.getContext("2d")!.clearRect(0,0,CELL,CELL);this.graphics.clear();
   drawFriendlyProj(this.graphics,{...p,x:CELL/2,y:CELL/2,vx:1,vy:0},opts);
   this.graphics.generateTexture(this.canvas,CELL,CELL);
   const bounds=glyphBounds(this.canvas.getContext("2d")!.getImageData(0,0,CELL,CELL).data,CELL);
   if(!bounds){this.frames.delete(key);return false;}this.bounds[frame]=bounds;
   const x=frame%8*CELL,y=Math.floor(frame/8)*CELL,ctx=this.atlas.getContext();ctx.clearRect(x,y,CELL,CELL);ctx.drawImage(this.canvas,x,y);
   if(!this.atlas.has(String(frame)))this.atlas.add(frame,0,x,y,CELL,CELL);this.dirty=true;
  }
  this.batch.draw(this.atlas.get(frame),p.x,p.y,CELL,CELL,Math.atan2(p.vy,p.vx),this.crop?this.bounds[frame]:undefined);return true;
 }
 end(){if(this.dirty){this.atlas!.refresh();this.dirty=false;}this.batch?.end();}
 counts(){return {generation:this.generation,disposed:this.disposed,glyphs:this.frames.size,maxGlyphs:MAX,atlasBytes:this.atlas?CELL*CELL*MAX*4:0,cropped:this.crop};}
}
