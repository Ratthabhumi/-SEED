// Small A/A control BEFORE another optimization/full benchmark.
// node scripts/profile-matched-control.mjs URL OUTPUT [profile=0]
import {chromium} from '@playwright/test';
import {readPreviewBuild} from './read-preview-build.mjs';
import {writeFileSync,mkdirSync} from 'node:fs';import {dirname} from 'node:path';
import os from 'node:os';import {execFileSync} from 'node:child_process';
const [url='http://127.0.0.1:4184',out='test-results/matched-control.json',profile='0']=process.argv.slice(2);
const build=await readPreviewBuild(url);if(build.dirty)throw Error('A clean immutable compiled build is required');
const cpu=()=>os.cpus().map(c=>({...c.times}));
const pct=(v,p)=>{v=[...v].sort((a,b)=>a-b);return v[Math.min(v.length-1,Math.floor(v.length*p))]??null;};
const summary=v=>({samples:v.length,p50:pct(v,.5),p95:pct(v,.95),p99:pct(v,.99)});
const browser=await chromium.launch({headless:true,...(process.platform==='win32'?{args:['--use-gl=angle','--use-angle=d3d11']}: {})});
const rows=[],errors=[];const env={at:new Date().toISOString(),platform:process.platform,cpu:os.cpus()[0]?.model,logicalCpus:os.cpus().length,freeMemory:os.freemem(),power:process.platform==='win32'?execFileSync('powercfg',['/getactivescheme'],{encoding:'utf8'}).trim():'not captured'};
try{
 const client=await browser.newBrowserCDPSession(),info=await client.send('SystemInfo.getInfo');env.gpu=info.gpu;env.browser=browser.version();
 for(const graphics of ['normal','contrast']){
  const page=await browser.newPage({viewport:{width:1920,height:1080}});page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>localStorage.setItem('seed-game-save-v1',JSON.stringify({schema:1,settings:{lang:'en',volume:0,tutorialCompleted:true,uiScale:1},archive:[],history:[],best:{}})));
  const target=new URL(url);target.searchParams.set('e2e','1');if(profile==='1')target.searchParams.set('profile','1');
  await page.goto(target.href);await page.locator('#seed-input').fill('EPOCH-GOLDEN-001');await page.locator('#start-btn').click();await page.waitForFunction(()=>window.__seedE2E?.canonicalStressStart);
  await page.evaluate(graphics=>{const h=window.__seedE2E;h.stageEvolution('hunters',5);h.streamingFixture(0,0,false,false,graphics==='contrast');h.canonicalStressStart(false);},graphics);
  await page.waitForTimeout(5000);await page.evaluate(()=>window.__seedE2E.takeUniquePerformanceFrames());await page.waitForTimeout(10000);
  const live=await page.evaluate(()=>({frames:window.__seedE2E.takeUniquePerformanceFrames(),state:window.__seedE2E.canonicalStressState()}));
  await page.keyboard.press('Escape');const frozen=await page.evaluate(()=>window.__seedE2E.canonicalStressState());if(!frozen.paused)throw Error('Not frozen');
  const controls=[];
  for(const label of ['A','B','B','A','B','A','A','B']){
   await page.evaluate(()=>{window.__seedE2E.takeUniquePerformanceFrames();window.__seedE2E.resetRenderDiagnostics?.();});const begin=cpu();
   await page.evaluate(()=>{window.__aaIntervals=[];let last;const f=t=>{if(last)window.__aaIntervals.push(t-last);last=t;window.__aaRaf=requestAnimationFrame(f);};window.__aaRaf=requestAnimationFrame(f);});
   await page.waitForTimeout(3000);const end=cpu();
   const x=await page.evaluate(()=>{cancelAnimationFrame(window.__aaRaf);return {frames:window.__seedE2E.takeUniquePerformanceFrames(),intervals:window.__aaIntervals,state:window.__seedE2E.canonicalStressState(),diagnostics:window.__seedE2E.renderDiagnostics?.(),visibility:document.visibilityState};});
   if(x.state.hash!==frozen.hash)throw Error('Control state changed');
   const busy=begin.map((b,i)=>{const total=Object.keys(b).reduce((n,k)=>n+end[i][k]-b[k],0);return total?1-(end[i].idle-b.idle)/total:null;});
   controls.push({label,hash:x.state.hash,foreground:x.visibility,renderer:summary(x.frames.map(f=>f.rendererCpuSubmit)),raf:summary(x.intervals),cpuBusyFraction:busy,diagnostics:profile==='1'?x.diagnostics:undefined});
  }
  rows.push({graphics,frozen,live:{state:live.state,renderer:summary(live.frames.map(f=>f.rendererCpuSubmit)),sim:summary(live.frames.flatMap(f=>f.sim))},controls});await page.close();
 }
 const final=await readPreviewBuild(url);if(JSON.stringify(final)!==JSON.stringify(build))throw Error('Served build changed');if(errors.length)throw Error(errors.join(';'));
 mkdirSync(dirname(out),{recursive:true});writeFileSync(out,JSON.stringify({classification:'IDENTICAL_CODE_MATCHED_FROZEN_AA_CONTROL_NOT_OPTIMIZATION_AB_OR_BUDGET_PASS',build,env,instrumented:profile==='1',rows,errors,limits:'Labels do not switch code. Same paused state within each condition; independent live prefix. CPU busy includes this browser and other work, not a process-specific cause. No OS cache eviction, no power/thermal control or universal regression attribution. GPU timing only in separately opt-in instrumented runs.'},null,2));console.log('MATCHED_AA_CONTROL_COMPLETE');
}finally{await browser.close();}
