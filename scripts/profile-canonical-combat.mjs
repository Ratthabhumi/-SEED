// Explicit staged live-simulation stress. No grants/refills during measurement.
// Usage: node scripts/profile-canonical-combat.mjs URL OUTPUT [seconds] [ageIndex]
import {chromium} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
import {dirname} from 'node:path';
import {readPreviewBuild} from './read-preview-build.mjs';
const [url='http://127.0.0.1:4173',output='test-results/browser/canonical-combat.json',seconds='30',age='',graphics='normal',width='1920']=process.argv.slice(2);
if(!['normal','reduced','contrast'].includes(graphics)||!['1280','1920'].includes(width))throw Error('Unsupported graphics/viewport condition');
if(age!==''&&(!Number.isInteger(Number(age))||Number(age)<0||Number(age)>5))throw Error('Age fixture must be0–5');
if(!Number.isFinite(Number(seconds))||Number(seconds)<10||Number(seconds)>1800)throw Error('Seconds must be10–1800');
const browser=await chromium.launch({headless:true,...(process.platform==='win32'?{args:['--use-gl=angle','--use-angle=d3d11']}: {})});
const pct=(values,p)=>{const sorted=[...values].sort((a,b)=>a-b);return sorted[Math.min(sorted.length-1,Math.floor(sorted.length*p/100))]??null;};
try{
 const diagnostic=await browser.newBrowserCDPSession(),gpu=(await diagnostic.send('SystemInfo.getInfo')).gpu.auxAttributes?.glRenderer;
 const page=await browser.newPage({viewport:{width:Number(width),height:width==='1280'?720:1080}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const pageDiagnostic=await page.context().newCDPSession(page);
 await page.addInitScript(()=>localStorage.setItem('seed-game-save-v1',JSON.stringify({schema:1,settings:{lang:'en',tutorialCompleted:true,uiScale:1,volume:0},archive:[],history:[],best:{}})));
 const build=await readPreviewBuild(url),pageUrl=new URL(url);pageUrl.searchParams.set('e2e','1');
 await page.goto(pageUrl.href);await page.locator('#seed-input').fill('EPOCH-GOLDEN-001');await page.locator('#start-btn').click();await page.waitForFunction(()=>window.__seedE2E);
 if(age!=='')await page.evaluate(a=>window.__seedE2E.stageEvolution('hunters',a),Number(age));
 const rows=[];
 for(const mode of ['dense','boss','child','restart']){
  if(mode==='child'){
   await page.evaluate(()=>window.__seedE2E.readyAscend());await page.locator('.hud-ascend button').click();
   await page.locator('#legacy-screen .card').first().click();await page.locator('#origin-screen .card').first().click();await page.locator('#child-intro-screen button').click();
  }
  if(mode==='restart'){
   await page.locator('.hud').evaluate(hud=>hud.dataset.stressBeforeRestart='true');
   await page.keyboard.press('Escape');await page.locator('#pause-restart-btn').click();await page.waitForFunction(()=>window.__seedE2E?.canonicalStressStart);
   await page.waitForFunction(()=>!document.querySelector('.hud[data-stress-before-restart="true"]')&&document.querySelector('.hud'));
  }
  await page.evaluate(graphics=>{const h=window.__seedE2E;const p=JSON.parse(h.snapshot()).p;h.streamingFixture(p[0],p[1],false,graphics==='reduced',graphics==='contrast');},graphics);
  const start=await page.evaluate(b=>window.__seedE2E.canonicalStressStart(b),mode==='boss');
  await page.evaluate(()=>{window.__stressFrames=[];let last=0;const sample=t=>{if(last&&window.__stressFrames.length<110000)window.__stressFrames.push(t-last);last=t;window.__stressRaf=requestAnimationFrame(sample);};window.__stressRaf=requestAnimationFrame(sample);});
  await page.evaluate(()=>window.__seedE2E.takeUniquePerformanceFrames());
  const uniqueFrames=[],samples=[],states=[],begin=Date.now(),duration=mode==='dense'?Math.max(10,Number(seconds)):20;
  while(Date.now()-begin<duration*1000){
   await page.waitForTimeout(1000);
   const observation=await page.evaluate(()=>({state:window.__seedE2E.canonicalStressState(),samples:window.__seedE2E.performanceSamples(),unique:window.__seedE2E.takeUniquePerformanceFrames()}));
   uniqueFrames.push(...observation.unique);states.push(observation.state);samples.push(observation.samples);
   if(states.length%30===0)observation.state.heap=await pageDiagnostic.send('Runtime.getHeapUsage');
   if(observation.state.draft||observation.state.paused)throw Error('Canonical stress stopped stepping');
   if(states.length>1&&observation.state.elapsed<=states[states.length-2].elapsed)throw Error('Canonical clock no longer advances');
  }
  const frames=await page.evaluate(()=>{cancelAnimationFrame(window.__stressRaf);return window.__stressFrames;});
  let prefixElapsed=0;const prefixFrames=frames.filter(ms=>{prefixElapsed+=ms;return prefixElapsed<=30000;});
  const prefix30={};for(const metric of ['frame','sim','rendererCpuSubmit']){const values=metric==='frame'?prefixFrames:samples.slice(0,30).flatMap(s=>s[metric]);prefix30[metric]={p50:pct(values,50),p95:pct(values,95),p99:pct(values,99),worst:values.reduce((max,value)=>Math.max(max,value),0)};}
  const summary={};for(const metric of ['frame','sim','rendererCpuSubmit']){const values=metric==='frame'?frames:samples.flatMap(s=>s[metric]);summary[metric]={p50:pct(values,50),p95:pct(values,95),p99:pct(values,99),worst:values.reduce((max,value)=>Math.max(max,value),0)};}
  const uniqueSummary={};for(const metric of ["rendererCpuSubmit","sim"]){const values=metric==="sim"?uniqueFrames.flatMap(f=>f.sim):uniqueFrames.map(f=>f.rendererCpuSubmit);uniqueSummary[metric]={samples:values.length,p50:pct(values,50),p95:pct(values,95),p99:pct(values,99)};}
  rows.push({uniqueFrames,uniqueSummary,mode,start,durationMs:Date.now()-begin,summary,prefix30,uniqueFrameSamples:frames.length,states,limitations:'Frame percentiles use unique RAF intervals; sim/render rolling240 samples observed each second overlap. Initial800 projectiles retire normally; count is NOT sustained at800. HighHP/zero-damage500-enemy fixture is not a natural or human run.'});
  await page.screenshot({path:output.replace('.json',`-${mode}.png`)});
 }
 mkdirSync(dirname(output),{recursive:true});writeFileSync(output,JSON.stringify({build,browser:browser.version(),url:pageUrl.href,gpu,graphics,viewport:{width:Number(width),height:width==='1280'?720:1080},fixture:true,ageFixture:age===''?null:Number(age),rows,errors,classification:'STAGED_LIVE_CANONICAL_STRESS',limitations:'Actual fixed-step simulation plus renderer. Optional age fixture stages existing roster/tier hooks, not natural progression. No human enjoyment/visual verdict, natural encounter hit-rate or sustained500/800 certification follows.'},null,2));
 if(errors.length)throw Error(errors.join('; '));console.log('Recorded live canonical dense/boss/child/restart stress');
}finally{await browser.close();}
