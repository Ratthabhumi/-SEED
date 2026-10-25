import {aimFromPivot,angleDelta,primaryTier} from '../src/core/combat/weaponGeometry';

/** Offline observation only. Wraps canonical methods without changing arguments,
 * return values, RNG or state. Never imported by the game bundle. */
export function combatDiagnostics(sim:any){
 const counts={dueTicks:0,validTargetTicks:0,noTargetTicks:0,angleDeferred:0,forwardDeferred:0,volleys:0,shots:0,beams:0,poolBlocked:0,targetChanges:0,headingReversals:0,projectileHits:0,projectileExpired:0};
 const waits:number[]=[],checkpoints:any[]=[],launches:any[]=[];
 const pending=new Map<string,number>(),tracked=new Map<number,string>();
 const resolvedDamage:Record<string,{hp:number;shield:number}>={};
 let firstEligible:number|null=null,firstRelease:number|null=null,lastTarget:any,turnSign=0,lastCheckpoint=-1;
 const wrap=(name:string,fn:(original:any,args:any[])=>any)=>{const original=sim[name];if(original)sim[name]=(...args:any[])=>fn(original.bind(sim),args);};
 wrap('updatePrimaryRig',(original,args)=>{
  const s=sim.state,target=sim.nearestEnemy(s.px,s.py,800),before=s.weaponRig.heading;
  if(target!==lastTarget){counts.targetChanges++;lastTarget=target;}
  const result=original(...args),delta=angleDelta(s.weaponRig.heading,before),sign=Math.abs(delta)>.001?Math.sign(delta):0;
  if(sign&&turnSign&&sign!==turnSign)counts.headingReversals++;
  if(sign)turnSign=sign;return result;
 });
 wrap('releasePose',(original,args)=>{
  const s=sim.state,t=args[0],aim=aimFromPivot(s.originId,primaryTier(s.originId,s.weaponStage),s.px,s.py,s.weaponRig,t.x,t.y);
  const result=original(...args);
  if(!result){if(aim.forward<1)counts.forwardDeferred++;else if(Math.abs(angleDelta(aim.heading,s.weaponRig.heading))>.045)counts.angleDeferred++;}
  return result;
 });
 for(const name of ['fireProjectileSpread','beamStrike'])wrap(name,(original,args)=>{
  const s=sim.state,family=args[0],range=args[name==='beamStrike'?2:3],events=args[name==='beamStrike'?3:4];
  const target=sim.nearestEnemy(s.px,s.py,range),previous=s.projs.map((p:any)=>p.active),start=events.length;
  counts.dueTicks++;if(target){counts.validTargetTicks++;firstEligible??=s.elapsed;if(!pending.has(family))pending.set(family,s.elapsed);}else {counts.noTargetTicks++;pending.delete(family);}
  const result=original(...args),releases=events.slice(start).filter((e:any)=>e.type==='weapon_fired'||e.type==='beam_fired');
  if(releases.length){
   counts.volleys++;firstRelease??=s.elapsed;
   if(pending.has(family)){waits.push(s.elapsed-pending.get(family)!);pending.delete(family);}
   for(const e of releases){if(e.type==='beam_fired')counts.beams++;else counts.shots++;
    if(launches.length<12)launches.push({t:s.elapsed,family,x:e.x??e.x1,y:e.y??e.y1,heading:e.release?.heading??Math.atan2(e.ty-e.y,e.tx-e.x)});
   }
   for(let i=0;i<s.projs.length;i++)if(!previous[i]&&s.projs[i].active)tracked.set(i,s.worldNonce);
  }else if(target&&result!==false)counts.poolBlocked++;
  return result;
 });
 wrap('step',(original,args)=>{
  const events=original(...args),s=sim.state;
  for(const e of events)if(e.type==='weapon_impact'||e.type==='energy_impact'){
   const source=e.type==='weapon_impact'?e.family:e.source;
   const d=resolvedDamage[source]??(resolvedDamage[source]={hp:0,shield:0});d.hp+=e.hpDamage;d.shield+=e.shieldDamage;
  }
  for(const [index,world] of tracked){const p=s.projs[index];if(world!==s.worldNonce){tracked.delete(index);continue;}
   if(!p.active){if(p.life<=0||Math.abs(p.x-s.px)>1400||Math.abs(p.y-s.py)>1400)counts.projectileExpired++;else counts.projectileHits++;tracked.delete(index);}
  }
  const checkpoint=Math.floor(s.elapsed/30);
  if(checkpoint!==lastCheckpoint){lastCheckpoint=checkpoint;checkpoints.push({t:s.elapsed,age:s.ageIndex,hp:s.build.hp,knowledge:s.knowledgeTotal,rawChronicleDamage:{...s.damageBySource},resolvedDamage:JSON.parse(JSON.stringify(resolvedDamage)),...counts});}
  return events;
 });
 return ()=>{const sorted=[...waits].sort((a,b)=>a-b);return {classification:'OFFLINE_OBSERVATION_NOT_HUMAN_INPUT',counts,firstEligibleToRelease:firstEligible===null||firstRelease===null?null:firstRelease-firstEligible,
  waiting:{episodes:waits.length,p95:sorted[Math.floor(sorted.length*.95)]??null,max:sorted[sorted.length-1]??null,total:waits.reduce((a,b)=>a+b,0),unresolved:Object.fromEntries([...pending].map(([family,start])=>[family,sim.state.elapsed-start]))},resolvedDamage,launches,checkpoints,unresolvedProjectiles:tracked.size};};
}
