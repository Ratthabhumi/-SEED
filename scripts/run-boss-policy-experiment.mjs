// Experimental controller evidence, explicitly separate from original Natural36.
import {execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
mkdirSync('scratch',{recursive:true});mkdirSync('test-results',{recursive:true});
const sourceSha=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const dirty=!!execFileSync('git',['status','--porcelain','--untracked-files=no'],{encoding:'utf8'}).trim();
writeFileSync('scratch/boss-policy-experiment.config.ts',`import {defineConfig} from 'vitest/config';export default defineConfig({test:{include:['scratch/boss-policy-experiment.test.ts'],testTimeout:300000,maxWorkers:1}});`);
writeFileSync('scratch/boss-policy-experiment.test.ts',`
import {setImmediate} from 'node:timers/promises';import {it,expect} from 'vitest';import fs from 'node:fs';import {createHash} from 'node:crypto';
import {RunSimulation} from '../src/core/sim/RunSimulation';import {naturalBossEvidence} from '../scripts/naturalBossEvidence';
import {bossPolicyEvaluation} from '../scripts/bossWarningPolicy';
const rows:any[]=[];const entry=new Map<string,string>();
for(const [origin,seed,mode] of [['engineers','EPOCH-STRESS-001','survival'],['engineers','EPOCH-GOLDEN-001','survival'],['sentinels','EPOCH-GOLDEN-001','survival'],['hunters','EPOCH-GOLDEN-002','damage']] as const)
 for(const delay of [null,.15,.3,.45])it(origin+' '+seed+' '+mode+' '+delay,async()=>{
 await setImmediate();
 const sim=new RunSimulation({masterSeed:seed,originId:origin}),probe=bossPolicyEvaluation(sim,delay),outcome=naturalBossEvidence(probe.simulation,mode);
 const key=origin+seed+mode;if(delay===null)entry.set(key,probe.report.entrySnapshot);
 expect(probe.report.entrySnapshot).toBe(entry.get(key));
 const {entrySnapshot,...report}=probe.report;
 rows.push({origin,seed,mode,delay,entrySnapshotEqual:true,entrySnapshotSha256:createHash('sha256').update(entrySnapshot).digest('hex'),report,outcome});
 fs.writeFileSync('test-results/content18-boss-policy-experiment.json',JSON.stringify({sourceSha:'${sourceSha}',sourceDirty:${dirty},classification:'EXPERIMENTAL_VISIBLE_WARNING_POLICY_NOT_HUMAN_FAIRNESS',protocol:'Original progressionPolicy untouched. Four adverse/burst cases x baseline/null and150/300/450ms delay. Entry snapshots exactly equal. InputFrame interception only, no HP/stat/timing/phase edits. Player-centered1280x720/1.25 visibility approximation, not exact native camera. Baseline decisions resume outside observed area. No claims about human reflexes or all36 experimental outcomes.',rows},null,2));await setImmediate();
 });`);
execFileSync(process.execPath,['node_modules/vitest/vitest.mjs','run','--config','scratch/boss-policy-experiment.config.ts','--reporter=verbose'],{stdio:'inherit'});
