import {writeFileSync} from 'node:fs';
import {RunSimulation} from '../src/core/sim/RunSimulation';
import {eligibleTech} from '../src/core/tech/web';
import {activeFamilies} from '../src/core/progression/origins';
const behaviors=new Set(['projectileAdd','auraAdd','orbitAdd','summonAdd','mineAdd','chainAdd','relayAdd','relayChain','beamAdd','weaponEvolve']);
const rows=[];
for(const seed of ['EPOCH-GOLDEN-001','EPOCH-EXPAND-01','V50-OPENING-03'])for(const origin of ['hunters','engineers','resonant','sentinels']){
 const sim=new RunSimulation({masterSeed:seed,originId:origin});const s=sim.state;
 const eligible=sim.techGraph().filter(n=>eligibleTech(n,new Set(s.owned),0,new Set(activeFamilies(origin,s.expansionFamily))));
 const behavior=eligible.filter(n=>n.effects.some(e=>behaviors.has(e.kind)));
 sim.gainKnowledge(100,'audit',[]);
 rows.push({seed,origin,eligible:eligible.length,eligibleBehavior:behavior.map(n=>n.id),offered:s.draftOffers.map(o=>({id:o.nodeId,effects:sim.techGraph().find(n=>n.id===o.nodeId)?.effects.map(e=>e.kind)}))});
}
writeFileSync('scratch/v50-opening-offer-audit.json',JSON.stringify({classification:'STAGED_ELIGIBILITY_AUDIT_NOT_NATURAL_TIMING',rows},null,2));
console.log(JSON.stringify({rows:rows.length,behaviorEligible:rows.filter(r=>r.eligibleBehavior.length).length,behaviorOffered:rows.filter(r=>r.offered.some(o=>o.effects?.some(e=>behaviors.has(e)))).length}));
