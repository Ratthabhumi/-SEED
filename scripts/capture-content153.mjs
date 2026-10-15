// Native presentation fixtures + a real-progression Boss controller. No fake HP.
// node scripts/capture-content153.mjs [URL|self] [OUTPUT_DIRECTORY]
import {chromium} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';import {join} from 'node:path';
import {preview} from 'vite';
import {readPreviewBuild} from './read-preview-build.mjs';
const [requested='self',out='test-results/browser/content153']=process.argv.slice(2);
mkdirSync(out,{recursive:true});const server=requested==='self'?await preview({preview:{host:'127.0.0.1',port:4180,strictPort:true}}):null;
const url=server?'http://127.0.0.1:4180':requested;
let build;
try{
 build=await readPreviewBuild(url);if(build.dirty)throw Error('Native receipt requires a stamped clean production build');
}catch(error){if(server)await new Promise(resolve=>server.httpServer.close(resolve));throw error;}
const browser=await chromium.launch({headless:true,...(process.platform==='win32'?{args:['--use-gl=angle','--use-angle=d3d11']}: {})});
const context=await browser.newContext({viewport:{width:1920,height:1080},recordVideo:{dir:out,size:{width:1920,height:1080}}}),errors=[],captures=[];
const client=await browser.newBrowserCDPSession(),gpu=(await client.send('SystemInfo.getInfo')).gpu.auxAttributes?.glRenderer;
const fresh=async()=>{const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));await p.addInitScript(()=>localStorage.setItem('seed-game-save-v1',JSON.stringify({schema:1,settings:{lang:'en',volume:0,uiScale:1,tutorialCompleted:true},archive:[],history:[],best:{}})));await p.goto(url+'/?e2e');await p.locator('#seed-input').fill('EPOCH-GOLDEN-001');await p.locator('#start-btn').click();await p.waitForFunction(()=>window.__seedE2E?.content153Review);return p;};
const capture=async(p,name)=>{await p.screenshot({path:join(out,name+'.png')});captures.push({file:name+'.png',review:await p.evaluate(()=>{const h=window.__seedE2E;return {...h.content153Review(),position:JSON.parse(h.snapshot()).p,zoom:h.integratedReview().zoom,sites:h.siteArtReview?.(),terrainArrival:h.terrainArrivalReview?.(),siteArrival:h.siteArrivalReview?.()};})});};
try{
 const page=await fresh();
 for(const origin of ['hunters','engineers','resonant','sentinels'])for(const age of [0,2,5]){
  await page.evaluate(([o,a])=>{const h=window.__seedE2E;h.stageEvolution(o,a);h.cleanPresentation();h.notificationReset();},[origin,age]);await page.waitForFunction(()=>window.__seedE2E.content153Review().terrain.pending===0);
  await page.keyboard.down('d');await page.waitForTimeout(700);await page.keyboard.up('d');await page.keyboard.down('w');await page.waitForTimeout(500);await page.keyboard.up('w');await capture(page,`${origin}-${age}`);
 }
 for(const biome of ['verdant','arid','tundra','badlands']){
  await page.evaluate(b=>{const h=window.__seedE2E,p=h.findTerrainBiome(b);h.streamingFixture(p.x,p.y);},biome);await page.waitForFunction(()=>window.__seedE2E.content153Review().terrain.pending===0);await capture(page,'biome-'+biome);
 }
 for(const mode of ['normal','reduced','contrast']){await page.evaluate(m=>window.__seedE2E.streamingFixture(0,0,true,m==='reduced',m==='contrast'),mode);await page.waitForTimeout(700);await capture(page,'dense-'+mode);}
 await page.evaluate(()=>window.__seedE2E.setLang('th'));await capture(page,'thai-hud');await page.close();await page.video().saveAs(join(out,'presentation.webm'));
 const hostile=await fresh();await hostile.evaluate(()=>window.__seedE2E.startOrdinaryHostileCapture());
 // A wall-clock delay cannot prove a shot was fired/rendered on software WebGL.
 await hostile.waitForFunction(()=>window.__seedE2E.content153Review().hostiles.paintedRoles.includes(1),null,{timeout:30000});
 await capture(hostile,'ordinary-hostile-live');await hostile.close();await hostile.video().saveAs(join(out,'ordinary-hostile.webm'));
 let boss=await fresh();const begin=Date.now(),attempts=[];
 let preparation=await boss.evaluate(()=>window.__seedE2E.prepareNaturalBoss('balanced'));
 attempts.push({mode:'balanced',result:preparation});
 if(preparation.spawn===null){
  await boss.close();await boss.video().saveAs(join(out,'natural-boss-balanced-unreached.webm'));
  boss=await fresh();preparation=await boss.evaluate(()=>window.__seedE2E.prepareNaturalBoss('damage'));
  attempts.push({mode:'damage',result:preparation});
 }
 const preparedAt=Date.now(),states=[];
 let held=new Set();const bossCaptures=new Set();
 if(preparation.spawn!==null)for(let i=0;i<600;i++){
  const s=await boss.evaluate(()=>window.__seedE2E.bossArenaState());states.push(s);if(s.killed||s.over||!s.boss)break;
  const evidence=s.boss.enraged?(s.boss.cycle>0?'phase2-attack':'phase2-transition'):s.boss.phase==='warning'?'phase1-warning':null;
  if(evidence&&!bossCaptures.has(evidence)){bossCaptures.add(evidence);await capture(boss,'natural-'+evidence);}
  if(s.draft){await boss.locator('#draft-skip-btn').click();continue;}
  const angle=(s.elapsed-preparation.spawn)*.8,tx=s.boss.x+Math.cos(angle)*260,ty=s.boss.y+Math.sin(angle)*260,dx=tx-s.player.x,dy=ty-s.player.y;
  const next=new Set([...(Math.abs(dx)>10?[dx>0?'d':'a']:[]),...(Math.abs(dy)>10?[dy>0?'s':'w']:[])]);
  for(const k of held)if(!next.has(k))await boss.keyboard.up(k);for(const k of next)if(!held.has(k))await boss.keyboard.down(k);held=next;
  await boss.waitForTimeout(100);
 }
 for(const k of held)await boss.keyboard.up(k);await capture(boss,'natural-progression-boss-final');
 const phase2Observed=states.some(s=>s.boss?.enraged),phase2AttackObserved=states.some(s=>s.boss?.enraged&&s.boss.cycle>0);
 const bossEvidence={reached:preparation.spawn!==null,phase2Observed,phase2AttackObserved,killed:states.some(s=>s.killed),playerDied:states.some(s=>s.over),simSeconds:states.length?states[states.length-1].elapsed-states[0].elapsed:0,qualityGate:phase2AttackObserved?'NATIVE_PHASE2_OBSERVED_NOT_HUMAN_FUN_PASS':'OPEN_NO_NATIVE_PHASE2_ATTACK_PROOF'};
 writeFileSync(join(out,'index.json'),JSON.stringify({classification:'STAGED_ART_GALLERY_PLUS_CANONICAL_NATURAL_PROGRESSION_BOSS',sourceSha:build.sha,buildDirty:false,seed:'EPOCH-GOLDEN-001',gpu,browser:browser.version(),captures,attempts,preparation,preparationWallMs:preparedAt-begin,bossEvidence,bossStates:states,bossWallMs:Date.now()-preparedAt,errors,limitations:'Gallery uses staged roster/ages. Boss build comes from actual movement/drafts/claims/combat, then real browser movement from spawn. Balanced policy is retained even when unreached; damage policy is a second documented attempt on a fresh run. Automated policies and circular steering are not human play or a fun verdict. Failure/unreachable/censored outcomes retained; no HP/phase forcing. Native phase2 attack is stated explicitly; successful capture execution is not universal encounter or human quality acceptance.'},null,2));
 await boss.close();await boss.video().saveAs(join(out,'natural-boss.webm'));if(errors.length)throw Error(errors.join('; '));
}finally{await context.close();await browser.close();if(server)await new Promise(resolve=>server.httpServer.close(resolve));}
