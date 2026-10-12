import { describe, it, expect } from "vitest";
import { generateTechGraph } from "../../src/core/tech/generator";
import { combinationRoute } from "../../src/core/tech/combinationRoute";
import { RunSimulation } from "../../src/core/sim/RunSimulation";
import { ORIGINS, activeFamilies } from "../../src/core/progression/origins";
import { missionDone } from "../../src/core/progression/missions";
import {calculateMaxLogistics} from "../../src/core/emergence/outpostLogistics";

describe("Content13 pre-Industrial combination recovery", () => {
  it("actual recipe picks, elite reward and legal claims advance the canonical Industrial gate",()=>{
    const sim=new RunSimulation({masterSeed:"EPOCH-GOLDEN-001",originId:"resonant"});const s=sim.state;
    // Isolate the Iron gate. Other acceptance conditions are earned through
    // canonical operations, not pre-inserted breakthroughs or over-cap bases.
    s.ageIndex=2;s.maxLogistics=calculateMaxLogistics(2);s.spawnT=s.eliteT=s.mineT=999;
    const elite=sim.spawnEnemy("tank",true,false,0,250,[],"armored")!;
    sim.debugDamageEnemy(s.enemies.indexOf(elite),elite.hp*10+elite.shield);
    expect(s.elitesAge).toBe(1);
    for(let r=0;r<6 && s.territories.length<2;r++)for(let x=-r;x<=r && s.territories.length<2;x++)for(let y=-r;y<=r && s.territories.length<2;y++){
      for(const poi of sim.chunks.get(s.worldSeed,s.worldNonce,x,y).poi){
        if(s.territories.some(t=>t.poiId===poi.id))continue;
        s.px=poi.wx;s.py=poi.wy;if(!s.poisWorld.includes(poi.id))s.poisWorld.push(poi.id);
        sim.claimTerritory(poi.id);sim.setOutpostSpec(poi.id,"research");
        if(s.territories.length===2)break;
      }
    }
    expect(s.territories.filter(t=>t.spec==="research")).toHaveLength(2);
    sim.gainKnowledge(5000,"test",[]);
    for(let i=0;i<2;i++){
      const next=sim.combinationRoute().next!;
      expect(s.breakthroughs).toHaveLength(0);
      sim.chooseDraft(s.draftOffers.findIndex(o=>o.nodeId===next.id));
    }
    expect(s.breakthroughs).toContain("metallurgy");
    let remaining=100;while(s.draftOpen&&remaining-->0)sim.chooseDraft(0);
    expect(s.draftOpen).toBe(false);expect(s.logistics).toBeLessThanOrEqual(s.maxLogistics);
    const ev=sim.step(1/60,{moveX:0,moveY:0,dashPressed:false});
    expect(s.ageIndex).toBe(3);expect(ev.some(e=>e.type==="age_reached"&&e.age==="industrial")).toBe(true);
  });
  it("203 seeds × four origins × three worlds retain a universal two-pick route", () => {
    const seeds = ["EPOCH-GOLDEN-001","EPOCH-GOLDEN-002","EPOCH-STRESS-001", ...Array.from({length:200},(_,i)=>`COMBINATION-AUDIT-${i}`)];
    let cases=0;
    for (const seed of seeds) for (const origin of ORIGINS) for (const world of [0,1,2]) {
      const nodes=generateTechGraph(seed,world).nodes;
      // Exhaust unrelated investments. None can exclude either ingredient.
      const owned=nodes.filter(n=>!["stone-fire","stone-tools"].includes(n.id)).map(n=>n.id);
      const tags:string[]=[];
      for(let i=0;i<2;i++) {
        const next=combinationRoute(nodes,owned,tags,[],2,new Set(activeFamilies(origin.id,""))).next;
        expect(next,`${seed}/${origin.id}/${world}/${i}`).toBeDefined();
        expect(next!.age).toBe("stone"); owned.push(next!.id); tags.push(...next!.tags,...next!.synergyTags);
      }
      expect(tags).toContain("fire"); expect(tags).toContain("tools"); cases++;
    }
    expect(cases).toBe(2436);
  });
  it("real drafts recover an exhausted frontier without free unlocks; replay matches", () => {
    for(const origin of ORIGINS) {
      const sims=[0,1].map(()=>new RunSimulation({masterSeed:"EPOCH-GOLDEN-001",originId:origin.id}));
      for(const sim of sims) {
        const s=sim.state; s.ageIndex=2;
        s.owned.push(...sim.techGraph().filter(n=>!s.owned.includes(n.id)&&!["stone-fire","stone-tools"].includes(n.id)).map(n=>n.id));
        sim.gainKnowledge(100000,"test",[]);
        for(let i=0;i<2;i++) {
          const next=sim.combinationRoute().next!;
          const slot=s.draftOffers.findIndex(o=>o.nodeId===next.id);
          expect(slot).toBeGreaterThanOrEqual(0);
          const events=sim.chooseDraft(slot);
          if(i===0) expect(s.breakthroughs).toHaveLength(0);
          else expect(events.some(e=>e.type==="breakthrough"&&e.id==="metallurgy")).toBe(true);
        }
        expect(missionDone("industrial",{ageKills:0,territoriesClaimed:0,elitesAge:1,outpostsTier2:0,raidsSurvived:0,signalSecured:false,breakthroughs:s.breakthroughs.length})).toBe(true);
      }
      expect(sims[0].snapshot()).toBe(sims[1].snapshot());
    }
  });
  it("advice rejects unavailable components using canonical eligibility", () => {
    const nodes=generateTechGraph("EPOCH-GOLDEN-001").nodes;
    const owned=["spine-tools","foundation-science","foundation-industry"];
    const fire=nodes.find(n=>n.id==="stone-fire")!;
    const route=()=>combinationRoute(nodes,owned,["tools"],[],2,new Set(["energy"]));
    fire.exclusions=["foundation-science"]; expect(route().next).toBeUndefined();
    fire.exclusions=[]; fire.age="atomic"; expect(route().next).toBeUndefined();
    fire.age="stone"; fire.effects=[{kind:"projectileAdd",value:1,family:"kinetic"}]; expect(route().next).toBeUndefined();
  });
});
