import type {RunSimulation} from "../src/core/sim/RunSimulation";
import {worldToChunk} from "../src/core/world/chunks";
import {AGE_DEFS,ageGates} from "../src/core/progression/ages";
import {activeFamilies} from "../src/core/progression/origins";
/** Synthetic policy: actual movement/drafts/claims/combat; no grants, teleports or stat edits. */
export function progressionPolicy(sim:RunSimulation,limit=900){
  let target={x:0,y:0},lastAge=0,lastAgeAt=0,choices=0,bossVictories=0;const ages:any[]=[],raids:any[]=[],samples:any[]=[],worlds:any[]=[];
  const selected:string[]=[];let raidWait=0,overshoot=0;
  const observe=(events:ReturnType<RunSimulation["step"]>)=>{
    for(const event of events)if(["raid_incoming","raid_repelled","outpost_lost","outpost_repaired"].includes(event.type))raids.push({world:sim.state.ascension+1,runTime:Number(sim.state.runElapsed.toFixed(2)),time:Number(sim.state.elapsed.toFixed(2)),...event});
  };
  for(let tick=0;tick<limit*60&&!sim.state.over;tick++){
    const s=sim.state;
    if(s.draftOpen){
      const route=sim.combinationRoute();
      const score=(i:number)=>{
        const offer=s.draftOffers[i]!;
        return (offer.nodeId===route.next?.id?100:0)+offer.effectiveEffects.reduce((n,e)=>n+(["knowledgeMul","maxHpAdd","regenAdd","damageMul","cooldownMul","speedAdd","chainAdd"].includes(e.kind)?3:1),0);
      };
      const index=s.draftOffers.reduce((best,_,i)=>score(i)>score(best)?i:best,0);
      if(!s.draftOffers[index])break;
      selected.push(s.draftOffers[index]!.nodeId);observe(sim.chooseDraft(index));choices++;
      if(s.draftOpen)continue;
    }
    if(tick%60===0){
      if(s.ageIndex>=3&&!s.expansionFamily)observe(sim.chooseExpansion(s.originId==="resonant"||s.originId==="sentinels"?"kinetic":"energy"));
      const engaged=s.enemies.filter(e=>e.active&&Math.hypot(e.x-s.px,e.y-s.py)<600).length;
      const near=s.enemies.filter(e=>e.active&&Math.hypot(e.x-s.px,e.y-s.py)<260).length;
      const useAbility=s.originId==="sentinels"?s.build.hp<s.build.maxHp*.7:s.originId==="resonant"?near>=2:engaged>=2;
      if(useAbility)observe(sim.tryAbility());
      for(const c of sim.claimablePOIs())if(c.clear){
        observe(sim.claimTerritory(c.poiId));
        if(sim.canSetOutpostSpec(c.poiId,"research"))observe(sim.setOutpostSpec(c.poiId,"research"));
      }
      for(const t of s.territories){
        if(!t.spec&&sim.canSetOutpostSpec(t.poiId,"research"))observe(sim.setOutpostSpec(t.poiId,"research"));
        if(s.ageIndex>=2&&sim.outpostUpgradeStatus(t.poiId).allowed)observe(sim.upgradeOutpost(t.poiId));
      }
      // Explore by travel heading. Never inspect undiscovered POI coordinates.
      const angle=Math.floor(tick/1800)*1.9;
      target={x:s.px+Math.cos(angle)*800,y:s.py+Math.sin(angle)*800};
      let nearest=Infinity;
      for(const p of s.pickups)if(p.active){const d=Math.hypot(p.x-s.px,p.y-s.py);if(d<nearest){nearest=d;target={x:p.x,y:p.y};}}
      if(nearest>400){
        const {cx,cy}=worldToChunk(s.px,s.py);
        for(let x=-2;x<=2;x++)for(let y=-2;y<=2;y++)for(const poi of sim.chunks.get(s.worldSeed,s.worldNonce,cx+x,cy+y).poi){
          if(!s.poisWorld.includes(poi.id)||s.territories.some(t=>t.poiId===poi.id))continue;
          const d=Math.hypot(poi.wx-s.px,poi.wy-s.py);if(d<nearest){nearest=d;target={x:poi.wx,y:poi.wy};}
        }
      }
      const damaged=s.territories.find(t=>t.disabled);if(damaged)target=damaged;
      if(s.raid){const base=s.territories.find(t=>t.poiId===s.raid!.poiId);if(base)target=base;}
      if(s.stronghold?.revealed)target=s.stronghold;
      const active=s.territories.filter(t=>!t.disabled);
      const gates=ageGates(s.ageIndex+1,s.knowledgeTotal,{ascension:s.ascension,ageKills:s.ageKills,territoriesClaimed:s.territories.length,elitesAge:s.elitesAge,
        outpostsTier2:active.filter(t=>t.tier===2).length,raidsSurvived:s.raidsSurvived,signalSecured:s.signalSecured,breakthroughs:s.breakthroughs.length},
        {active:active.length,specialized:active.filter(t=>t.spec).length,tier2:active.filter(t=>t.tier===2).length,raidsSurvived:s.raidsSurvived});
      const solelyRaid=gates.length>0&&gates.every(g=>g.id==="dominion"?g.sub.every(r=>r.done||r.labelKey==="dominion.raids"):g.done)&&
        gates.some(g=>g.sub.some(r=>r.labelKey==="dominion.raids"&&!r.done));
      if(solelyRaid){raidWait++;overshoot=Math.max(overshoot,s.knowledgeTotal-(AGE_DEFS[s.ageIndex+1]?.knowledgeThreshold??s.knowledgeTotal));}
      samples.push({world:s.ascension+1,runTime:Number(s.runElapsed.toFixed(1)),t:Number(s.elapsed.toFixed(1)),age:s.ageIndex,knowledge:Math.floor(s.knowledgeTotal),logistics:s.logistics,max:s.maxLogistics,raid:s.raid?.landed?"active":s.raid?"warning":"none",solelyRaid});
    }
    let dx=target.x-s.px,dy=target.y-s.py,close=120,foe=null,warning=null;
    for(const e of s.enemies)if(e.active){const d=Math.hypot(e.x-s.px,e.y-s.py);if(d<close){close=d;foe=e;}}
    for(const e of s.enemies)if(e.active&&e.evolution?.phase==="warning"&&Math.hypot(e.x-s.px,e.y-s.py)<350)warning=e;
    if(foe){const away=Math.atan2(s.py-foe.y,s.px-foe.x);dx=Math.cos(away);dy=Math.sin(away);}
    if(warning){const angle=Math.atan2(warning.evolution!.aimY-warning.y,warning.evolution!.aimX-warning.x);dx=-Math.sin(angle);dy=Math.cos(angle);}
    let projectileDanger=false;
    for(const p of s.projs)if(p.active&&!p.friendly&&Math.hypot(p.x+p.vx*.2-s.px,p.y+p.vy*.2-s.py)<100){
      const side=(s.px-p.x)*(-p.vy)+(s.py-p.y)*p.vx>=0?1:-1;dx=-p.vy*side;dy=p.vx*side;projectileDanger=true;break;
    }
    const distance=Math.max(1,Math.hypot(dx,dy));
    observe(sim.step(1/60,{moveX:dx/distance,moveY:dy/distance,dashPressed:s.dashCd<=0&&(projectileDanger||!!foe&&close<95||!!warning&&warning.evolution!.timer<.2)}));
    if(s.ageIndex!==lastAge){ages.push({world:s.ascension+1,from:lastAge,to:s.ageIndex,time:Number(s.elapsed.toFixed(2)),spent:Number((s.elapsed-lastAgeAt).toFixed(2)),knowledge:Math.floor(s.knowledgeTotal)});lastAge=s.ageIndex;lastAgeAt=s.elapsed;}
    if(s.ascendReady){
      bossVictories++;
      if(bossVictories>=2)break;
      const families=activeFamilies(s.originId,"");
      const offer=sim.legacyOffers().find(o=>!o.requiredFamily||families.includes(o.requiredFamily));
      if(!offer)break;
      observe(sim.ascend(offer.id,s.originId));
      const child=sim.state;lastAge=0;lastAgeAt=0;target={x:child.px,y:child.py};
      worlds.push({runTime:Number(child.runElapsed.toFixed(2)),world:child.ascension+1,legacy:offer.id,origin:child.originId,
        startingLogistics:child.logistics,startingKnowledge:child.knowledgeTotal,raidReset:child.raid===null});
    }
  }
  const s=sim.state;
  return {classification:"SYNTHETIC_CANONICAL_POLICY",policy:"responsive-route-planner-v2",seed:s.masterSeed,origin:s.originId,
    outcome:s.over?"defeat":s.ascendReady?"boss-victory":"time-limit",seconds:Number(s.runElapsed.toFixed(2)),age:s.ageIndex,highestAge:s.runHighestAge,bossVictories,worlds,ages,
    choices,selected,breakthroughs:s.breakthroughs,raids,raidOnlyWait:raidWait,knowledgeOvershoot:Math.floor(overshoot),
    knowledge:Math.floor(s.knowledgeTotal),logistics:s.logistics,maxLogistics:s.maxLogistics,outposts:s.territories.length,samples};
}
