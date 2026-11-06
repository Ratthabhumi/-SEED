import fs from 'node:fs';
import {test,expect} from '@playwright/test';
import {startRun,assertNoRawKeys} from './helpers';
for(const lang of ['en','th']as const)for(const width of [1280,1920,2550])test(`upgrade consequences use real hit values ${lang} ${width}`,async({page})=>{
 await page.setViewportSize({width,height:width===1280?720:width===1920?1080:1272});await startRun(page,'EPOCH-GOLDEN-001',{lang});
 await page.evaluate(()=>(window as any).__seedE2E.grant(100));await expect(page.locator('#draft-screen')).toBeVisible();
 const damage=page.locator('.card').filter({has:page.locator('.choice-outcome',{hasText:'12 → 13.44'})});
 await expect(damage).toHaveCount(1);await damage.locator('.card-details').click();await expect(page.locator('.draft-detail-panel .card-delta')).toContainText('×');
 await expect(page.locator('.draft-detail-panel .card-combat-change')).toContainText('12 → 13.44');await page.keyboard.press('Escape');
 for(const action of await page.locator('.card-select,.card-reserve').all())await expect(action).toBeInViewport();
 await assertNoRawKeys(page);await page.screenshot({path:`test-results/v52-visible/choice-${lang}-${width}.png`});
 const before=await page.evaluate(()=>(window as any).__seedE2E.draftFacts().taken);
 await damage.locator('.card-select').focus();await page.keyboard.press('Enter');
 expect(await page.evaluate(()=>(window as any).__seedE2E.draftFacts().taken)).toBe(before+1);
});
for(const width of [1280,1920,2550])test(`world readability audit ${width}`,async({page})=>{
 await page.setViewportSize({width,height:width===1280?720:width===1920?1080:1272});await startRun(page,'EPOCH-GOLDEN-001',{lang:width===1920?'en':'th'});
 await page.evaluate(()=>(window as any).__seedE2E.stagePoiEdge());await page.screenshot({path:`test-results/v52-audit/exploration-${width}.png`});
 await page.evaluate(()=>(window as any).__seedE2E.stageActorReview(true));await page.screenshot({path:`test-results/v52-audit/dense-${width}.png`});
 await page.evaluate(()=>(window as any).__seedE2E.stageBossReview('cross'));await expect(page.locator('#boss-encounter')).toBeVisible();
 await page.screenshot({path:`test-results/v52-audit/boss-${width}.png`});await assertNoRawKeys(page);
});

test('source-backed costumes keep actual hero size and Origin/Age identities',async({page})=>{
 await startRun(page,'EPOCH-GOLDEN-001');
 for(const [index,origin]of ['hunters','engineers','resonant','sentinels'].entries()){
  await page.evaluate(origin=>(window as any).__seedE2E.stageEvolution(origin,2),origin);
  await expect.poll(()=>page.evaluate(()=>(window as any).__seedE2E.actorPresentation()[0]?.texture)).toBe('hero-neutral');
  const body=await page.evaluate(()=>(window as any).__seedE2E.actorPresentation()[0]);
  expect(body.width).toBe(126);expect(body.height).toBe(126);expect(Number(body.frame)).toBe(index*6+2);
 }
 await page.screenshot({path:'test-results/v52-visible/source-costume.png'});
});

test('paired starting mines remain visible with high contrast and reduced effects',async({page})=>{
 await page.setViewportSize({width:1280,height:720});await startRun(page,'EPOCH-GOLDEN-001',{lang:'th',contrast:'high',reducedEffects:true});
 // Hunters owns Field in the original configured starting pair.
 expect(await page.evaluate(()=>(window as any).__seedE2E.weaponsReview().instances.some((w:any)=>w.family==='field'))).toBe(true);
 await expect.poll(()=>page.evaluate(()=>JSON.parse((window as any).__seedE2E.snapshot()).mn.length)).toBeGreaterThan(0);
 await page.screenshot({path:'test-results/v52-visible/mines-high-contrast-reduced.png'});
 await page.waitForTimeout(1500);const samples=await page.evaluate(()=>(window as any).__seedE2E.performanceSamples());
 const describe=(xs:number[])=>{const a=xs.filter(Number.isFinite).sort((a,b)=>a-b);return a.length?{count:a.length,p50:a[Math.floor(a.length*.5)],p95:a[Math.min(a.length-1,Math.floor(a.length*.95))]}:null;};
 fs.mkdirSync('test-results/v52-visible',{recursive:true});fs.writeFileSync('test-results/v52-visible/software-window.json',JSON.stringify({classification:'SHORT_HEADLESS_BROWSER_WINDOW_NOT_NATIVE_PERFORMANCE_ACCEPTANCE',window:'first run frames including cold ground; no controlled parent comparison',renderer:samples.rendererType,viewport:samples.viewport,simulationStepMs:describe(samples.sim),renderCpuSubmissionMs:describe(samples.rendererCpuSubmit),browserFrameIntervalMs:describe(samples.frame),gpuCompletion:null,textureUpload:null,monitorPresentation:null,acceptance:'PERFORMANCE_INCONCLUSIVE',raw:samples},null,2));
});
