import {test,expect} from '@playwright/test';
import {startRun} from './helpers';
import {mkdirSync,writeFileSync} from 'node:fs';
import {readPreviewBuild} from '../scripts/read-preview-build.mjs';
const tag=process.env.SEED_V41_TAG??'candidate',out='test-results/v41-visible';
for(const [width,height] of [[1280,720],[1920,1080]])for(const lang of ['en','th'] as const){
 test(`encounter alerts protect play focus and Space progress stays truthful ${height} ${lang}`,async({page})=>{
  mkdirSync(out,{recursive:true});await page.setViewportSize({width,height});await startRun(page,'EPOCH-GOLDEN-001',{lang});
  const build=await readPreviewBuild('http://127.0.0.1:4173');
  await expect(page.locator('.next-action')).toContainText(lang==='th'?'ขั้นต่อไป':'Next step');
  await page.evaluate(()=>{const h=(window as any).__seedE2E;h.notificationReset();h.stageBossReview('slam');h.notificationBurst(3,true);});
  await page.waitForTimeout(100);
  const counts=await page.evaluate(()=>(window as any).__seedE2E.notificationCounts());
  const rect=await page.locator('#notification-stack').boundingBox();
  await page.screenshot({path:`${out}/${tag}-boss-${height}-${lang}.png`});
  writeFileSync(`${out}/${tag}-boss-${height}-${lang}.json`,JSON.stringify({classification:'STAGED_UI_REGRESSION_NOT_HUMAN_ACCEPTANCE',build,counts,rect,viewport:{width,height}},null,2));
  expect(counts.visible).toBe(1);expect(counts.queued).toBe(2);
  expect(rect!.x+rect!.width).toBeLessThan(width*.35);
  await page.evaluate(()=>(window as any).__seedE2E.stageEvolution('hunters',5));
  await expect(page.locator('.knowledge-nums')).not.toContainText('/');
  await expect(page.locator('.knowledge-card .mini-bar')).toBeHidden();
  await page.screenshot({path:`${out}/${tag}-space-${height}-${lang}.png`});
  await page.evaluate(()=>(window as any).__seedE2E.stageEvolution('hunters',0));
  await expect(page.locator('.knowledge-nums')).toContainText('/ 500');
  await expect(page.locator('.knowledge-card .mini-bar')).toBeVisible();
 });
}
