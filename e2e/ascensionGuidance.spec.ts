import {test,expect} from '@playwright/test';
import {startRun,resolveDrafts,assertNoRawKeys} from './helpers';
for(const lang of ['en','th'] as const) {
 test('map pin to draft advice and updated map ('+lang+')',async({page})=>{
 await page.setViewportSize({width:1920,height:1080});await startRun(page,'GUIDANCE-FLOW',{lang});await page.keyboard.press('T');
 await expect(page.locator('#techmap-screen')).toBeVisible();
 // A future node, genuine map selection and pin. Overview fits the actual graph.
 await page.locator('.techmap-btn-overview').click();
 const future=page.locator('.techmap-node.future').first(); const id=await future.getAttribute('data-node-id');
 await future.click();await page.locator('.techmap-pin-btn').click();await expect(page.locator('.techmap-pin')).toBeVisible();
 await page.keyboard.press('T');
 await page.evaluate(()=>{const h=(window as unknown as {__seedE2E:{grant:(n:number)=>void}}).__seedE2E;h.grant(100);});
 await expect(page.locator('#draft-screen .card')).toHaveCount(3);await expect(page.locator('.draft-goal')).toBeVisible();
 await expect(page.locator('.card-path-reason')).toHaveCount(3);await assertNoRawKeys(page);
 await page.screenshot({path:'test-results/browser/pinned-draft-'+lang+'.png'});
 // Map can be reviewed during a pending choice without consuming the choice.
 await page.locator('#draft-goal-map').click();await expect(page.locator('#techmap-screen')).toBeVisible();await expect(page.locator('#draft-screen')).toBeHidden();
 await page.keyboard.press('T');await expect(page.locator('#draft-screen')).toBeVisible();
 await expect(page.locator('.goal-no-relevant')).toBeVisible();
 // Change to an actually offered goal through the map, not injected cards.
 const offered=await page.evaluate(()=>{const h=(window as unknown as {__seedE2E:{snapshot:()=>string}}).__seedE2E;return (JSON.parse(h.snapshot()).lvl[5][0] as string).replace(/:(COMMON|UNCOMMON|RARE|MYTHIC):.*$/,'');});
 await page.locator('#draft-goal-map').click();await page.locator('.techmap-btn-overview').click();await page.locator('[data-node-id="'+offered+'"]').click();await page.locator('.techmap-pin-btn').click();await page.keyboard.press('T');
 await expect(page.locator('.card[data-path-relation="complete"]')).toHaveCount(1);await expect(page.locator('.card[data-path-relation="complete"] .card-path-reason')).toContainText(lang==='en'?'Completes':'สำเร็จ');
 await page.screenshot({path:'test-results/browser/recommended-draft-'+lang+'.png'});
 await page.locator('.card[data-path-relation="complete"] .card-select').click();
 await resolveDrafts(page,20);await page.keyboard.press('T');await expect(page.locator('.techmap-pin')).toBeVisible();await expect(page.locator('[data-node-id="'+id+'"]')).toBeAttached();expect(await page.locator('.techmap-goal-progress').innerText()).toMatch(/([1-9]\d*)\/\1/);
 await page.screenshot({path:'test-results/browser/pinned-map-'+lang+'.png'});
 });
 test('child intro explains actual inheritance and world condition ('+lang+')',async({page})=>{
 await startRun(page,'CHILD-INTRO',{lang,uiScale:2});
 await page.evaluate(()=>(window as unknown as {__seedE2E:{readyAscend:()=>void}}).__seedE2E.readyAscend());
 await page.locator('.hud-ascend button').click();await page.locator('#legacy-screen .card').first().focus();await page.keyboard.press('Enter');await expect(page.locator('#origin-screen')).toBeVisible();await page.locator('#origin-screen .card').first().click();
 await expect(page.locator('#child-intro-screen')).toBeVisible();await expect(page.locator('.child-intro')).toContainText('×0.8');await expect(page.locator('.child-intro')).toContainText(lang==='en'?'Inherited power':'พลังสืบทอด');await assertNoRawKeys(page);
 expect(await page.locator('.child-intro').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
 await page.screenshot({path:'test-results/browser/child-intro-'+lang+'.png'});await page.locator('#child-intro-screen button').click();await expect(page.locator('#child-intro-screen')).toHaveCount(0);
 await page.evaluate(()=>(window as unknown as {__seedE2E:{readyAscend:()=>void}}).__seedE2E.readyAscend());await page.locator('.hud-ascend button').click();await page.locator('#legacy-screen .card').first().click();await page.locator('#origin-screen .card').first().click();await expect(page.locator('.child-intro')).toContainText('75%');await page.screenshot({path:'test-results/browser/frontier-intro-'+lang+'.png'});await page.keyboard.press('Escape');await expect(page.locator('#child-intro-screen')).toHaveCount(0);
 });
}

test('combo goal with no relevant choices is truthful and unpin works',async({page})=>{await startRun(page,'GUIDANCE-EMPTY');await page.keyboard.press('T');await page.locator('[data-combo-id="metallurgy"]').click();await expect(page.locator('.techmap-pin')).toContainText('Metallurgy');await page.keyboard.press('T');await page.evaluate(()=>(window as unknown as {__seedE2E:{stageNoAlternativeDraft:()=>void}}).__seedE2E.stageNoAlternativeDraft());await expect(page.locator('.goal-no-relevant')).toBeVisible();await expect(page.locator('#draft-reroll-btn')).toBeDisabled();await page.screenshot({path:'test-results/browser/no-relevant-combo.png'});await page.locator('#draft-goal-map').click();await page.locator('.techmap-pin-group button').click();await page.keyboard.press('T');await expect(page.locator('.draft-goal')).toHaveCount(0);await expect(page.locator('.card')).toHaveCount(3);});
