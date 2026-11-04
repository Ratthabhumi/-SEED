import {test,expect} from '@playwright/test';
import {startRun} from './helpers';
for(const lang of ['en','th'] as const)test(`equip restores keyboard focus ${lang}`,async({page})=>{
 await page.addInitScript((lang)=>localStorage.setItem('seed-game-save-v1',JSON.stringify({schema:3,settings:{lang,tutorialCompleted:true},collection:{owned:['dawn','ward'],origins:['hunters'],equipped:{}}})),lang);
 await page.goto('/?e2e');
 const summary=page.locator('.title-legacy .legacy-collection > summary');await summary.focus();await page.keyboard.press('Tab');
 const equip=page.locator('.title-legacy [data-equip="dawn"]');await expect(equip).toBeFocused();await page.keyboard.press('Space');await expect(equip).toBeFocused();await expect(equip).toHaveAttribute('aria-pressed','true');
 await page.keyboard.press('Space');await expect(equip).toBeFocused();await expect(equip).toHaveAttribute('aria-pressed','false');
 await expect(page.locator('.legacy-progress')).toContainText('2/5');
 await expect(page.locator('[data-collectible="prism"]')).toContainText('1/2');
 await expect(page.locator('.legacy-preview svg')).toHaveCount(5);
 await page.screenshot({path:`test-results/v45-visible/collection-${lang}.png`});
});
for(const lang of ['en','th'] as const)for(const uiScale of [1,2] as const)test(`map identifies actual boss threat ${lang} ${uiScale}`,async({page})=>{
 await startRun(page,'EPOCH-GOLDEN-001',{lang,uiScale});await page.evaluate(()=>(window as any).__seedE2E.stageSpecRegression(false,true));await page.keyboard.press('Escape');
 await page.evaluate(()=>{const h=(window as any).__seedE2E;h.stageBossReview('slam');h.stageDefenseReview();h.bossPhaseReview();h.setAgeIndex(5);});await page.keyboard.press('M');
 await expect(page.locator('.civmap-site[data-threat="boss"]')).toHaveCount(1);
 const before=await page.evaluate(()=>(window as any).__seedE2E.snapshot());
 const target=page.locator('.civmap-site[data-threat="boss"]');await target.click();await expect(page.locator('#civmap-detail')).toContainText(lang==='th'?'บอส':'Boss');
 await expect(target).toBeFocused();
 expect(await page.evaluate(()=>(window as any).__seedE2E.snapshot())).toBe(before);
 const stateRow=page.locator('#civmap-detail .civmap-detail-row').first();await expect(stateRow).toBeInViewport();
 await expect(page.locator('#civmap-screen .btn.primary').last()).toBeInViewport();
 await page.screenshot({path:`test-results/v45-visible/base-threat-${lang}-${uiScale}.png`});
});
