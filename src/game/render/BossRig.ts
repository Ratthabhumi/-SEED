import type Phaser from "phaser";
import type {SimEnemy} from "../../core/sim/RunState";
import {bossRigPose} from "./bossRigMotion";
import source from "../../../assets/original/actors/boss-rig.svg?url";

/** One boss, fourteen bounded images from a single 1024×768 vector texture.
 * Original armor plates pivot at actual shoulder/elbow/hip/knee joints. */
export class BossRig {
  static preload(scene:Phaser.Scene){scene.load.svg("boss-rig",source,{width:1024,height:768});}
  private parts:Phaser.GameObjects.Image[]=[];
  private world="";
  private death?:{enemy:SimEnemy;at:number};
  private last?:SimEnemy;
  private lastSize=240;
  private used=0;
  constructor(private scene:Phaser.Scene){
    const texture=scene.textures.get("boss-rig");
    for(let i=0;i<9;i++)if(!texture.has(String(i)))texture.add(i,0,i%4*256,Math.floor(i/4)*256,256,256);
  }
  begin(world:string,time:number,boss?:SimEnemy){
    if(world!==this.world){this.world=world;this.last=undefined;this.death=undefined;this.lastSize=240;}
    if(boss)this.death=undefined;
    if(!boss&&this.last?.hp!==undefined)this.death={enemy:{...this.last},at:time};
    this.last=boss?{...boss}:undefined;
    this.used=0;
  }
  draw(e:SimEnemy,time:number,size:number,moving:boolean,highContrast:boolean,death=0){
    this.lastSize=size;
    const p=bossRigPose(time,moving,e.encounter,e.flash,death),scale=size/256;
    const ox=e.x,oy=e.y-size*.16+p.lift*scale;
    const part=(frame:number,x:number,y:number,angle=0,flip=false,alpha=1)=>{
      let image=this.parts[this.used++];
      if(!image){image=this.scene.add.image(0,0,"boss-rig",frame).setDepth(2.05);this.parts.push(image);}
      image.setFrame(frame).setPosition(ox+x*scale,oy+y*scale).setScale(scale*(flip?-1:1),scale).setRotation(angle+p.fall*(flip?-.7:.7))
        .setAlpha(alpha*(1-p.fall)).setTint(e.flash>0?0xffc5b8:highContrast?0xffe4ce:0xffffff).setVisible(true);
    };
    const limb=(side:number,hipX:number,hipY:number,length:number,angle:number,frame:number)=>{
      part(frame,hipX,hipY,angle,side<0);
      return {x:hipX-Math.sin(angle)*length,y:hipY+Math.cos(angle)*length};
    };
    part(8,0,-20-p.fall*20,p.lean*.5,false,.9);
    for(const side of [-1,1]){
      const a=p.stride*side+p.fall*side*.7;
      const knee=limb(side,side*25,39,43,a,4);
      part(5,knee.x,knee.y,-a*.5,side<0);
    }
    part(0,0,-30,p.lean);
    for(const side of [-1,1]){
      const a=-side*(p.shoulder+p.spread)+p.stride*.25;
      const elbow=limb(side,side*61,-65,62,a,2);
      part(3,elbow.x,elbow.y,a-side*p.elbow,side<0);
      part(6,side*62,-69,side*p.spread*.3,side<0);
    }
    part(1,0,-105+p.crown,p.lean*.5);
    part(7,0,-37,p.lean,false,Math.min(1,p.pulse));
  }
  end(time:number,hc:boolean){
    if(this.death){const age=time-this.death.at;if(age<.7)this.draw(this.death.enemy,time,this.lastSize,false,hc,age/.7);else this.death=undefined;}
    for(let i=this.used;i<this.parts.length;i++)this.parts[i]!.setVisible(false);
  }
  review(){return this.parts.filter(p=>p.visible).map(p=>({texture:p.texture.key,frame:p.frame.name,x:p.x,y:p.y,rotation:p.rotation,width:p.displayWidth,height:p.displayHeight,alpha:p.alpha}));}
}
