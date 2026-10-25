import {aimFromPivot,weaponTransform} from '../../src/core/combat/weaponGeometry';
import { describe, it, expect } from "vitest";
import { RunSimulation } from "../../src/core/sim/RunSimulation";
import { CombatFeedback, energyCharge, COMBAT_FEEDBACK_BUDGET } from "../../src/game/render/CombatFeedback";
import type { SimEvent } from "../../src/core/sim/SimEvent";
import { getWeaponStage } from "../../src/core/combat/weapons";

const idle={moveX:0,moveY:0,dashPressed:false};
function arena() {
  const sim=new RunSimulation({masterSeed:"EPOCH-GOLDEN-001",originId:"resonant"}),s=sim.state;
  s.spawnT=s.eliteT=s.mineT=999;s.weaponStage.energy=4;
  for(const f of ["kinetic","energy","defense","field"] as const)s.weaponCd[f]=999;
  for(const a of s.squad)a.active=false;
  const e=sim.spawnEnemy("tank",false,false,0,140,[])!;
  e.speed=e.dmg=0;e.hp=e.maxHp=1000;e.shield=0;
  s.weaponRig.heading=aimFromPivot(s.originId,4,s.px,s.py,s.weaponRig,e.x,e.y).heading;
  return {sim,s,e};
}
describe("canonical signature beam feedback",()=>{
  it("charge requires an acquired beam, live target and actual imminent cooldown",()=>{
    const {s,e}=arena();s.weaponCd.energy=.1;expect(energyCharge(s)).toBeCloseTo(.5);
    e.active=false;expect(energyCharge(s)).toBe(0);e.active=true;e.x=s.px+801;expect(energyCharge(s)).toBe(0);
    e.x=s.px+140;s.weaponStage.energy=0;expect(energyCharge(s)).toBe(0);
    s.weaponStage.energy=4;s.originId="hunters";expect(energyCharge(s)).toBe(0);
    s.originId="resonant";s.weaponCd.energy=0;expect(energyCharge(s)).toBe(0);
  });
  it("real beam emits source/tier/aim and reports shield absorption separately from actual HP loss",()=>{
    const {sim,s,e}=arena();s.weaponCd.energy=0;e.shield=20;
    const x=e.x,y=e.y,ev=sim.step(1/60,idle),damage=getWeaponStage("energy",4).damage*s.build.damageMul;
    const beam=ev.find(e=>e.type==="beam_fired")!;const pose=weaponTransform(s.originId,4,s.px,s.py,s.weaponRig,s.elapsed);
    expect(beam).toMatchObject({type:"beam_fired",family:"energy",tier:4,x1:pose.muzzleX,y1:pose.muzzleY,x2:x,y2:y,release:{owner:"player-primary"}});
    expect(ev.find(e=>e.type==="energy_impact")).toMatchObject({x,y,hpDamage:damage-20,shieldDamage:20,source:"energy"});
    expect(e.hp).toBe(1000-(damage-20));expect(e.shield).toBe(0);
  });
  it("no target produces no fake release and lethal impact captures values before slot reuse",()=>{
    const empty=arena();empty.e.active=false;empty.s.weaponCd.energy=0;
    expect(empty.sim.step(1/60,idle).some(e=>e.type==="beam_fired")).toBe(false);
    const {sim,s,e}=arena();e.hp=1;e.xp=0;s.weaponCd.energy=0;
    const ev=sim.step(1/60,idle);expect(ev.find(e=>e.type==="energy_impact")).toMatchObject({hpDamage:1});
    expect(ev.some(e=>e.type==="enemy_killed")).toBe(true);
  });
  it("cosmetics/reduced effects leave every canonical replay snapshot and RNG unchanged",()=>{
    const a=arena(),b=arena(),fx=new CombatFeedback();a.s.weaponCd.energy=b.s.weaponCd.energy=0;
    for(let i=0;i<180;i++) {
      for(const e of a.sim.step(1/60,idle))fx.accept(e,a.s.elapsed,i%2===0);
      b.sim.step(1/60,idle);expect(a.sim.snapshot()).toBe(b.sim.snapshot());
    }
  });
  it("pool stays bounded; pause freezes timestamps, expiry and world reset release every slot",()=>{
    const fx=new CombatFeedback();fx.reset("parent");
    const beam:SimEvent={type:"beam_fired",family:"energy",tier:4,x1:0,y1:0,x2:100,y2:0};
    const hit:SimEvent={type:"energy_impact",x:100,y:0,hpDamage:45,shieldDamage:0,source:"energy"};
    for(let i=0;i<200;i++){fx.accept(beam,1,false);fx.accept(hit,1,false);}
    expect(fx.counts(1)).toEqual({beams:COMBAT_FEEDBACK_BUDGET.beams,impacts:COMBAT_FEEDBACK_BUDGET.impacts});
    expect(fx.counts(1)).toEqual(fx.counts(1));expect(fx.counts(1.3)).toEqual({beams:0,impacts:0});
    fx.accept(beam,2,true);fx.accept(hit,2,true);expect(fx.counts(2)).toEqual({beams:1,impacts:0});
    fx.syncWorld("child");expect(fx.counts(0)).toEqual({beams:0,impacts:0});
  });
  it("offscreen effects submit no draw calls; reduced mode retains the released attack line",()=>{
    const fx=new CombatFeedback();fx.accept({type:"beam_fired",family:"energy",tier:4,x1:0,y1:0,x2:100,y2:0},1,false);
    let calls=0;const g:any={lineStyle:()=>{calls++;},lineBetween:()=>{calls++;}};
    fx.draw(g,1,true,()=>false);expect(calls).toBe(0);
    fx.draw(g,1,true,()=>true);expect(calls).toBe(4);
  });
});
