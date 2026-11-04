import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {RunSimulation} from '../src/core/sim/RunSimulation';
import {eligibleTech} from '../src/core/tech/web';
import {changesAttackPattern} from '../src/core/tech/earlyTactics';
import {activeFamilies} from '../src/core/progression/origins';
import {progressionPolicy} from './progressionPolicy';
const seeds=['EPOCH-GOLDEN-001','EPOCH-EXPAND-01','V50-OPENING-03'];
const origins=['hunters','engineers','resonant','sentinels'];
const before=JSON.parse(readFileSync('docs/evidence/v50/opening-offer-audit.json','utf8'));
const rows=[];
for(const seed of seeds)for(const originId of origins){
 const sim=new RunSimulation({masterSeed:seed,originId}),s=sim.state;
 const eligible=sim.techGraph().filter(n=>eligibleTech(n,new Set(s.owned),0,new Set(activeFamilies(originId,s.expansionFamily))));
 sim.gainKnowledge(100,'staged-audit',[]);
 const offered=s.draftOffers.map(o=>({id:o.nodeId,effects:o.effectiveEffects,baseBehavior:changesAttackPattern(sim.techGraph().find(n=>n.id===o.nodeId))}));
 const index=s.draftOffers.findIndex(o=>changesAttackPattern({effects:o.effectiveEffects}));
 const selected=s.draftOffers[index];if(index<0)throw Error('No legal opening behavior opportunity');
 sim.chooseDraft(index);
 rows.push({seed,origin:originId,eligible:eligible.length,eligibleBehavior:eligible.filter(n=>changesAttackPattern(n)).map(n=>n.id),offered,selected:selected.nodeId,counters:{projectiles:s.build.bonusProjectiles,chain:s.build.chainUnlocked,mines:s.build.bonusMines,orbit:s.build.bonusOrbit}});
}
const smoke=[];
for(const originId of origins){
 const sim=new RunSimulation({masterSeed:seeds[0],originId});let firstOffer=null,firstChoice=null,firstBehaviorChoice=null,firstEffectivePattern=null;
 const run=progressionPolicy(sim,60,{mode:'balanced',onStep:(sim)=>{
  const s=sim.state;
  if(firstOffer===null&&s.draftOpen&&s.draftOffers.some(o=>changesAttackPattern({effects:o.effectiveEffects})))firstOffer=s.elapsed;
  if(firstChoice===null&&s.stats.techsTaken)firstChoice=s.elapsed;
  if(firstEffectivePattern===null&&(s.build.bonusProjectiles>0||s.build.bonusMines>0||s.build.bonusOrbit>0||s.build.chainUnlocked||s.build.bonusAura>0||s.build.beamUnlocked||s.build.relayUnlocked))firstEffectivePattern=s.elapsed;
  if(firstBehaviorChoice===null){const h=s.history.find(h=>h.kind==='tech'&&changesAttackPattern(sim.techGraph().find(n=>n.id===h.label)??{effects:[]}));if(h)firstBehaviorChoice=h.t;}
  return false;
 }});
 smoke.push({origin:originId,firstBehaviorOffer:firstOffer,firstChoice,firstBaseBehaviorChoice:firstBehaviorChoice,firstEffectivePattern,outcome:run.outcome,seconds:run.seconds,selected:run.selected,kills:sim.state.stats.kills,age:sim.state.ageIndex,hash:sim.hash()});
}
const sha=s=>createHash('sha256').update(s).digest('hex');
const sourceFiles=['src/core/tech/generator.ts','src/core/emergence/offerEngine.ts','src/core/tech/earlyTactics.ts','src/core/sim/RunSimulation.ts','src/core/seed/versions.ts'];
const result={classification:'STAGED_ELIGIBILITY_AND_EFFECT_CHOICES_PLUS_UNCHANGED60S_SYNTHETIC_POLICY_NOT_HUMAN_FUN',baseline:'18ec2b51b2af5ee90231a9eb7235ba7d6fd56d2f',versions:[3,27,3],childLaw:18,sourceSha256LF:Object.fromEntries(sourceFiles.map(f=>[f,sha(readFileSync(f,'utf8').replace(/\r\n/g,'\n'))])),before:{cases:before.rows.length,eligibleBehavior:before.rows.filter(r=>r.eligibleBehavior.length).length,offeredBehavior:before.rows.filter(r=>r.offered.some(o=>o.effects?.some(k=>['projectileAdd','chainAdd','mineAdd','orbitAdd','summonAdd','auraAdd','beamAdd','relayAdd','weaponEvolve'].includes(k)))).length},after:{cases:rows.length,eligibleBehavior:rows.filter(r=>r.eligibleBehavior.length).length,offeredBehavior:rows.filter(r=>r.offered.some(o=>o.baseBehavior)).length,firstBehaviorIds:[...new Set(rows.map(r=>r.selected))]},rows,smoke,limitations:['100 knowledge is staged solely to inspect the first draft; no natural-time claim.','60s smoke reuses the historical balanced policy without alteration; null means the event was not observed by the cap.','No human enjoyment rating; no before/after timing comparison with a different-duration protocol.']};
writeFileSync('scratch/v51-early-audit.json',JSON.stringify(result,null,2));
console.log(JSON.stringify({before:result.before,after:result.after,smoke}));
