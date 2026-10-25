// V3.7 diagnostic-only pass isolation on the frozen 500/800 fixture at native 1080p.
// Hides one display-list depth band from the camera per window; omissions never ship.
import {chromium} from '@playwright/test';
import {preview} from 'vite';
import {mkdirSync,writeFileSync} from 'node:fs';
import {dirname} from 'node:path';
import {readPreviewBuild} from './read-preview-build.mjs';
const [dir='scratch/v37-pr26-dist',out='test-results/v37-layer-isolation.json',width='1920',height='1080']=process.argv.slice(2);
const pct=(v,p)=>{v=[...v].sort((a,b)=>a-b);return v.length?v[Math.min(v.length-1,Math.floor(v.length*p))]:null;};
const stats=v=>({samples:v.length,p50:pct(v,.5),p95:pct(v,.95)});
const report={classification:'DIAGNOSTIC_LAYER_ISOLATION_NOT_PHYSICAL_GATE',viewport:[+width,+height],modes:{},errors:[],complete:false};
const save=()=>{mkdirSync(dirname(out),{recursive:true});writeFileSync(out,JSON.stringify(report,null,2));};
const browser=await chromium.launch({headless:true,...(process.platform==='win32'?{args:['--use-gl=angle','--use-angle=d3d11']}:{})});
const server=await preview({build:{outDir:dir},preview:{host:'127.0.0.1',port:4199,strictPort:true}});
try{
 report.source=await readPreviewBuild('http://127.0.0.1:4199');
 report.gpu=(await(await browser.newBrowserCDPSession()).send('SystemInfo.getInfo')).gpu.auxAttributes?.glRenderer;
 for(const graphics of ['normal','contrast']){
  const context=await browser.newContext({viewport:{width:+width,height:+height}}),page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  await page.addInitScript(()=>localStorage.setItem('seed-game-save-v1',JSON.stringify({schema:1,settings:{lang:'en',volume:0,uiScale:1,tutorialCompleted:true},archive:[],history:[],best:{}})));
  await page.goto('http://127.0.0.1:4199/?e2e=1&profile=1');await page.locator('#seed-input').fill('EPOCH-GOLDEN-001');await page.locator('#start-btn').click();
  await page.waitForFunction(()=>window.__seedE2E?.layerIsolation&&window.__seedE2E?.renderDiagnostics);
  await page.evaluate(g=>{const h=window.__seedE2E;h.stageEvolution('hunters',5);h.primeSignature();h.streamingFixture(0,0,true,false,g==='contrast');},graphics);
  if(graphics==='normal')await page.waitForFunction(()=>{const t=window.__seedE2E.canonicalStressState().terrain;return t.mode==='source-fallback'||t.pending===0;},null,{timeout:60000});
  await page.waitForTimeout(2500);
  const census=await page.evaluate(()=>window.__seedE2E.layerCensus());
  const depths=Object.keys(census).map(Number).sort((a,b)=>a-b);
  const windows=[];const hash0=await page.evaluate(()=>window.__seedE2E.canonicalStressState().hash);
  const measure=async(label,min,max)=>{
   const hidden=await page.evaluate(([a,b])=>window.__seedE2E.layerIsolation(a,b),[min,max]);await page.waitForTimeout(800);
   await page.evaluate(()=>{window.__seedE2E.takeUniquePerformanceFrames();window.__seedE2E.resetRenderDiagnostics();});await page.waitForTimeout(2500);
   const r=await page.evaluate(()=>({frames:window.__seedE2E.takeUniquePerformanceFrames(),diag:window.__seedE2E.renderDiagnostics()}));
   windows.push({label,min,max,hidden,render:stats(r.frames.map(f=>f.rendererCpuSubmit)),gpu:stats((r.diag?.gpu??[]).map(g=>g.ms)),frame:stats(r.frames.slice(1).map((f,i)=>f.at-r.frames[i].at))});
   const w=windows.at(-1);console.log(`${graphics} ${label} hidden=${hidden} render p95=${w.render.p95?.toFixed(2)} gpu p50/p95=${w.gpu.p50?.toFixed(2)}/${w.gpu.p95?.toFixed(2)}`);
  };
  await measure('baseline',1e9,1e9);
  for(const d of depths){await measure(`hide-depth-${d}`,d,d);await measure('baseline',1e9,1e9);}
  await measure('hide-all',-1e9,1e9);await measure('baseline',1e9,1e9);
  if(hash0!==await page.evaluate(()=>window.__seedE2E.canonicalStressState().hash))throw Error('Frozen workload changed');
  report.modes[graphics]={census,windows};save();await context.close();
 }
 if(report.errors.length)throw Error(report.errors.join(';'));
 report.complete=true;save();console.log('COMPLETE '+out);
}catch(e){report.errors.push(String(e));save();throw e;}finally{await browser.close();await new Promise(r=>server.httpServer.close(r));}
