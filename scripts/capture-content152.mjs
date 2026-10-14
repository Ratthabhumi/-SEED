// Reproducible staged native presentation evidence, never a human playtest.
// node scripts/capture-content152.mjs URL OUTPUT_DIRECTORY
import {chromium} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {join} from 'node:path';
const [url='http://127.0.0.1:4188',out='test-results/content152-gallery']=process.argv.slice(2);
mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,...(process.platform==='win32'?{args:['--use-gl=angle','--use-angle=d3d11']}: {})});
const context=await browser.newContext({viewport:{width:1920,height:1080},recordVideo:{dir:out,size:{width:1920,height:1080}}});
const page=await context.newPage(),errors=[],captures=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.addInitScript(()=>localStorage.setItem('seed-game-save-v1',JSON.stringify({schema:1,settings:{lang:'en',volume:0,uiScale:1,tutorialCompleted:true},archive:[],history:[],best:{}})));
 await page.goto(url+'/?e2e');await page.locator('#seed-input').fill('EPOCH-GOLDEN-001');await page.locator('#start-btn').click();await page.waitForFunction(()=>window.__seedE2E?.stageEvolution);
 for(const origin of ['hunters','engineers','resonant','sentinels'])for(const age of [0,5]){
  await page.evaluate(([o,a])=>{const h=window.__seedE2E;h.stageEvolution(o,a);h.cleanPresentation();h.notificationReset();},[origin,age]);
  await page.waitForFunction(()=>window.__seedE2E.integratedReview().terrain.pending===0);
  const before=await page.evaluate(()=>JSON.parse(window.__seedE2E.snapshot()).p);
  await page.keyboard.down('d');await page.waitForTimeout(700);await page.keyboard.up('d');
  await page.keyboard.down('w');await page.waitForTimeout(500);await page.keyboard.up('w');
  const after=await page.evaluate(()=>({p:JSON.parse(window.__seedE2E.snapshot()).p,actors:window.__seedE2E.actorPresentation(),rig:window.__seedE2E.integratedReview().equipment,motion:window.__seedE2E.referenceAnimation()}));
  if(after.p[0]<=before[0]||after.p[1]>=before[1])throw Error('Native movement did not advance');
  const file=`${origin}-${age}.png`;await page.screenshot({path:join(out,file)});captures.push({file,origin,age,before,after});
 }
 await page.evaluate(()=>{const h=window.__seedE2E;h.canonicalStressStart(true);h.bossPhaseReview();h.notificationReset();});
 const phases=[];for(let i=0;i<16;i++){await page.waitForTimeout(1000);phases.push(await page.evaluate(()=>window.__seedE2E.canonicalStressState()));}
 if(phases.some((p,i)=>p.paused||p.draft||(i&&p.elapsed<=phases[i-1].elapsed)))throw Error('Boss fixture stopped advancing');
 await page.screenshot({path:join(out,'boss-advancing.png')});
 writeFileSync(join(out,'index.json'),JSON.stringify({classification:'STAGED_NATIVE_PRESENTATION_NOT_HUMAN_ACCEPTANCE',sourceSha:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),viewport:{width:1920,height:1080},seed:'EPOCH-GOLDEN-001',mode:'normal',browser:browser.version(),captures,phases,errors,limitations:'High-HP enemies, isolated roster and a forced canonical half-health transition. Authored motion coverage unchanged. No natural DPS, art approval or fun verdict.'},null,2));
 await page.close();await page.video().saveAs(join(out,'native-reference-and-boss.webm'));
 if(errors.length)throw Error(errors.join('; '));
}finally{await context.close();await browser.close();}
