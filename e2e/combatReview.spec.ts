import {test,expect} from '@playwright/test';
import {prepareSave,startRun,assertNoRawKeys} from './helpers';
import {writeFileSync} from 'node:fs';
for(const height of [720,1080])for(const lang of ['en','th'] as const)test(`owner combat review remains staged ${height} ${lang}`,async({page})=>{
 await page.setViewportSize({width:height===720?1280:1920,height});await prepareSave(page,{lang,tutorialCompleted:false});
 await page.goto('/?e2e=1&combatReview=1&qa=1');await page.locator('#seed-input').fill('EPOCH-GOLDEN-001');await page.locator('#start-btn').click();
 // Match startRun's existing startup contract before asserting review controls.
 await page.waitForFunction(()=>!!(window as any).__seedE2E?.snapshot&&!!document.querySelector('.hud')&&document.fonts.status==='loaded',undefined,{timeout:15000});
 await expect(page.locator('#combat-review')).toBeVisible();await expect(page.locator('#qa-panel')).toHaveCount(0);
 const press=(action:string)=>page.locator(`[data-review-action="${action}"]`).click();
 await press('bow');await expect.poll(()=>page.evaluate(()=>(window as any).__seedE2E.weaponMuzzleReview().release?.release?.pose.frame)).toBe(0);
 await press('near');await expect.poll(()=>page.evaluate(()=>(window as any).__seedE2E.weaponMuzzleReview().release?.release?.pose.frame)).toBe(10);
 const near=await page.evaluate(()=>(window as any).__seedE2E.weaponMuzzleReview());expect(near.art.mount).toBe('hand');
 await press('left');await expect.poll(()=>page.evaluate(()=>{const r=(window as any).__seedE2E.weaponMuzzleReview();return r.release?.release?.targetX<r.player[0];})).toBe(true);
 await press('right');await expect.poll(()=>page.evaluate(()=>{const r=(window as any).__seedE2E.weaponMuzzleReview();return r.release?.release?.targetX>r.player[0];})).toBe(true);
 await press('multi');await expect.poll(()=>page.evaluate(()=>(window as any).__seedE2E.weaponMuzzleReview().release?.release?.count)).toBe(2);
 await press('beam');await expect.poll(()=>page.evaluate(()=>(window as any).__seedE2E.weaponMuzzleReview().release?.type)).toBe('beam_fired');
 await press('boss');const initial=await page.evaluate(()=>(window as any).__seedE2E.bossReviewState().hp);
 await page.keyboard.down('w');await page.waitForTimeout(900);await page.keyboard.up('w');await page.waitForTimeout(700);
 expect(await page.evaluate(()=>(window as any).__seedE2E.bossReviewState().hp)).toBe(initial);
 await page.screenshot({path:`test-results/browser/v36-review-${height}-${lang}.png`});
 await press('world');await page.locator('#legacy-screen .card').first().click();await page.locator('#origin-screen .card').first().click();await page.locator('#child-intro-screen button').click();
 await expect.poll(()=>page.evaluate(()=>(window as any).__seedE2E.canonicalStressState().world)).toBe(2);
 await page.keyboard.press('Escape');await page.locator('#pause-restart-btn').click();await expect(page.locator('#combat-review')).toHaveCount(1);
 // The panel re-mounts on Restart; wait for its styled line-height (NaN before), same >=1.7 contract.
 await expect.poll(()=>page.locator('#combat-review').evaluate(root=>{const s=getComputedStyle(root);return parseFloat(s.lineHeight)/parseFloat(s.fontSize);}),{timeout:15000}).toBeGreaterThanOrEqual(1.7);
 const bounds=await page.locator('#combat-review').evaluate(root=>{const r=root.getBoundingClientRect();return {left:r.left,right:r.right,bottom:r.bottom,lineHeight:parseFloat(getComputedStyle(root).lineHeight),fontSize:parseFloat(getComputedStyle(root).fontSize)};});
 expect(bounds.left).toBeGreaterThanOrEqual(0);expect(bounds.right).toBeLessThanOrEqual(height===720?1280:1920);expect(bounds.bottom).toBeLessThanOrEqual(height);expect(bounds.lineHeight/bounds.fontSize).toBeGreaterThanOrEqual(1.7);
 await assertNoRawKeys(page);writeFileSync(`test-results/browser/v36-review-${height}-${lang}.json`,JSON.stringify({classification:'STAGED_OPERATOR_ROUTE_NOT_NATURAL_HUMAN_INPUT',near,bounds},null,2));
});
test('ordinary play and Human QA do not expose the combat review controls',async({page})=>{
 await startRun(page,'EPOCH-GOLDEN-001');await expect(page.locator('#combat-review')).toHaveCount(0);
 await page.route('**/__seed_qa/report',r=>r.fulfill({status:200,contentType:'application/json',body:'{"ok":true}'}));
 await page.goto('/?e2e=1&qa=1');await page.locator('#seed-input').fill('EPOCH-GOLDEN-001');await page.locator('#start-btn').click();
 await expect(page.locator('#qa-rec-indicator')).toBeVisible();await expect(page.locator('#qa-panel')).toBeHidden();
 await page.keyboard.press('F10');await expect(page.locator('#qa-panel')).toBeVisible();await expect(page.locator('#combat-review')).toHaveCount(0);
});
