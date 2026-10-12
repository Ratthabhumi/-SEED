import { describe, it, expect } from "vitest";
import { generateTechGraph } from "../../src/core/tech/generator";
import { combinationRoute } from "../../src/core/tech/combinationRoute";
import { RunSimulation } from "../../src/core/sim/RunSimulation";
import { ORIGINS, activeFamilies } from "../../src/core/progression/origins";
import { missionDone } from "../../src/core/progression/missions";

describe("Content13 pre-Industrial combination recovery", () => {
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
