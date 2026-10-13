import {describe,it,expect} from "vitest";
import {RunSimulation} from "../../src/core/sim/RunSimulation";
import {raidDelay} from "../../src/core/world/raidReadiness";
import type {Territory} from "../../src/core/world/territory";
const idle={moveX:0,moveY:0,dashPressed:false};
function setup(){
  const sim=new RunSimulation({masterSeed:"RAID-CLOSURE",originId:"hunters"}),s=sim.state;
  s.spawnT=s.eliteT=s.mineT=999;s.build.hp=s.build.maxHp=10000;
  const t:Territory={poiId:"raid-target",poiType:"ruin",x:0,y:0,spec:"research",tier:2,hp:350,maxHp:350,disabled:false,garrisoned:false,heldSince:0,repairT:0};
  s.territories.push(t);s.logistics=2;return {sim,s,t};
}
describe("real raid credit and predictable readiness",()=>{
  it("keeps normal interval, bounded preparation and full warning",()=>{
    expect(raidDelay(100,100,180,null)).toBe(180);
    expect(raidDelay(100,0,180,100)).toBe(30);
    expect(raidDelay(100,100,180,100)).toBe(45);
  });
  it("when raid is the sole next-age gate, warning starts within30s then real attackers arrive",()=>{
    const {sim,s,t}=setup();s.ageIndex=3;s.elapsed=100;s.lastRaidAt=100;s.knowledgeTotal=5000;s.elitesAge=2;
    s.territories.push({...t,poiId:"second",spec:""},{...t,poiId:"third",spec:""});
    sim.step(1/60,idle);expect(sim.raidReadiness()).toMatchObject({status:"waiting",gateBlocked:true});
    s.elapsed+=45;sim.step(1/60,idle);expect(s.raid?.landed).toBe(false);expect(s.raid?.tMinus).toBe(30);
    s.raid!.tMinus=0;sim.step(1/60,idle);expect(s.raid?.spawned).toBe(3);expect(s.raidsSurvived).toBe(0);
    for(let i=0;i<s.enemies.length;i++)if(s.enemies[i]!.active&&s.enemies[i]!.siege)sim.debugDamageEnemy(i,100000);
    const events=sim.step(1/60,idle);expect(events.some(e=>e.type==="raid_repelled")).toBe(true);expect(s.raidsSurvived).toBe(1);
  });
  it("saturated ordinary pool reclaims deterministically, without free loot or credit",()=>{
    const {sim,s}=setup();for(const e of s.enemies){e.active=true;e.boss=e.elite=e.siege=false;e.hp=e.maxHp=10000;e.x=e.y=10000;e.speed=e.dmg=0;}
    s.raid={poiId:"raid-target",tMinus:0,landed:false};
    const kills=s.stats.kills;sim.step(1/60,idle);
    expect(s.raid?.spawned).toBe(3);expect(s.enemies.filter(e=>e.active&&e.siege)).toHaveLength(3);
    expect(s.stats.kills).toBe(kills);expect(s.raidsSurvived).toBe(0);
  });
  it("protected full pool never grants phantom victory; retries after a slot frees",()=>{
    const {sim,s}=setup();for(const e of s.enemies){e.active=e.boss=true;e.hp=e.maxHp=10000;e.x=e.y=10000;e.speed=e.dmg=0;}
    s.raid={poiId:"raid-target",tMinus:0,landed:false};sim.step(1/60,idle);
    expect(s.raid).toMatchObject({landed:false,spawned:0,tMinus:5});expect(s.raidsSurvived).toBe(0);
    s.enemies[0]!.active=false;s.raid!.tMinus=0;sim.step(1/60,idle);
    expect(s.raid?.spawned).toBe(1);expect(s.raidsSurvived).toBe(0);
  });
  it("target loss cancels rather than credits; phase/spawn count/timer are hashed",()=>{
    const {sim,s,t}=setup();s.raid={poiId:t.poiId,tMinus:10,landed:false,spawned:0};
    const before=sim.snapshot();s.raid.landed=true;expect(sim.snapshot()).not.toBe(before);
    t.disabled=true;sim.step(1/60,idle);expect(s.raid).toBeNull();expect(s.raidsSurvived).toBe(0);expect(s.raidReadySince).toBeNull();
  });
});
