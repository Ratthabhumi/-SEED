import {test,expect} from '@playwright/test';
import {startRun} from './helpers';
import {mkdirSync,writeFileSync} from 'node:fs';
import {readPreviewBuild} from '../scripts/read-preview-build.mjs';
const tag=process.env.SEED_V43_TAG??'after',out='test-results/v43-visible';
for(const [width,height] of [[1280,720],[1920,1080],[2550,1272]])for(const lang of ['en','th'] as const){
 test(`V43 combat focus ${width} ${lang}`,async({page})=>{
  mkdirSync(out,{recursive:true});await page.setViewportSize({width,height});await startRun(page,'EPOCH-GOLDEN-001',{lang});
  await page.evaluate(()=>(window as any).__seedE2E.stageBossReview('slam'));
  const stats=await page.locator('.hud-stats').boundingBox(),bar=await page.locator('.boss-bar').boundingBox();
  expect(stats!.y+stats!.height).toBeLessThanOrEqual(bar!.y);
  if(tag!=='before')await expect(page.locator('.command-hint')).toContainText('F');
  const build=await readPreviewBuild('http://127.0.0.1:4173');
  await page.screenshot({path:`${out}/${tag}-${width}-${lang}.png`});
  writeFileSync(`${out}/${tag}-${width}-${lang}.json`,JSON.stringify({classification:'STAGED_BROWSER_CAPTURE_NOT_HUMAN_OR_PHYSICAL_ACCEPTANCE',build,stats,bar,viewport:{width,height}},null,2));
 });
}
for(const lang of ['en','th'] as const)test(`held movement releases through an outpost picker ${lang}`,async({page})=>{
 await startRun(page,'EPOCH-GOLDEN-001',{lang});
 await page.keyboard.down('w');
 await page.evaluate(()=>(window as any).__seedE2E.stageSpecRegression(false,true));
 await expect(page.locator('#spec-screen')).toBeVisible();await page.keyboard.up('w');
 await page.keyboard.press('Escape');await expect(page.locator('#spec-screen')).toHaveCount(0);
 const pos=()=>page.evaluate(()=>JSON.parse((window as any).__seedE2E.snapshot()).p.slice(0,2));
 await page.waitForTimeout(150);const stopped=await pos();await page.waitForTimeout(200);expect(await pos()).toEqual(stopped);
 await page.keyboard.down('w');await expect.poll(async()=>(await pos())[1]).toBeLessThan(stopped[1]-5);await page.keyboard.up('w');
});
