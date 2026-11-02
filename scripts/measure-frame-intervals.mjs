// Bounded current-build staged Boss diagnostic; NOT natural play or physical24.
import {chromium} from '@playwright/test';
import {spawn,execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';

const sha=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
if(execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim())throw Error('Commit source first; clean build provenance required');
const out=process.argv[2]??'test-results/v39-native-boss.json';
const receipt={sourceSha:sha,classification:'SYNTHETIC_DIAGNOSTIC',complete:false,
  hostIsolation:'UNCONTROLLED; do not stop remote access. Parsec active connection and thermals NOT VERIFIED',
  limitations:'Two staged live Boss windows, 8s each, native CSS/backing sizes at DPR1. Profiling overhead included. Sim/render CPU timing is rolling240, GPU is asynchronous valid queries only. Not natural gameplay, a matched speedup study, physical24, or subjective acceptance.',rows:[],errors:[]};
mkdirSync('test-results',{recursive:true});const save=()=>writeFileSync(out,JSON.stringify(receipt,null,2));save();
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','4189','--strictPort'],{windowsHide:true,stdio:'ignore'});
let browser;
const quantiles=values=>{const s=values.filter(Number.isFinite).sort((a,b)=>a-b);return {samples:s.length,p50:s.length?s[Math.ceil(s.length*.5)-1]:null,p95:s.length?s[Math.ceil(s.length*.95)-1]:null,p99:s.length?s[Math.ceil(s.length*.99)-1]:null};};
try{
  let ready=false;for(let i=0;i<60;i++){if(server.exitCode!==null)throw Error('Own preview exited (possible port conflict); no process killed');try{if((await fetch('http://127.0.0.1:4189')).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,500));}
  if(!ready)throw Error('Preview readiness timeout');
  browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=d3d11']});
  const cdp=await browser.newBrowserCDPSession();const gpu=await cdp.send('SystemInfo.getInfo');
  receipt.browser=browser.version();receipt.renderer=gpu.gpu?.auxAttributes?.glRenderer??'NOT_OBSERVABLE';
  for(const [width,height] of [[1280,720],[1920,1080]]){
    const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1});const page=await context.newPage();
    page.on('pageerror',e=>{receipt.errors.push(e.message);save();});
    await page.addInitScript(()=>localStorage.setItem('seed-game-save-v1',JSON.stringify({schema:1,settings:{lang:'en',tutorialCompleted:true,contrast:'normal',uiScale:1},archive:[],history:[]})));
    await page.goto('http://127.0.0.1:4189/?e2e&profile=1');await page.locator('#seed-input').fill('EPOCH-GOLDEN-001');await page.locator('#start-btn').click();
    await page.waitForFunction(()=>!!window.__seedE2E?.frameIntervalEvidence?.()&&document.fonts.status==='loaded',null,{timeout:30000});
    const build=await page.evaluate(()=>performance.getEntriesByType('resource').map(e=>e.name).find(n=>/assets\/index-.*\.js/.test(n)));
    if(!build)throw Error('Missing build asset');
    const bundle=await (await page.request.get(build)).text();if(!bundle.includes(sha))throw Error('Build SHA mismatch; build clean source first');
    await page.evaluate(()=>{const h=window.__seedE2E;h.stageBossReview('fan');h.resumeCombatReview();});
    await page.waitForTimeout(2000);
    const start=await page.evaluate(()=>{const h=window.__seedE2E;h.resetPerformanceSamples();h.resetRenderDiagnostics();return h.canonicalStressState();});
    await page.keyboard.down('KeyD');await page.waitForTimeout(4000);await page.keyboard.up('KeyD');
    await page.keyboard.down('KeyA');await page.waitForTimeout(4000);await page.keyboard.up('KeyA');
    const row=await page.evaluate(()=>{const h=window.__seedE2E,c=document.querySelector('canvas'),r=c.getBoundingClientRect();
      return {intervalEvidence:h.frameIntervalEvidence(),timing:h.performanceSamples(),diagnostics:h.renderDiagnostics(),end:h.canonicalStressState(),
        visibility:document.visibilityState,dpr:devicePixelRatio,viewport:[innerWidth,innerHeight],canvasCss:[r.width,r.height],canvasBacking:[c.width,c.height],displayRefreshHz:'NOT_OBSERVABLE_IN_BROWSER'};});
    if(row.canvasCss[0]!==width||row.canvasCss[1]!==height||row.canvasBacking[0]!==width||row.canvasBacking[1]!==height)throw Error('Not a native viewport/backing match');
    const {timing,diagnostics,...kept}=row;
    receipt.rows.push({...kept,width,height,graphics:'normal',start,simRolling240:quantiles(timing.sim),rendererCpuSubmitRolling240:quantiles(timing.rendererCpuSubmit),
      gpu:diagnostics.gpuSupported?{status:diagnostics.gpuDisjoint?'DISJOINT_OBSERVED':'VALID_QUERY_RESULTS',disjoint:diagnostics.gpuDisjoint,...quantiles(diagnostics.gpu.map(g=>g.ms))}:{status:'UNSUPPORTED',samples:0,p95:null}});
    await page.screenshot({path:`test-results/v39-native-boss-${height}.png`});save();await context.close();
  }
  receipt.complete=true;save();console.log(JSON.stringify({out,complete:true,rows:receipt.rows.length,errors:receipt.errors.length}));
}catch(error){receipt.errors.push(String(error));save();throw error;}
finally{await browser?.close();server.kill();}
