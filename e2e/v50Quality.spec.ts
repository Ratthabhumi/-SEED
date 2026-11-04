import {test,expect} from '@playwright/test';
import {startRun,assertNoRawKeys} from './helpers';

for(const lang of ['en','th'] as const)test(`age acknowledgement survives reading and held input before queued choice ${lang}`,async({page})=>{
 await startRun(page,'EPOCH-EXPAND-01',{lang});
 await page.keyboard.press('Escape');
 await page.evaluate(()=>(window as any).__seedE2E.readyExpansion());
 await page.keyboard.press('Escape');
 const age=page.locator('#age-screen');await expect(age).toBeVisible();
 // Real owner sequence: movement/dash while the timed age screen appears.
 await page.keyboard.down('w');await page.keyboard.down('Space');
 await page.waitForTimeout(1800);
 await expect(age).toBeVisible();await expect(page.locator('#expansion-screen')).toHaveCount(0);
 await page.screenshot({path:`test-results/v50-visible/age-reading-${lang}.png`});
 await page.keyboard.up('Space');await page.keyboard.up('w');
 await age.locator('button').focus();await page.keyboard.down('Enter');
 await expect(age).toHaveCount(0);await expect(page.locator('#expansion-screen')).toBeVisible();
 await page.keyboard.down('Enter');await expect(page.locator('#expansion-screen')).toBeVisible();
 await page.keyboard.up('Enter');await page.keyboard.press('Tab');await page.keyboard.press('Enter');
 await expect(page.locator('#expansion-screen')).toHaveCount(0);
 await assertNoRawKeys(page);
});

test('movement facing survives independently aimed floating shots and idle',async({page})=>{
 await startRun(page,'EPOCH-GOLDEN-001');
 await page.evaluate(()=>(window as any).__seedE2E.stageEvolution('hunters',0));
 await page.evaluate(()=>(window as any).__seedE2E.resumeCombatReview());
 await page.keyboard.down('a');
 await expect.poll(()=>page.evaluate(()=>(window as any).__seedE2E.actorPresentation()[0]?.flipX)).toBe(true);
 // Fire backward while still holding movement; the weapon follows the target.
 const right=await page.evaluate(()=>(window as any).__seedE2E.aimReleaseReview(300,0));
 expect(right.facing).toBeUndefined();
 await page.evaluate(()=>(window as any).__seedE2E.resumeCombatReview());
 await page.waitForTimeout(300);
 await expect.poll(()=>page.evaluate(()=>(window as any).__seedE2E.referenceAnimation()?.action)).toBe('walk');
 await page.keyboard.up('a');
 await expect.poll(()=>page.evaluate(()=>(window as any).__seedE2E.actorPresentation()[0]?.flipX)).toBe(true);
 for(const [x,y] of [[0,-300],[300,0],[0,300]]){
  const shot=await page.evaluate(([x,y])=>(window as any).__seedE2E.aimReleaseReview(x,y),[x,y]);
  expect(shot.facing).toBeUndefined();
  await expect.poll(()=>page.evaluate(()=>(window as any).__seedE2E.actorPresentation()[0]?.flipX)).toBe(true);
 }
 await page.screenshot({path:'test-results/v50-visible/body-left-bow-independent.png'});
});

test('Eclipse high contrast and reduced effects retain readable geometry at Thai 200%',async({page})=>{
 await page.setViewportSize({width:1280,height:720});
 await startRun(page,'EPOCH-GOLDEN-001',{lang:'th',uiScale:2,contrast:'high',reducedEffects:true});
 await page.evaluate(()=>(window as any).__seedE2E.readyAscend());await page.locator('.hud-ascend button').click();
 await page.locator('#legacy-screen .card').first().click();await page.locator('#origin-screen .card').first().click();
 const dialog=page.locator('#child-intro-screen');await expect(dialog).toBeVisible();
 expect(await dialog.locator('.panel').evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);
 await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);
 const review=await page.evaluate(()=>(window as any).__seedE2E.worldPresentationReview());
 expect(review.theme.ground).toBe(0xffffff);expect(review.theme.architecture).toBe(0xffffff);
 await assertNoRawKeys(page);await page.screenshot({path:'test-results/v50-visible/eclipse-high-contrast-th-200.png'});
});

for(const lang of ['en','th'] as const)for(const width of [1280,1920,2550])test(`grounded POI and Eclipse entry ${lang} ${width}`,async({page})=>{
 await page.setViewportSize({width,height:width===1280?720:width===1920?1080:1272});
 await startRun(page,'EPOCH-GOLDEN-001',{lang});
 await page.evaluate(()=>(window as any).__seedE2E.stagePoiEdge());
 await expect.poll(()=>page.evaluate(()=>(window as any).__seedE2E.siteArtReview().length)).toBeGreaterThan(0);
 await page.screenshot({path:`test-results/v50-visible/poi-${lang}-${width}.png`});
 await page.evaluate(()=>(window as any).__seedE2E.readyAscend());await page.locator('.hud-ascend button').click();
 await page.locator('#legacy-screen .card').first().click();await page.locator('#origin-screen .card').first().click();
 await expect(page.locator('.world-theme')).toContainText(lang==='en'?'Eclipse Frontier':'พรมแดนอุปราคา');
 await expect(page.locator('.child-intro')).toContainText('×0.8');await assertNoRawKeys(page);
 await page.screenshot({path:`test-results/v50-visible/eclipse-entry-${lang}-${width}.png`});
 await page.locator('#child-intro-screen button').click();
 await expect.poll(()=>page.evaluate(()=>(window as any).__seedE2E.worldPresentationReview().terrain.length)).toBeGreaterThan(0);
 const theme=await page.evaluate(()=>(window as any).__seedE2E.worldPresentationReview());
 expect(theme.world).toBe(2);expect(theme.terrain.every((t:number)=>t===theme.theme.ground)).toBe(true);
 expect(theme.landmarks.every((t:number)=>t===theme.theme.architecture)).toBe(true);
 expect(await page.evaluate(()=>(window as any).__seedE2E.actorPresentation()[0]?.tint)).toBe(0xffffff);
 await page.screenshot({path:`test-results/v50-visible/eclipse-${lang}-${width}.png`});
});
