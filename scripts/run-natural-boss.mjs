import {execFileSync} from 'node:child_process';
import {mkdirSync,existsSync,writeFileSync,readFileSync} from 'node:fs';
const sha='ce63df35d52e8b3041d232f5e8e3438c087cecf8';
try{execFileSync('git',['cat-file','-e',sha],{stdio:'pipe'});}catch{execFileSync('git',['fetch','origin',sha],{stdio:'inherit'});}
mkdirSync('scratch',{recursive:true});mkdirSync('test-results',{recursive:true});
if(!existsSync('scratch/boss-baseline-ce63/src/core/sim/RunSimulation.ts')){
 execFileSync('git',['archive','--format=zip','--output=scratch/boss-baseline-ce63.zip',sha,'--','src/core','src/content','src/i18n']);
 if(process.platform==='win32')execFileSync('python',['-m','zipfile','-e','scratch/boss-baseline-ce63.zip','scratch/boss-baseline-ce63']);
 else execFileSync('unzip',['-q','scratch/boss-baseline-ce63.zip','-d','scratch/boss-baseline-ce63']);
}
writeFileSync('scratch/natural-boss.vitest.config.ts',`import {defineConfig} from 'vitest/config';export default defineConfig({test:{include:['scratch/natural-boss.test.ts'],testTimeout:180000,maxWorkers:1}});`);
writeFileSync('scratch/natural-boss.test.ts',`
import {it,expect} from 'vitest';import fs from 'node:fs';import {setImmediate} from 'node:timers/promises';
import {RunSimulation as Before} from './boss-baseline-ce63/src/core/sim/RunSimulation';
import {RunSimulation as After} from '../src/core/sim/RunSimulation';import {naturalBossEvidence} from '../scripts/naturalBossEvidence';
const rows:any[]=[];
for(const origin of ['hunters','engineers','resonant','sentinels'])for(const seed of ['EPOCH-GOLDEN-001','EPOCH-GOLDEN-002','EPOCH-STRESS-001'])for(const mode of ['balanced','damage','survival'] as const)it(origin+' '+seed+' '+mode,async()=>{
 const before=naturalBossEvidence(new Before({masterSeed:seed,originId:origin}) as any,mode);await setImmediate();
 const after=naturalBossEvidence(new After({masterSeed:seed,originId:origin}),mode);
 expect(Number.isFinite(after.progression.seconds)).toBe(true);
 rows.push({origin,seed,mode,before,after});fs.writeFileSync('test-results/content153-natural-boss.json',JSON.stringify({baselineSha:'${sha}',classification:'FULL_CANONICAL_PROGRESSION_POLICIES_NOT_HUMAN_PLAY',protocol:'All4 Origins x3 seeds x3 fixed draft priorities;1200s cap, same responsive route controller, no grants/HP edits/phase forcing. Every unreachable/defeat/phase-skipped outcome retained. Finite execution is engineering verification, NOT boss-quality acceptance.',rows},null,2));await setImmediate();
});`);
execFileSync(process.execPath,['node_modules/vitest/vitest.mjs','run','--config','scratch/natural-boss.vitest.config.ts','--reporter=verbose'],{stdio:'inherit'});
const report=JSON.parse(readFileSync('test-results/content153-natural-boss.json','utf8'));
console.log('NATURAL_BOSS_OUTCOMES '+JSON.stringify(report.rows.map(r=>({origin:r.origin,seed:r.seed,mode:r.mode,before:{spawn:r.before.spawn,killed:r.before.killed,phase2:r.before.phase2,phase2Attacks:r.before.phase2Attacks,duration:r.before.duration,dps:r.before.dps},after:{spawn:r.after.spawn,killed:r.after.killed,phase2:r.after.phase2,phase2Attacks:r.after.phase2Attacks,duration:r.after.duration,dps:r.after.dps}}))));
