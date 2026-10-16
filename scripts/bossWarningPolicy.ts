import type {RunSimulation} from '../src/core/sim/RunSimulation';
import type {InputFrame} from '../src/core/sim/InputFrame';
import {BOSS_ENCOUNTER,bossAreaHit,type BossPattern} from '../src/core/combat/bossEncounter';

/** Evaluation-only visible hazard. No timer, future attack or hidden enemy data. */
export interface ObservedWarning {id:string;phase:string;pattern:BossPattern;x:number;y:number;aimX:number;aimY:number;}
export const WARNING_POLICY_VERSION='visible-locked-area-v1';
export class WarningReaction {
 private id='';private first=0;
 constructor(readonly delay:number){if(!Number.isFinite(delay)||delay<0)throw Error('Invalid reaction delay');}
 input(t:number,x:number,y:number,dashReady:boolean,base:InputFrame,w?:ObservedWarning):InputFrame {
  if(!w){this.id='';return base;}
  if(w.id!==this.id){this.id=w.id;this.first=t;}
  if(t-this.first+1e-9<this.delay||w.pattern==='fan')return base;
  let dx=x-w.aimX,dy=y-w.aimY;
  if(w.pattern==='slam'){
   if(Math.hypot(dx,dy)>BOSS_ENCOUNTER.slamRadius+18)return base;
   if(!dx&&!dy){dx=base.moveX||1;dy=base.moveY;}
  }else{
   const a=Math.atan2(w.aimY-w.y,w.aimX-w.x),cs=Math.cos(a),sn=Math.sin(a);
   const u=dx*cs+dy*sn,v=-dx*sn+dy*cs,safe=BOSS_ENCOUNTER.crossHalfWidth+18;
   if(Math.abs(u)>safe&&Math.abs(v)>safe||Math.abs(u)>BOSS_ENCOUNTER.crossLength+18||Math.abs(v)>BOSS_ENCOUNTER.crossLength+18)return base;
   const du=(u>=0?1:-1)*Math.max(0,safe-Math.abs(u)),dv=(v>=0?1:-1)*Math.max(0,safe-Math.abs(v));
   dx=du*cs-dv*sn;dy=du*sn+dv*cs;
  }
  const length=Math.hypot(dx,dy);if(!length)return base;
  return {...base,moveX:dx/length,moveY:dy/length,dashPressed:dashReady};
 }
}

/** Wrap only InputFrame evaluation; baseline progressionPolicy source is untouched.
 * All methods remain bound to the original simulation. No state/stat grants.
 * Visibility is an explicit conservative1280x720/zoom1.25 player-centered view
 * approximation, NOT a claim of human peripheral perception or exact native camera. */
export function bossPolicyEvaluation(sim:RunSimulation,delay:number|null){
 const reaction=new WarningReaction(delay??0);
 const report={policy:delay===null?'responsive-route-planner-v2':WARNING_POLICY_VERSION,delay,entrySnapshot:'',entry:null as null|{hp:number;adds:number},
  warnings:[] as Array<{id:string;pattern:string;at:number;initialInside:boolean;commitAt?:number;insideAtFire?:boolean;evaded?:boolean;responseWindow?:number;dashReady:boolean;dashUses:number}>,
  damage:{} as Record<string,number>,damageTrace:[] as Array<{t:number;source:string;amount:number;hp:number;adds:number}>,steps:0,interventions:0,dashUses:0};
 let lastId='';
 const proxy=new Proxy(sim,{get(target,key){
  if(key!=='step'){const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;}
  return (dt:number,input:InputFrame)=>{
   const s=sim.state,b=s.enemies.find(e=>e.active&&e.boss),a=b?.encounter;
   if(b&&!report.entry){report.entrySnapshot=sim.snapshot();report.entry={hp:s.build.hp,adds:s.enemies.filter(e=>e.active&&!e.boss).length};}
   let observed:ObservedWarning|undefined;
   if(b&&a&&['warning','commit','attack'].includes(a.phase)){
    const range=a.pattern==='slam'?BOSS_ENCOUNTER.slamRadius:BOSS_ENCOUNTER.crossLength*1.42;
    if(Math.abs(a.aimX-s.px)<=512+range&&Math.abs(a.aimY-s.py)<=288+range){
     const id=`${s.worldNonce}:${s.enemies.indexOf(b)}:${a.cycle}:${a.pattern}`;
     // A new attack cannot first be learned at commitment: require visible warning.
     if(a.phase==='warning'||id===lastId){observed={id,phase:a.phase,pattern:a.pattern,x:b.x,y:b.y,aimX:a.aimX,aimY:a.aimY};
      if(id!==lastId){lastId=id;report.warnings.push({id,pattern:a.pattern,at:s.elapsed,initialInside:bossAreaHit(a.pattern,b.x,b.y,a.aimX,a.aimY,s.px,s.py),dashReady:s.dashCd<=0,dashUses:0});}
     }
    }
   }
   const chosen=delay===null?input:reaction.input(s.elapsed,s.px,s.py,s.dashCd<=0,input,observed),row=report.warnings[report.warnings.length-1];
   if(chosen!==input)report.interventions++;
   const dash=chosen.dashPressed&&s.dashCd<=0;if(dash){report.dashUses++;if(row&&observed)row.dashUses++;}
   if(row&&observed?.phase==='commit'&&row.commitAt===undefined)row.commitAt=s.elapsed;
   const events=sim.step(dt,chosen);report.steps++;
   for(const e of events){
    if(e.type==='player_hurt'&&report.entry){const source=e.source??'unknown';report.damage[source]=(report.damage[source]??0)+e.damage;report.damageTrace.push({t:s.elapsed,source,amount:e.damage,hp:s.build.hp,adds:s.enemies.filter(x=>x.active&&!x.boss).length});}
    if(e.type==='boss_attack_fired'&&row&&b&&a&&a.pattern!=='fan'){
     row.insideAtFire=bossAreaHit(a.pattern,b.x,b.y,a.aimX,a.aimY,s.px,s.py);row.responseWindow=s.elapsed-row.at;
     row.evaded=row.initialInside&&!row.insideAtFire&&!events.some(e=>e.type==='player_hurt'&&e.source===`boss-${a.pattern}`);
    }
   }
   return events;
  };
 }});
 return {simulation:proxy,report};
}
