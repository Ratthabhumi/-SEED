import {test,expect} from '@playwright/test';
import {startRun,resolveDrafts,assertNoRawKeys} from './helpers';
for(const lang of ['en','th'] as const)test('uncharted Signal guidance reveals no hidden bearing '+lang,async({page})=>{
  await startRun(page,'EPOCH-GOLDEN-001',{lang});
  const state=await page.evaluate(()=>(window as any).__seedE2E.stageUnchartedNavigation());
  expect(state.known).toBe(0);expect(state.compass).toBe(lang==='en'
    ?'Explore uncharted ground for an Alien Signal; clear nearby threats before claiming it.'
    :'สำรวจพื้นที่ที่ยังไม่รู้จักเพื่อค้นหาสัญญาณต่างดาว แล้วกำจัดภัยรอบข้างก่อนยึด');
  expect(state.compass).not.toMatch(/\d+u|[↗↘↙↖↑↓←→]/);
  const box=await page.locator('.nav-compass').boundingBox();expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);expect(box!.y+box!.height).toBeLessThanOrEqual(720);
  await page.screenshot({path:'test-results/browser/signal-exploration-'+lang+'.png'});
  await assertNoRawKeys(page);
});
for(const lang of ['en','th'] as const)test('real Atomic beam release, pause and restart '+lang,async({page})=>{
  await page.setViewportSize({width:1280,height:720});await startRun(page,'EPOCH-GOLDEN-001',{lang});
  await page.evaluate(()=>{const h=(window as any).__seedE2E;h.stageEvolution('resonant',4);h.primeSignature();});
  const state=()=>page.evaluate(()=>(window as any).__seedE2E.signatureFeedback());
  const before=await state();expect(before.charge).toBeGreaterThan(0);expect(before.beams).toBe(0);
  await page.screenshot({path:'test-results/browser/signature-charge-'+lang+'.png'});
  await page.evaluate(()=>(window as any).__seedE2E.advanceEvolution(.17));
  const fired=await state();expect(fired.beams).toBe(1);expect(fired.impacts).toBeGreaterThan(0);
  expect(fired.hp.some((hp:number,i:number)=>hp<before.hp[i])).toBe(true);
  await page.waitForTimeout(150);expect((await state()).elapsed).toBe(fired.elapsed);
  await page.screenshot({path:'test-results/browser/signature-impact-'+lang+'.png'});
  await page.evaluate(()=>(window as any).__seedE2E.advanceEvolution(.3));expect((await state()).beams).toBe(0);expect((await state()).impacts).toBe(0);
  await page.keyboard.press('Escape');await page.keyboard.press('Escape');await page.locator('#pause-reducedEffects').check();await page.keyboard.press('Escape');
  await page.evaluate(()=>{const h=(window as any).__seedE2E;h.stageEvolution('resonant',4);h.primeSignature();h.advanceEvolution(.17);});
  expect((await state()).reduced).toBe(true);expect((await state()).beams).toBe(1);expect((await state()).impacts).toBe(0);
  await page.screenshot({path:'test-results/browser/signature-reduced-'+lang+'.png'});
  await assertNoRawKeys(page);
  // Fixture pause has no menu: first Escape resumes, second opens the normal menu.
  await page.keyboard.press('Escape');await page.keyboard.press('Escape');await page.locator('#pause-restart-btn').click();
  await expect(page.locator('.hud')).toBeVisible();expect((await state()).beams).toBe(0);
});
for(const lang of ['en','th'] as const)test('actual claimed outpost identities and localized Knowledge HUD '+lang,async({page})=>{
  await page.setViewportSize({width:1600,height:900});await startRun(page,'EPOCH-GOLDEN-001',{lang});
  await expect(page.locator('.knowledge-icon')).toBeVisible();
  for(let i=0;i<3;i++){
    // Fresh runs prevent the fixture removing a Military base while leaving
    // its previously recruited allies in the next specialization capture.
    if(i>0)await startRun(page,'EPOCH-GOLDEN-001',{lang});
    const id=await page.evaluate(()=>(window as any).__seedE2E.stageSpecRegression(false,false));
    await page.locator('#spec-screen .terr-spec-btn').nth(i).click();await expect(page.locator('#spec-screen')).toHaveCount(0);
    const terr=await page.evaluate(id=>(window as any).__seedE2E.specRegressionState().territories.find((t:any)=>t.poiId===id),id);
    expect(terr.spec).toBe(['research','military','economy'][i]);
    // Real movement separates the actor from the building for native inspection.
    await page.keyboard.down('d');await page.waitForTimeout(1800);await page.keyboard.up('d');
    await resolveDrafts(page,20);
    const landmark=await page.evaluate(()=>(window as any).__seedE2E.integratedReview().landmarks);
    expect(landmark.some((a:any)=>a.texture==='outposts-v2'&&Number(a.frame)===i*4&&a.width===176)).toBe(true);
    await page.screenshot({path:'test-results/browser/outpost-'+terr.spec+'-'+lang+'.png'});
  }
  await page.evaluate(()=>(window as any).__seedE2E.stageSpecRegression(true,false));await page.locator('#spec-screen .spec-later-btn').click();
  await resolveDrafts(page,20);
  await page.waitForTimeout(600);await page.screenshot({path:'test-results/browser/signal-monolith-'+lang+'.png'});
  await page.evaluate(()=>(window as any).__seedE2E.stageKnowledgeReview());await page.waitForTimeout(100);
  await page.screenshot({path:'test-results/browser/knowledge-codex-'+lang+'.png'});
  await page.evaluate(()=>(window as any).__seedE2E.advanceEvolution(.5));
  await expect(page.locator('body')).toContainText(lang==='en'?'Collect the open codices':'เก็บตำราความรู้');
  await assertNoRawKeys(page);
});
for(const lang of ['en','th'] as const)test('selecting actual Conduction changes the Atomic attack '+lang,async({page})=>{
  await page.setViewportSize({width:1280,height:720});await startRun(page,'EPOCH-GOLDEN-001',{lang});
  const state=()=>page.evaluate(()=>(window as any).__seedE2E.signatureFeedback());
  await page.evaluate(()=>{const h=(window as any).__seedE2E;h.stageEvolution('resonant',4);h.primeSignature();h.lineUpSignatureTargets();h.advanceEvolution(.17);});
  const before=await state();expect(before.chain).toBe(false);expect(before.hp[1]).toBe(1000);expect(before.hp[2]).toBe(1000);
  await page.screenshot({path:'test-results/browser/conduction-before-'+lang+'.png'});
  await page.evaluate(()=>(window as any).__seedE2E.offerSignatureUpgrade());
  await page.locator('#draft-screen .card-select').first().click();await expect(page.locator('#draft-screen')).toHaveCount(0);
  expect((await state()).chain).toBe(true);
  await page.evaluate(()=>{const h=(window as any).__seedE2E;h.primeSignature();h.lineUpSignatureTargets();h.advanceEvolution(.17);});
  const after=await state();expect(after.hp[1]).toBeLessThan(before.hp[1]);expect(after.hp[2]).toBeLessThan(before.hp[2]);
  expect(after.arcs).toBe(2);
  await page.screenshot({path:'test-results/browser/conduction-after-'+lang+'.png'});
  await assertNoRawKeys(page);
  // Ascend while the parent effects are still frozen/live, exercising actual reset.
  await page.evaluate(()=>(window as any).__seedE2E.readyAscend());await page.locator('.hud-ascend button').click();
  await page.locator('#legacy-screen .card').first().click();await page.locator('#origin-screen .card').first().click();
  const child=await state();expect(child.arcs).toBe(0);expect(child.beams).toBe(0);expect(child.impacts).toBe(0);
  await page.keyboard.press('Escape');await expect(page.locator('#child-intro-screen')).toHaveCount(0);
});
