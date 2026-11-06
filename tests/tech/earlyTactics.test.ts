import {equipWeapon} from '../helpers/equipWeapon';
import {describe,it,expect} from 'vitest';
import {RunSimulation} from '../../src/core/sim/RunSimulation';
import {eligibleTech} from '../../src/core/tech/web';
import {equippedFamilies} from '../../src/core/combat/weaponInstances';
import {generateOffers} from '../../src/core/emergence/offerEngine';
import {createStreamRng} from '../../src/core/seed/streams';
const seeds=['EPOCH-GOLDEN-001','EPOCH-EXPAND-01','V50-OPENING-03'];
const origins=['hunters','engineers','resonant','sentinels'];
const behavior=new Set(['projectileAdd','chainAdd','mineAdd','orbitAdd','summonAdd','auraAdd','beamAdd','relayAdd']);
const tactical=(effects:readonly {kind:string}[])=>effects.some(e=>behavior.has(e.kind));
describe('Content27 early tactical opportunity',()=>{
 it('opportunity policy preserves the RNG draw budget on the same legal pool',()=>{
  const sim=new RunSimulation({masterSeed:seeds[0]}),s=sim.state;
  const context={sim:{owned:s.owned,ownedTags:s.ownedTags,breakthroughs:s.breakthroughs,ageIndex:0,age:'stone' as const,originId:s.originId,expansionFamily:s.expansionFamily,pinnedTarget:'',draftChoices:[],reservedTech:'',history:s.history,techGraph:()=>sim.techGraph()},laws:s.worldLaws,activeFamilies:new Set(equippedFamilies(s)),recentOffers:[],recentPicks:[]};
  const a=createStreamRng('V51','draft'),b=createStreamRng('V51','draft');
  generateOffers({...context,rng:a});generateOffers({...context,rng:b,earlyTactics:true});
  expect(b.snapshot()).toEqual(a.snapshot());
 });
 it('an already unlocked chain is not the protected new behavior opportunity',()=>{
  const sim=new RunSimulation({masterSeed:seeds[0],originId:'resonant'}),s=sim.state;equipWeapon(sim,'field');
  const context={sim:{owned:s.owned,ownedTags:s.ownedTags,breakthroughs:s.breakthroughs,ageIndex:0,age:'stone' as const,originId:s.originId,expansionFamily:s.expansionFamily,pinnedTarget:'',draftChoices:[],reservedTech:'',history:s.history,techGraph:()=>sim.techGraph().map(n=>n.id==='tactical-energy'?{...n,weight:1e10}:n)},laws:s.worldLaws,activeFamilies:new Set(equippedFamilies(s)),recentOffers:[],recentPicks:[],rng:createStreamRng('V51-marginal','draft'),earlyTactics:true,chainUnlocked:true};
  const offers=generateOffers(context);expect(offers[0]!.node.effects.some(e=>['mineAdd','orbitAdd','projectileAdd'].includes(e.kind))).toBe(true);
 });
 it('all12 starting pools have two owned family branches and legal acquisitions, without any free tactical grant',()=>{
  for(const seed of seeds)for(const originId of origins){
   const sim=new RunSimulation({masterSeed:seed,originId}),s=sim.state;
   const pool=sim.techGraph().filter(n=>eligibleTech(n,new Set(s.owned),0,new Set(equippedFamilies(s))));
   expect(pool.filter(n=>n.id.startsWith('tactical-'))).toHaveLength(2);
   expect(s.build.bonusProjectiles+s.build.bonusMines+s.build.bonusOrbit).toBe(0);expect(s.build.chainUnlocked).toBe(false);
   expect(pool.filter(n=>!tactical(n.effects)).length).toBeGreaterThan(2);
  }
 });
 it('each first level draft offers real behavior and numerical/recipe choices legally',()=>{
  for(const seed of seeds)for(const originId of origins){
   const sim=new RunSimulation({masterSeed:seed,originId}),s=sim.state;sim.gainKnowledge(100,'test',[]);
   expect(s.draftOffers).toHaveLength(3);expect(s.draftOffers.some(o=>tactical(o.effectiveEffects))).toBe(true);
   expect(s.draftOffers.some(o=>!tactical(o.effectiveEffects))).toBe(true);
   expect(new Set(s.draftOffers.map(o=>o.nodeId)).size).toBe(3);
   for(const offer of s.draftOffers)expect(eligibleTech(sim.techGraph().find(n=>n.id===offer.nodeId)!,new Set(s.owned),0,new Set(equippedFamilies(s)))).toBe(true);
  }
 });
 it('legitimate tactical choices apply counters, not HP/damage/logistics gifts',()=>{
  for(const [originId,family,field]of [['hunters','kinetic','bonusProjectiles'],['resonant','energy','chainUnlocked'],['hunters','field','bonusMines'],['engineers','defense','bonusOrbit']]as const){
   const sim=new RunSimulation({masterSeed:seeds[0],originId}),s=sim.state;
   const node=sim.techGraph().find(n=>n.id===`tactical-${family}`)!;expect(node).toBeDefined();
   equipWeapon(sim,family);const before={hp:s.build.maxHp,damage:s.build.damageMul,cap:s.maxLogistics};
   s.draftOpen=true;s.draftOffers=[{nodeId:node.id,quality:'COMMON',modifierIds:[],effectiveEffects:node.effects}];sim.chooseDraft(0);
   expect(s.owned).toContain(node.id);expect(s.build[field]).toBe(field==='chainUnlocked'?true:1);
   expect({hp:s.build.maxHp,damage:s.build.damageMul,cap:s.maxLogistics}).toEqual(before);
  }
 });
});

function combat(originId:string,family:string,upgrade:boolean){
 const sim=new RunSimulation({masterSeed:seeds[0],originId}),s=sim.state;
 equipWeapon(sim,family as any);
 if(upgrade){const n=sim.techGraph().find(n=>n.id===`tactical-${family}`)!;s.draftOpen=true;s.draftOffers=[{nodeId:n.id,quality:'COMMON',modifierIds:[],effectiveEffects:n.effects}];sim.chooseDraft(0);}
 s.px=s.py=10000;s.spawnT=s.eliteT=s.mineT=999;s.build.hp=s.build.maxHp=10000;
 for(const f of ['kinetic','energy','field','defense']as const)s.weaponCd[f]=999;
 for(const a of s.squad)a.active=false;
 for(let x=18;x<=21;x++)for(let y=18;y<=21;y++)for(const p of sim.chunks.get(s.worldSeed,s.worldNonce,x,y).poi)if(!s.poisWorld.includes(p.id))s.poisWorld.push(p.id);
 return sim;
}
it('Split volley changes a real primary release from one aimed shot to two coverage rays',()=>{
 const counts=[];
 for(const upgraded of [false,true]){
  const sim=combat('hunters','kinetic',upgraded),s=sim.state;s.weaponCd.kinetic=0;
  const e=sim.spawnEnemy('chaser',false,false,0,220,[])!;e.speed=0;e.hp=e.maxHp=10000;
  let count=0;for(let i=0;i<120&&!count;i++)count=sim.step(1/60,{moveX:0,moveY:0,dashPressed:false}).filter(e=>e.type==='weapon_fired'&&e.family==='kinetic'&&e.release).length;
  counts.push(count);
 }expect(counts).toEqual([1,2]);
});
it('First arc actually damages a second clustered enemy through a canonical energy arc',()=>{
 const arcs=[];
 for(const upgraded of [false,true]){
  const sim=combat('resonant','energy',upgraded),s=sim.state;s.weaponCd.energy=0;
  for(const distance of [220,275]){const e=sim.spawnEnemy('chaser',false,false,0,distance,[])!;e.speed=0;e.hp=e.maxHp=10000;}
  let n=0;for(let i=0;i<100;i++)n+=sim.step(1/60,{moveX:0,moveY:0,dashPressed:false}).filter(e=>e.type==='energy_arc'&&e.source==='chain').length;
  arcs.push(n);if(upgraded)expect(s.damageBySource.chain).toBeGreaterThan(0);
 }expect(arcs[0]).toBe(0);expect(arcs[1]).toBeGreaterThan(0);
});
it('Layered traps adds an actual rear barrier mine, not a preview-only effect',()=>{
 const counts=[];for(const upgraded of [false,true]){const sim=combat('hunters','field',upgraded),s=sim.state;s.mineT=0;sim.step(1/60,{moveX:1,moveY:0,dashPressed:false});const mines=s.mines.filter(m=>m.active);counts.push(mines.length);expect(mines.every(m=>m.x<s.px)).toBe(true);}expect(counts).toEqual([1,2]);
});
it('Outer ward hits the opposite side through the real orbit collision geometry',()=>{
 const damage=[];for(const upgraded of [false,true]){const sim=combat('engineers','defense',upgraded),s=sim.state;const e=sim.spawnEnemy('chaser',false,false,Math.PI,70,[])!;e.speed=0;e.hitCd=0;e.hp=e.maxHp=10000;sim.step(1/60,{moveX:0,moveY:0,dashPressed:false});damage.push(e.maxHp-e.hp);}expect(damage[0]).toBe(0);expect(damage[1]).toBeGreaterThan(0);
});
