import type {RunSimulation} from '../src/core/sim/RunSimulation';
import type {RunConfig} from '../src/core/sim/RunConfig';
import {applyTechEffect} from '../src/core/sim/progression';
import type {TechEffect} from '../src/core/tech/graph';
type Sim=Pick<RunSimulation,'state'|'step'|'spawnEnemy'|'snapshot'|'techGraph'|'chooseDraft'>;
type Constructor=new(c:RunConfig)=>Sim;
export const V47_BUILDS=[
 {id:'kinetic-fan',origin:'hunters',tier:2,effects:[{kind:'projectileAdd',value:2}]},
 {id:'energy-chain',origin:'resonant',tier:3,effects:[{kind:'chainAdd',value:1}]},
 {id:'mine-control',origin:'hunters',tier:1,effects:[{kind:'mineAdd',value:2}]},
] as const;
/** Staged mechanics arena, NOT natural pressure, boss, or human fun evidence.
 * High-HP stationary targets avoid kill XP/drafts contaminating a build sample. */
export function combatSlice(Ctor:Constructor,index:number,upgraded:boolean,moving=false){
 const build=V47_BUILDS[index]!,sim=new Ctor({masterSeed:'V47-CONTROLLED',originId:build.origin}),s=sim.state;
 // C28 explicit fixture acquisition; historical pre-instance builds stay untouched.
 if(index===2&&s.weapons&&!s.weapons.some(w=>w.family==='field')){const n=sim.techGraph().find(n=>n.weaponFamily==='field')!;s.draftOpen=true;s.pendingLevels=1;s.draftOffers=[{nodeId:n.id,quality:'COMMON',modifierIds:[],effectiveEffects:[]}];sim.chooseDraft(0);}
 s.build.hp=s.build.maxHp=10000;s.spawnT=s.eliteT=999;s.mineT=index===2?0:999;
 for(const a of s.squad)a.active=false;
 for(const f of ['kinetic','energy','defense','field'] as const){s.weaponStage[f]=build.tier;s.weaponCd[f]=999;}
 s.weaponCd[index===1?'energy':'kinetic']=index===2?999:0;
 if(upgraded)for(const effect of build.effects)applyTechEffect(s.build,effect as TechEffect);
 const targets=[];
 for(let i=0;i<18;i++){
  const enemy=sim.spawnEnemy('tank',false,false,0,200,[])!;
  enemy.x=s.px+70+(i%6)*32;enemy.y=s.py-80+Math.floor(i/6)*64;
  enemy.hp=enemy.maxHp=100000;enemy.speed=enemy.dmg=0;enemy.shield=0;enemy.evolution=undefined;
  targets.push(enemy);
 }
 const result={shots:0,volleys:0,arcs:0,detonations:0,hpDamage:0,shieldDamage:0,targetsHit:0,peakProjectiles:0,peakMines:0,firstRelease:null as number|null,firstDamage:null as number|null,elapsed:0,stoppedByDraft:false};
 const hits=new Set<number>();
 for(let tick=0;tick<720;tick++){
  const hp=targets.map(e=>e.hp);
  const events=sim.step(1/60,{moveX:moving?(tick<360?-1:1):0,moveY:0,dashPressed:false});
  for(const event of events){
   if(event.type==='weapon_fired'&&event.release){result.shots++;if(event.release.index===0)result.volleys++;result.firstRelease??=s.elapsed;}
   if(event.type==='energy_arc')result.arcs++;
   if(event.type==='mine_detonated')result.detonations++;
   if(event.type==='weapon_impact'||event.type==='energy_impact'){result.hpDamage+=event.hpDamage;result.shieldDamage+=event.shieldDamage;if(event.hpDamage+event.shieldDamage>0)result.firstDamage??=s.elapsed;}
  }
  targets.forEach((e,i)=>{if(e.hp<hp[i]!)hits.add(i);});
  result.peakProjectiles=Math.max(result.peakProjectiles,s.projs.filter(p=>p.active).length);result.peakMines=Math.max(result.peakMines,s.mines.filter(m=>m.active).length);
  if(s.draftOpen){result.stoppedByDraft=true;break;}
 }
 result.targetsHit=hits.size;result.elapsed=s.elapsed;
 return {build:build.id,upgraded,moving,...result,snapshot:sim.snapshot()};
}
