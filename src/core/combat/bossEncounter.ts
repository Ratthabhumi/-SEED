import type {SimEnemy} from "../sim/RunState";
export type BossPattern="slam"|"fan"|"cross";
export interface BossEncounter {phase:"approach"|"warning"|"commit"|"attack"|"recover"|"phase-transition";timer:number;cycle:number;pattern:BossPattern;aimX:number;aimY:number;enraged:boolean;}
export const BOSS_ENCOUNTER={warning:1.15,recovery:1.6,cooldown:2.2,slamRadius:105,crossHalfWidth:24,crossLength:360,shotSpeed:230} as const;
export const createBossEncounter=():BossEncounter=>({phase:"approach",timer:2.2,cycle:0,pattern:"slam",aimX:0,aimY:0,enraged:false});
export const bossWarningDuration=(pattern:BossPattern):number=>pattern==="fan"?1.35:pattern==="cross"?1.4:BOSS_ENCOUNTER.warning;
export const bossRecoveryDuration=(pattern:BossPattern):number=>pattern==="fan"?1.4:pattern==="cross"?1.8:1.85;
/** Fixed-step, fixed aim, no RNG. Phase two adds a third spatial problem,
 * not HP. Pattern-dependent generous warnings and stationary recovery persist. */
export function stepBossEncounter(e:SimEnemy,px:number,py:number,dt:number,fire:(pattern:BossPattern,x:number,y:number)=>void):boolean {
  const a=e.encounter;if(!e.boss||!a)return false;
  const dx=px-e.x,dy=py-e.y,d=Math.max(1,Math.hypot(dx,dy));a.timer-=dt;
  if(a.phase==="approach") {
    if(!a.enraged&&e.hp<=e.maxHp*.5){a.enraged=true;a.phase="phase-transition";a.timer=.8;return true;}
    if(d>230){e.x+=dx/d*e.speed*dt;e.y+=dy/d*e.speed*dt;}
    if(a.timer<=0 && d<=600){
      const patterns:BossPattern[]=a.enraged?["fan","slam","cross","fan","cross","slam"]:["slam","fan"];
      a.pattern=patterns[a.cycle%patterns.length];a.aimX=px;a.aimY=py;
      a.phase="warning";a.timer=bossWarningDuration(a.pattern);
    }
  } else if(a.phase==="warning" && a.timer<=0) {
    a.phase="commit";a.timer=.14;
  } else if(a.phase==="commit" && a.timer<=0) {
    fire(a.pattern,a.aimX,a.aimY);a.phase="attack";a.timer=.18;a.cycle++;
  } else if(a.phase==="attack" && a.timer<=0) {
    a.phase="recover";a.timer=bossRecoveryDuration(a.pattern);
  } else if(a.phase==="phase-transition" && a.timer<=0) {
    a.phase="approach";a.timer=0;
  } else if(a.phase==="recover" && a.timer<=0) {a.phase="approach";a.timer=BOSS_ENCOUNTER.cooldown;}
  return true;
}
export function bossAreaHit(pattern:BossPattern,originX:number,originY:number,aimX:number,aimY:number,x:number,y:number):boolean {
  if(pattern==="fan")return false;
  if(pattern==="slam")return Math.hypot(x-aimX,y-aimY)<=BOSS_ENCOUNTER.slamRadius;
  const a=Math.atan2(aimY-originY,aimX-originX),dx=x-aimX,dy=y-aimY;
  const along=dx*Math.cos(a)+dy*Math.sin(a),across=-dx*Math.sin(a)+dy*Math.cos(a);
  return (Math.abs(along)<=BOSS_ENCOUNTER.crossLength&&Math.abs(across)<=BOSS_ENCOUNTER.crossHalfWidth)
    ||(Math.abs(across)<=BOSS_ENCOUNTER.crossLength&&Math.abs(along)<=BOSS_ENCOUNTER.crossHalfWidth);
}
