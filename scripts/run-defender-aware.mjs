import {execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
const sourceSha=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const sourceDirty=!!execFileSync('git',['status','--porcelain','--untracked-files=no'],{encoding:'utf8'}).trim();
mkdirSync('scratch',{recursive:true});mkdirSync('test-results',{recursive:true});
writeFileSync('scratch/defender.vitest.config.ts',`import {defineConfig} from 'vitest/config';export default defineConfig({test:{include:['scratch/defender.test.ts'],testTimeout:process.platform==='win32'?600000:180000,maxWorkers:1}});`);
writeFileSync('scratch/defender.test.ts',`
import {it,expect} from 'vitest';import {writeFileSync} from 'node:fs';import {setImmediate} from 'node:timers/promises';
import {RunSimulation} from '../src/core/sim/RunSimulation';import {defenderAwarePolicy} from '../scripts/defenderAwarePolicy';
const rows:any[]=[];
for(const origin of ['hunters','engineers','resonant','sentinels'])for(const seed of ['EPOCH-GOLDEN-001','EPOCH-GOLDEN-002','EPOCH-STRESS-001'])for(const mode of ['balanced','damage','survival'] as const)it(origin+' '+seed+' '+mode,async()=>{
 const observe=(sim:RunSimulation)=>{let spawn:number|null=null,end:number|null=null,wins=0,phase2At:number|null=null;const run=defenderAwarePolicy(sim,1200,{mode,onStep:(sim,events)=>{const s=sim.state;if(spawn===null&&s.enemies.some(e=>e.active&&e.boss))spawn=s.runElapsed;if(phase2At===null&&events.some(e=>e.type==='boss_phase_changed'))phase2At=s.runElapsed;if(events.some(e=>e.type==='boss_killed')){wins++;end=s.runElapsed;return true;}return false;}});return {run,spawn,wins,duration:spawn===null?null:(end??sim.state.runElapsed)-spawn,phase2At,phase2Duration:phase2At===null?0:(end??sim.state.runElapsed)-phase2At,playerDead:sim.state.over,hash:sim.hash()};};
 const sim=new RunSimulation({masterSeed:seed,originId:origin});const result=observe(sim);await setImmediate();const replay=new RunSimulation({masterSeed:seed,originId:origin});const repeated=observe(replay);expect(replay.snapshot()).toBe(sim.snapshot());
 rows.push({origin,seed,mode,...result,replayEqual:result.hash===repeated.hash});writeFileSync('test-results/v44-defender-aware.json',JSON.stringify({sourceSha:'${sourceSha}',sourceDirty:${sourceDirty},classification:'SEPARATE_DEFENDER_AWARE_POLICY_NOT_HUMAN_ACCEPTANCE',protocol:'4 Origins x3 seeds x3 priorities;1200s; actual inputs/drafts/claims; no grants; historical policy unchanged and reported independently; every non-win retained',rows},null,2));await setImmediate();
});`);
execFileSync(process.execPath,['node_modules/vitest/vitest.mjs','run','--config','scratch/defender.vitest.config.ts','--reporter=verbose'],{stdio:'inherit'});
