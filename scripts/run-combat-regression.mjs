// Offline diagnosis only. parent/candidate observe15 changed-win cases;
// ablation uses96 explicitly staged, fixed-input scenarios, never Human QA.
import {execFileSync} from 'node:child_process';
import {mkdirSync,existsSync,readFileSync,writeFileSync} from 'node:fs';
const mode=process.argv[2]??'candidate';if(!['parent','candidate','ablation'].includes(mode))throw Error('Use parent, candidate or ablation');
const sha='fe04927d0a03f1478cdf4b57bb4aee40a68256dd',base='scratch/combat-parent-fe04927';mkdirSync('scratch',{recursive:true});
if(!existsSync(base+'/.source')||readFileSync(base+'/.source','utf8')!==sha){
 execFileSync('git',['archive','--format=zip','--output=scratch/combat-parent.zip',sha,'--','src/core','src/content','src/i18n']);
 if(process.platform==='win32')execFileSync('python',['-m','zipfile','-e','scratch/combat-parent.zip',base]);else execFileSync('unzip',['-q','-o','scratch/combat-parent.zip','-d',base]);
 writeFileSync(base+'/.source',sha);
}
const prefix=`scratch/combat-${mode}`,module=mode==='candidate'?'../src/core/sim/RunSimulation':'./combat-parent-fe04927/src/core/sim/RunSimulation';
let source=`import {it,expect} from 'vitest';import fs from 'node:fs';import {setImmediate} from 'node:timers/promises';import {RunSimulation} from '${module}';import {combatDiagnostics} from '../scripts/combatDiagnostics';\n`;
if(mode==='ablation')source+=`
import {counterfactual} from '../scripts/combatCounterfactual';
const rows:any[]=[];
it('fixed input ablations',()=>{
for(const variant of ['parent','placement','lock','both'] as const)for(const mount of ['hand','float'] as const)for(const origin of ['hunters','engineers','resonant','sentinels'])for(const scenario of ['overlap','moving','switching']){
 const sim=new RunSimulation({masterSeed:'CONTROLLED-AIM',originId:origin,weaponMount:mount}),s=sim.state;s.spawnT=s.eliteT=s.mineT=999;s.weaponStage.kinetic=s.weaponStage.energy=4;s.build.hp=s.build.maxHp=100000;for(const a of s.squad)a.active=false;
 const e=sim.spawnEnemy('tank',false,false,0,300,[])!;e.speed=0;e.hp=e.maxHp=100000;
 if(scenario==='switching'){e.x=s.px-245.5;e.y=s.py;const second=sim.spawnEnemy('tank',false,false,0,254.5,[])!;second.speed=0;second.hp=second.maxHp=100000;}
 if(variant!=='parent')counterfactual(sim,variant);const read=combatDiagnostics(sim);
 for(let t=0;t<360;t++){if(scenario!=='switching'){e.x=s.px+(scenario==='overlap'?0:Math.cos(t/40)*120);e.y=s.py+(scenario==='overlap'?0:Math.sin(t/40)*120);}sim.step(1/60,{moveX:scenario==='switching'?(Math.floor(t/4)%2?-1:1):0,moveY:0,dashPressed:false});}
 rows.push({variant,mount,origin,scenario,...read()});
}expect(rows).toHaveLength(96);fs.writeFileSync('${prefix}.json',JSON.stringify({classification:'DIAGNOSTIC_ABLATION_NOT_SHIPPABLE_REPLAY_MODEL',rows}));});`;
else source+=`
const reference=JSON.parse(fs.readFileSync('docs/evidence/v36-recovery/reference-pr24-pr25.json','utf8')),rows:any[]=[];
for(const r of reference.rows.filter((r:any)=>r.pr24.won!==r.pr25.won))it(r.origin+' '+r.seed+' '+r.mode,async()=>{
 const sim=new RunSimulation({masterSeed:r.seed,originId:r.origin}),read=combatDiagnostics(sim);
 const {naturalBossEvidence}=await import('../scripts/naturalBossEvidence');const outcome=naturalBossEvidence(sim as any,r.mode);
 ${mode==='parent'?'expect(sim.hash()).toBe(r.pr25Hash);':"expect(Number.isFinite(outcome.progression.seconds)).toBe(true);"}
 rows.push({origin:r.origin,seed:r.seed,policy:r.mode,outcome,afterHash:sim.hash(),diagnostics:read()});
 fs.writeFileSync('${prefix}.json',JSON.stringify({classification:'OFFLINE_POLICY_OBSERVATION_NOT_HUMAN',mode:'${mode}',rows}));await setImmediate();
});`;
writeFileSync(prefix+'.test.ts',source);
writeFileSync(prefix+'.config.ts',`import {defineConfig} from 'vitest/config';export default defineConfig({test:{include:['${prefix}.test.ts'],maxWorkers:1,testTimeout:600000}});`);
execFileSync(process.execPath,['node_modules/vitest/vitest.mjs','run','--config',prefix+'.config.ts','--reporter=dot'],{stdio:'inherit'});
