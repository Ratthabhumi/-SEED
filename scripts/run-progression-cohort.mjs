import {execFileSync} from "node:child_process";
import {mkdirSync,writeFileSync,existsSync} from "node:fs";
import path from "node:path";
const root=process.cwd(),baseline="2222002b84928fff38dedad9689bfbcd0b67edae";
mkdirSync(path.join(root,"scratch"),{recursive:true});
mkdirSync(path.join(root,"test-results"),{recursive:true});
try{execFileSync("git",["cat-file","-e",baseline],{stdio:"pipe"});}
catch{execFileSync("git",["fetch","origin",baseline],{stdio:"inherit"});}
const zip=path.join(root,"scratch/progression-baseline-2222002.zip"),directory=path.join(root,"scratch/progression-baseline-2222002");
if(!existsSync(directory)){
  execFileSync("git",["archive","--format=zip",`--output=${zip}`,baseline,"--","src/core","src/content","src/i18n"],{stdio:"inherit"});
  mkdirSync(directory,{recursive:true});
  if(process.platform==="win32")execFileSync("powershell",["-NoProfile","-Command",`Expand-Archive -LiteralPath '${zip.replaceAll("'","''")}' -DestinationPath '${directory.replaceAll("'","''")}' -Force`],{stdio:"inherit"});
  else execFileSync("unzip",["-q",zip,"-d",directory],{stdio:"inherit"});
}
writeFileSync(path.join(root,"scratch/cohort.vitest.config.ts"),`import {defineConfig} from 'vitest/config';export default defineConfig({test:{include:['scratch/integrated-cohort.test.ts'],testTimeout:180000,workers:1,maxWorkers:1}});`);
writeFileSync(path.join(root,"scratch/integrated-cohort.test.ts"),`
import {it,expect} from 'vitest';
import {RunSimulation as Before} from './progression-baseline-2222002/src/core/sim/RunSimulation';
import {RunSimulation as After} from '../src/core/sim/RunSimulation';
import {progressionPolicy} from '../scripts/progressionPolicy';
import fs from 'node:fs';
const results:any[]=[];
for(const origin of ['hunters','engineers','resonant','sentinels'])for(const seed of ['EPOCH-GOLDEN-001','EPOCH-A7F2-K19X'])it(origin+' '+seed,()=>{
  const before=progressionPolicy(new Before({masterSeed:seed,originId:origin}) as unknown as After);
  const after=progressionPolicy(new After({masterSeed:seed,originId:origin}));
  expect(Number.isFinite(after.seconds)).toBe(true);expect(after.logistics).toBeGreaterThanOrEqual(0);
  results.push({origin,seed,before,after});
  fs.writeFileSync('test-results/integrated-progression-cohort.json',JSON.stringify({classification:'SYNTHETIC_CANONICAL_POLICY',baselineSha:'${baseline}',policy:'responsive-route-planner-v2',limitations:'Same cohort/controller, different Content versions. No grants, teleports, god mode or hidden-POI inspection. Adaptive trajectories can differ; not human fun or isolated causal evidence.',results},null,2));
});`);
execFileSync(process.execPath,["node_modules/vitest/vitest.mjs","run","--config","scratch/cohort.vitest.config.ts","--reporter=verbose"],{stdio:"inherit"});
