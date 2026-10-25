// V3.7 bounded causal experiment, NOT a replacement for physical24.
// 2x2 factorial on the frozen 500/800 fixture: viewport pixels x visible world area.
// Zoom overrides are diagnostic-only; production keeps gameZoom(height).
import {chromium} from '@playwright/test';
import {preview} from 'vite';
import {mkdirSync,writeFileSync} from 'node:fs';
import {dirname} from 'node:path';
import os from 'node:os';
import {readPreviewBuild} from './read-preview-build.mjs';
const [dir='scratch/v37-pr26-dist',out='test-results/v37-resolution-factorial.json',repeats='3',mode='factorial']=process.argv.slice(2);
const pct=(v,p)=>{v=[...v].sort((a,b)=>a-b);return v.length?v[Math.min(v.length-1,Math.floor(v.length*p))]:null;};
const stats=v=>({samples:v.length,p50:pct(v,.5),p95:pct(v,.95),p99:pct(v,.99)});
// world view = viewport / zoom
// 'trim' mode: same build, native zoom, actor alpha trimming on vs ?actorTrim=off.
const CONDITIONS=mode==='trim'?[
 {id:'1080_TRIM_ON',width:1920,height:1080,query:''},
 {id:'1080_TRIM_OFF',width:1920,height:1080,query:'&actorTrim=off'},
 {id:'720_TRIM_ON',width:1280,height:720,query:''},
 {id:'720_TRIM_OFF',width:1280,height:720,query:'&actorTrim=off'},
]:[
 {id:'PX720_WORLD720',width:1280,height:720,zoom:1},
 {id:'PX720_WORLD1080',width:1280,height:720,zoom:0.8},
 {id:'PX1080_WORLD720',width:1920,height:1080,zoom:1.5},
 {id:'PX1080_WORLD1080',width:1920,height:1080,zoom:1.2},
];
const rows=[],errors=[];
const save=complete=>{mkdirSync(dirname(out),{recursive:true});writeFileSync(out,JSON.stringify({classification:'BOUNDED_RESOLUTION_FACTORIAL_NOT_PHYSICAL_GATE_OR_HUMAN_PLAY',
 host:{cpu:os.cpus()[0]?.model,cores:os.cpus().length,platform:process.platform},rows,errors,complete},null,2));};
const browser=await chromium.launch({headless:true,...(process.platform==='win32'?{args:['--use-gl=angle','--use-angle=d3d11']}:{})});
const server=await preview({build:{outDir:dir},preview:{host:'127.0.0.1',port:4198,strictPort:true}});
try{
 const build=await readPreviewBuild('http://127.0.0.1:4198');
 const gpu=(await(await browser.newBrowserCDPSession()).send('SystemInfo.getInfo')).gpu.auxAttributes?.glRenderer;
 const order=[];for(let r=0;r<Number(repeats);r++){const rot=[...CONDITIONS.slice(r%4),...CONDITIONS.slice(0,r%4)];for(const c of r%2?rot.reverse():rot)for(const graphics of ['normal','contrast'])order.push({...c,graphics,repeat:r});}
 for(const [index,c] of order.entries()){
  const context=await browser.newContext({viewport:{width:c.width,height:c.height}}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>localStorage.setItem('seed-game-save-v1',JSON.stringify({schema:1,settings:{lang:'en',volume:0,uiScale:1,tutorialCompleted:true},archive:[],history:[],best:{}})));
  await page.goto(`http://127.0.0.1:4198/?e2e=1&profile=1${c.query??''}`);await page.locator('#seed-input').fill('EPOCH-GOLDEN-001');await page.locator('#start-btn').click();
  await page.waitForFunction(()=>window.__seedE2E?.canonicalStressStart&&window.__seedE2E?.renderDiagnostics);
  await page.evaluate(({graphics,zoom})=>{const h=window.__seedE2E;h.stageEvolution('hunters',5);h.primeSignature();h.streamingFixture(0,0,true,false,graphics==='contrast');if(zoom)h.cameraReviewSet(zoom);},c);
  if(c.graphics==='normal')await page.waitForFunction(()=>{const t=window.__seedE2E.canonicalStressState().terrain;return t.mode==='source-fallback'||t.pending===0;},null,{timeout:60000});
  await page.waitForTimeout(2000);
  const start=await page.evaluate(()=>{const h=window.__seedE2E;h.takeUniquePerformanceFrames();h.resetRenderDiagnostics();return h.canonicalStressState();});
  await page.waitForTimeout(4000);
  const r=await page.evaluate(()=>{const h=window.__seedE2E,cv=document.querySelector('canvas'),gl=cv.getContext('webgl2')||cv.getContext('webgl');
   return {frames:h.takeUniquePerformanceFrames(),diag:h.renderDiagnostics(),state:h.canonicalStressState(),ground:h.groundReview(),camera:h.cameraGroundReview(),
    dpr:window.devicePixelRatio,css:[cv.clientWidth,cv.clientHeight],backing:[cv.width,cv.height],drawingBuffer:gl?[gl.drawingBufferWidth,gl.drawingBufferHeight]:null,visibility:document.visibilityState};});
  if(start.hash!==r.state.hash||r.state.enemies!==500||r.state.projectiles!==800)throw Error(`Frozen workload changed in ${c.id}`);
  const intervals=r.frames.slice(1).map((f,i)=>f.at-r.frames[i].at);
  const z=r.camera.zoom,vw=r.camera.view;
  rows.push({index,condition:c.id,graphics:c.graphics,repeat:c.repeat,source:build,gpu,browser:browser.version(),
   viewport:[c.width,c.height],dpr:r.dpr,css:r.css,backing:r.backing,drawingBuffer:r.drawingBuffer,zoom:z,worldView:[vw.right-vw.left,vw.bottom-vw.top],
   groundCommands:r.ground.commands,actors:r.state.actors,terrain:r.state.terrain,foreground:r.visibility,
   renderCpuSubmit:stats(r.frames.map(f=>f.rendererCpuSubmit)),frameInterval:stats(intervals),over25ms:intervals.filter(v=>v>25).length,
   gpuMs:{supported:r.diag?.gpuSupported,extension:r.diag?.gpuExtension,disjoint:r.diag?.gpuDisjoint,...stats((r.diag?.gpu??[]).map(g=>g.ms))},longTasks:r.diag?.longTasks?.length??null});
  console.log(`${index+1}/${order.length} ${c.id} ${c.graphics} render p95=${rows.at(-1).renderCpuSubmit.p95?.toFixed(2)} gpu p95=${rows.at(-1).gpuMs.p95?.toFixed(2)} frame p95=${rows.at(-1).frameInterval.p95?.toFixed(2)}`);
  save(false);await context.close();
 }
 if(errors.length)throw Error(errors.join(';'));
 save(true);console.log('COMPLETE '+out);
}catch(e){errors.push(String(e));save(false);throw e;}finally{await browser.close();await new Promise(r=>server.httpServer.close(r));}
