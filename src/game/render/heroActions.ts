import type {SimEvent} from "../../core/sim/SimEvent";
export type HeroAction = "idle"|"walk"|"attack"|"hurt"|"dash"|"death"|"special";
export class HeroActions {
  private world=""; private attack=-Infinity; private hurt=-Infinity; private special=-Infinity;
  sync(world:string):void {if(this.world!==world){this.world=world;this.attack=this.hurt=this.special=-Infinity;}}
  accept(e:SimEvent,t:number,x:number,y:number):void {
    if(e.type==="beam_fired" || e.type==="weapon_fired") {
      const ex=e.type==="beam_fired"?e.x1:e.x, ey=e.type==="beam_fired"?e.y1:e.y;
      if(Math.hypot(ex-x,ey-y)<4)this.attack=t+.16;
    } else if(e.type==="mine_detonated" && Math.hypot(e.x-x,e.y-y)<160) this.attack=t+.16;
    else if(e.type==="player_hurt")this.hurt=t+.18;
    else if(e.type==="ability_used")this.special=t+.35;
  }
  pose(t:number,moving:boolean,dash:boolean,dead:boolean):HeroAction {
    return dead?"death":dash?"dash":this.hurt>t?"hurt":this.special>t?"special":this.attack>t?"attack":moving?"walk":"idle";
  }
}
