import {chromium} from '@playwright/test';
import {preview} from 'vite';
import {mkdirSync,writeFileSync} from 'node:fs';
import {readPreviewBuild} from './read-preview-build.mjs';
import {loadResolvedBaseline,CONTRACT} from './resolve-legacy-baselines.mjs';
import {resolve} from 'node:path';

// Compare pinned PR21/PR25 source; receipt explicitly identifies reconstruction.
const [output='test-results/v32-early',requestedDir,requestedSha,baselineLabel='pr21']=process.argv.slice(2);
const prepared=loadResolvedBaseline(baselineLabel),baselineDir=prepared.dist,baselineSha=prepared.evidence.sourceSha;
if(requestedDir&&resolve(requestedDir)!==resolve(baselineDir))throw Error('Comparison must use the validated resolved baseline directory');
if(requestedSha&&requestedSha!==baselineSha)throw Error('Wrong requested baseline source');
mkdirSync(output,{recursive:true});
const servers=[],rows=[];
const browser=await chromium.launch({headless:true,...(process.platform==='win32'?{args:['--use-gl=angle','--use-angle=d3d11']}: {})});
try{
 for(const [label,dir,port] of [[baselineLabel,baselineDir,4291],['candidate','dist',4292]]){
  const server=await preview({build:{outDir:dir},preview:{host:'127.0.0.1',port,strictPort:true}});servers.push(server);
  const url=`http://127.0.0.1:${port}`,build=await readPreviewBuild(url);
  if(build.dirty||(label===baselineLabel&&build.sha!==baselineSha))throw Error('Wrong immutable baseline source or dirty comparison');
  const context=await browser.newContext({viewport:{width:1280,height:720},recordVideo:{dir:output,size:{width:1280,height:720}}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>localStorage.setItem('seed-game-save-v1',JSON.stringify({schema:1,settings:{lang:'en',tutorialCompleted:true,uiScale:1,volume:0},archive:[],history:[],best:{}})));
  let release=()=>{},requested=()=>{};
  const gate=new Promise(r=>{release=r;}),requestSeen=new Promise(r=>{requested=r;});
  if(baselineLabel!=='pr21')await page.route('**/boss-v2-*.png',async route=>{requested();await gate;await route.continue();});
  await page.goto(url+'/?e2e');await page.locator('#seed-input').fill('EPOCH-GOLDEN-001');await page.locator('#start-btn').click();
  if(baselineLabel!=='pr21'){await requestSeen;await page.screenshot({path:`${output}/${label}-loading.png`});release();}
  await page.waitForFunction(()=>window.__seedE2E);
  const observations=[];
  const sample=async(name)=>{
   await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   const state=await page.evaluate(()=>{const h=window.__seedE2E;return {boss:h.bossReviewState(),actors:h.integratedReview(),motion:h.referenceAnimation(),camera:h.cameraGroundReview(),hash:h.hash()};});
   await page.screenshot({path:`${output}/${label}-${name}.png`});observations.push({name,state});
  };
  await page.evaluate(()=>{const h=window.__seedE2E;h.startBossArena(0);h.streamingFixture(0,0,false,false,false);h.stageBossReview('cross');h.notificationReset();});
  await page.waitForFunction(()=>window.__seedE2E.content153Review().terrain.pending===0);
  await sample('boss-warning');
  for(let i=0;i<44;i++){await page.evaluate(()=>window.__seedE2E.advanceEvolution(.1));await page.waitForTimeout(100);if(i===16)await sample('boss-impact');if(i===22)await sample('boss-recovery');}
  for(let age=0;age<6;age++){
   await page.evaluate(age=>window.__seedE2E.stageEvolution('hunters',age),age);
   await page.waitForFunction(()=>window.__seedE2E.content153Review().terrain.pending===0);
   // Live keyboard input + real autoattacks, not a sequence of paused costumes.
   await page.keyboard.down('a');await page.waitForTimeout(350);await page.keyboard.up('a');
   await sample('hunters-age-'+age);
   await page.keyboard.down('d');await page.waitForTimeout(350);await page.keyboard.up('d');
  }
  await page.evaluate(()=>{const h=window.__seedE2E;h.stageEvolution('resonant',4);h.primeSignature();h.advanceEvolution(.17);});
  await sample('beam-release');await page.waitForTimeout(250);
  if(baselineLabel!=='pr21'){
   await page.evaluate(()=>{const h=window.__seedE2E;h.stageBossReview('fan');h.bossPhaseReview();h.advanceEvolution(.5);});await sample('boss-phase2');
   await page.evaluate(()=>{const h=window.__seedE2E;h.streamingFixture(0,0,false,false,true);h.canonicalStressStart(false);});
   await page.waitForTimeout(3000);await sample('dense-hc');
   await page.evaluate(()=>window.__seedE2E.readyAscend());await page.locator('.hud-ascend button').click();
   await page.locator('#legacy-screen .card').first().click();await page.locator('#origin-screen .card').first().click();await page.locator('#child-intro-screen button').click();
   await sample('prepared-real-world2');
   await page.locator('.hud').evaluate(hud=>hud.dataset.sliceOld='true');
   await page.keyboard.press('Escape');await sample('pause');await page.locator('#pause-restart-btn').click();
   await page.waitForFunction(()=>!document.querySelector('.hud[data-slice-old]')&&document.querySelector('.hud'));
   await sample('restart');
  }
  const video=page.video();await context.close();await video.saveAs(`${output}/${label}-slice.webm`);
  rows.push({label,build,observations,errors,video:`${label}-slice.webm`});
  if(errors.length)throw Error(errors.join('; '));
 }
 writeFileSync(`${output}/comparison.json`,JSON.stringify({classification:'STAGED_NATIVE_SOURCE_PINNED_COMPARISON_NOT_HUMAN_ACCEPTANCE',evidenceContract:CONTRACT,baselineEvidence:prepared.evidence,baselineLabel,rows,limitations:'Real canonical attacks in staged fixtures. Startup histories are not claimed identical. Ascension uses explicit ready fixture then actual canonical UI progression, not a natural victory. No new painted anatomy, natural progression or fun verdict.'},null,2));
 console.log(baselineLabel+'/candidate native screenshots and moving slice saved: '+output);
}finally{await browser.close();for(const s of servers)await new Promise(r=>s.httpServer.close(r));}
