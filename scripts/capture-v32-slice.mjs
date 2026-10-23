import {chromium} from '@playwright/test';
import {preview} from 'vite';
import {mkdirSync,writeFileSync} from 'node:fs';
import {readPreviewBuild} from './read-preview-build.mjs';

// Compare the actual PR21 package, not a same-build legacy switch.
const output=process.argv[2]??'test-results/v32-early';
mkdirSync(output,{recursive:true});
const servers=[],rows=[];
const browser=await chromium.launch({headless:true,...(process.platform==='win32'?{args:['--use-gl=angle','--use-angle=d3d11']}: {})});
try{
 for(const [label,dir,port] of [['pr21','scratch/v32-pr21-dist',4291],['candidate','dist',4292]]){
  const server=await preview({build:{outDir:dir},preview:{host:'127.0.0.1',port,strictPort:true}});servers.push(server);
  const url=`http://127.0.0.1:${port}`,build=await readPreviewBuild(url);
  if(label==='pr21'&&(build.sha!=='835a25f821b5aa0e8492c9f13787a3d7aa59f6ad'||build.dirty))throw Error('Wrong immutable PR21 source');
  const context=await browser.newContext({viewport:{width:1280,height:720},recordVideo:{dir:output,size:{width:1280,height:720}}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>localStorage.setItem('seed-game-save-v1',JSON.stringify({schema:1,settings:{lang:'en',tutorialCompleted:true,uiScale:1,volume:0},archive:[],history:[],best:{}})));
  await page.goto(url+'/?e2e');await page.locator('#seed-input').fill('EPOCH-GOLDEN-001');await page.locator('#start-btn').click();await page.waitForFunction(()=>window.__seedE2E);
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
  const video=page.video();await context.close();await video.saveAs(`${output}/${label}-slice.webm`);
  rows.push({label,build,observations,errors,video:`${label}-slice.webm`});
  if(errors.length)throw Error(errors.join('; '));
 }
 writeFileSync(`${output}/comparison.json`,JSON.stringify({classification:'STAGED_NATIVE_OFFICIAL_PR21_COMPARISON_NOT_HUMAN_ACCEPTANCE',rows,limitations:'Real canonical attacks in staged fixtures. Startup histories are not claimed identical. No new painted anatomy, natural progression or fun verdict.'},null,2));
 console.log('PR21/candidate native screenshots and moving slice saved: '+output);
}finally{await browser.close();for(const s of servers)await new Promise(r=>s.httpServer.close(r));}
