// One short controlled traversal at the recorded viewport. NOT an input replay.
import {chromium} from '@playwright/test';
import {writeFileSync,mkdirSync} from 'node:fs';
import {dirname} from 'node:path';
import {readPreviewBuild} from './read-preview-build.mjs';
const [url='http://127.0.0.1:4184',output='test-results/human-route-profile.json']=process.argv.slice(2);
const build=await readPreviewBuild(url);if(build.dirty)throw Error('Use a clean immutable compiled build');
const browser=await chromium.launch({headless:true,...(process.platform==='win32'?{args:['--use-gl=angle','--use-angle=d3d11']}: {})});
const p95=v=>{v=[...v].sort((a,b)=>a-b);return v.length?v[Math.floor(v.length*.95)]:null;};
try{
 const info=await(await browser.newBrowserCDPSession()).send('SystemInfo.getInfo');
 const page=await browser.newPage({viewport:{width:1268,height:1264}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>localStorage.setItem('seed-game-save-v1',JSON.stringify({schema:1,settings:{lang:'th',volume:0,tutorialCompleted:true,uiScale:1,contrast:'normal'},archive:[],history:[],best:{}})));
 await page.goto(url+'/?e2e&profile=1');await page.locator('#seed-input').fill('EPOCH-GOLDEN-001');await page.locator('#start-btn').click();await page.waitForFunction(()=>window.__seedE2E?.renderDiagnostics);
 await page.evaluate(()=>{window.__seedE2E.resetRenderDiagnostics();window.__seedE2E.takeUniquePerformanceFrames();});
 const states=[],frames=[],actions=[],started=Date.now();await page.keyboard.down('d');
 for(let i=0;i<20;i++){
  await page.waitForTimeout(1000);
  const pick=page.locator('#draft-screen .card .card-select').first();
  if(await pick.isVisible()){await pick.click();actions.push({second:i,action:'first real draft selection'});}
  const x=await page.evaluate(()=>({state:window.__seedE2E.canonicalStressState(),frames:window.__seedE2E.takeUniquePerformanceFrames()}));states.push(x.state);frames.push(...x.frames);
 }
 await page.keyboard.up('d');
 const diagnostics=await page.evaluate(()=>window.__seedE2E.renderDiagnostics());
 const spans=Object.fromEntries(['graphics.ground','graphics.combat','presentation.prepare','renderer.boundary','browser.interval'].map(k=>[k,p95(diagnostics.frames.map(f=>f.spans[k]??0))]));
 const final=await readPreviewBuild(url);if(JSON.stringify(final)!==JSON.stringify(build)||errors.length)throw Error('Build changed or browser errors: '+errors.join(';'));
 const summary={rendererP95:p95(frames.map(f=>f.rendererCpuSubmit)),simP95:p95(frames.flatMap(f=>f.sim)),inclusiveSpanP95:spans,gpuSamples:diagnostics.gpu.length,gpuDisjoint:diagnostics.gpuDisjoint,gpuP95:p95(diagnostics.gpu.map(x=>x.ms)),textureUploads:diagnostics.frames.reduce((n,f)=>n+(f.calls['gl.texImage2D']??0)+(f.calls['gl.texSubImage2D']??0),0),longTasks:diagnostics.longTasks.length};
 mkdirSync(dirname(output),{recursive:true});writeFileSync(output,JSON.stringify({classification:'CONTROLLED_SHORT_TRAVERSAL_NOT_REPLAY_OF_HUMAN_SESSION',build,browser:browser.version(),renderer:info.gpu.auxAttributes?.glRenderer,viewport:{width:1268,height:1264},graphics:'normal',uiScale:1,nominalSeconds:20,durationMs:Date.now()-started,summary,states,actions,frames,diagnostics,errors,limitations:'Recorded human graphics mode/UI scale/input trace are unavailable. Normal/scale1/held-right are explicit controlled choices. No grants, staged density or natural-victory claim. Inclusive CPU spans overlap; async GPU is separate and disjoints excluded. One instrumented condition, uncontrolled host; no causal speedup claim.'},null,2));
 console.log(JSON.stringify(summary));
}finally{await browser.close();}
