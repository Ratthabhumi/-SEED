import {chromium} from '@playwright/test';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {readPreviewBuild} from './read-preview-build.mjs';
const [url='http://127.0.0.1:4292',baseline='scratch/v32-pr21-dist',output='test-results/v33-diagnosis/detail-control.json']=process.argv.slice(2);const build=await readPreviewBuild(url);
const old=readFileSync(baseline+'/assets/'+readdirSync(baseline+'/assets').find(n=>/^boss-v2-.*\.png$/.test(n)));
const rows=[],errors=[];
const p95=v=>[...v].sort((a,b)=>a-b)[Math.floor(v.length*.95)];
const browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=d3d11']});
try{for(const label of ['256','128','128','256','128','256','256','128']){
 const context=await browser.newContext({viewport:{width:1920,height:1080}}),page=await context.newPage();let overrides=0;
 page.on('pageerror',e=>errors.push(e.message));
 if(label==='128')await page.route('**/boss-v2-*.png',route=>{overrides++;return route.fulfill({body:old,contentType:'image/png'});});
 await page.addInitScript(()=>localStorage.setItem('seed-game-save-v1',JSON.stringify({schema:1,settings:{lang:'en',volume:0,tutorialCompleted:true,uiScale:1},archive:[],history:[],best:{}})));
 await page.goto(url+'/?e2e&profile=1');await page.locator('#start-btn').click();await page.waitForFunction(()=>window.__seedE2E?.stageBossReview);
 await page.evaluate(()=>{window.__seedE2E.stageBossReview('cross');});await page.waitForTimeout(1500);
 const before=await page.evaluate(()=>{const h=window.__seedE2E;h.takeUniquePerformanceFrames();h.resetRenderDiagnostics();return h.hash();});
 await page.waitForTimeout(3000);
 const sample=await page.evaluate(()=>{const h=window.__seedE2E;return {frames:h.takeUniquePerformanceFrames(),diagnostics:h.renderDiagnostics(),hash:h.hash()};});
 if(sample.hash!==before)throw Error('Paused hash changed');
 rows.push({label,overrides,hash:before,renderP95:p95(sample.frames.map(x=>x.rendererCpuSubmit)),diagnostics:sample.diagnostics});
 await context.close();
}writeFileSync(output,JSON.stringify({build,classification:'SAME_PR22_CODE_DIAGNOSTIC_TEXTURE_OVERRIDE_NOT_PRODUCTION_OR_PIXEL_PARITY',oldTextureSha256:createHash('sha256').update(old).digest('hex'),rows,errors,limits:'Staged paused Boss only; eight alternating fresh contexts.128 override retains256-derived contact metadata; not an approved presentation candidate. Instrumented spans inclusive. Host uncontrolled.'},null,2));}finally{await browser.close();}
