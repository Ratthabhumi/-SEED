import type Phaser from "phaser";
import {PaintedQuadBatch} from "./PaintedQuadBatch";

const QUADS=16;
/** Consecutive runs only: never regroup by texture/tint across another actor.
 * Maximum650 slots, each16 quads (~0.8MiB typed buffers at worst). No new atlas.
 * Scene owns Mesh lifecycle. Canvas and the explicit comparator use Images. */
export class OrderedActorBatch {
 private slots:Array<{batch:PaintedQuadBatch;key:string;tint:number;count:number}>=[];
 private used=0;
 private actors=0;
 private rows:Array<{key:string;frame:number;x:number;y:number;size:number;origin:number;flip:boolean}>=[];
 constructor(private scene:Phaser.Scene,private max:number,private depth:number){}
 begin(){this.used=0;this.actors=0;}
 draw(key:string,frame:number,x:number,y:number,size:number,origin:number,flip:boolean,tint:number){
  if(this.actors++>=this.max)throw Error("Actor pool exceeded "+this.max);
  let slot=this.slots[this.used-1];
  if(!slot||slot.key!==key||slot.tint!==tint||slot.count===QUADS){
   slot=this.slots[this.used++];
   if(!slot){slot={batch:new PaintedQuadBatch(this.scene,key,QUADS,this.depth),key,tint,count:0};this.slots.push(slot);}
   slot.key=key;slot.tint=tint;slot.count=0;slot.batch.style(key,tint);slot.batch.begin();
  }
  slot.batch.draw(this.scene.textures.getFrame(key,frame),x,y+(.5-origin)*size,size,size,0,undefined,flip);slot.count++;
  // Reuse review records; read only on explicit QA request, not per-frame DOM.
  const index=this.actors-1,record=this.rows[index];
  if(record){record.key=key;record.frame=frame;record.x=x;record.y=y;record.size=size;record.origin=origin;record.flip=flip;}
  else this.rows.push({key,frame,x,y,size,origin,flip});
 }
 end(){for(let i=0;i<this.slots.length;i++){const s=this.slots[i]!;if(i>=this.used)s.batch.begin();s.batch.end();}}
 // Preserve ActorRenderer.size as allocated actor capacity, not Mesh count.
 get size(){return this.rows.length;}
 counts(){return {actors:this.actors,activeRuns:this.used,allocatedRuns:this.slots.length,maxRuns:this.max,quadsPerRun:QUADS,bufferBytes:this.slots.length*QUADS*(16*4+8*2)};}
 review(){return this.rows.slice(0,this.actors).map(r=>({texture:r.key,frame:r.frame,rotation:0,flipX:r.flip,x:r.x,y:r.y,width:r.size,height:r.size,screenWidth:r.size*this.scene.cameras.main.zoom,inView:this.scene.cameras.main.worldView.contains(r.x,r.y)}));}
}
