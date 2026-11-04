import {RunSimulation} from '../src/core/sim/RunSimulation';
import {applyTechEffect} from '../src/core/sim/progression';
import {progressionPolicy} from './progressionPolicy';
type Constructor=new(c:{masterSeed:string;originId?:string})=>RunSimulation;
/** Staged geometry/positioning probes, not DPS optimization or human play. */
export function buildControlEvidence(Ctor:Constructor,build:'kinetic'|'energy'|'field',upgraded:boolean){
 const sim=new Ctor({masterSeed:'V48-CONTROL',originId:build==='energy'?'resonant':'hunters'}),s=sim.state;
 s.spawnT=s.eliteT=s.mineT=999;for(const a of s.squad)a.active=false;
 if(build==='field'){
  s.mineT=0;if(upgraded)applyTechEffect(s.build,{kind:'mineAdd',value:2});
  sim.step(1/60,{moveX:1,moveY:0,dashPressed:false});
  const mines=s.mines.filter(m=>m.active),rear=mines.map(m=>m.x-s.px),side=mines.map(m=>m.y-s.py);
  return {build,upgraded,count:mines.length,rearOffsets:rear,lateralWidth:Math.max(...side)-Math.min(...side),mines:mines.map(m=>({x:m.x,y:m.y,radius:m.radius,damage:m.dmg})),rng:JSON.parse(sim.snapshot()).rng,snapshot:sim.snapshot()};
 }
 if(build==='kinetic'&&upgraded)applyTechEffect(s.build,{kind:'projectileAdd',value:1});
 if(build==='energy'&&upgraded)applyTechEffect(s.build,{kind:'chainAdd',value:1});
 const target=sim.spawnEnemy('tank',false,false,0,250,[])!;target.hp=target.maxHp=100000;target.speed=target.dmg=0;
 const x=target.x,y=target.y;const angles:number[]=[];let damage=0,firstHit:number|null=null;
 for(let i=0;i<180;i++){
  const events=sim.step(1/60,{moveX:0,moveY:0,dashPressed:false});
  for(const e of events){if(e.type==='weapon_fired'&&e.family===build&&e.release&&angles.length<Math.ceil(1+s.build.bonusProjectiles))angles.push(e.release.heading-e.release.pose.heading);
   if(e.type==='weapon_impact'||e.type==='energy_impact'){damage+=e.hpDamage;if(e.hpDamage>0)firstHit??=s.elapsed;}}
  if(firstHit!==null)break;
 }
 return {build,upgraded,angles,damage,firstHit,targetDisplacement:Math.hypot(target.x-x,target.y-y),snapshot:sim.snapshot()};
}
/** Unmodified historical controller,180s bounded observation; no grants/HP edits.
 * Actor counts and first selected-Tech time are observed at canonical steps.
 * Direct API action counters are not inferred from missing step events. */
export function firstRunEvidence(Ctor:Constructor,origin:string){
 const sim=new Ctor({masterSeed:'EPOCH-GOLDEN-001',originId:origin});let firstKill:number|null=null,firstChoice:number|null=null,lastKill=0,longestGap=0,emptySeconds=0,nearSum=0,samples=0,maxNear=0;
 const kills:number[]=[];
 const run=progressionPolicy(sim,180,{mode:'balanced',onStep:(sim,events)=>{
  const s=sim.state,near=s.enemies.filter(e=>e.active&&Math.hypot(e.x-s.px,e.y-s.py)<300).length;
  nearSum+=near;maxNear=Math.max(maxNear,near);samples++;if(!near)emptySeconds+=1/60;
  if(s.stats.techsTaken&&firstChoice===null)firstChoice=s.elapsed;
  for(const event of events)if(event.type==='enemy_killed'){firstKill??=s.elapsed;longestGap=Math.max(longestGap,s.elapsed-lastKill);lastKill=s.elapsed;kills.push(s.elapsed);}
  return false;
 }});
 longestGap=Math.max(longestGap,sim.state.elapsed-lastKill);
 return {origin,firstKill,firstChoice,kills:kills.length,killTimes:kills,longestKillGap:longestGap,emptyNear300Seconds:emptySeconds,meanNear300:samples?nearSum/samples:0,maxNear300:maxNear,outcome:run.outcome,seconds:run.seconds,age:run.highestAge,selected:run.selected,snapshot:sim.snapshot()};
}
