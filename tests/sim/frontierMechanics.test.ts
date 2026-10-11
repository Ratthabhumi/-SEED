import {it,expect} from "vitest";
import {RunSimulation} from "../../src/core/sim/RunSimulation";
import {applyTechEffect,previewTechEffects} from "../../src/core/sim/progression";
import {checkBreakthroughs} from "../../src/core/tech/synergy";
const idle={moveX:0,moveY:0,dashPressed:false};
function setup(){
 const sim=new RunSimulation({masterSeed:"FRONTIER-TRACE",originId:"resonant"}),s=sim.state;
 s.ageIndex=1;s.spawnT=999;s.eliteT=999;s.mineT=999;for(const a of s.squad)a.active=false;
 s.weaponCd={kinetic:999,energy:999,defense:999,field:999};
 return sim;
}
function enemies(sim:RunSimulation){
 for(let i=0;i<4;i++)Object.assign(sim.state.enemies[i]!,{active:true,x:200+i*80,y:0,hp:100,maxHp:100,speed:0,dmg:0,xp:0});
}
function bolt(sim:RunSimulation){Object.assign(sim.state.projs[0]!,{active:true,x:200,y:0,vx:0,vy:0,dmg:20,radius:8,life:2,friendly:true,src:"energy"});}
function buy(sim:RunSimulation,id:string){
 const n=sim.state.techNodes.find(n=>n.id===id)!;expect(n).toBeDefined();
 sim.state.draftOpen=true;sim.state.pendingLevels=1;sim.state.draftOffers=[{nodeId:id,quality:"COMMON",modifierIds:[],effectiveEffects:n.effects.map(e=>({...e}))}];
 const events=sim.chooseDraft(0);expect(events.some(e=>e.type==="tech_selected")).toBe(true);return events;
}
it("energy chain changes actual damage, has two bounded hops, replays and is absent by default",()=>{
 const a=setup(),b=setup(),plain=setup();for(const sim of [a,b,plain]){enemies(sim);bolt(sim);}
 buy(a,"conduction-lattice");buy(b,"conduction-lattice");
 const ev=a.step(1/60,idle);expect(b.step(1/60,idle)).toEqual(ev);plain.step(1/60,idle);
 expect(a.hash()).toBe(b.hash());expect(ev.filter(e=>e.type==="energy_arc")).toHaveLength(2);
 expect(a.state.enemies.slice(0,4).map(e=>e.hp)).toEqual([80,90,95,100]);
 expect(plain.state.enemies.slice(0,4).map(e=>e.hp)).toEqual([80,100,100,100]);
});
it("relay pulses have a real cooldown, cap three operational specialized bases, and no free foundation fusion",()=>{
 const sim=setup();enemies(sim);buy(sim,"outpost-relay");
 sim.state.territories=Array.from({length:6},(_,i)=>({poiId:"t"+i,poiType:"ruin",x:200,y:0,spec:"research",tier:1,hp:300,maxHp:300,disabled:false,garrisoned:false,heldSince:0,repairT:0}));
 sim.state.territories[0]!.disabled=true;sim.state.territories[1]!.spec="";
 const ev=sim.step(1/60,idle);expect(ev.filter(e=>e.type==="energy_arc")).toHaveLength(3);expect(sim.state.enemies[0]!.hp).toBe(76);
 expect(sim.step(1/60,idle).filter(e=>e.type==="energy_arc")).toHaveLength(0);
 expect(checkBreakthroughs(new Set(["science","industry","relay"]),new Set()).some(b=>b.id==="resonant-frontier")).toBe(false);
 expect(buy(sim,"conduction-lattice").some(e=>e.type==="breakthrough"&&e.id==="resonant-frontier")).toBe(true);
 expect(sim.state.build.relayChain).toBe(true);sim.state.relayCd=0;
 expect(sim.step(1/60,idle).filter(e=>e.type==="energy_arc")).toHaveLength(9);
});
it("new flags/timers are hashed and reset in child worlds; visual preview is non-mutating",()=>{
 const sim=setup(),before=sim.hash(),build={...sim.state.build};
 const next=previewTechEffects(build,[{kind:"relayAdd",value:1},{kind:"damageMul",value:.2}]);
 expect(build).toEqual(sim.state.build);expect(next.relayUnlocked).toBe(true);expect(next.damageMul).toBe(1.2);
 applyTechEffect(sim.state.build,{kind:"relayAdd",value:1});expect(sim.hash()).not.toBe(before);
 const hash=sim.hash();sim.state.relayCd=1;expect(sim.hash()).not.toBe(hash);
 sim.state.ascendReady=true;sim.ascend("affinity-kinetic","hunters");expect(sim.state.build.relayUnlocked).toBe(false);expect(sim.state.relayCd).toBe(0);
});
it("pre-claim preview matches full-capacity Signal exemption and reads actual biome/hostiles without mutation",()=>{
 const sim=setup(),s=sim.state;enemies(sim);s.logistics=s.maxLogistics=6;
 Object.assign(s.enemies[4]!,{active:true,x:605,y:0,hp:100,maxHp:100,speed:0,dmg:0,radius:12,xp:0});sim.step(1/60,idle);
 const hash=sim.hash(),rng=sim.streamSnapshots();const ruin=sim.outpostPreview(200,0,"ruin")!,signal=sim.outpostPreview(200,0,"signal")!;
 expect(ruin.options.every(o=>!o.affordable)).toBe(true);expect(signal.options.every(o=>o.affordable)).toBe(true);
 expect(ruin.hostiles).toBe(5);expect(ruin.hostiles).toBe(sim.queryRadius(200,0,400,[]).length);expect(ruin.researchPercent).toBe(10*sim.siteMultiplier(200,0,"research"));
 expect(sim.hash()).toBe(hash);expect(sim.streamSnapshots()).toEqual(rng);
 expect(sim.outpostPreview(Infinity,0,"ruin")).toBeNull();
});
it("victory finish requires a boss kill and settles one terminal event without turning completion into death",()=>{
 const sim=setup();expect(sim.finishAttempt()).toEqual([]);sim.state.stats.bosses=1;
 expect(sim.finishAttempt()).toEqual([{type:"run_completed"}]);expect(sim.state.over).toBe(true);expect(sim.state.build.hp).toBeGreaterThan(0);
 expect(sim.finishAttempt()).toEqual([]);expect(sim.step(1/60,idle)).toEqual([]);
});

it("energy aura and beam keep conduction useful after weapon evolution",()=>{
 const aura=setup();enemies(aura);for(let i=0;i<4;i++)aura.state.enemies[i]!.x=50+i*80;
 buy(aura,"conduction-lattice");aura.state.weaponStage.energy=2;aura.state.weaponCd.energy=0;
 expect(aura.step(1/60,idle).filter(e=>e.type==="energy_arc")).toHaveLength(2);
 expect(aura.state.enemies.slice(0,4).map(e=>e.hp)).toEqual([92,96,98,100]);
 const beam=setup();enemies(beam);buy(beam,"conduction-lattice");beam.state.weaponStage.energy=4;beam.state.weaponCd.energy=0;
 expect(beam.step(1/60,idle).filter(e=>e.type==="energy_arc")).toHaveLength(2);
 expect(beam.state.enemies.slice(0,4).map(e=>e.hp)).toEqual([55,77.5,88.75,100]);
});
