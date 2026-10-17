import type Phaser from "phaser";
import type {SimEvent} from "../../core/sim/SimEvent";
import {enemyArtSize} from "./combatPresentation";
type Death=Extract<SimEvent,{type:"enemy_killed"}>;
/** Actual kill observations only; pooled fall/fade is not an authored death sequence. */
export class DeathResponse {
  private world="";
  private slots:Array<{image:Phaser.GameObjects.Image;until:number;size:number}>=[];
  constructor(private scene:Phaser.Scene){}
  reset(world:string){this.world=world;for(const p of this.slots){p.until=-Infinity;p.image.setVisible(false);}}
  accept(event:Death,time:number,world:string,reduced:boolean){
    if(world!==this.world)this.reset(world);
    if(reduced||!event.family||event.boss)return; // BossRig owns articulated defeat.
    let p=this.slots.find(p=>p.until<=time);
    if(!p){if(this.slots.length>=12)return;p={image:this.scene.add.image(0,0,"enemies-v2",0).setDepth(1),until:0,size:0};this.slots.push(p);}
    const row=["chaser","ranged","tank","swarm"].indexOf(event.family);
    p.until=time+.3;p.size=enemyArtSize(event.family,event.radius??9,event.elite,event.boss);
    p.image.setTexture(event.boss?"boss-v2":"enemies-v2",event.boss?7:row*4).setOrigin(.5,.65).setPosition(event.x,event.y).setTint(0xbac2cb).setVisible(true);
  }
  draw(time:number,world:string,reduced:boolean){
    if(world!==this.world)this.reset(world);
    for(const p of this.slots){const f=Math.min(1,(p.until-time)/.3);
      if(reduced||f<=0){p.image.setVisible(false);continue;}
      p.image.setVisible(true).setDisplaySize(p.size*(1+.12*(1-f)),p.size*(.25+.75*f)).setAlpha(f*.8);
    }
  }
  get size(){return this.slots.length;}
}
