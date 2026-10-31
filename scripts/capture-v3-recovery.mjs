import {chromium} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
import {readPreviewBuild} from './read-preview-build.mjs';
import {preview} from 'vite';
import {loadResolvedBaseline,CONTRACT} from './resolve-legacy-baselines.mjs';
const baseline18=loadResolvedBaseline('pr18'),baseline19=loadResolvedBaseline('pr19');
let [parent18='http://127.0.0.1:4181',parent19='http://127.0.0.1:4182',candidate='http://127.0.0.1:4183',output='test-results/v3-early-visual']=process.argv.slice(2);
const servers=[];
if(parent18==='self'){
 for(const [dir,port] of [[baseline18.dist,4281],[baseline19.dist,4282],['dist',4283]])servers.push(await preview({build:{outDir:dir},preview:{host:'127.0.0.1',port,strictPort:true}}));
 [parent18,parent19,candidate]=[4281,4282,4283].map(p=>'http://127.0.0.1:'+p);
 output='test-results/v3-comparison';
}
mkdirSync(output,{recursive:true});
const browser=await chromium.launch({headless:true,...(process.platform==='win32'?{args:['--use-gl=angle','--use-angle=d3d11']}: {})});
const rows=[];
try{
 for(const [label,url,expected] of [['pr18',parent18,'cf5aaf69277c992ca964ab25ac679d9750fdad0d'],['pr19',parent19,'9b5c1facd4bbab891b452051b392e5e460c76353'],['candidate',candidate,null]]){
  const build=await readPreviewBuild(url);if(build.dirty||(expected&&build.sha!==expected))throw Error('Wrong pinned source or dirty comparison build '+JSON.stringify(build));
  const context=await browser.newContext({viewport:{width:1280,height:720},recordVideo:{dir:output,size:{width:1280,height:720}}});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>localStorage.setItem('seed-game-save-v1',JSON.stringify({schema:1,settings:{lang:'en',tutorialCompleted:true,uiScale:1,volume:0},archive:[],history:[],best:{}})));
  await page.goto(url+'/?e2e');await page.locator('#seed-input').fill('EPOCH-GOLDEN-001');await page.locator('#start-btn').click();await page.waitForFunction(()=>window.__seedE2E);
  await page.evaluate(()=>{const h=window.__seedE2E;h.startBossArena(0);h.streamingFixture(0,0,false,false,false);h.stageBossReview('fan');h.notificationReset();});
  await page.waitForFunction(()=>window.__seedE2E.content153Review().terrain.pending===0);
  await page.waitForTimeout(300);
  const inspect=()=>page.evaluate(()=>{const h=window.__seedE2E;return {canonical:JSON.parse(h.snapshot()),boss:h.bossReviewState(),camera:h.cameraGroundReview()};});
  const initial=await inspect();await page.screenshot({path:`${output}/${label}-warning.png`});
  await page.evaluate(()=>window.__seedE2E.advanceEvolution(2.15));await page.waitForTimeout(100);
  const recovery=await inspect();await page.screenshot({path:`${output}/${label}-recovery.png`});
  // A visibly moving staged encounter, preserving real canonical step/timers.
  await page.evaluate(()=>window.__seedE2E.stageBossReview('cross'));
  for(let i=0;i<20;i++){await page.evaluate(()=>window.__seedE2E.advanceEvolution(.2));await page.waitForTimeout(200);}
  const video=page.video();await context.close();await video.saveAs(`${output}/${label}-encounter.webm`);
  if(errors.length)throw Error(errors.join('; '));rows.push({label,build,baselineEvidence:label==='pr18'?baseline18.evidence:label==='pr19'?baseline19.evidence:null,initial,recovery,video:`${label}-encounter.webm`,errors});
 }
 // Full canonical snapshots include startup RNG/timers unrelated to this art
 // fixture. Compare every displayed boss/encounter field, not those histories.
 const visualBoss=r=>{const b=r.initial.boss.boss;return JSON.stringify({x:b.x,y:b.y,hp:b.hp,maxHp:b.maxHp,radius:b.radius,encounter:b.encounter});};
 writeFileSync(`${output}/comparison.json`,JSON.stringify({classification:'MATCHED_SOURCE_PINNED_PARENT_NATIVE_STAGED_NOT_HUMAN_ART_APPROVAL',evidenceContract:CONTRACT,rows,limitations:'Staged boss/encounter/viewport/camera/settings are matched; startup canonical histories are not equal. Early candidate may be dirty. No natural-play or new painted anatomy claim.'},null,2));
 if(rows.some(r=>visualBoss(r)!==visualBoss(rows[0])))throw Error('Boss fixture mismatch');
 if(rows.some(r=>r.initial.camera.zoom!==rows[0].initial.camera.zoom||JSON.stringify(r.initial.camera.view)!==JSON.stringify(rows[0].initial.camera.view)))throw Error('Camera mismatch');
 console.log('Matched source-pinned V2 PR18/PR19/candidate captures and clips saved');
}finally{await browser.close();for(const server of servers)await new Promise(r=>server.httpServer.close(r));}
