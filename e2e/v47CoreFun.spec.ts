import {test,expect} from '@playwright/test';
import {startRun,prepareSave,assertNoRawKeys} from './helpers';

for(const lang of ['en','th'] as const)test(`Space cannot select a focused Outpost decision ${lang}`,async({page})=>{
 await startRun(page,'EPOCH-GOLDEN-001',{lang});
 await page.keyboard.down('w');
 await page.evaluate(()=>(window as any).__seedE2E.stageSpecRegression(false,false));
 const dialog=page.locator('#spec-screen');await expect(dialog).toBeVisible();
 await page.locator('.terr-spec-btn:not(:disabled)').first().focus();
 await page.keyboard.down('Space');await page.keyboard.down('Space');await page.keyboard.up('Space');
 await expect(dialog).toBeVisible();
 await page.keyboard.up('w');await page.keyboard.press('Enter');await expect(dialog).toHaveCount(0);
});

test('map-known approaching POI has world art before discovery or chunk entry',async({page})=>{
 await startRun(page,'EPOCH-GOLDEN-001');
 const site=await page.evaluate(()=>(window as any).__seedE2E.stagePoiEdge());expect(site.known).toBe(false);
 await expect.poll(()=>page.evaluate(p=>(window as any).__seedE2E.siteArtReview().some((a:any)=>Math.abs(a.x-p.x)<1&&Math.abs(a.y-p.y-8)<1),site)).toBe(true);
 await page.screenshot({path:'test-results/v47-visible/poi-before-discovery.png'});
});

for(const lang of ['en','th'] as const)test(`held gameplay input cannot cross mandatory world decisions ${lang}`,async({page})=>{
 await startRun(page,'EPOCH-GOLDEN-001',{lang});
 await page.evaluate(()=>(window as any).__seedE2E.readyAscend());
 await page.keyboard.down('w');await page.keyboard.down('Space');
 await page.locator('.hud-ascend button').click();await expect(page.locator('#legacy-screen')).toBeVisible();
 await page.locator('#legacy-screen .card').first().focus();
 await page.keyboard.down('Space');await page.keyboard.up('Space');await expect(page.locator('#legacy-screen')).toBeVisible();
 await page.keyboard.down('Enter');await expect(page.locator('#origin-screen')).toBeVisible();
 await page.keyboard.down('Enter');await expect(page.locator('#origin-screen')).toBeVisible();await page.keyboard.up('Enter');await page.keyboard.up('w');
 await page.keyboard.press('Tab');await page.keyboard.press('Enter');await expect(page.locator('#origin-screen')).toHaveCount(0);
});

test('actual floating bow release leaves body idle and keeps canonical muzzle',async({page})=>{
 await startRun(page,'EPOCH-GOLDEN-001');await page.evaluate(()=>(window as any).__seedE2E.stageEvolution('hunters',0));
 await page.evaluate(()=>(window as any).__seedE2E.aimReleaseReview(300,0));
 await expect.poll(()=>page.evaluate(()=>(window as any).__seedE2E.referenceAnimation()?.action)).toBe('idle');
 const snapshot=await page.evaluate(()=>(window as any).__seedE2E.snapshot());
 await page.screenshot({path:'test-results/v47-visible/floating-bow.png'});
 expect(await page.evaluate(()=>(window as any).__seedE2E.snapshot())).toBe(snapshot);
});

for(const lang of ['en','th'] as const)for(const width of [1280,1920,2550])test(`main collection and pause fit ${lang} ${width}`,async({page})=>{
 await page.setViewportSize({width,height:width===1280?720:width===1920?1080:1272});await prepareSave(page,{lang});await page.goto('/?e2e');
 const collection=page.locator('.title-legacy .legacy-collection');await expect(collection).toBeVisible();
 await expect(collection).toHaveAttribute('open','');await expect(collection.locator('.legacy-card')).toHaveCount(5);
 const overflow=await page.locator('.title-layout').evaluate(e=>({h:e.scrollHeight-e.clientHeight,w:e.scrollWidth-e.clientWidth}));expect(overflow.h).toBeLessThanOrEqual(1);expect(overflow.w).toBeLessThanOrEqual(1);
 await assertNoRawKeys(page);await page.screenshot({path:`test-results/v47-visible/main-${lang}-${width}.png`});
 await page.locator('#start-btn').click();await page.waitForFunction(()=>!!(window as any).__seedE2E);
 await page.keyboard.press('Escape');await expect(page.locator('#pause-screen')).toBeVisible();await expect(page.locator('#pause-screen .legacy-collection')).toHaveCount(0);
 const p=await page.locator('#pause-screen .panel').evaluate(e=>({h:e.scrollHeight-e.clientHeight,w:e.scrollWidth-e.clientWidth}));expect(p.w).toBeLessThanOrEqual(1);expect(p.h).toBeLessThanOrEqual(1);
 await page.screenshot({path:`test-results/v47-visible/pause-${lang}-${width}.png`});
});
