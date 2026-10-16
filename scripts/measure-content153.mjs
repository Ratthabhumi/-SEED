// Reuse the established five-block profiler, isolated from E2E activity.
import {preview} from 'vite';import {execFileSync,spawn} from 'node:child_process';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';import {createHash} from 'node:crypto';
import {captureWorldComparison} from './capture-content161.mjs';
const [baseline='scratch/content18-baseline-official/seed-web-v0.2.0-dev.0.zip',out='test-results/content153-performance',baselineDist='scratch/content18-baseline-dist']=process.argv.slice(2);mkdirSync(out,{recursive:true});
if(createHash('sha256').update(readFileSync(baseline)).digest('hex')!=='c9d6d19725b51cef8fb7f4c0f6acb46262cfba5d0615b5c39c548514c42047b0')throw Error('PR15 parent official ZIP hash differs from verified receipt');
if(process.platform==='win32')execFileSync(process.env.SEED_PYTHON??'python',['-m','zipfile','-e',baseline,baselineDist]);else execFileSync('unzip',['-q',baseline,'-d',baselineDist]);
const before=await preview({build:{outDir:baselineDist},preview:{host:'127.0.0.1',port:4187,strictPort:true}}),after=await preview({preview:{host:'127.0.0.1',port:4188,strictPort:true}});
const run=args=>new Promise((resolve,reject)=>{const child=spawn(process.execPath,args,{stdio:'inherit'});child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(Error('Profiler exited'+code)));});
try{
 await run(['scripts/profile-paired-renderer.mjs','http://127.0.0.1:4187','http://127.0.0.1:4188',out+'/parent-candidate.json','5']);
 await run(['scripts/profile-paired-renderer.mjs','http://127.0.0.1:4188/?actors=images','http://127.0.0.1:4188',out+'/same-build-actors.json','5']);
 await run(['scripts/profile-canonical-combat.mjs','http://127.0.0.1:4188',out+'/advancing-space.json','60','5']);
 const summaries=[];
 for(const file of ['parent-candidate','same-build-actors']){
  const d=JSON.parse(readFileSync(out+'/'+file+'.json','utf8'));if(!d.complete||d.rows.length!==240||d.errors.length)throw Error('Incomplete paired measurement');
  for(const width of [1280,1920])for(const mode of ['normal','reduced','contrast'])for(const cache of ['cold','warm'])for(const label of ['A','B']){
   const rows=d.rows.filter(r=>r.viewport.width===width&&r.mode===mode&&r.cache===cache&&r.label===label),values=rows.map(r=>r.render.p95).sort((a,b)=>a-b);
   if(rows.length!==10)throw Error('Paired condition requires ten runs per label');
   const waits=rows.map(r=>r.warmWaitMs).sort((a,b)=>a-b);
   summaries.push({experiment:file,width,mode,cache,label,runs:rows.length,medianPerRunP95:(values[4]+values[5])/2,min:values[0],max:values[9],failedStrictRender8ms:values.filter(v=>v>=8).length,minUniqueSamples:Math.min(...rows.map(r=>r.render.samples)),medianWarmWaitMs:(waits[4]+waits[5])/2,maxWarmWaitMs:waits[9],warmPendingMax:Math.max(...rows.map(r=>r.terrain.pending)),maxUploadLifetimeMs:Math.max(...rows.map(r=>r.terrain.uploadMaxMs)),maxSourcePrepMs:rows.every(r=>typeof r.terrain.sourcePrepMs==='number')?Math.max(...rows.map(r=>r.terrain.sourcePrepMs)):null});
  }
 }
 writeFileSync(out+'/summary.json',JSON.stringify({classification:'MEASUREMENT_COMPLETION_NOT_PERFORMANCE_BUDGET_PASS',baselineSha:'b909802d5fa18e5bbef11ce7ff5ae38a30b1bb37',limitations:'CI renderer/device recorded in raw rows; does not certify Intel laptop hardware or natural combat. Fixed paused500/800 workload, strict8ms unchanged. Source preparation/startup retained separately; upload lifetime maxima include startup. Same-build Images comparator isolates ordered actor batching; no added texture cache. Prior ground experiment retained in PR15 evidence.',summaries},null,2));
 await captureWorldComparison('http://127.0.0.1:4187','http://127.0.0.1:4188',out+'/native');
}finally{await Promise.all([before,after].map(s=>new Promise(resolve=>s.httpServer.close(resolve))));}
