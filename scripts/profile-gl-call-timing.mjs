// V3.7 diagnostic: attributes CPU render-submit time to individual WebGL calls by
// wrapping prototype methods in the page (test harness only; game code untouched).
import {chromium} from '@playwright/test';
import {preview} from 'vite';
import {mkdirSync,writeFileSync} from 'node:fs';
import {dirname} from 'node:path';
import {readPreviewBuild} from './read-preview-build.mjs';
const [dir='scratch/v37-diag-dist',out='test-results/v37-gl-call-timing.json']=process.argv.slice(2);
const CASES=[
 {id:'720-normal',width:1280,height:720,graphics:'normal'},
 {id:'1080-normal',width:1920,height:1080,graphics:'normal'},
 {id:'1080-normal-hide-combat-gfx',width:1920,height:1080,graphics:'normal',hide:[0,0]},
 {id:'1080-contrast',width:1920,height:1080,graphics:'contrast'},
 {id:'1080-normal-repeat',width:1920,height:1080,graphics:'normal'},
];
const report={classification:'DIAGNOSTIC_GL_CALL_ATTRIBUTION_NOT_PHYSICAL_GATE',rows:[],errors:[],complete:false};
const save=()=>{mkdirSync(dirname(out),{recursive:true});writeFileSync(out,JSON.stringify(report,null,2));};
const browser=await chromium.launch({headless:true,...(process.platform==='win32'?{args:['--use-gl=angle','--use-angle=d3d11']}:{})});
const server=await preview({build:{outDir:dir},preview:{host:'127.0.0.1',port:4200,strictPort:true}});
try{
 report.source=await readPreviewBuild('http://127.0.0.1:4200');
 report.gpu=(await(await browser.newBrowserCDPSession()).send('SystemInfo.getInfo')).gpu.auxAttributes?.glRenderer;
 for(const c of CASES){
  const context=await browser.newContext({viewport:{width:c.width,height:c.height}}),page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  await page.addInitScript(()=>{
   localStorage.setItem('seed-game-save-v1',JSON.stringify({schema:1,settings:{lang:'en',volume:0,uiScale:1,tutorialCompleted:true},archive:[],history:[],best:{}}));
   const acc=window.__glAcc={on:false,calls:{}};
   for(const P of [WebGL2RenderingContext.prototype,WebGLRenderingContext.prototype])for(const name of ['bufferSubData','bufferData','drawElements','drawArrays','texSubImage2D','texImage2D','useProgram','uniform1fv','uniformMatrix4fv','bindTexture','getError','readPixels','finish','flush','getQueryParameter','clear']){
    const f=P[name];if(typeof f!=='function')continue;
    P[name]=function(...a){if(!acc.on)return f.apply(this,a);const t=performance.now();const r=f.apply(this,a);const d=performance.now()-t;const e=acc.calls[name]??={n:0,ms:0,max:0,bytes:0};e.n++;e.ms+=d;if(d>e.max)e.max=d;if(name==='bufferSubData'){const v=a[2];e.bytes+=v?.byteLength??0;}return r;};
   }
  });
  await page.goto('http://127.0.0.1:4200/?e2e=1&profile=1');await page.locator('#seed-input').fill('EPOCH-GOLDEN-001');await page.locator('#start-btn').click();
  await page.waitForFunction(()=>window.__seedE2E?.layerIsolation);
  await page.evaluate(g=>{const h=window.__seedE2E;h.stageEvolution('hunters',5);h.primeSignature();h.streamingFixture(0,0,true,false,g==='contrast');},c.graphics);
  if(c.graphics==='normal')await page.waitForFunction(()=>{const t=window.__seedE2E.canonicalStressState().terrain;return t.mode==='source-fallback'||t.pending===0;},null,{timeout:60000});
  if(c.hide)await page.evaluate(([a,b])=>window.__seedE2E.layerIsolation(a,b),c.hide);
  await page.waitForTimeout(2500);
  await page.evaluate(()=>{window.__seedE2E.takeUniquePerformanceFrames();window.__glAcc.calls={};window.__glAcc.on=true;});
  await page.waitForTimeout(3000);
  const r=await page.evaluate(()=>{window.__glAcc.on=false;return {frames:window.__seedE2E.takeUniquePerformanceFrames(),calls:window.__glAcc.calls};});
  const n=r.frames.length||1,render=r.frames.reduce((s,f)=>s+f.rendererCpuSubmit,0)/n;
  const perFrame=Object.fromEntries(Object.entries(r.calls).map(([k,v])=>[k,{callsPerFrame:+(v.n/n).toFixed(2),msPerFrame:+(v.ms/n).toFixed(3),maxMs:+v.max.toFixed(2),kbPerFrame:+(v.bytes/n/1024).toFixed(1)}]));
  report.rows.push({...c,frames:n,meanRenderCpuSubmitMs:+render.toFixed(3),perFrame});save();
  const top=Object.entries(perFrame).sort((a,b)=>b[1].msPerFrame-a[1].msPerFrame).slice(0,4).map(([k,v])=>`${k}:${v.msPerFrame}ms/${v.callsPerFrame}x`).join(' ');
  console.log(`${c.id} frames=${n} meanRender=${render.toFixed(2)} ${top}`);
  await context.close();
 }
 if(report.errors.length)throw Error(report.errors.join(';'));
 report.complete=true;save();console.log('COMPLETE '+out);
}catch(e){report.errors.push(String(e));save();throw e;}finally{await browser.close();await new Promise(r=>server.httpServer.close(r));}
