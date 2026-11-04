import {execFileSync} from 'node:child_process';
import {mkdirSync,existsSync,writeFileSync} from 'node:fs';
const base='57df3d1b5e27e31bc10893b5ef61c106eb38bf0d';
mkdirSync('scratch',{recursive:true});mkdirSync('test-results',{recursive:true});
if(!existsSync('scratch/v47-parent/src/core/sim/RunSimulation.ts')){
 execFileSync('git',['archive','--format=zip','--output=scratch/v47-parent.zip',base,'--','src/core','src/content','src/i18n']);
 execFileSync('python',['-m','zipfile','-e','scratch/v47-parent.zip','scratch/v47-parent']);
}
writeFileSync('scratch/v47-comparison.config.ts',`import {defineConfig} from 'vitest/config';export default defineConfig({test:{include:['scratch/v47-comparison.test.ts'],maxWorkers:1}});`);
writeFileSync('scratch/v47-comparison.test.ts',`import {it,expect} from 'vitest';import {writeFileSync} from 'node:fs';import {RunSimulation as Before} from './v47-parent/src/core/sim/RunSimulation';import {RunSimulation as After} from '../src/core/sim/RunSimulation';import {combatSlice} from '../scripts/v47CombatSlice';it('sealed parent/candidate three-build comparison',()=>{const rows=[];for(let i=0;i<3;i++)for(const moving of [false,true])for(const upgraded of [false,true]){const before=combatSlice(Before,i,upgraded,moving),after=combatSlice(After,i,upgraded,moving),replay=combatSlice(After,i,upgraded,moving);expect(after.snapshot).toBe(replay.snapshot);const {snapshot:b,...old}=before,{snapshot:a,...next}=after;rows.push({before:old,after:next,replayEqual:true});}writeFileSync('test-results/v47-combat-comparison.json',JSON.stringify({baseline:'${base}',classification:'STAGED_MECHANICS_NOT_NATURAL_PRESSURE_OR_HUMAN_FUN',rows},null,2));});`);
execFileSync(process.execPath,['node_modules/vitest/vitest.mjs','run','--config','scratch/v47-comparison.config.ts'],{stdio:'inherit'});
