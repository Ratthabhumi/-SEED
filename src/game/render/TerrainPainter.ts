import type Phaser from "phaser";
import type {ChunkDescriptor} from "../../core/world/chunks";
import type {BiomeId} from "../../core/world/biome";
import verdant from "../../../assets/seed/terrain/verdant-v2.png";
import arid from "../../../assets/seed/terrain/arid-v1.png";
import tundra from "../../../assets/seed/terrain/tundra-v1.png";
import badlands from "../../../assets/seed/terrain/badlands-v1.png";
import {terrainCorners,mirroredTexel} from "./terrainBlend";
export const TERRAIN_TEXTURES={verdant,arid,tundra,badlands};
const CELL=252,SOURCE=256,STRIDE=256,PAD=2,ATLAS=2048,SLOTS=64,KEY="painted-ground-atlas";
interface Entry{slot:number;used:number;}
/** One bounded GPU atlas: all floor images batch; never one GPU texture per chunk. */
export class TerrainPainter {
  private images:Phaser.GameObjects.Image[]=[];
  private cache=new Map<string,Entry>();private clock=0;
  private world="";
  private source:Record<BiomeId,Uint8ClampedArray>={} as Record<BiomeId,Uint8ClampedArray>;
  private atlas:Phaser.Textures.CanvasTexture;
  constructor(private scene:Phaser.Scene){
    this.atlas=(scene.textures.exists(KEY)?scene.textures.get(KEY):scene.textures.createCanvas(KEY,ATLAS,ATLAS)) as Phaser.Textures.CanvasTexture;
    for(let i=0;i<SLOTS;i++)if(!this.atlas.has(String(i)))this.atlas.add(i,0,(i%8)*STRIDE+PAD,Math.floor(i/8)*STRIDE+PAD,CELL,CELL);
    const canvas=document.createElement("canvas");canvas.width=canvas.height=SOURCE;
    const context=canvas.getContext("2d",{willReadFrequently:true})!;
    for(const id of Object.keys(TERRAIN_TEXTURES) as BiomeId[]){
      context.clearRect(0,0,SOURCE,SOURCE);context.drawImage(scene.textures.get(`terrain-${id}`).getSourceImage() as CanvasImageSource,0,0,SOURCE,SOURCE);
      this.source[id]=context.getImageData(0,0,SOURCE,SOURCE).data;
    }
  }
  refresh(cx:number,cy:number,radius:number,chunk:(x:number,y:number)=>ChunkDescriptor,highContrast:boolean,world:string):void{
    if(world!==this.world){this.world=world;this.cache.clear();}
    const stamp=++this.clock;let count=0,dirty=false;
    const visible=new Set<string>();
    const halfW=this.scene.scale.width/this.scene.cameras.main.zoom/2+512,halfH=this.scene.scale.height/this.scene.cameras.main.zoom/2+512;
    for(let x=cx-radius;x<=cx+radius;x++)for(let y=cy-radius;y<=cy+radius;y++){
      if(!highContrast&&Math.abs((x-cx)*512)<=halfW&&Math.abs((y-cy)*512)<=halfH)visible.add(`${x},${y}`);
    }
    for(const key of visible){
      const [x,y]=key.split(",").map(Number) as [number,number];
      let entry=this.cache.get(key);
      if(!entry){
        let slot=this.cache.size;
        if(slot>=SLOTS){
          let oldestKey="",oldest=Infinity;
          for(const [k,v] of this.cache)if(!visible.has(k)&&v.used<oldest){oldest=v.used;oldestKey=k;slot=v.slot;}
          if(!oldestKey)throw new Error("Terrain atlas budget exceeded");
          this.cache.delete(oldestKey);
        }
        this.paint(x,y,slot,chunk);entry={slot,used:stamp};this.cache.set(key,entry);dirty=true;
      }
      entry.used=stamp;
      let image=this.images[count++];
      if(!image){image=this.scene.add.image(0,0,KEY,entry.slot).setDepth(-11).setOrigin(0,0);this.images.push(image);}
      image.setTexture(KEY,entry.slot).setPosition(x*512,y*512).setDisplaySize(512,512).setVisible(true);
    }
    for(let i=count;i<this.images.length;i++)this.images[i]!.setVisible(false);
    if(dirty)this.atlas.refresh();
  }
  private paint(cx:number,cy:number,slot:number,chunk:(x:number,y:number)=>ChunkDescriptor){
    const context=this.atlas.getContext(),image=context.createImageData(CELL,CELL),out=image.data;
    // Resolve neighbor identities once; no descriptor queries/allocations per pixel.
    const ids:BiomeId[][]=[];for(let x=cx-1;x<=cx+1;x++){const row:BiomeId[]=[];for(let y=cy-1;y<=cy+1;y++)row.push(chunk(x,y).biome);ids.push(row);}
    for(let y=0;y<CELL;y++)for(let x=0;x<CELL;x++){
      const wx=cx*512+(x+.5)*512/CELL,wy=cy*512+(y+.5)*512/CELL,c=terrainCorners(wx,wy);
      const i=c.cx-cx+1,j=c.cy-cy+1;
      const a=this.source[ids[i]![j]!],b=this.source[ids[i+1]![j]!],d=this.source[ids[i]![j+1]!],e=this.source[ids[i+1]![j+1]!];
      const source=(Math.floor(mirroredTexel(wy)/2)*SOURCE+Math.floor(mirroredTexel(wx)/2))*4,target=(y*CELL+x)*4;
      const wa=(1-c.fx)*(1-c.fy),wb=c.fx*(1-c.fy),wd=(1-c.fx)*c.fy,we=c.fx*c.fy;
      for(let n=0;n<3;n++)out[target+n]=(a[source+n]!*wa+b[source+n]!*wb+d[source+n]!*wd+e[source+n]!*we)*.72;
      out[target+3]=255;
    }
    const ax=(slot%8)*STRIDE,ay=Math.floor(slot/8)*STRIDE,canvas=this.atlas.getCanvas();
    context.putImageData(image,ax+PAD,ay+PAD);
    // Extrude edges: GPU linear filtering must never sample an unrelated atlas cell.
    context.drawImage(canvas,ax+PAD,ay+PAD,1,CELL,ax,ay+PAD,PAD,CELL);
    context.drawImage(canvas,ax+PAD+CELL-1,ay+PAD,1,CELL,ax+PAD+CELL,ay+PAD,PAD,CELL);
    context.drawImage(canvas,ax,ay+PAD,STRIDE,1,ax,ay,STRIDE,PAD);
    context.drawImage(canvas,ax,ay+PAD+CELL-1,STRIDE,1,ax,ay+PAD+CELL,STRIDE,PAD);
  }
  counts(){return {images:this.images.length,tiles:this.cache.size,atlasBytes:ATLAS*ATLAS*4};}
}
