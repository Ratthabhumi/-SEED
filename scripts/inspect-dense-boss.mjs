// One bounded dense investigation. No light-Boss rerun, second RAF or refills.
import {chromium} from '@playwright/test';
import {preview} from 'vite';
import {mkdirSync,writeFileSync} from 'node:fs';
import {readPreviewBuild} from './read-preview-build.mjs';
const out=process.argv[2]??'test-results/browser/dense-boss';mkdirSync(out,{recursive:true});
const server=await preview({preview:{host:'127.0.0.1',port:4196,strictPort:true}});
let browser;
const result={classification:'STAGED_DENSE_WARNING_AND_LIVE_DIAGNOSTIC_NOT_HUMAN_OR_STRICT_PHYSICAL_ACCEPTANCE',complete:false,captures:[],windows:[],errors:[],
 limitations:'Warning OFF/ON is a same-build visibility reference, not a bug-fix before/after. Paused shots remain800 for images; live initial800 shots retire naturally without refill. Live fixture has highHP/zero-damage500-enemy harness settings. Two10s windows only; profiling overhead and uncontrolled host included. Sim/CPU use rolling240; observed update buckets do not prove GPU presentation.'};
const save=()=>writeFileSync(out+'/index.json',JSON.stringify(result,null,2));
const percentile=values=>{const s=values.filter(Number.isFinite).sort((a,b)=>a-b);return {samples:s.length,p95:s.length?s[Math.ceil(.95*s.length)-1]:null};};
try{
 result.build=await readPreviewBuild('http://127.0.0.1:4196');if(result.build.dirty)throw Error('Clean compiled source required');
 browser=await chromium.launch({headless:true,...(process.platform==='win32'?{args:['--use-gl=angle','--use-angle=d3d11']}: {})});
 result.browser=browser.version();const cdp=await browser.newBrowserCDPSession();result.renderer=(await cdp.send('SystemInfo.getInfo')).gpu.auxAttributes?.glRenderer;
 for(const [width,height] of [[1280,720],[1920,1080]])for(const lang of ['en','th'])for(const graphics of ['normal','contrast']){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1}),page=await context.newPage();
  page.on('pageerror',e=>{result.errors.push(e.message);save();});
  await page.addInitScript(lang=>localStorage.setItem('seed-game-save-v1',JSON.stringify({schema:1,settings:{lang,tutorialCompleted:true,uiScale:1,volume:0},archive:[],history:[],best:{}})),lang);
  await page.goto('http://127.0.0.1:4196/?e2e&profile=1');await page.locator('#seed-input').fill('EPOCH-GOLDEN-001');await page.locator('#start-btn').click();
  await page.waitForFunction(()=>!!window.__seedE2E?.frameIntervalEvidence&&document.fonts.status==='loaded');
  const layout=await page.evaluate(({graphics})=>{
   const h=window.__seedE2E;h.stageEvolution('hunters',5);h.streamingFixture(0,0,false,false,graphics==='contrast');
   const initial=h.canonicalStressStart(true);h.streamingMove(0,0);h.offscreenWarningFixture(true,'source-off',1);
   const c=document.querySelector('canvas'),r=c.getBoundingClientRect();
   return {initial,canvasCss:[r.width,r.height],backing:[c.width,c.height],dpr:devicePixelRatio,refreshHz:'NOT_OBSERVABLE_IN_BROWSER'};
  },{graphics});
  if(layout.initial.enemies!==501||layout.initial.projectiles!==800)throw Error('Dense warning fixture density mismatch');
  if(layout.dpr!==1||layout.canvasCss[0]!==width||layout.canvasCss[1]!==height||layout.backing[0]!==width||layout.backing[1]!==height)throw Error('Native viewport mismatch');
  const captures=[];
  for(const warning of [false,true]){
   await page.evaluate(w=>window.__seedE2E.offscreenWarningFixture(w,'source-off',1),warning);
   await page.waitForTimeout(150);
   const file=`${height}-${lang}-${graphics}-${warning?'warning':'reference'}.png`;await page.screenshot({path:out+'/'+file});
   const state=await page.evaluate(()=>{const h=window.__seedE2E;return {state:h.canonicalStressState(),boss:h.bossReviewState().boss,camera:h.cameraGroundReview()};});
   if(state.state.enemies!==501||state.state.projectiles!==800||!state.state.paused)throw Error('Paused reference density changed');
   captures.push({warning,file,...state});
  }
  result.captures.push({width,height,lang,graphics,layout,captures});save();
  // Exactly one live Normal window per viewport. HC/language images are not extra performance runs.
  if(graphics==='normal'&&lang==='en'){
   const start=await page.evaluate(()=>{const h=window.__seedE2E;const s=h.canonicalStressStart(true);h.resetPerformanceSamples();h.resetRenderDiagnostics();return s;});
   const density=[];
   for(let second=1;second<=10;second++){
    await page.waitForTimeout(1000);const state=await page.evaluate(()=>window.__seedE2E.canonicalStressState());
    if(state.paused||state.draft)throw Error('Live simulation paused');
    density.push({second,elapsed:state.elapsed,enemies:state.enemies,projectiles:state.projectiles,phase:state.boss?.phase});
   }
   if(density.at(-1).elapsed<=density[0].elapsed)throw Error('Canonical time stopped');
   const data=await page.evaluate(()=>{const h=window.__seedE2E;return {intervals:h.frameIntervalEvidence(),timing:h.performanceSamples(),gpu:h.renderDiagnostics(),visibility:document.visibilityState};});
   result.windows.push({width,height,graphics,lang,start,density,visibility:data.visibility,intervalEvidence:data.intervals,
    simRolling240:percentile(data.timing.sim),cpuSubmitRolling240:percentile(data.timing.rendererCpuSubmit),
    gpu:{supported:data.gpu.gpuSupported,disjoint:data.gpu.gpuDisjoint,...percentile(data.gpu.gpu.map(g=>g.ms))}});save();
  }
  await context.close();
 }
 if(result.errors.length)throw Error('Browser page errors');result.complete=true;save();console.log('Dense investigation completed:8 warning pairs and2 live windows');
}catch(e){result.errors.push(String(e));save();throw e;}
finally{await browser?.close();await new Promise(r=>server.httpServer.close(r));}
