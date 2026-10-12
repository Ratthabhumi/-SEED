import type Phaser from "phaser";
import {facingPolicy,humanoid,type MotionPose} from "./actorMotion";
import { ACTOR_ASSETS, type ActorId } from "../assets/actorAssets";
/** Bound matches canonical enemy pool; allies use a separate bounded pool. */
export class ActorRenderer {
  private images: Phaser.GameObjects.Image[] = [];
  private count = 0;
  constructor(private scene: Phaser.Scene, private max: number, private depth: number) {}
  static frames(scene: Phaser.Scene): void {
    for (const id of Object.keys(ACTOR_ASSETS)) {
      if (!scene.textures.exists("actor-" + id)) throw new Error("Mandatory actor art missing: " + id);
      const texture = scene.textures.get("actor-" + id);
      for (let frame = 0; frame < (humanoid(id as ActorId)?36:18); frame++) if (!texture.has(String(frame))) texture.add(frame,0,frame*64,0,64,64);
    }
  }
  begin(): void { this.count = 0; }
  draw(id: ActorId,x: number,y: number,size: number,facing: number,time: number,moving: boolean,tint = 0xffffff, age = 0, pose?:MotionPose): void {
    if (this.count >= this.max) throw new Error("Actor pool exceeded " + this.max);
    let image = this.images[this.count++];
    if (!image) { image=this.scene.add.image(0,0,"actor-"+id,0).setDepth(this.depth); this.images.push(image); }
    const upright=facingPolicy(id)==='upright';
    const frame=Math.max(0,Math.min(5,age))*3+(moving?1+Math.floor(time*8)%2:0)+(humanoid(id)&&pose?.back?18:0);
    image.setTexture("actor-"+id,frame).setPosition(x,y).setDisplaySize(size,size).setRotation(upright?0:facing+Math.PI/2).setFlipX(upright?(pose?.flip??Math.cos(facing)<-0.15):false).setTint(tint).setVisible(true);
  }
  end(): void { for(let i=this.count;i<this.images.length;i++)this.images[i]!.setVisible(false); }
  get size(): number { return this.images.length; }
  review():unknown[] { return this.images.filter(i=>i.visible).map(i=>({texture:i.texture.key,frame:i.frame.name,rotation:i.rotation,flipX:i.flipX,x:i.x,y:i.y})); }
}
