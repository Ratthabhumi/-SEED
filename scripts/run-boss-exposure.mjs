// Existing Vitest/headless simulation workflow, one exact archived parent.
import {execFileSync} from 'node:child_process';
import {mkdirSync,existsSync,writeFileSync} from 'node:fs';
const sha='ce63df35d52e8b3041d232f5e8e3438c087cecf8';
mkdirSync('scratch',{recursive:true});mkdirSync('test-results',{recursive:true});
if(!existsSync('scratch/boss-baseline-ce63/src/core/sim/RunSimulation.ts')){
 execFileSync('git',['archive','--format=zip','--output=scratch/boss-baseline-ce63.zip',sha,'--','src/core','src/content','src/i18n']);
 if(process.platform==='win32')execFileSync('python',['-m','zipfile','-e','scratch/boss-baseline-ce63.zip','scratch/boss-baseline-ce63']);
 else execFileSync('unzip',['-q','scratch/boss-baseline-ce63.zip','-d','scratch/boss-baseline-ce63']);
}
writeFileSync('scratch/boss-exposure.vitest.config.ts',`import {defineConfig} from 'vitest/config';export default defineConfig({test:{include:['scratch/boss-exposure.test.ts'],testTimeout:180000,maxWorkers:1}});`);
writeFileSync('scratch/boss-exposure.test.ts',`
import {it,expect} from 'vitest';import fs from 'node:fs';import {setImmediate} from 'node:timers/promises';
import {RunSimulation as Before} from './boss-baseline-ce63/src/core/sim/RunSimulation';
import {RunSimulation as After} from '../src/core/sim/RunSimulation';import {bossExposure} from '../scripts/bossExposure';
const rows:any[]=[];
for(const origin of ['hunters','engineers','resonant','sentinels'])for(const seed of ['EPOCH-GOLDEN-001','EPOCH-GOLDEN-002','EPOCH-STRESS-001'])for(const tier of [3,4,5])it(origin+' '+seed+' '+tier,async()=>{
 const before=await bossExposure(new Before({masterSeed:seed,originId:origin}) as any,tier),after=await bossExposure(new After({masterSeed:seed,originId:origin}),tier);
 expect(after.initialHp).toBe(before.initialHp);expect(after.duration).toBeGreaterThan(0);
 rows.push({origin,seed,tier,before,after});fs.writeFileSync('test-results/content153-boss-exposure.json',JSON.stringify({baselineSha:'${sha}',classification:'STAGED_CANONICAL_ARENA_NATURAL_DAMAGE_AND_PHASES',limitations:'Age5/tier fixtures and isolated arena; no HP/damage/phase forcing during encounter. Circular steering, no squad, no natural progression or human enjoyment certificate.',rows},null,2));await setImmediate();
});`);
execFileSync(process.execPath,['node_modules/vitest/vitest.mjs','run','--config','scratch/boss-exposure.vitest.config.ts','--reporter=verbose'],{stdio:'inherit'});
