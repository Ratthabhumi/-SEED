import type Phaser from "phaser";
import {facingPolicy,humanoid,type MotionPose} from "./actorMotion";
import { ACTOR_ASSETS, type ActorId } from "../assets/actorAssets";
import { HERO_ASSETS } from "../assets/heroAssets";
import type {HeroAction} from "./heroActions";
import {originRow} from "./combatSpriteIdentity";
import referenceMetadata from "../assets/hunters-reference-v1.json";
import {ReferenceAnimation} from "./ReferenceAnimation";
type ActorImage=Phaser.GameObjects.Image|Phaser.GameObjects.Sprite;
/** Bound matches canonical enemy pool; allies use a separate bounded pool. */
export class ActorRenderer {
  private reference=new ReferenceAnimation(referenceMetadata);
  private referenceActive=false;
  referenceReview(){return this.referenceActive?this.reference.review():null;}
  private images: ActorImage[] = [];
  private count = 0;
  private styles=new WeakMap<ActorImage,{key:string;frame:string;size:number;origin:number;tint:number}>();
  constructor(private scene: Phaser.Scene, private max: number, private depth: number) {}
  static frames(scene: Phaser.Scene): void {
    const outposts=scene.textures.get("outposts-v2");
    for(let i=0;i<12;i++)if(!outposts.has(String(i)))outposts.add(i,0,(i%4)*128,Math.floor(i/4)*128,128,128);
    const boss=scene.textures.get("boss-v2");
    for(let i=0;i<8;i++)if(!boss.has(String(i)))boss.add(i,0,(i%4)*128,Math.floor(i/4)*128,128,128);
    const enemies=scene.textures.get("enemies-v2");
    for(let i=0;i<16;i++)if(!enemies.has(String(i)))enemies.add(i,0,(i%4)*128,Math.floor(i/4)*128,128,128);
    for(const id of Object.keys(HERO_ASSETS)){
      const texture=scene.textures.get("hero-v2-"+id);
      for(let i=0;i<16;i++)if(!texture.has(String(i)))texture.add(i,0,(i%4)*128,Math.floor(i/4)*128,128,128);
    }
    const heroes=scene.textures.get("hero-neutral");
    for(let i=0;i<48;i++)if(!heroes.has(String(i)))heroes.add(i,0,(i%6)*128,Math.floor(i/6)*128,128,128);
    const reference=scene.textures.get("hero-reference");
    for(let i=0;i<36;i++)if(!reference.has(String(i)))reference.add(i,0,(i%9)*128,Math.floor(i/9)*128,128,128);
    for(let row=0;row<4;row++)for(const [action,clip] of Object.entries(referenceMetadata.clips)){
      const key=`reference-${row}-${action}`;
      if(!scene.anims.exists(key))scene.anims.create({key,frames:clip.columns.map(col=>({key:"hero-reference",frame:String(row*9+col)})),frameRate:1000/clip.frameMs,repeat:clip.loop?-1:0});
    }
    for (const id of ["guardian"] as const) {
      if (!scene.textures.exists("actor-" + id)) throw new Error("Mandatory actor art missing: " + id);
      const texture = scene.textures.get("actor-" + id);
      for (let frame = 0; frame < (humanoid(id as ActorId)?36:18); frame++) if (!texture.has(String(frame))) texture.add(frame,0,frame*64,0,64,64);
    }
  }
  begin(): void { this.count = 0; }
  guardian(origin:string,x:number,y:number,size:number,facing:number):void{
    if(this.count>=this.max)throw new Error("Actor pool exceeded "+this.max);
    let image=this.images[this.count++];if(!image){image=this.scene.add.image(0,0,"world-props",7+originRow(origin)).setDepth(this.depth);this.images.push(image);}
    this.sprite(image,"world-props",7+originRow(origin),x,y,size,.5,0,Math.cos(facing)<-.15,0xffffff);
  }
  private sprite(image:ActorImage,key:string,frame:number,x:number,y:number,size:number,origin:number,rotation:number,flip:boolean,tint:number){
    let style=this.styles.get(image);
    if(!style){style={key:"",frame:"",size:-1,origin:-1,tint:-1};this.styles.set(image,style);}
    if(style.key!==key||style.frame!==String(frame)){image.setTexture(key,frame);style.key=key;style.frame=String(frame);style.size=-1;style.origin=-1;}
    if(style.size!==size){image.setDisplaySize(size,size);style.size=size;}
    if(style.origin!==origin){image.setOrigin(.5,origin);style.origin=origin;}
    if(style.tint!==tint){image.setTint(tint);style.tint=tint;}
    image.setPosition(x,y).setRotation(rotation).setFlipX(flip).setVisible(true);
  }
  draw(id: ActorId,x: number,y: number,size: number,facing: number,time: number,moving: boolean,tint = 0xffffff, age = 0, pose?:MotionPose, action?:HeroAction, bossPose?:number, enemyPose?:number,neutralHero=false,revision=0): void {
    if(neutralHero){
      this.referenceActive=id==="hunters"&&(age===0||age===5);
    }
    if (this.count >= this.max) throw new Error("Actor pool exceeded " + this.max);
    let image = this.images[this.count++];
    if (!image) { image=(neutralHero?this.scene.add.sprite(0,0,"hero-neutral",0):this.scene.add.image(0,0,"enemies-v2",0)).setDepth(this.depth); this.images.push(image); }
    const upright=facingPolicy(id)==='upright';
    if(neutralHero&&this.referenceActive){
      const ref=this.reference.sample(age,pose?.back??false,action??"idle",time,revision);
      if("anims" in image){
        const row=Math.floor(ref.frame/9),key=`reference-${row}-${ref.action}`;
        if(image.anims.currentAnim?.key!==key){image.play(key);image.anims.pause();}
        const count=referenceMetadata.clips[ref.action as keyof typeof referenceMetadata.clips].columns.length;
        image.anims.setProgress(count>1?ref.index/(count-1):0);
      }
      this.sprite(image,"hero-reference",ref.frame,x,y,size,.65,0,pose?.flip??false,tint);return;
    }
    if(enemyPose!==undefined && ["chaser","ranged","tank","swarm"].includes(id)) {
      const row=["chaser","ranged","tank","swarm"].indexOf(id);
      const gliding=id==="ranged"&&(enemyPose===1||enemyPose===2);
      const frame=gliding?(Math.cos(facing)<-.15?2:1):enemyPose;
      this.sprite(image,"enemies-v2",row*4+frame,x,y,size,.65,0,gliding?false:Math.cos(facing)<-.15,tint);return;
    }
    if(id==="boss" && bossPose!==undefined){
      this.sprite(image,"boss-v2",bossPose,x,y,size,.65,0,false,tint);return;
    }
    if(action && id in HERO_ASSETS && !neutralHero){
      const index=action==="walk"?1+Math.floor(time*8)%2:({idle:0,attack:3,hurt:4,dash:5,death:6,special:7} as const)[action];
      this.sprite(image,"hero-v2-"+id,index+(pose?.back?8:0),x,y,size,.65,0,pose?.flip??false,tint);return;
    }
    if(action && id in HERO_ASSETS) {
      // Six full body costumes; procedural bob/tilt is explicitly not authored animation.
      const frame=originRow(id)*6+Math.max(0,Math.min(5,age))+(pose?.back?24:0);
      const bob=action==="walk"?Math.sin(time*9)*2:0;
      this.sprite(image,"hero-neutral",frame,x,y+bob,size,.65,0,pose?.flip??false,tint);
      return;
    }
    const frame=Math.max(0,Math.min(5,age))*3+(moving?1+Math.floor(time*8)%2:0)+(humanoid(id)&&pose?.back?18:0);
    this.sprite(image,"actor-"+id,frame,x,y,size,.5,upright?0:facing+Math.PI/2,upright?(pose?.flip??Math.cos(facing)<-0.15):false,tint);
  }
  end(): void { for(let i=this.count;i<this.images.length;i++)this.images[i]!.setVisible(false); }
  get size(): number { return this.images.length; }
  review():unknown[] { return this.images.filter(i=>i.visible).map(i=>({texture:i.texture.key,frame:i.frame.name,rotation:i.rotation,flipX:i.flipX,x:i.x,y:i.y,width:i.displayWidth,height:i.displayHeight,screenWidth:i.displayWidth*this.scene.cameras.main.zoom,inView:this.scene.cameras.main.worldView.contains(i.x,i.y)})); }
}
