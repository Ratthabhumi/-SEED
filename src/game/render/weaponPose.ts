import type {SimEvent} from "../../core/sim/SimEvent";

/** Only a real player release may steer the body/mount. Autonomous traps and
 * squad shots must not turn the hero. This observes events, never emits them. */
export function playerRelease(e:SimEvent,_x:number,_y:number){
  if(e.type!=="weapon_fired"&&e.type!=="beam_fired")return;
  if(e.family!=="kinetic"&&e.family!=="energy")return;
  const [sx,sy,tx,ty]=e.type==="beam_fired"?[e.x1,e.y1,e.x2,e.y2]:[e.x,e.y,e.tx,e.ty];
  if(e.release?.owner!=="player-primary")return;
  return {x:sx,y:sy,tx,ty,family:e.family,heading:e.release.pose.heading};
}
