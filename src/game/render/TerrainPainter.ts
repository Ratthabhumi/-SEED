import type Phaser from "phaser";
import type {ChunkDescriptor} from "../../core/world/chunks";
import type {BiomeId} from "../../core/world/biome";
import verdant from "../../../assets/seed/content15/verdant-floor-v1.png";
import arid from "../../../assets/seed/content15/arid-floor-v1.png";
import tundra from "../../../assets/seed/content15/tundra-floor-v1.png";
import badlands from "../../../assets/seed/content15/badlands-floor-v1.png";
import {TERRAIN_CELL as CELL,TERRAIN_STRIDE as STRIDE,TERRAIN_PAD as PAD} from "./terrainTile";
export const TERRAIN_TEXTURES={verdant,arid,tundra,badlands};
const IDS:BiomeId[]=["verdant","arid","tundra","badlands"],ATLAS=2048,SLOTS=64,KEY="painted-ground-atlas";
interface Entry{slot:number;used:number;serial:number;ready:boolean;readyAt:number;biome:BiomeId;}
interface Job{key:string;epoch:number;serial:number;cx:number;cy:number;ids:number[];}
interface Result{key:string;epoch:number;serial:number;pixels:Uint8ClampedArray;paintMs:number;}
/** Same Content14 pixels/atlas batching. CPU mixing runs off the frame thread;
 * at most one 256px subregion uploads per frame. Originals fill pending cells.
 */
export class TerrainPainter {
 private images:Phaser.GameObjects.Image[]=[];private fallbacks:Phaser.GameObjects.Image[]=[];
 private assigned:Entry[]=[];
 private cache=new Map<string,Entry>();private clock=0;private world="";private epoch=0;private serial=0;
 private worker?:Worker;private busy=false;private jobs:Job[]=[];private ready:Result[]=[];
 private visible:{key:string;x:number;y:number}[]=[];private atlas:Phaser.Textures.CanvasTexture;
 private tileCanvas:HTMLCanvasElement;private tileContext:CanvasRenderingContext2D;
 private hits=0;private misses=0;private uploads=0;private paintMs=0;private uploadCallMs=0;private uploadMaxMs=0;private workerFailed=false;
 private uploadedFrame=-1;
 private highContrast=false;
 private workerPaintMaxMs=0;
 private deliveredMs=0;private sentAt=0;private evictions=0;
 diagnosticTargets(){return {tile:this.tileContext,backing:this.atlas.getContext()};}
 constructor(private scene:Phaser.Scene){
  this.atlas=(scene.textures.exists(KEY)?scene.textures.get(KEY):scene.textures.createCanvas(KEY,ATLAS,ATLAS)) as Phaser.Textures.CanvasTexture;
  this.atlas.setFilter(0); // No mip chain: subregion updates keep linear sampling valid.
  for(let i=0;i<SLOTS;i++)if(!this.atlas.has(String(i)))this.atlas.add(i,0,(i%8)*STRIDE+PAD,Math.floor(i/8)*STRIDE+PAD,CELL,CELL);
  this.tileCanvas=document.createElement("canvas");this.tileCanvas.width=this.tileCanvas.height=STRIDE;this.tileContext=this.tileCanvas.getContext("2d")!;
  if(typeof Worker!=="undefined"){
   this.worker=new Worker(new URL("./terrainWorker.ts",import.meta.url),{type:"module"});
   const canvas=document.createElement("canvas");canvas.width=canvas.height=256;const ctx=canvas.getContext("2d",{willReadFrequently:true})!;
   const sources=IDS.map(id=>{ctx.clearRect(0,0,256,256);ctx.drawImage(scene.textures.get(`terrain-${id}`).getSourceImage() as CanvasImageSource,0,0,256,256);return ctx.getImageData(0,0,256,256).data;});
   this.worker.postMessage({type:"sources",sources},sources.map(s=>s.buffer));
   this.worker.onmessage=(event:MessageEvent<Result>)=>{this.deliveredMs=performance.now()-this.sentAt;this.busy=false;this.ready.push(event.data);};
   this.worker.onerror=(event)=>{event.preventDefault();this.workerFailed=true;this.worker?.terminate();this.worker=undefined;this.busy=false;this.jobs=[];this.ready=[];};
  }
  scene.events.once("shutdown",()=>{this.worker?.terminate();this.worker=undefined;this.jobs=[];this.ready=[];this.cache.clear();});
 }
 refresh(cx:number,cy:number,radius:number,chunk:(x:number,y:number)=>ChunkDescriptor,highContrast:boolean,world:string):void{
  if(world!==this.world){this.world=world;this.epoch++;this.cache.clear();this.jobs=[];this.ready=[];}
  const stamp=++this.clock;this.visible=[];
  this.highContrast=highContrast;
  const halfW=this.scene.scale.width/this.scene.cameras.main.zoom/2+512,halfH=this.scene.scale.height/this.scene.cameras.main.zoom/2+512;
  const candidates:{x:number;y:number;distance:number}[]=[];
  for(let x=cx-radius;x<=cx+radius;x++)for(let y=cy-radius;y<=cy+radius;y++){
   const key=`${x},${y}`;
   if(!highContrast&&Math.abs((x-cx)*512)<=halfW&&Math.abs((y-cy)*512)<=halfH)this.visible.push({key,x,y});
   candidates.push({x,y,distance:Math.max(Math.abs(x-cx),Math.abs(y-cy))});
  }
  const protectedKeys=new Set(this.visible.map(v=>v.key));
  // Visible tiles first, then the existing one-chunk visual margin prewarms.
  candidates.sort((a,b)=>Number(protectedKeys.has(`${b.x},${b.y}`))-Number(protectedKeys.has(`${a.x},${a.y}`))||a.distance-b.distance);
  if(!highContrast&&this.worker)for(const {x,y} of candidates){
   const key=`${x},${y}`,found=this.cache.get(key);if(found){found.used=stamp;this.hits++;continue;}
   this.misses++;let slot=this.cache.size;
   if(slot>=SLOTS){let oldest="",used=Infinity;
    for(const [k,e] of this.cache)if(!protectedKeys.has(k)&&e.used<used){oldest=k;used=e.used;slot=e.slot;}
    if(!oldest)continue;this.evictions++;this.cache.delete(oldest);this.jobs=this.jobs.filter(j=>j.key!==oldest);
   }
   const serial=++this.serial,ids:number[]=[];
   for(let ix=x-1;ix<=x+1;ix++)for(let iy=y-1;iy<=y+1;iy++)ids.push(IDS.indexOf(chunk(ix,iy).biome));
   this.cache.set(key,{slot,used:stamp,serial,ready:false,readyAt:0,biome:IDS[ids[4]!]!});
   this.jobs.push({key,epoch:this.epoch,serial,cx:x,cy:y,ids});
  }
  // Worker-unavailable fallback needs canonical biome identity, never blank tiles.
  if(!this.worker)for(const v of this.visible)if(!this.cache.has(v.key)){
   if(this.cache.size>=SLOTS)this.cache.delete(this.cache.keys().next().value!);
   this.cache.set(v.key,{slot:0,serial:0,used:stamp,ready:false,readyAt:0,biome:chunk(v.x,v.y).biome});
  }
  this.jobs.sort((a,b)=>Number(protectedKeys.has(b.key))-Number(protectedKeys.has(a.key))||Math.max(Math.abs(a.cx-cx),Math.abs(a.cy-cy))-Math.max(Math.abs(b.cx-cx),Math.abs(b.cy-cy)));
  this.update();
 }
 update():void{
  const frame=this.scene.game.loop.frame;
  const result=!this.highContrast&&this.uploadedFrame!==frame?this.ready.shift():undefined;
  if(result){const entry=this.cache.get(result.key);
   if(result.epoch===this.epoch&&entry?.serial===result.serial){
    this.paintMs=result.paintMs;this.workerPaintMaxMs=Math.max(this.workerPaintMaxMs,result.paintMs);const start=performance.now();this.upload(entry.slot,result.pixels);
    this.uploadCallMs=performance.now()-start;this.uploadMaxMs=Math.max(this.uploadMaxMs,this.uploadCallMs);this.uploads++;this.uploadedFrame=frame;
    entry.ready=true;entry.readyAt=performance.now();
   }
  }
  if(!this.highContrast&&this.worker&&!this.busy&&this.ready.length===0&&this.jobs.length){this.busy=true;this.sentAt=performance.now();this.worker.postMessage(this.jobs.shift()!);}
  const now=performance.now();let count=0;
  for(const v of this.visible){const entry=this.cache.get(v.key);if(!entry)continue;
   const index=count++,alpha=entry.ready?Math.min(1,(now-entry.readyAt)/160):0;
   let image=this.images[index];if(!image){image=this.scene.add.image(0,0,KEY,entry.slot).setDepth(-11).setOrigin(0,0);this.images.push(image);}
   let fallback=this.fallbacks[index];if(!fallback){fallback=this.scene.add.image(0,0,`terrain-${entry.biome}`).setDepth(-12).setOrigin(0,0);this.fallbacks.push(fallback);}
   if(this.assigned[index]!==entry){
    this.assigned[index]=entry;
    image.setTexture(KEY,entry.slot).setPosition(v.x*512,v.y*512).setDisplaySize(512,512);
    fallback.setTexture(`terrain-${entry.biome}`).setPosition(v.x*512,v.y*512).setDisplaySize(512,512).setTint(0xb8b8b8).setFlipX(Math.abs(v.x%2)===1).setFlipY(Math.abs(v.y%2)===1);
   }
   image.setAlpha(alpha).setVisible(alpha>0);fallback.setVisible(alpha<1);
  }
  for(let i=count;i<this.images.length;i++){this.images[i]!.setVisible(false);this.fallbacks[i]!.setVisible(false);}
 }
 private upload(slot:number,pixels:Uint8ClampedArray):void{
  const ax=(slot%8)*STRIDE,ay=Math.floor(slot/8)*STRIDE;
  this.tileContext.putImageData(new ImageData(pixels,STRIDE,STRIDE),0,0);
  this.atlas.getContext().drawImage(this.tileCanvas,ax,ay); // backing source survives WebGL context restoration
  const renderer=this.scene.game.renderer as Phaser.Renderer.WebGL.WebGLRenderer;
  if(!renderer.gl){this.atlas.refresh();return;}
  const gl=renderer.gl,units=renderer.glTextureUnits,texture=this.atlas.source[0]!.glTexture!,previous=units.units[0];
  units.bind(texture,0);
  renderer.glWrapper.updateTexturing({texturing:{flipY:true,premultiplyAlpha:true}});
  gl.texSubImage2D(gl.TEXTURE_2D,0,ax,ATLAS-ay-STRIDE,gl.RGBA,gl.UNSIGNED_BYTE,this.tileCanvas);
  units.bind(previous??null,0);
 }
 counts(){return {images:this.images.length,tiles:this.cache.size,atlasBytes:ATLAS*ATLAS*4,hits:this.hits,misses:this.misses,
  pending:this.jobs.length+(this.busy?1:0)+this.ready.length,uploads:this.uploads,uploadBytes:this.uploads*STRIDE*STRIDE*4,
  paintMs:this.paintMs,workerPaintMaxMs:this.workerPaintMaxMs,deliveredMs:this.deliveredMs,evictions:this.evictions,uploadCallMs:this.uploadCallMs,uploadMaxMs:this.uploadMaxMs,workerFailed:this.workerFailed,
  mode:this.worker?"worker-partial-upload":"source-fallback",ready:[...this.cache.values()].filter(e=>e.ready).length};}
}
