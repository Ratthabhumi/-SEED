import type Phaser from "phaser";
import type {SimProj,SimMine,SimPickup} from "../../core/sim/RunState";
import {originRow,projectileFrame} from "./combatSpriteIdentity";
import {PaintedQuadBatch} from "./PaintedQuadBatch";
import bounds from "../assets/combatFrameBounds.json";
/** A shared painted atlas, lazily allocated bounded slots. Danger and hit radii
 * remain in canonical state; no bloom shader, particle spam or hidden attack.
 */
export class CombatSprites {
 private images:Phaser.GameObjects.Image[]=[];private count=0;
 private pickups:Phaser.GameObjects.Image[]=[];private pickupCount=0;
 private warm?:PaintedQuadBatch;private bright?:PaintedQuadBatch;private books?:PaintedQuadBatch;private peak=0;private pickupPeak=0;
 constructor(private scene:Phaser.Scene,private cap=1060){
  if("gl" in scene.game.renderer){this.warm=new PaintedQuadBatch(scene,"combat-projectiles",cap,6,0xe2d2b3);this.bright=new PaintedQuadBatch(scene,"combat-projectiles",cap,6);this.books=new PaintedQuadBatch(scene,"world-props",400,1);}
 }
 begin(){this.count=0;this.pickupCount=0;this.warm?.begin();this.bright?.begin();this.books?.begin();}
 private draw(frame:number,x:number,y:number,w:number,h:number,angle:number,tint:number){
  if(this.count>=this.cap)return;
  if(this.bright){this.count++;this.peak=Math.max(this.peak,this.count);(tint===0xffffff?this.bright:this.warm)!.draw(this.scene.textures.get("combat-projectiles").get(frame),x,y,w,h,angle,bounds.shots[frame]);return;}
  let image=this.images[this.count++];
  if(!image){image=this.scene.add.image(0,0,"combat-projectiles",frame).setDepth(6);this.images.push(image);}
  if(image.frame.name!==String(frame))image.setTexture("combat-projectiles",frame);
  image.setPosition(x,y).setDisplaySize(w,h).setRotation(angle).setTint(tint).setVisible(true);
 }
 projectile(p:SimProj,origin:string){
  const tier=Math.max(0,Math.min(5,p.visualTier??0)),height=Math.max(16,p.radius*2+8),width=Math.min(52,Math.max(32,height*(tier>=3?2.4:2.8)));
  this.draw(projectileFrame(origin,p),p.x,p.y,width,height,Math.atan2(p.vy,p.vx),tier<3?0xe2d2b3:0xffffff);
 }
 mine(m:SimMine,origin:string){this.draw(12+originRow(origin),m.x,m.y,36,36,0,0xffffff);}
 orbit(x:number,y:number,angle:number,origin:string,family:"field"|"defense"){this.draw((family==="field"?originRow(origin):8+originRow(origin)),x,y,40,24,angle,0xffffff);}
 knowledge(k:SimPickup,time:number,reduced:boolean){
  if(this.pickupCount>=400)return;
  const size=30+Math.min(6,k.value*.5),y=k.y+(reduced?0:Math.sin(time*3+k.x*.01)*2);
  if(this.books){this.pickupCount++;this.pickupPeak=Math.max(this.pickupPeak,this.pickupCount);this.books.draw(this.scene.textures.get("world-props").get(6),k.x,y,size,size,0,bounds.props[6]);return;}
  let image=this.pickups[this.pickupCount++];
  if(!image){image=this.scene.add.image(0,0,"world-props",6).setDepth(1);this.pickups.push(image);}
  image.setPosition(k.x,y).setDisplaySize(size,size).setVisible(true);
 }
 end(){this.warm?.end();this.bright?.end();this.books?.end();for(let i=this.count;i<this.images.length;i++)this.images[i]!.setVisible(false);for(let i=this.pickupCount;i<this.pickups.length;i++)this.pickups[i]!.setVisible(false);}
 counts(){return {allocated:this.bright?this.peak:this.images.length,visible:this.count,cap:this.cap,pickupAllocated:this.books?this.pickupPeak:this.pickups.length,pickupVisible:this.pickupCount,renderObjects:this.bright?3:this.images.length+this.pickups.length};}
}
