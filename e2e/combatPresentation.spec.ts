import {test,expect} from '@playwright/test';
import {startRun} from './helpers';
import {writeFileSync} from 'node:fs';
const frame=async(page:any)=>page.evaluate(()=>new Promise<void>(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r()))));
for(const height of [720,1080])for(const lang of ['en','th'] as const)test(`real aimed releases and grounded boss ${height} ${lang}`,async({page})=>{
 await page.setViewportSize({width:height===720?1280:1920,height});await startRun(page,'EPOCH-GOLDEN-001',{lang,uiScale:height===720?1:2});
 await expect.poll(()=>page.evaluate(()=>(window as any).__seedE2E.integratedReview().equipment?.mount)).toBe('float');
 const rows=[];
 for(const age of [0,1,2,3,4,5])for(const mount of ['hand','float']){
  await page.evaluate(({age,mount})=>{const h=(window as any).__seedE2E;h.stageEvolution('hunters',age);h.primeSignature();h.equipmentMountReview(mount);h.aimReleaseReview(-150,0);},{age,mount});
  await frame(page);
  const before=await page.evaluate(()=>{const h=(window as any).__seedE2E;return {art:h.integratedReview(),hash:h.hash()};});
  expect(before.art.equipment.flipY).toBe(true);expect(Math.cos(before.art.equipment.rotation)).toBeCloseTo(-1);
  expect(before.art.equipment.grip[1]).toBeCloseTo(mount==='float'?.5:age<3?.5:1-74/128);
  if(mount==='float'){
   const body=before.art.actors[0],weapon=before.art.equipment;
   expect(Math.hypot(weapon.x-body.x,weapon.y-body.y)).toBeGreaterThan(95);
  }
  expect(before.art.actors[0].flipX).toBe(true);
  await page.waitForTimeout(50);expect(await page.evaluate(()=>(window as any).__seedE2E.hash())).toBe(before.hash);
  expect(await page.evaluate(()=>(window as any).__seedE2E.integratedReview().equipment)).toEqual(before.art.equipment);
  rows.push({age,mount,...before});
 }
 await page.evaluate(()=>{const h=(window as any).__seedE2E;h.stageEvolution('resonant',4);h.primeSignature();h.aimReleaseReview(-150,0);});await frame(page);
 const beam=await page.evaluate(()=>{const h=(window as any).__seedE2E;return {fx:h.signatureFeedback(),art:h.integratedReview()};});
 expect(beam.fx.beams).toBe(1);expect(beam.art.equipment.flipY).toBe(true);expect(Math.cos(beam.art.equipment.rotation)).toBeCloseTo(-1);
 await page.screenshot({path:`test-results/browser/v32-beam-${height}-${lang}.png`});
 await page.evaluate(()=>{const h=(window as any).__seedE2E;h.streamingFixture(0,0,false,false,false);h.stageBossReview('fan');});await frame(page);
 const sample=()=>page.evaluate(()=>(window as any).__seedE2E.bossReviewState());
 const warning=await sample();
 expect(warning.actors[0].originY).toBe(118/128);
 await page.waitForTimeout(50);expect((await sample()).actors).toEqual(warning.actors);
 await page.evaluate(()=>(window as any).__seedE2E.advanceEvolution(2.15));await frame(page);
 const recover=await sample();expect(Number(recover.actors[0].frame)).toBe(0);expect(recover.actors[0].rotation).toBe(0);
 expect(recover.actors[0].y-recover.boss.y).toBeCloseTo(warning.actors[0].y-warning.boss.y);
 await page.screenshot({path:`test-results/browser/v32-grounded-${height}-${lang}.png`});
 await page.evaluate(()=>(window as any).__seedE2E.bossPhaseReview());await frame(page);
 const phase2=await sample();expect(phase2.boss.encounter.phase).toBe('phase-transition');expect(phase2.actors[0].tint).toBe(0xffc68c);
 writeFileSync(`test-results/browser/v32-presentation-${height}-${lang}.json`,JSON.stringify({classification:'STAGED_REAL_CANONICAL_RELEASES_NOT_HUMAN_ACCEPTANCE',rows,beam,warning,recover,phase2},null,2));
});
