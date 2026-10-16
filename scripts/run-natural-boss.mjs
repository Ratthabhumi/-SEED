import {execFileSync} from 'node:child_process';
import {mkdirSync,existsSync,writeFileSync,readFileSync} from 'node:fs';
const sha='b909802d5fa18e5bbef11ce7ff5ae38a30b1bb37';
const sourceSha=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),sourceDirty=!!execFileSync('git',['status','--porcelain','--untracked-files=no'],{encoding:'utf8'}).trim();
try{execFileSync('git',['cat-file','-e',sha],{stdio:'pipe'});}catch{execFileSync('git',['fetch','origin',sha],{stdio:'inherit'});}
mkdirSync('scratch',{recursive:true});mkdirSync('test-results',{recursive:true});
if(!existsSync('scratch/boss-baseline-b909/src/core/sim/RunSimulation.ts')){
 execFileSync('git',['archive','--format=zip','--output=scratch/boss-baseline-b909.zip',sha,'--','src/core','src/content','src/i18n']);
 if(process.platform==='win32')execFileSync('python',['-m','zipfile','-e','scratch/boss-baseline-b909.zip','scratch/boss-baseline-b909']);
 else execFileSync('unzip',['-q','scratch/boss-baseline-b909.zip','-d','scratch/boss-baseline-b909']);
}
writeFileSync('scratch/natural-boss.vitest.config.ts',`import {defineConfig} from 'vitest/config';export default defineConfig({test:{include:['scratch/natural-boss.test.ts'],testTimeout:180000,maxWorkers:1}});`);
writeFileSync('scratch/natural-boss.test.ts',`
import {it,expect} from 'vitest';import fs from 'node:fs';import {setImmediate} from 'node:timers/promises';
import {RunSimulation as Before} from './boss-baseline-b909/src/core/sim/RunSimulation';
import {RunSimulation as After} from '../src/core/sim/RunSimulation';import {naturalBossEvidence} from '../scripts/naturalBossEvidence';
const rows:any[]=[];
for(const origin of ['hunters','engineers','resonant','sentinels'])for(const seed of ['EPOCH-GOLDEN-001','EPOCH-GOLDEN-002','EPOCH-STRESS-001'])for(const mode of ['balanced','damage','survival'] as const)it(origin+' '+seed+' '+mode,async()=>{
 const beforeSim=new Before({masterSeed:seed,originId:origin}),afterSim=new After({masterSeed:seed,originId:origin});
 const before=naturalBossEvidence(beforeSim as any,mode);await setImmediate();
 const after=naturalBossEvidence(afterSim,mode);
 expect(afterSim.snapshot()).toBe(beforeSim.snapshot());
 expect(Number.isFinite(after.progression.seconds)).toBe(true);
 rows.push({origin,seed,mode,before,after,canonicalSnapshotEqual:true});fs.writeFileSync('test-results/content153-natural-boss.json',JSON.stringify({baselineSha:'${sha}',sourceSha:'${sourceSha}',sourceDirty:${sourceDirty},classification:'FULL_CANONICAL_PROGRESSION_POLICIES_NOT_HUMAN_PLAY',protocol:'All4 Origins x3 seeds x3 fixed draft priorities;1200s cap, same responsive route controller, no grants/HP edits/phase forcing. Every unreachable/defeat/phase-skipped outcome retained. Exact final snapshots must match PR15; source labels are descriptive only. Finite execution is engineering verification, NOT boss-quality acceptance.',rows},null,2));await setImmediate();
});`);
execFileSync(process.execPath,['node_modules/vitest/vitest.mjs','run','--config','scratch/natural-boss.vitest.config.ts','--reporter=verbose'],{stdio:'inherit'});
const report=JSON.parse(readFileSync('test-results/content153-natural-boss.json','utf8'));
console.log('NATURAL_BOSS_OUTCOMES '+JSON.stringify(report.rows.map(r=>({origin:r.origin,seed:r.seed,mode:r.mode,before:{spawn:r.before.spawn,killed:r.before.killed,phase2:r.before.phase2,phase2Attacks:r.before.phase2Attacks,duration:r.before.duration,dps:r.before.dps},after:{spawn:r.after.spawn,killed:r.after.killed,phase2:r.after.phase2,phase2Attacks:r.after.phase2Attacks,duration:r.after.duration,dps:r.after.dps}}))));
