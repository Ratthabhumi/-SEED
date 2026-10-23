import type {SimEvent} from "../../core/sim/SimEvent";
import {playerRelease} from "./weaponPose";
export type HeroAction = "idle"|"walk"|"attack"|"hurt"|"dash"|"death"|"special";
export class HeroActions {
  revision=0;
  private world=""; private attack=-Infinity; private hurt=-Infinity; private special=-Infinity;
  private aim=0;
  facing(t:number){return this.attack>t?this.aim:undefined;}
  sync(world:string):void {if(this.world!==world){this.world=world;this.attack=this.hurt=this.special=-Infinity;}}
  accept(e:SimEvent,t:number,x:number,y:number):void {
    if(e.type==="beam_fired" || e.type==="weapon_fired") {
      const shot=playerRelease(e,x,y);
      if(shot){this.attack=t+.16;this.aim=shot.heading;this.revision++;}
    } else if(e.type==="player_hurt"){this.hurt=t+.18;this.revision++;}
    else if(e.type==="ability_used"){this.special=t+.35;this.revision++;}
  }
  pose(t:number,moving:boolean,dash:boolean,dead:boolean):HeroAction {
    return dead?"death":dash?"dash":this.hurt>t?"hurt":this.special>t?"special":this.attack>t?"attack":moving?"walk":"idle";
  }
}
