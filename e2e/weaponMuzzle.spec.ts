import {test,expect} from '@playwright/test';
import {startRun} from './helpers';
import {writeFileSync} from 'node:fs';
// Avoid screencast encoding during 1080p geometry checks. A dedicated 720p
// clip below records real movement; screenshots still cover both resolutions.
const frame=async(page:any)=>page.evaluate(()=>new Promise<void>(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r()))));
for(const height of [720,1080])for(const lang of ['en','th'] as const)test(`authentic muzzle eight directions ${height} ${lang}`,async({page})=>{
 await page.setViewportSize({width:height===720?1280:1920,height});await startRun(page,'EPOCH-GOLDEN-001',{lang});
 const rows=[];
 for(const mount of ['float','hand'])for(let direction=0;direction<8;direction++){
  await page.evaluate(({mount,direction})=>{const h=(window as any).__seedE2E;h.stageEvolution('hunters',0);h.primeSignature();h.equipmentMountReview(mount);h.aimReleaseReview(Math.cos(direction*Math.PI/4)*450,Math.sin(direction*Math.PI/4)*450);},{mount,direction});
  await frame(page);const r=await page.evaluate(()=>(window as any).__seedE2E.weaponMuzzleReview()),a=r.art,e=a.release,p=r.projectile;
  expect(e.release.owner).toBe('player-primary');expect(p.primary).toBe(true);
  expect(e.x).toBeCloseTo(e.release.pose.muzzleX,7);expect(e.y).toBeCloseTo(e.release.pose.muzzleY,7);
  expect(a.x).toBeCloseTo(a.pose.x,7);expect(a.y).toBeCloseTo(a.pose.y,7);expect(a.rotation).toBeCloseTo(a.pose.rotation,7);
  expect(p.x).toBeCloseTo(e.x+p.vx/60,5);expect(p.y).toBeCloseTo(e.y+p.vy/60,5);
  const hash=await page.evaluate(()=>(window as any).__seedE2E.hash());await frame(page);expect(await page.evaluate(()=>(window as any).__seedE2E.hash())).toBe(hash);
  if(mount==='float'&&((height===720&&lang==='en')||direction===0||direction===4)){
   await page.screenshot({path:`test-results/browser/v35-clean-${height}-${lang}-${direction}.png`});
   await page.evaluate(()=>(window as any).__seedE2E.weaponOverlayReview(true));await frame(page);
   await page.screenshot({path:`test-results/browser/v35-overlay-${height}-${lang}-${direction}.png`});
   await page.evaluate(()=>(window as any).__seedE2E.weaponOverlayReview(false));
  }rows.push({mount,direction,...r});
 }
 writeFileSync(`test-results/browser/v35-muzzle-${height}-${lang}.json`,JSON.stringify({classification:'STAGED_CANONICAL_RELEASE_NATIVE_RENDER_NOT_HUMAN_FUN',rows},null,2));
});
test('reproduces stale 7 HP contamination, clears it between fixtures and retains real Slam damage',async({page})=>{
 await startRun(page,'EPOCH-GOLDEN-001');
 await page.evaluate(()=>{const h=(window as any).__seedE2E;h.stageBossReview('slam');h.staleThreatReview();h.dodgeBossReview();h.advanceEvolution(2);});
 expect(await page.evaluate(()=>(window as any).__seedE2E.bossReviewState().hp)).toBe(493);
 await page.evaluate(()=>{const h=(window as any).__seedE2E;h.staleThreatReview();h.stageBossReview('slam');h.dodgeBossReview();h.advanceEvolution(2);});
 expect(await page.evaluate(()=>(window as any).__seedE2E.bossReviewState().hp)).toBe(500);
 await page.evaluate(()=>{const h=(window as any).__seedE2E;h.stageBossReview('slam');h.advanceEvolution(2);});
 expect(await page.evaluate(()=>(window as any).__seedE2E.bossReviewState().hp)).toBe(451);
});
test('real releases survive reduced effects and high contrast, all painted frame axes remain canonical',async({page})=>{
 await startRun(page,'EPOCH-GOLDEN-001');const rows=[];
 for(const graphics of ['normal','reduced','contrast'])for(const origin of ['hunters','engineers','resonant','sentinels'])for(let age=0;age<6;age++){
  await page.evaluate(({graphics,origin,age})=>{const h=(window as any).__seedE2E;h.streamingFixture(0,0,false,graphics==='reduced',graphics==='contrast');h.stageEvolution(origin,age);h.primeSignature();h.aimReleaseReview(-400,250);},{graphics,origin,age});
  await frame(page);const r=await page.evaluate(()=>(window as any).__seedE2E.weaponMuzzleReview()),e=r.release;
  // Aura-only energy stages emit no primary projectile or beam.
  if((origin==='resonant'||origin==='sentinels')&&age===2)continue;
  expect(e.release.owner).toBe('player-primary');expect(e.release.pose.frame).toBe(['hunters','engineers','resonant','sentinels'].indexOf(origin)*6+age);
  const x=e.type==='beam_fired'?e.x1:e.x,y=e.type==='beam_fired'?e.y1:e.y;
  expect(x).toBeCloseTo(e.release.pose.muzzleX,6);expect(y).toBeCloseTo(e.release.pose.muzzleY,6);
  if(graphics!=='contrast'){expect(r.art.rotation).toBeCloseTo(e.release.pose.rotation,6);expect(r.art.x).toBeCloseTo(e.release.pose.x,6);}
  if(age===0||age===5)await page.screenshot({path:`test-results/browser/v35-frame-${graphics}-${origin}-${age}.png`});
  rows.push({graphics,origin,age,...r});
 }
 writeFileSync('test-results/browser/v35-frames.json',JSON.stringify({classification:'STAGED_CANONICAL_RELEASES_NOT_HUMAN_ACCEPTANCE',rows},null,2));
});
