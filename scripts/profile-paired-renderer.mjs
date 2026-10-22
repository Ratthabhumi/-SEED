// ABBA/BAAB, six graphics/viewport conditions, cold startup vs settled warm.
// Cold means fresh browser context/in-process texture state, NOT OS disk cache.
// node scripts/profile-paired-renderer.mjs A_URL B_URL OUTPUT [blocks=5] [friendly|hostile] [all|contrast1080]
// Selected1080p HC is40 cold/warm rows; default all remains240. Heap samples
// bracket each window and report occupancy, never allocation rate or forced GC.
import {chromium} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
import {dirname} from 'node:path';
import {readPreviewBuild} from './read-preview-build.mjs';
const [a,b,output='test-results/paired-renderer.json',blocks='5',fixture='friendly',conditions='all']=process.argv.slice(2);
if(!a||!b||Number(blocks)<5)throw Error('Provide A/B URLs and at least5 blocks');
if(!['friendly','hostile'].includes(fixture))throw Error('Unknown paused projectile fixture');
if(!['all','contrast1080'].includes(conditions))throw Error('Unknown condition selection');
const builds={A:await readPreviewBuild(a),B:await readPreviewBuild(b)};if(builds.A.dirty||builds.B.dirty)throw Error('Paired protocol requires clean compiled builds');
const percentile=(values,p)=>{const s=[...values].sort((x,y)=>x-y);return s[Math.min(s.length-1,Math.floor(s.length*p/100))]??null;};
const summary=values=>({samples:values.length,p50:percentile(values,50),p95:percentile(values,95),p99:percentile(values,99),worst:Math.max(0,...values)});
const report={classification:'PAIRED_PAUSED_RENDERER_NOT_LIVE_ACCEPTANCE',protocol:'Five blocks alternating ABBA/BAAB; fresh browser process per letter, fresh context per condition. Cold is the initial3s. Warm waits for active terrain work to drain, then1500ms, then a new3s sample. High Contrast does not consume painted terrain, so its paused unused queue is excluded from the drain requirement. Wait duration/pending counts retained; no GPU-readiness or OS-cache eviction claim. Uninstrumented product render boundary; unique retained frames.',rows:[],errors:[],complete:false};
report.builds=builds;report.fixture=fixture;report.conditions=conditions;
mkdirSync(dirname(output),{recursive:true});const save=()=>writeFileSync(output,JSON.stringify(report,null,2));
for(let block=0;block<Number(blocks);block++)for(const [position,label] of [...(block%2?'BAAB':'ABBA')].entries()){
 const browser=await chromium.launch({headless:true,...(process.platform==='win32'?{args:['--use-gl=angle','--use-angle=d3d11']}: {})});
 try{
  const client=await browser.newBrowserCDPSession(),info=await client.send('SystemInfo.getInfo');
  for(const viewport of [{width:1280,height:720},{width:1920,height:1080}])for(const mode of ['normal','reduced','contrast']){
   if(conditions==='contrast1080'&&(viewport.width!==1920||mode!=='contrast'))continue;
   const context=await browser.newContext({viewport}),page=await context.newPage();page.on('pageerror',e=>report.errors.push({block,position,label,message:e.message}));
   const heapSession=await context.newCDPSession(page);
   await page.addInitScript(()=>localStorage.setItem('seed-game-save-v1',JSON.stringify({schema:1,settings:{lang:'en',volume:0,uiScale:1,tutorialCompleted:true},archive:[],best:{},history:[]})));
   const pageUrl=new URL(label==='A'?a:b);pageUrl.searchParams.set('e2e','1');await page.goto(pageUrl.href);await page.locator('#seed-input').fill('EPOCH-GOLDEN-001');await page.locator('#start-btn').click();await page.waitForFunction(()=>window.__seedE2E?.streamingFixture);
   const initial=await page.evaluate(([mode,kind])=>{const h=window.__seedE2E;const result=h.streamingFixture(0,0,true,mode==='reduced',mode==='contrast');if(kind==='hostile')Object.assign(result,h.content153HostileFixture());h.resetPerformanceSamples();return result;},[mode,fixture]);
   let warmWaitMs=0;
   for(const cache of ['cold','warm']){
    if(cache==='warm'){
     const start=Date.now();
     await page.waitForFunction(mode=>{const t=window.__seedE2E.canonicalStressState().terrain;return mode==='contrast'||t.mode==='source-fallback'||t.pending===0;},mode,{timeout:60000});
     await page.waitForTimeout(1500);warmWaitMs=Date.now()-start;
     await page.evaluate(()=>window.__seedE2E.resetPerformanceSamples());
    }
    const heapBefore=await heapSession.send('Runtime.getHeapUsage');
    await page.waitForTimeout(3000);
    const measured=await page.evaluate(()=>({performance:window.__seedE2E.performanceSamples(),state:window.__seedE2E.canonicalStressState(),foreground:document.visibilityState,hash:window.__seedE2E.hash()}));
    if(!measured.performance.rendererCpuSubmit.length)throw Error('No unique rendered samples');
    if(cache==='warm'&&mode!=='contrast'&&measured.state.terrain.pending!==0)throw Error('Warm sample contains pending painted terrain');
    const heapAfter=await heapSession.send('Runtime.getHeapUsage');
    report.rows.push({block,position,label,viewport,mode,cache,warmWaitMs,terrainDrainRequired:mode!=='contrast',initial,hash:measured.hash,foreground:measured.foreground,renderer:info.gpu.auxAttributes?.glRenderer??'UNAVAILABLE',browser:browser.version(),frame:summary(measured.performance.frame),render:summary(measured.performance.rendererCpuSubmit),terrain:measured.state.terrain,heap:{before:heapBefore,after:heapAfter,limitation:'Heap occupancy across the window, not allocation rate; GC is not forced.'}});save();
    if(initial.hash!==measured.hash)throw Error('Paused rendering mutated canonical state');
    if(measured.state.enemies!==500||measured.state.projectiles!==800)throw Error('Paused comparison lost canonical density');
   }
   await context.close();
  }
 }catch(e){report.errors.push({block,position,label,message:String(e)});save();throw e;}finally{await browser.close();}
 console.log(`Completed block${block+1}/${blocks} position${position+1}/4 ${label}`);
}
report.complete=true;save();console.log(`Saved${report.rows.length} cold/warm rows to${output}`);
