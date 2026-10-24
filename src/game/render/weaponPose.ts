import type {SimEvent} from "../../core/sim/SimEvent";

/** Only a real player release may steer the body/mount. Autonomous traps and
 * squad shots must not turn the hero. This observes events, never emits them. */
export function playerRelease(e:SimEvent,x:number,y:number){
  if(e.type!=="weapon_fired"&&e.type!=="beam_fired")return;
  if(e.family!=="kinetic"&&e.family!=="energy")return;
  const [sx,sy,tx,ty]=e.type==="beam_fired"?[e.x1,e.y1,e.x2,e.y2]:[e.x,e.y,e.tx,e.ty];
  if(Math.hypot(sx-x,sy-y)>=4)return;
  return {x:sx,y:sy,tx,ty,family:e.family,heading:Math.atan2(ty-sy,tx-sx)};
}

/** All imported cells point right: the pipeline already rotated the diagonal
 * raw staff source. Mirroring on leftward aim preserves an upright grip. */
export function equipmentPose(heading:number,age:number){
  const left=Math.cos(heading)<0;
  const recoil=age>=0&&age<.16?2*Math.pow(1-age/.16,2):0;
  return {rotation:heading,flipY:left,recoil};
}

/** Cosmetic companion orbit, outside the painted hero silhouette. Canonical
 * elapsed time freezes with pause; Reduced Effects holds one quiet station. */
export function floatingWeaponPosition(time:number,reduced:boolean){
  const phase=-.5+(reduced?0:time*.7);
  return {x:120*Math.cos(phase),y:-12+112*Math.sin(phase)};
}
