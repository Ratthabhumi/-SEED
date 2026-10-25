import type Phaser from "phaser";
import type {SimEnemy} from "../../core/sim/RunState";
import {BossRig} from "./BossRig";
import {paintedBossPose,paintedBossGround} from "./paintedBossPose";

export type BossArtMode="painted"|"baseline"|"rig";
/** Owner rejected the vector rig. Production uses the preserved painted atlas;
 * explicit comparison modes keep the old work inspectable without loading it. */
export class BossPresentation {
  private rig?:BossRig;
  private image?:Phaser.GameObjects.Image;
  private world="";
  private last?:SimEnemy;
  private death?:{enemy:SimEnemy;at:number};
  private size=240;
  private used=false;
  private lastTime=-Infinity;private walking=false;private facingLeft=false;
  constructor(private scene:Phaser.Scene,private mode:BossArtMode){
    if(mode==="rig")this.rig=new BossRig(scene);
  }
  begin(world:string,time:number,boss?:SimEnemy){
    if(this.rig){this.rig.begin(world,time,boss);return;}
    if(world!==this.world||time<this.lastTime){this.world=world;this.last=undefined;this.death=undefined;this.lastTime=-Infinity;this.walking=false;this.facingLeft=false;this.image?.setVisible(false);}
    if(time!==this.lastTime){
      const dx=boss&&this.last?boss.x-this.last.x:0,dy=boss&&this.last?boss.y-this.last.y:0;
      this.walking=Math.hypot(dx,dy)>.01;
      if(Math.abs(dx)>.01)this.facingLeft=dx<0;
      this.lastTime=time;
    }
    if(boss)this.death=undefined;
    else if(this.last)this.death={enemy:this.last,at:time};
    this.last=boss?{...boss}:undefined;this.used=false;
  }
  draw(e:SimEnemy,time:number,size:number,moving:boolean,hc:boolean,reduced=false){
    if(this.rig){this.rig.draw(e,time,size,moving,hc);return;}
    this.used=true;this.size=size;
    const p=paintedBossPose(time,this.mode==="baseline"?moving:this.walking,e.encounter,e.flash,reduced,this.mode==="baseline");
    const ground=this.mode==="baseline"?{originY:.65,offsetY:0}:paintedBossGround(p.frame,size);
    const locked=e.encounter&&e.encounter.phase!=="approach";
    const flip=locked?e.encounter!.aimX<e.x:this.facingLeft;
    if(!this.image)this.image=this.scene.add.image(0,0,"boss-v2",0).setDepth(2.05).setOrigin(.5,.65);
    this.image.setFrame(p.frame).setOrigin(.5,ground.originY).setPosition(e.x,e.y+ground.offsetY+p.lift).setDisplaySize(size,size).setRotation(p.rotation*(flip?-1:1))
      .setFlipX(this.mode!=="baseline"&&flip).setAlpha(1).setTint(e.flash>0?0xffbbbb:e.encounter?.enraged?0xffc68c:hc?0xffead5:0xffffff).setVisible(true);
  }
  end(time:number,hc:boolean,reduced=false){
    if(this.rig){this.rig.end(time,hc);return;}
    if(this.death&&this.image){
      const f=(time-this.death.at)/.7;
      if(f>=0&&f<1){
        const e=this.death.enemy;
        const ground=this.mode==="baseline"?{originY:.65,offsetY:0}:paintedBossGround(7,this.size);
        this.image.setFrame(7).setOrigin(.5,ground.originY).setPosition(e.x,e.y+ground.offsetY).setRotation(0).setDisplaySize(this.size,this.size)
          .setTint(0xffffff).setAlpha(reduced?1:1-f).setVisible(true);return;
      }
      this.death=undefined;
    }
    if(!this.used)this.image?.setVisible(false);
  }
  review(){return this.rig?.review()??(this.image?.visible?[{texture:this.image.texture.key,frame:this.image.frame.name,x:this.image.x,y:this.image.y,rotation:this.image.rotation,flipX:this.image.flipX,originY:this.image.originY,tint:this.image.tintTopLeft,width:this.image.displayWidth,height:this.image.displayHeight,alpha:this.image.alpha}]:[]);}
}
