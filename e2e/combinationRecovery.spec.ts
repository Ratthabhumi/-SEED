import {test,expect} from '@playwright/test';
import {startRun,assertNoRawKeys} from './helpers';
for(const lang of ['en','th'] as const)test('combination mission → map → actual two recipe picks '+lang,async({page})=>{
  await page.setViewportSize({width:1280,height:720}); await startRun(page,'EPOCH-GOLDEN-001',{lang});
  await page.evaluate(()=>(window as any).__seedE2E.stageCombinationRecovery());
  await expect(page.locator('#combination-map')).toBeVisible();
  await page.screenshot({path:'test-results/browser/combination-objective-'+lang+'.png'});
  await page.locator('#combination-map').click();
  await expect(page.locator('#techmap-screen .combination-route')).toBeVisible();
  await page.screenshot({path:'test-results/browser/combination-map-'+lang+'.png'});
  await page.keyboard.press('Escape');
  await page.evaluate(()=>(window as any).__seedE2E.requestCombinationReviewDraft());
  for(let i=0;i<2;i++){
    const next=await page.evaluate(()=>(window as any).__seedE2E.combinationReview().route.next.id);
    await page.locator(`#draft-screen .card[data-node-id="${next}"] .card-select`).click();
  }
  expect(await page.evaluate(()=>(window as any).__seedE2E.combinationReview().breakthroughs)).toContain('metallurgy');
  await assertNoRawKeys(page);
});
