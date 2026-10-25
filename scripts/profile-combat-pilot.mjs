// Short diagnosis, NOT a replacement for physical24 or the existing paired protocol.
import {chromium} from '@playwright/test';
import {preview} from 'vite';
import {mkdirSync,writeFileSync} from 'node:fs';
import {dirname} from 'node:path';
import os from 'node:os';
import {readPreviewBuild} from './read-preview-build.mjs';
const [oldDir='scratch/v35-pr24-dist',parentDir='scratch/v36-pr25-dist',out='test-results/v36-combat-pilot.json']=process.argv.slice(2);
const servers=[],rows=[],errors=[];
const expected={P24:'8edbc5b5afa3c5b4beb66341af8e993fb21aa6fa',P25:'fe04927d0a03f1478cdf4b57bb4aee40a68256dd'};
const pct=v=>{v=[...v].sort((a,b)=>a-b);return {samples:v.length,p50:v[Math.floor(v.length*.5)]??null,p95:v[Math.floor(v.length*.95)]??null};};
const cpu=()=>os.cpus().map(c=>({...c.times}));
const browser=await chromium.launch({headless:true,...(process.platform==='win32'?{args:['--use-gl=angle','--use-angle=d3d11']}: {})});
const save=()=>{mkdirSync(dirname(out),{recursive:true});writeFileSync(out,JSON.stringify({classification:'SHORT_CAUSAL_PILOT_NOT_PHYSICAL_GATE_OR_HUMAN_PLAY',rows,errors,complete:false},null,2));};
try{
 const gpu=(await(await browser.newBrowserCDPSession()).send('SystemInfo.getInfo')).gpu;
 for(const [label,dir,port] of [['P24',oldDir,4196],['P25',parentDir,4197]]){
  const server=await preview({build:{outDir:dir},preview:{host:'127.0.0.1',port,strictPort:true}});servers.push(server);
  const build=await readPreviewBuild(`http://127.0.0.1:${port}`);if(build.sha!==expected[label]||build.dirty)throw Error('Wrong immutable source');
 }
 for(const live of [false,true])for(const graphics of live?['normal']:['normal','contrast'])for(const [order,label] of ['P25','P25','P24','P25','P25','P24'].entries()){
  const context=await browser.newContext({viewport:{width:1920,height:1080}}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>localStorage.setItem('seed-game-save-v1',JSON.stringify({schema:1,settings:{lang:'en',volume:0,uiScale:1,tutorialCompleted:true},archive:[],history:[],best:{}})));
  const url=`http://127.0.0.1:${label==='P24'?4196:4197}/?e2e=1`;
  await page.goto(url);await page.locator('#seed-input').fill('EPOCH-GOLDEN-001');await page.locator('#start-btn').click();await page.waitForFunction(()=>window.__seedE2E?.canonicalStressStart);
  await page.evaluate(({live,graphics})=>{const h=window.__seedE2E;h.stageEvolution('hunters',5);h.primeSignature();h.streamingFixture(0,0,!live,false,graphics==='contrast');if(live)h.canonicalStressStart(false);},{live,graphics});
  if(graphics==='normal')await page.waitForFunction(()=>{const t=window.__seedE2E.canonicalStressState().terrain;return t.mode==='source-fallback'||t.pending===0;},null,{timeout:60000});
  await page.waitForTimeout(live?3000:2000);
  const start=await page.evaluate(()=>{window.__seedE2E.takeUniquePerformanceFrames();return window.__seedE2E.canonicalStressState();});const begin=cpu();
  await page.waitForTimeout(live?8000:3000);const end=cpu();
  const result=await page.evaluate(()=>({frames:window.__seedE2E.takeUniquePerformanceFrames(),state:window.__seedE2E.canonicalStressState(),visibility:document.visibilityState}));
  if(!live&&(start.hash!==result.state.hash||result.state.enemies!==500||result.state.projectiles!==800))throw Error('Frozen workload changed');
  rows.push({label,order,live,graphics,source:expected[label],gpu:gpu.auxAttributes?.glRenderer,browser:browser.version(),start,end:result.state,foreground:result.visibility,
   render:pct(result.frames.map(f=>f.rendererCpuSubmit)),sim:pct(result.frames.flatMap(f=>f.sim)),cpuBusy:begin.map((b,i)=>{const total=Object.keys(b).reduce((n,k)=>n+end[i][k]-b[k],0);return total?1-(end[i].idle-b.idle)/total:null;})});save();await context.close();
 }
 for(const graphics of ['normal','contrast']){
  const page=await browser.newPage({viewport:{width:1920,height:1080}});await page.goto('http://127.0.0.1:4197/?e2e=1&profile=1');
  await page.locator('#seed-input').fill('EPOCH-GOLDEN-001');await page.locator('#start-btn').click();await page.waitForFunction(()=>window.__seedE2E?.renderDiagnostics);
  await page.evaluate(g=>{const h=window.__seedE2E;h.stageEvolution('hunters',5);h.primeSignature();h.streamingFixture(0,0,true,false,g==='contrast');},graphics);
  await page.waitForTimeout(3000);await page.evaluate(()=>window.__seedE2E.resetRenderDiagnostics());await page.waitForTimeout(3000);
  const diagnostic=await page.evaluate(()=>window.__seedE2E.renderDiagnostics());rows.push({label:'P25-INSTRUMENTED',graphics,diagnostic});save();await page.close();
 }
 if(errors.length)throw Error(errors.join(';'));
 const report=JSON.parse((await import('node:fs')).readFileSync(out,'utf8'));report.complete=true;report.limits='Same host/browser/backend/viewport/seed and warm500/800 frozen fixture. A/A controls and P24/P25 ABBA are short pilots, not formal confidence or physical24. Live entity retirement and actual inputs diverge across canonical versions; no historical snapshot equality is required. Instrumented inclusive spans are separate and not additive. All windows/errors retained; external host load/thermals uncontrolled.';
 writeFileSync(out,JSON.stringify(report,null,2));console.log('COMPLETE '+out);
}catch(e){errors.push(String(e));save();throw e;}finally{await browser.close();for(const s of servers)await new Promise(r=>s.httpServer.close(r));}
