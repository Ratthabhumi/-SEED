import type {EnemyFamily} from '../director/director';
import type {SimEnemy} from '../sim/RunState';
export type EnemyAdaptation='rush'|'burst';
export interface EnemyEvolutionState {id:EnemyAdaptation;phase:'ready'|'warning'|'attack'|'recover';timer:number;aimX:number;aimY:number;shots:number;}
/** First human-validation slice: family, Age and elite identity remain independent. */
export function adaptationFor(age:number,family:EnemyFamily,elite:boolean,boss:boolean):EnemyAdaptation|null {
 if(elite||boss)return null;
 if(age===0&&family==='chaser')return 'rush';
 if(age===3&&family==='ranged')return 'burst';
 return null;
}
export function createEvolution(id:EnemyAdaptation):EnemyEvolutionState {return {id,phase:'ready',timer:2,aimX:0,aimY:0,shots:0};}
export const EVOLUTION_DEFS={rush:{range:150,warning:0.75,attack:0.35,recovery:0.9,cooldown:3,speedMul:3},burst:{range:300,warning:0.8,interval:0.15,count:3,recovery:1.2,cooldown:3.3}} as const;
/** No RNG, no density changes. Fixed target commitment creates a real dodge window. */
export function stepEvolution(e:SimEnemy,px:number,py:number,dt:number,shot:(e:SimEnemy,x:number,y:number)=>void):boolean {
 const a=e.evolution;if(!a||e.siege||e.boss||e.elite)return false;
 const dx=px-e.x,dy=py-e.y,d=Math.max(1,Math.hypot(dx,dy));const def=EVOLUTION_DEFS[a.id];a.timer-=dt;
 if(a.phase==='ready'){
  if(a.id==='rush'||d>def.range){e.x+=dx/d*e.speed*dt;e.y+=dy/d*e.speed*dt;}
  else if(d<180){e.x-=dx/d*e.speed*dt;e.y-=dy/d*e.speed*dt;}
  if(a.timer<=0&&d<=def.range){a.phase='warning';a.timer=def.warning;a.aimX=px;a.aimY=py;}
 }else if(a.phase==='warning'){
  if(d>def.range){a.phase='recover';a.timer=0.9;}
  else if(a.timer<=0){a.phase='attack';a.timer=a.id==='rush'?EVOLUTION_DEFS.rush.attack:0;a.shots=a.id==='burst'?EVOLUTION_DEFS.burst.count:0;}
 }else if(a.phase==='attack'){
  if(a.id==='rush'){
   const ax=a.aimX-e.x,ay=a.aimY-e.y,ad=Math.max(1,Math.hypot(ax,ay));const length=Math.min(ad,e.speed*EVOLUTION_DEFS.rush.speedMul*dt);e.x+=ax/ad*length;e.y+=ay/ad*length;
   if(a.timer<=0||ad<2){a.phase='recover';a.timer=EVOLUTION_DEFS.rush.recovery;}
  }else if(d>def.range){a.phase='recover';a.timer=EVOLUTION_DEFS.burst.recovery;}
  else if(a.timer<=0){shot(e,a.aimX,a.aimY);a.shots--;a.timer=EVOLUTION_DEFS.burst.interval;if(a.shots===0){a.phase='recover';a.timer=EVOLUTION_DEFS.burst.recovery;}}
 }else if(a.timer<=0){a.phase='ready';a.timer=def.cooldown;}
 return true;
}
