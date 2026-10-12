import {describe,it,expect} from "vitest";
import {RunSimulation} from "../../src/core/sim/RunSimulation";
import {CombatFeedback} from "../../src/game/render/CombatFeedback";
describe("all-family resolved feedback",()=>{
  it("kinetic and guardian release/impact observe real projectile damage",()=>{
    for(const [origin,family,age] of [["hunters","kinetic",0],["sentinels","defense",3]] as const){
      const sim=new RunSimulation({masterSeed:"FAMILY-FX",originId:origin});const s=sim.state;s.ageIndex=age;s.weaponStage.defense=age;s.spawnT=s.eliteT=s.mineT=999;for(const a of s.squad)a.cd=999;
      const e=sim.spawnEnemy("tank",false,false,0,100,[])!;e.speed=e.dmg=0;e.hp=e.maxHp=10000;
      const all=[];for(let i=0;i<90;i++)all.push(...sim.step(1/60,{moveX:0,moveY:0,dashPressed:false}));
      expect(all.some(e=>e.type==="weapon_fired"&&e.family===family)).toBe(true);
      expect(all.some(e=>e.type==="weapon_impact"&&e.family===family&&e.hpDamage>0)).toBe(true);
    }
  });
  it("mine detonation is actual damage, not expiry; reduced feedback remains bounded",()=>{
    const sim=new RunSimulation({masterSeed:"FIELD-FX",originId:"engineers"});const s=sim.state;s.spawnT=s.eliteT=s.mineT=999;for(const a of s.squad)a.cd=999;
    const e=sim.spawnEnemy("tank",false,false,0,100,[])!;e.speed=e.dmg=0;e.hp=e.maxHp=10000;
    Object.assign(s.mines[0],{active:true,x:e.x,y:e.y,dmg:40,radius:60,life:3});
    const ev=sim.step(1/60,{moveX:0,moveY:0,dashPressed:false});
    expect(ev.some(e=>e.type==="mine_detonated")).toBe(true);expect(ev.some(e=>e.type==="weapon_impact"&&e.family==="field")).toBe(true);
    const f=new CombatFeedback();f.reset("one");for(let i=0;i<100;i++)for(const e of ev)f.accept(e,0,false);expect(f.counts(0).impacts).toBeLessThanOrEqual(32);
    f.reset("two");for(const e of ev)f.accept(e,0,true);expect(f.counts(0).impacts).toBe(0);
  });
});
