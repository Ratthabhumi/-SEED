import {test,expect} from '@playwright/test';
import {prepareSave,assertNoRawKeys} from './helpers';
for(const lang of ['en','th'] as const)for(const uiScale of [1,2] as const)test(`V47 reachable main/pause/draft ${lang} scale ${uiScale}`,async({page})=>{
 await page.setViewportSize({width:uiScale===2?1280:1920,height:uiScale===2?720:1080});
 await prepareSave(page,{lang,uiScale,contrast:uiScale===2?'high':'normal',reducedEffects:uiScale===2});await page.goto('/?e2e');
 const start=page.locator('#start-btn');await expect(start).toBeInViewport();
 const summary=page.locator('.title-legacy .legacy-collection summary');await summary.focus();await page.keyboard.press('Tab');
 // All locked cosmetics have disabled equip controls; Tab reaches the Archive.
 await expect(page.locator('#archive-panel summary')).toBeFocused();await expect(page.locator('#archive-panel summary')).toBeInViewport();
 await assertNoRawKeys(page);await page.screenshot({path:`test-results/v47-visible/main-${lang}-scale${uiScale}.png`});
 await start.click();await page.waitForFunction(()=>!!(window as any).__seedE2E);
 await page.keyboard.press('Escape');const snapshot=await page.evaluate(()=>(window as any).__seedE2E.snapshot());
 const controls=page.locator('#pause-screen button');await controls.last().focus();await expect(controls.last()).toBeInViewport();
 await page.keyboard.press('Tab');await expect(controls.first()).toBeFocused();await expect(controls.first()).toBeInViewport();
 expect(await page.evaluate(()=>(window as any).__seedE2E.snapshot())).toBe(snapshot);await page.keyboard.press('Escape');
 await page.evaluate(()=>(window as any).__seedE2E.grant(30));await expect(page.locator('#draft-screen')).toBeVisible();
 const cards=page.locator('#draft-screen .card');await expect(cards).toHaveCount(3);await assertNoRawKeys(page);
 await page.screenshot({path:`test-results/v47-visible/draft-${lang}-scale${uiScale}.png`});
 await page.keyboard.press('Tab');const focused=page.locator(':focus');await expect(focused).toBeInViewport();await page.keyboard.press('Space');await expect(page.locator('#draft-screen')).toBeVisible();
});
