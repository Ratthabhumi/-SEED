import {describe,it,expect} from "vitest";
import {RunSimulation} from "../../src/core/sim/RunSimulation";
import {committedLogistics} from "../../src/core/emergence/outpostLogistics";
import {Xoshiro128StarStar} from "../../src/core/seed/rng";
import type {Territory} from "../../src/core/world/territory";
function post(id:string,signal=false):Territory{return {poiId:id,poiType:signal?"signal":"ruin",x:0,y:0,spec:"",tier:1,hp:350,maxHp:350,disabled:false,garrisoned:false,heldSince:0,repairT:0};}
describe("canonical logistics reservations",()=>{
  it("garrison slots are not duplicated by founding; recall preserves wounded HP",()=>{
    const sim=new RunSimulation({masterSeed:"GARRISON-LEDGER",originId:"engineers"}),s=sim.state;
    s.territories.push(post("staff"),post("military"));sim.setOutpostSpec("staff","research");
    s.squad[0]!.hp=7;sim.garrisonOutpost("staff");expect(sim.mobileSquadLimit()).toBe(1);
    sim.setOutpostSpec("military","military");expect(sim.mobileSquadLimit()).toBe(2);
    expect(s.squad.filter(a=>a.active)).toHaveLength(2);expect(s.logistics).toBe(3);
    sim.garrisonOutpost("staff");expect(sim.mobileSquadLimit()).toBe(3);expect(s.logistics).toBe(3);
    expect(s.squad[0]!.hp).toBe(7);
  });
  it("0/3 → 2/3 → 3/3; overflow rejected; disabled/repair reserve stays charged",()=>{
    const sim=new RunSimulation({masterSeed:"LEDGER",originId:"engineers"}),s=sim.state;
    s.territories.push(post("a"),post("b"),post("c"));
    expect(sim.logisticsStatus().used).toBe(0);
    sim.setOutpostSpec("a","military");expect(s.logistics).toBe(2);
    sim.setOutpostSpec("b","research");expect(s.logistics).toBe(3);
    const before=sim.snapshot();expect(sim.setOutpostSpec("c","economy")).toEqual([]);expect(sim.snapshot()).toBe(before);
    const a=s.territories[0]!;a.disabled=true;a.hp=0;
    expect(sim.logisticsStatus()).toMatchObject({used:3,reservedDisabled:1});
    a.disabled=false;a.hp=a.maxHp/2;expect(s.logistics).toBe(3);
    sim.dismantleOutpost("a");expect(s.logistics).toBe(1);
    const once=sim.snapshot();expect(sim.dismantleOutpost("a")).toEqual([]);expect(sim.snapshot()).toBe(once);
  });
  it("one bounded Signal overcommitment, charged visibly and never renewed",()=>{
    const sim=new RunSimulation({masterSeed:"SIGNAL-LEDGER",originId:"hunters"}),s=sim.state;
    s.territories.push(post("a"),post("b"),post("first",true),post("second",true));
    sim.setOutpostSpec("a","military");sim.setOutpostSpec("b","research");
    sim.setOutpostSpec("first","military");expect(sim.logisticsStatus()).toMatchObject({used:5,maximum:3,overcommit:2,signalExceptionUsed:true});
    expect(sim.setOutpostSpec("second","research")).toEqual([]);
    sim.dismantleOutpost("first");expect(s.logistics).toBe(3);
    expect(sim.setOutpostSpec("first","military")).toEqual([]);
  });
  it("seeded legal-operation sequences reconcile cost, refunds and garrison without farming",()=>{
    for(let seed=0;seed<24;seed++){
      const sim=new RunSimulation({masterSeed:`LEDGER-${seed}`,originId:"engineers"}),s=sim.state,rng=new Xoshiro128StarStar(seed);
      s.elapsed=100;s.knowledgeTotal=20000;
      for(let i=0;i<8;i++)s.territories.push(post(`${i}`,i===7));
      for(let i=0;i<160;i++){
        const p=s.territories[rng.nextInt(0,8)]!,op=rng.nextInt(0,4);
        if(op===0)sim.setOutpostSpec(p.poiId,["research","military","economy"][rng.nextInt(0,3)] as "research");
        else if(op===1)sim.dismantleOutpost(p.poiId);
        else if(op===2)sim.upgradeOutpost(p.poiId);
        else sim.garrisonOutpost(p.poiId);
        expect(s.logistics).toBe(committedLogistics(s.territories,s.ageIndex));
        expect(s.logistics).toBeGreaterThanOrEqual(0);expect(s.logistics).toBeLessThanOrEqual(s.maxLogistics+2);
        if(s.logistics>s.maxLogistics)expect(s.signalSecured).toBe(true);
      }
      const before=sim.snapshot();sim.logisticsStatus();expect(sim.snapshot()).toBe(before);
    }
  });
});
