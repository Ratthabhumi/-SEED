import type Phaser from "phaser";
import type {SimEnemy} from "../../core/sim/RunState";
import {BossRig} from "./BossRig";
import {paintedBossPose} from "./paintedBossPose";

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
  constructor(private scene:Phaser.Scene,private mode:BossArtMode){
    if(mode==="rig")this.rig=new BossRig(scene);
  }
  begin(world:string,time:number,boss?:SimEnemy){
    if(this.rig){this.rig.begin(world,time,boss);return;}
    if(world!==this.world){this.world=world;this.last=undefined;this.death=undefined;this.image?.setVisible(false);}
    if(boss)this.death=undefined;
    else if(this.last)this.death={enemy:this.last,at:time};
    this.last=boss?{...boss}:undefined;this.used=false;
  }
  draw(e:SimEnemy,time:number,size:number,moving:boolean,hc:boolean,reduced=false){
    if(this.rig){this.rig.draw(e,time,size,moving,hc);return;}
    this.used=true;this.size=size;
    const p=paintedBossPose(time,moving,e.encounter,e.flash,reduced,this.mode==="baseline");
    if(!this.image)this.image=this.scene.add.image(0,0,"boss-v2",0).setDepth(2.05).setOrigin(.5,.65);
    this.image.setFrame(p.frame).setPosition(e.x,e.y+p.lift).setDisplaySize(size,size).setRotation(p.rotation)
      .setAlpha(1).setTint(e.flash>0?0xffbbbb:hc?0xffead5:0xffffff).setVisible(true);
  }
  end(time:number,hc:boolean,reduced=false){
    if(this.rig){this.rig.end(time,hc);return;}
    if(this.death&&this.image){
      const f=(time-this.death.at)/.7;
      if(f>=0&&f<1){
        const e=this.death.enemy;
        this.image.setFrame(7).setPosition(e.x,e.y).setRotation(0).setDisplaySize(this.size,this.size)
          .setTint(0xffffff).setAlpha(reduced?1:1-f).setVisible(true);return;
      }
      this.death=undefined;
    }
    if(!this.used)this.image?.setVisible(false);
  }
  review(){return this.rig?.review()??(this.image?.visible?[{texture:this.image.texture.key,frame:this.image.frame.name,x:this.image.x,y:this.image.y,rotation:this.image.rotation,width:this.image.displayWidth,height:this.image.displayHeight,alpha:this.image.alpha}]:[]);}
}
