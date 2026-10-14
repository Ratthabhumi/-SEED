import {describe,it,expect} from "vitest";
import {RunSimulation} from "../../src/core/sim/RunSimulation";
import {stepBossEncounter,bossAreaHit,createBossEncounter,BOSS_ENCOUNTER} from "../../src/core/combat/bossEncounter";
const idle={moveX:0,moveY:0,dashPressed:false};
function arena(){const sim=new RunSimulation({masterSeed:"BOSS-COUNTERPLAY-001"});const s=sim.state;s.spawnT=s.eliteT=s.mineT=999;s.build.hp=s.build.maxHp=10000;s.weaponCd={kinetic:999,energy:999,defense:999,field:999};for(const a of s.squad)a.cd=999;const e=sim.spawnEnemy("tank",false,true,0,250,[])!;return {sim,s,e};}
describe("deterministic warned boss counterplay",()=>{
  it("two attacks alternate, phase two adds cross, recovery is stationary",()=>{
    const {e}=arena();const fired:string[]=[];
    const advance=(seconds:number)=>{for(let i=0;i<seconds*60;i++)stepBossEncounter(e,0,0,1/60,p=>fired.push(p));};
    advance(10);expect(fired.slice(0,2)).toEqual(["slam","fan"]);
    e.hp=e.maxHp*.4;advance(18);expect(fired).toContain("cross");
    e.encounter={...createBossEncounter(),phase:"recover",timer:1};const before=[e.x,e.y];advance(.5);expect([e.x,e.y]).toEqual(before);
  });
  it("warning locks aim and leaving it avoids real slam damage",()=>{
    for(const dodge of [false,true]){
      const {sim,s,e}=arena();e.encounter!.phase="warning";e.encounter!.timer=.5;e.encounter!.aimX=s.px;e.encounter!.aimY=s.py;
      const hp=s.build.hp;if(dodge)s.py+=BOSS_ENCOUNTER.slamRadius+30;
      for(let i=0;i<60;i++)sim.step(1/60,idle);
      expect(s.build.hp).toBe(dodge?hp:hp-e.dmg);
      expect(e.encounter!.phase).toBe("recover");
    }
  });
  it("cross leaves genuine diagonal safety and fixed-width damaging lanes",()=>{
    expect(bossAreaHit("cross",-250,0,0,0,100,0)).toBe(true);
    expect(bossAreaHit("cross",-250,0,0,0,80,80)).toBe(false);
    expect(bossAreaHit("slam",-250,0,0,0,0,0)).toBe(true);
  });
  it("fan fires six canonical projectiles with a central gap; state is hashed and pool reset",()=>{
    const a=arena(),b=arena();for(const {sim,e} of [a,b]){e.encounter!.phase="warning";e.encounter!.pattern="fan";e.encounter!.timer=0;e.encounter!.aimX=0;e.encounter!.aimY=0;for(let i=0;i<10;i++)sim.step(1/60,idle);}
    expect(a.s.projs.filter(p=>p.active&&p.src==="boss-fan")).toHaveLength(6);
    expect(a.sim.snapshot()).toBe(b.sim.snapshot());const hash=a.sim.hash();a.e.encounter!.cycle++;expect(a.sim.hash()).not.toBe(hash);
    const thresholdHash=b.sim.hash();b.e.maxHp*=2;expect(b.sim.hash()).not.toBe(thresholdHash);
    a.e.active=false;a.sim.spawnEnemy("tank",false,false,0,250,[]);expect(a.e.encounter).toBeUndefined();
  });
});
