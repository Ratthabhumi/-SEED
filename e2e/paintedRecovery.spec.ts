import {test,expect} from '@playwright/test';
import {startRun} from './helpers';
import {writeFileSync} from 'node:fs';
test.use({video:{mode:'on',size:{width:1280,height:720}}});
const frame=async(page:any)=>page.evaluate(()=>new Promise<void>(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r()))));
for(const height of [720,1080])for(const lang of ['en','th'] as const)test(`painted default recovery, HUD and modes ${height} ${lang}`,async({page})=>{
 await page.setViewportSize({width:height===720?1280:1920,height});
 await startRun(page,'EPOCH-GOLDEN-001',{lang,uiScale:2});
 const rows=[];
 for(const graphics of ['normal','reduced','contrast']){
  await page.evaluate(mode=>{const h=(window as any).__seedE2E;h.streamingFixture(0,0,false,mode==='reduced',mode==='contrast');h.stageBossReview('fan');},graphics);
  await frame(page);
  const before=await page.evaluate(()=>(window as any).__seedE2E.bossReviewState());
  expect(before.actors).toHaveLength(1);expect(before.actors[0].texture).toBe('boss-v2');expect(Number(before.actors[0].frame)).toBe(3);
  await page.waitForTimeout(80);expect(await page.evaluate(()=>(window as any).__seedE2E.bossReviewState().actors)).toEqual(before.actors);
  // Rejected artwork isn't loaded in the default production presentation.
  expect(await page.evaluate(()=>performance.getEntriesByType('resource').some(r=>r.name.includes('boss-rig')))).toBe(false);
  const rects=await page.evaluate(()=>['.hud-stats','.boss-bar','#boss-encounter','.hud-top-left','.hud-top-right'].map(selector=>{
   const b=document.querySelector(selector)!.getBoundingClientRect();return {selector,x:b.x,y:b.y,right:b.right,bottom:b.bottom};
  }));
  expect(rects[0]!.bottom).toBeLessThanOrEqual(rects[1]!.y);expect(rects[1]!.bottom).toBeLessThanOrEqual(rects[2]!.y);
  expect(rects[3]!.right).toBeLessThanOrEqual(rects[1]!.x);expect(rects[1]!.right).toBeLessThanOrEqual(rects[4]!.x);
  await page.screenshot({path:`test-results/browser/v3-boss-${height}-${lang}-${graphics}-warning.png`});
  // Fixed-step phase changes consume complete ticks; sample safely after the
  // .32s impact hold rather than exactly on its quantized boundary.
  await page.evaluate(()=>(window as any).__seedE2E.advanceEvolution(2.15));await frame(page);
  const after=await page.evaluate(()=>(window as any).__seedE2E.bossReviewState());
  expect(after.boss.encounter.phase).toBe('recover');expect(Number(after.actors[0].frame)).toBe(0);expect(after.projectiles).toBe(6);
  await page.screenshot({path:`test-results/browser/v3-boss-${height}-${lang}-${graphics}-recovery.png`});
  rows.push({graphics,rects,before,after});
 }
 writeFileSync(`test-results/browser/v3-boss-${height}-${lang}.json`,JSON.stringify({classification:'STAGED_PAINTED_BASELINE_RECOVERY_NOT_HUMAN_ACCEPTANCE',rows},null,2));
});
test('painted defeat cell, child world and restart clear the presentation',async({page})=>{
 await startRun(page,'EPOCH-GOLDEN-001');
 await page.evaluate(()=>(window as any).__seedE2E.stageBossReview('cross'));await frame(page);
 await page.evaluate(()=>(window as any).__seedE2E.bossDefeatArtReview());await frame(page);
 await page.evaluate(()=>(window as any).__seedE2E.advanceEvolution(.35));await frame(page);
 const death=await page.evaluate(()=>(window as any).__seedE2E.bossReviewState().actors);
 expect(death).toHaveLength(1);expect(Number(death[0].frame)).toBe(7);expect(death[0].alpha).toBeGreaterThan(0);expect(death[0].alpha).toBeLessThan(1);
 await page.screenshot({path:'test-results/browser/v3-painted-defeat.png'});
 await page.evaluate(()=>(window as any).__seedE2E.advanceEvolution(.5));await frame(page);
 expect(await page.evaluate(()=>(window as any).__seedE2E.bossReviewState().actors)).toHaveLength(0);
 await page.evaluate(()=>(window as any).__seedE2E.readyAscend());await page.getByRole('button',{name:'Enter a new world',exact:true}).click();
 await page.locator('#legacy-screen .card').first().click();await page.locator('#origin-screen .card').first().click();await page.locator('#child-intro-screen button').click();await frame(page);
 expect(await page.evaluate(()=>(window as any).__seedE2E.bossReviewState().actors)).toHaveLength(0);
 await page.evaluate(()=>(window as any).__seedE2E.stageBossReview('fan'));await frame(page);
 expect(await page.evaluate(()=>(window as any).__seedE2E.bossReviewState().actors)).toHaveLength(1);
 await page.keyboard.press('Escape');await frame(page);await page.keyboard.press('Escape');await page.locator('#pause-restart-btn').click();await frame(page);
 expect(await page.evaluate(()=>(window as any).__seedE2E.bossReviewState().actors)).toHaveLength(0);
});
