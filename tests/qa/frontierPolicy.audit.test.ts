// Canonical synthetic policies: real movement, offers, claims; no grants/teleports/stat edits.
import {it,expect} from "vitest";
import {RunSimulation} from "../../src/core/sim/RunSimulation";
import {worldToChunk} from "../../src/core/world/chunks";
import {attemptReward} from "../../src/core/progression/archiveLedger";
import {AGES} from "../../src/core/tech/graph";
import {calculateLogisticsCost} from "../../src/core/emergence/outpostLogistics";
import {CONTENT_VERSION} from "../../src/core/seed/versions";
declare const require:(m:string)=>any;
const fs=require("fs");
function run(seed:string,policy:string,limit=900){
 const sim=new RunSimulation({masterSeed:seed,originId:"hunters"});let target={x:0,y:0};
 let choices=0,claims=0;const signatures=new Set<string>();
 for(let tick=0;tick<limit*60&&!sim.state.over;tick++){
  const s=sim.state;
  if(s.draftOpen){
   const offers=s.draftOffers;let index=0;
   if(policy==="planner"){
    const score=(i:number)=>offers[i]!.effectiveEffects.reduce((n,e)=>n+(["knowledgeMul","maxHpAdd","regenAdd","relayAdd","chainAdd"].includes(e.kind)?2:1),0);
    index=offers.reduce((best,_,i)=>score(i)>score(best)?i:best,0);
   }
   for(const event of sim.chooseDraft(index))if(event.type==="tech_selected")choices++;
   if(s.draftOpen)continue;
  }
  if(tick%60===0){
   if(s.ageIndex>=2&&!s.expansionFamily)sim.chooseExpansion("energy");
   if(policy!=="novice")sim.tryAbility();
   for(const c of sim.claimablePOIs()){
    if(!c.clear)continue;const events=sim.claimTerritory(c.poiId);if(events.some(e=>e.type==="territory_claimed"))claims++;
    const spec=policy==="kiter"?"military":"research";
    if(sim.canSetOutpostSpec(c.poiId,spec) && (policy!=="planner" || s.logistics+calculateLogisticsCost(spec,1,s.ageIndex)<=s.maxLogistics-1 || c.poiType==="signal"))sim.setOutpostSpec(c.poiId,spec);
   }
   for(const t of s.territories)if(!t.spec&&sim.canSetOutpostSpec(t.poiId,"research")&&(policy!=="planner"||s.logistics<s.maxLogistics-1||t.poiType==="signal"))sim.setOutpostSpec(t.poiId,"research");
   if(policy==="planner")for(const t of s.territories)if(sim.outpostUpgradeStatus(t.poiId).allowed)sim.upgradeOutpost(t.poiId);
   target={x:s.px+Math.cos(tick/1800)*600,y:s.py+Math.sin(tick/1800)*600};
   const pickups=s.pickups.filter(k=>k.active).sort((a,b)=>Math.hypot(a.x-s.px,a.y-s.py)-Math.hypot(b.x-s.px,b.y-s.py));
   if(pickups[0] && policy!=="novice")target=pickups[0];
   if(policy==="explorer"||(policy==="planner"&&Math.floor(tick/1800)%2===0)){
    const {cx,cy}=worldToChunk(s.px,s.py);let best=Infinity;
    for(let x=-2;x<=2;x++)for(let y=-2;y<=2;y++)for(const poi of sim.chunks.get(s.worldSeed,s.worldNonce,cx+x,cy+y).poi){
     if(s.poisWorld.includes(poi.id))continue;const d=Math.hypot(poi.wx-s.px,poi.wy-s.py);
     if(d<best){best=d;target={x:poi.wx,y:poi.wy};}
    }
   }
  }
  if(policy==="planner"&&s.raid){const t=s.territories.find(t=>t.poiId===s.raid!.poiId);if(t)target=t;}
  if(policy==="planner"&&s.stronghold?.revealed)target=s.stronghold;
  let x=target.x-s.px,y=target.y-s.py;
  if(policy==="kiter"||policy==="planner"){
   let foe=null,best=200;
   for(const e of s.enemies)if(e.active){const d=Math.hypot(e.x-s.px,e.y-s.py);if(d<best){foe=e;best=d;}}
   if(foe){x=s.px-foe.x;y=s.py-foe.y;}
  }
  const len=Math.max(1,Math.hypot(x,y));
  sim.step(1/60,{moveX:x/len,moveY:y/len,dashPressed:policy!=="stationary"&&tick%240===0});
  if(s.stats.bosses>0)sim.finishAttempt();
  for(const id of s.breakthroughs)signatures.add(id);
 }
 const s=sim.state;expect(Number.isFinite(s.build.hp)).toBe(true);expect(s.techNodes.length).toBeLessThanOrEqual(128);
 return {seed,policy,outcome:s.over?(s.build.hp>0?"victory":"defeat"):"time-limit",seconds:Number(s.runElapsed.toFixed(2)),age:s.runHighestAge,kills:s.runKills,choices,claims,bosses:s.stats.bosses,bossEncountered:s.bossSpawned,eligibleInsight:s.over?attemptReward(s.runElapsed,AGES.indexOf(s.runHighestAge),s.stats.bosses>0):0,persistedInsight:0,capacity:s.logistics,capacityMax:s.maxLogistics,fusions:[...signatures],hp:Number(s.build.hp.toFixed(2)),hash:sim.hash()};
}
it("measures four bounded strategies over two seeds without pretending to measure human fun",()=>{
 const report={contentVersion:CONTENT_VERSION,classification:"SYNTHETIC_POLICY_AUDIT",maxSeconds:900,archivePerks:[],rows:["EPOCH-GOLDEN-001","FRONTIER-POLICY-002"].flatMap(seed=>["novice","kiter","explorer","planner"].map(p=>run(seed,p)))};
 expect(run("POLICY-REPLAY","planner",30)).toEqual(run("POLICY-REPLAY","planner",30));
 fs.mkdirSync("test-results",{recursive:true});fs.writeFileSync("test-results/frontier-policy.json",JSON.stringify(report,null,2));
 console.table(report.rows.map(({seed,policy,outcome,seconds,age,kills,claims})=>({seed,policy,outcome,seconds,age,kills,claims})));
},180000);
