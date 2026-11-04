import {test,expect} from '@playwright/test';
import {mkdirSync} from 'node:fs';
for(const lang of ['en','th'] as const)for(const [width,height] of [[1280,720],[1920,1080],[2550,1272]])test(`V44 earned collection preview/equip ${lang} ${width}`,async({page})=>{
 await page.setViewportSize({width,height});
 await page.addInitScript((lang)=>localStorage.setItem('seed-game-save-v1',JSON.stringify({schema:3,settings:{lang,tutorialCompleted:true},collection:{owned:['dawn','ward','prism','star'],origins:['hunters','engineers'],equipped:{emblem:'ward',ornament:'star',trail:'prism'}}})),lang);
 await page.goto('/?e2e');await expect(page.locator('.legacy-card')).toHaveCount(5);
 const cards=page.locator('.title-legacy .legacy-card');
 const equip=page.locator('.title-legacy [data-equip="dawn"]');await equip.focus();await page.keyboard.press('Space');await expect(equip).toHaveAttribute('aria-pressed','true');
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('seed-game-save-v1')!).collection.equipped.emblem)).toBe('dawn');
 await page.keyboard.press('Space');await expect(equip).toHaveAttribute('aria-pressed','false');
 for(const card of await cards.all())expect(await card.evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);
 await page.locator('#seed-input').fill('EPOCH-GOLDEN-001');await page.locator('#start-btn').click();await expect(page.locator('.hud')).toBeVisible();
 const state=()=>page.evaluate(()=>(window as any).__seedE2E.legacyCollectionReview());
 expect((await state()).collection.equipped).toEqual({trail:'prism',ornament:'star'});
 await page.keyboard.press('Escape');await expect(page.locator('#pause-screen .legacy-collection')).toHaveCount(0);
 const canonical=await page.evaluate(()=>(window as any).__seedE2E.snapshot());
 await page.locator('#pause-reducedEffects').setChecked(true);
 expect((await state()).collection.equipped.emblem).toBeUndefined();
 expect(await page.evaluate(()=>(window as any).__seedE2E.snapshot())).toBe(canonical);
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('seed-game-save-v1')!).collection.owned.length)).toBe(4);
 const panel=page.locator('#pause-screen .panel');expect((await panel.boundingBox())!.width).toBeLessThanOrEqual(width);
 mkdirSync('test-results/v44-visible',{recursive:true});await page.screenshot({path:`test-results/v44-visible/collection-${width}-${lang}.png`});
 await page.keyboard.press('Escape');await expect(page.locator('#pause-screen')).toHaveCount(0);
 if(lang==='en'&&width===1280){
  await page.evaluate(()=>(window as any).__seedE2E.readyAscend());await page.locator('.hud-ascend button').click();await page.locator('#legacy-screen .card').first().click();await page.locator('#origin-screen .card').first().click();
  await expect(page.locator('#child-intro-screen')).toBeVisible();expect((await state()).world).toBe(2);
  expect((await state()).collection.equipped).toEqual({trail:'prism',ornament:'star'});expect((await state()).collection.owned).toContain('chronicle');
 }
});
