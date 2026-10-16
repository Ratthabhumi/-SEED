// Native diagnostic probe, optional tracing; no canonical gameplay changes.
// node scripts/profile-render-phases.mjs URL OUTPUT [seconds=20] [trace=0]
import {chromium} from '@playwright/test';
import {writeFileSync,mkdirSync,openSync,writeSync,closeSync} from 'node:fs';
import {dirname} from 'node:path';
import {readPreviewBuild} from './read-preview-build.mjs';
const [url='http://127.0.0.1:4184',output='test-results/render-phases.json',seconds='20',trace='0',variant='',fixture='live']=process.argv.slice(2);
const browser=await chromium.launch({headless:true,...(process.platform==='win32'?{args:['--use-gl=angle','--use-angle=d3d11']}: {})});
mkdirSync(dirname(output),{recursive:true});
try{
 const client=await browser.newBrowserCDPSession();const info=await client.send('SystemInfo.getInfo');
 const page=await browser.newPage({viewport:{width:1920,height:1080}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>localStorage.setItem('seed-game-save-v1',JSON.stringify({schema:1,settings:{lang:'en',volume:0,uiScale:1,tutorialCompleted:true},archive:[],best:{},history:[]})));
 const target=new URL(url);target.searchParams.set('e2e','1');target.searchParams.set('profile','1');if(trace==='1')target.searchParams.set('profileTrace','1');if(variant){const [key,value='1']=variant.split('=');target.searchParams.set(key,value);}
 await page.goto(target.href);
 await page.locator('#seed-input').fill('EPOCH-GOLDEN-001');await page.locator('#start-btn').click();await page.waitForFunction(()=>window.__seedE2E?.canonicalStressStart);
 await page.evaluate(mode=>{const h=window.__seedE2E;if(mode==='live-contrast'){h.stageEvolution('hunters',5);h.streamingFixture(0,0,false,false,true);h.canonicalStressStart(false);}else if(mode==='contrast')h.streamingFixture(0,0,true,false,true);else h.canonicalStressStart(false);},fixture);await page.waitForTimeout(3000);
 await page.evaluate(()=>{window.__seedE2E.resetRenderDiagnostics();window.__seedE2E.resetPerformanceSamples();});
 if(trace==='1')await client.send('Tracing.start',{categories:'devtools.timeline,blink.user_timing,toplevel,v8,gpu',transferMode:'ReturnAsStream'});
 await page.waitForTimeout(Number(seconds)*1000);
 const result=await page.evaluate(()=>({diagnostics:window.__seedE2E.renderDiagnostics(),performance:window.__seedE2E.performanceSamples(),state:window.__seedE2E.canonicalStressState(),foreground:document.visibilityState}));
 result.gpu=info.gpu.auxAttributes?.glRenderer;result.errors=errors;result.browser=browser.version();result.durationSeconds=Number(seconds);result.variant=variant;result.fixture=fixture;
 result.build=await readPreviewBuild(url);
 if(trace==='1'){
  const complete=new Promise(resolve=>client.once('Tracing.tracingComplete',resolve));await client.send('Tracing.end');const {stream}=await complete;
  const path=output.replace('.json','.trace.json'),fd=openSync(path,'w');
  while(true){const chunk=await client.send('IO.read',{handle:stream});writeSync(fd,chunk.base64Encoded?Buffer.from(chunk.data,'base64'):chunk.data);if(chunk.eof)break;}
  closeSync(fd);await client.send('IO.close',{handle:stream});result.trace=path;
 }
 writeFileSync(output,JSON.stringify(result,null,2));await page.screenshot({path:output.replace('.json','.png')});
 console.log(JSON.stringify({output,gpu:result.gpu,frames:result.diagnostics?.frames.length,errors}));
}finally{await browser.close();}
