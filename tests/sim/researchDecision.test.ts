import {it,expect} from 'vitest';
import {RunSimulation} from '../../src/core/sim/RunSimulation';
const idle={moveX:0,moveY:0,dashPressed:false};
export function stageResearchDecision(sim:RunSimulation){
 const s=sim.state;s.ageIndex=2;s.knowledgeTotal=0;s.spawnT=s.eliteT=s.mineT=999;
 for(const e of s.enemies)e.active=false;
 const sites:{id:string;wx:number;wy:number}[]=[];for(let x=-3;x<=3;x++)for(let y=-3;y<=3;y++)for(const p of sim.chunks.get(s.worldSeed,s.worldNonce,x,y).poi)if(p.type!=='signal')sites.push(p);
 const first=sites.find(a=>sites.some(b=>a.id!==b.id&&Math.hypot(a.wx-b.wx,a.wy-b.wy)<900))!;
 const second=sites.find(b=>first&&b.id!==first.id&&Math.hypot(first.wx-b.wx,first.wy-b.wy)<900)!;
 expect(first).toBeDefined();expect(second).toBeDefined();
 for(const p of [first,second]){s.px=p.wx;s.py=p.wy;if(!s.poisWorld.includes(p.id))s.poisWorld.push(p.id);expect(sim.claimTerritory(p.id).some(e=>e.type==='territory_claimed')).toBe(true);}
 sim.setOutpostSpec(first.id,'military');s.px=first.wx;s.py=first.wy;s.lastRaidAt=-10000;s.draftOpen=false;s.pendingLevels=0;sim.step(1/60,idle);
 expect(s.raid?.poiId).toBe(first.id);s.px=second.wx;s.py=second.wy;
 return{support:second.id,threat:first.id};
}
it('World2 research/defense decision projects actual gains without changing the simulation',()=>{
 const sim=new RunSimulation({masterSeed:'EPOCH-GOLDEN-001'});sim.state.ascendReady=true;sim.ascend('affinity-kinetic','hunters');
 const ids=stageResearchDecision(sim),before=sim.snapshot();
 const choice=sim.researchDecision(ids.support)!;
 expect(choice).not.toBeNull();expect(choice.knowledgeNow).toBeCloseTo(sim.knowledgeMult());
 expect(choice.knowledgeAfter).toBeGreaterThan(choice.knowledgeNow);expect(choice.canResearch).toBe(true);
 expect(choice.raid?.poiId).toBe(ids.threat);expect(choice.raid!.distance).toBeLessThan(900);
 expect(sim.snapshot()).toBe(before);
 sim.setOutpostSpec(ids.support,'research');expect(sim.knowledgeMult()).toBeCloseTo(choice.knowledgeAfter);expect(sim.researchDecision(ids.support)).toBeNull();
});
it('research choice respects full logistics and ordinary World1 has no scarcity decision',()=>{
 const sim=new RunSimulation({masterSeed:'EPOCH-GOLDEN-001'});expect(sim.researchDecision('missing')).toBeNull();sim.state.ascendReady=true;sim.ascend('affinity-kinetic','hunters');
 const ids=stageResearchDecision(sim),s=sim.state;s.logistics=s.maxLogistics;
 expect(sim.researchDecision(ids.support)!.canResearch).toBe(false);
 const before=sim.snapshot();sim.setOutpostSpec(ids.support,'research');expect(sim.snapshot()).toBe(before);
});
