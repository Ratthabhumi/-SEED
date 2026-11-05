import {test,expect} from '@playwright/test';
import {startRun,assertNoRawKeys} from './helpers';
for(const lang of ['en','th']as const)for(const scale of [1,2]as const)test(`visual weapon choices ${lang} scale${scale}`,async({page})=>{
 await page.setViewportSize({width:1280,height:720});await startRun(page,'EPOCH-GOLDEN-001',{lang,uiScale:scale});
 await page.evaluate(()=>(window as any).__seedE2E.grant(100));await expect(page.locator('#draft-screen .card')).toHaveCount(3);
 await assertNoRawKeys(page);for(const card of await page.locator('#draft-screen .card').all()){await expect(card.locator('.weapon-figure')).toBeVisible();expect(await card.evaluate(e=>getComputedStyle(e).overflowY)).not.toBe('auto');}
 if(scale===2){const bounds=await page.evaluate(()=>({cards:document.querySelector('#draft-screen .cards')!.getBoundingClientRect().bottom,actions:document.querySelector('#draft-screen .draft-agency')!.getBoundingClientRect().top}));expect(bounds.actions).toBeGreaterThanOrEqual(bounds.cards);}
 if(scale===1){for(const button of await page.locator('.card-select,.card-details,.card-reserve,#draft-screen .draft-agency button').all())await expect(button).toBeInViewport();expect(await page.locator('#draft-screen').evaluate(e=>e.scrollHeight<=e.clientHeight+2)).toBe(true);}
 const before=await page.evaluate(()=>(window as any).__seedE2E.draftFacts().taken);
 await page.locator('.card-details').first().click();await expect(page.locator('.draft-detail-panel')).toBeVisible();await page.keyboard.press('1');await page.keyboard.press('Enter');expect(await page.evaluate(()=>(window as any).__seedE2E.draftFacts().taken)).toBe(before);
 await page.keyboard.press('Escape');await expect(page.locator('.draft-detail-panel')).toHaveCount(0);await expect(page.locator('.card-details').first()).toBeFocused();
 await page.screenshot({path:`test-results/v53/choices-${lang}-${scale}.png`});await page.locator('.card-select').first().click();expect(await page.evaluate(()=>(window as any).__seedE2E.draftFacts().taken)).toBe(before+1);
});
test('legal second weapon renders, full checkpoint resumes original attempt and weapon identities',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await startRun(page,'EPOCH-GOLDEN-001');
 const first=await page.evaluate(()=>(window as any).__seedE2E.weaponsReview());expect(first.instances).toHaveLength(1);
 await page.evaluate(()=>(window as any).__seedE2E.stageWeaponOffer('energy'));await page.locator('.card-select').click();
 await expect.poll(()=>page.evaluate(()=>(window as any).__seedE2E.weaponsReview().extraArt.length)).toBe(1);
 const owned=await page.evaluate(()=>(window as any).__seedE2E.weaponsReview().instances.map((w:any)=>w.id));
 await page.keyboard.press('Escape');await page.locator('#pause-save-run').click();await expect(page.locator('#continue-run-btn')).toBeVisible();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('seed-game-save-v1')!));expect(saved.activeRun.attemptId).toBeGreaterThan(0);
 await page.locator('#continue-run-btn').click();await expect(page.locator('.hud')).toBeVisible();expect(await page.evaluate(()=>(window as any).__seedE2E.weaponsReview().instances.map((w:any)=>w.id))).toEqual(owned);
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('seed-game-save-v1')!).meta.nextAttempt)).toBe(saved.meta.nextAttempt);await expect.poll(()=>page.evaluate(()=>(window as any).__seedE2E.weaponsReview().extraArt.length)).toBe(1);expect(errors).toEqual([]);
});
