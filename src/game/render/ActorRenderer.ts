import type Phaser from "phaser";
import {facingPolicy,humanoid,type MotionPose} from "./actorMotion";
import { ACTOR_ASSETS, type ActorId } from "../assets/actorAssets";
import { HERO_ASSETS } from "../assets/heroAssets";
import type {HeroAction} from "./heroActions";
/** Bound matches canonical enemy pool; allies use a separate bounded pool. */
export class ActorRenderer {
  private images: Phaser.GameObjects.Image[] = [];
  private count = 0;
  constructor(private scene: Phaser.Scene, private max: number, private depth: number) {}
  static frames(scene: Phaser.Scene): void {
    const boss=scene.textures.get("boss-v2");
    for(let i=0;i<8;i++)if(!boss.has(String(i)))boss.add(i,0,(i%4)*128,Math.floor(i/4)*128,128,128);
    const enemies=scene.textures.get("enemies-v2");
    for(let i=0;i<16;i++)if(!enemies.has(String(i)))enemies.add(i,0,(i%4)*128,Math.floor(i/4)*128,128,128);
    for(const id of Object.keys(HERO_ASSETS)) {
      if(!scene.textures.exists("hero-v2-"+id))throw new Error("Hero atlas missing: "+id);
      const texture=scene.textures.get("hero-v2-"+id);
      for(let i=0;i<16;i++)if(!texture.has(String(i)))texture.add(i,0,(i%4)*128,Math.floor(i/4)*128,128,128);
    }
    for (const id of Object.keys(ACTOR_ASSETS)) {
      if (!scene.textures.exists("actor-" + id)) throw new Error("Mandatory actor art missing: " + id);
      const texture = scene.textures.get("actor-" + id);
      for (let frame = 0; frame < (humanoid(id as ActorId)?36:18); frame++) if (!texture.has(String(frame))) texture.add(frame,0,frame*64,0,64,64);
    }
  }
  begin(): void { this.count = 0; }
  draw(id: ActorId,x: number,y: number,size: number,facing: number,time: number,moving: boolean,tint = 0xffffff, age = 0, pose?:MotionPose, action?:HeroAction, bossPose?:number, enemyPose?:number): void {
    if (this.count >= this.max) throw new Error("Actor pool exceeded " + this.max);
    let image = this.images[this.count++];
    if (!image) { image=this.scene.add.image(0,0,"actor-"+id,0).setDepth(this.depth); this.images.push(image); }
    const upright=facingPolicy(id)==='upright';
    if(enemyPose!==undefined && ["chaser","ranged","tank","swarm"].includes(id)) {
      const row=["chaser","ranged","tank","swarm"].indexOf(id);
      const gliding=id==="ranged"&&(enemyPose===1||enemyPose===2);
      const frame=gliding?(Math.cos(facing)<-.15?2:1):enemyPose;
      image.setTexture("enemies-v2",row*4+frame).setPosition(x,y).setOrigin(.5,.65).setDisplaySize(size,size).setRotation(0).setFlipX(gliding?false:Math.cos(facing)<-.15).setTint(tint).setVisible(true);return;
    }
    if(id==="boss" && bossPose!==undefined){
      image.setTexture("boss-v2",bossPose).setPosition(x,y).setOrigin(.5,.65).setDisplaySize(size,size).setRotation(0).setFlipX(false).setTint(tint).setVisible(true);return;
    }
    if(action && id in HERO_ASSETS) {
      const index=action==="walk"?1+Math.floor(time*8)%2:({idle:0,attack:3,hurt:4,dash:5,death:6,special:7} as const)[action];
      image.setTexture("hero-v2-"+id,index+(pose?.back?8:0)).setPosition(x,y).setOrigin(.5,.65)
        .setDisplaySize(size,size).setRotation(0).setFlipX(pose?.flip??false).setTint(tint).setVisible(true);
      return;
    }
    const frame=Math.max(0,Math.min(5,age))*3+(moving?1+Math.floor(time*8)%2:0)+(humanoid(id)&&pose?.back?18:0);
    image.setTexture("actor-"+id,frame).setPosition(x,y).setOrigin(.5,.5).setDisplaySize(size,size).setRotation(upright?0:facing+Math.PI/2).setFlipX(upright?(pose?.flip??Math.cos(facing)<-0.15):false).setTint(tint).setVisible(true);
  }
  end(): void { for(let i=this.count;i<this.images.length;i++)this.images[i]!.setVisible(false); }
  get size(): number { return this.images.length; }
  review():unknown[] { return this.images.filter(i=>i.visible).map(i=>({texture:i.texture.key,frame:i.frame.name,rotation:i.rotation,flipX:i.flipX,x:i.x,y:i.y,inView:this.scene.cameras.main.worldView.contains(i.x,i.y)})); }
}
