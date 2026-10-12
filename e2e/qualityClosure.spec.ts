import {test,expect} from '@playwright/test';
import {startRun,assertNoRawKeys} from './helpers';
for(const lang of ['en','th'] as const)test('boss warnings, actual dodge, fan projectiles and native art '+lang,async({page})=>{
  await page.setViewportSize({width:1280,height:720});await startRun(page,'EPOCH-GOLDEN-001',{lang});
  for(const pattern of ['slam','fan','cross'] as const){
    const initial=await page.evaluate(p=>(window as any).__seedE2E.stageBossReview(p),pattern);
    await page.waitForTimeout(250);await page.screenshot({path:`test-results/browser/boss-v2-warning-${pattern}-${lang}.png`});
    const state=()=>page.evaluate(()=>(window as any).__seedE2E.bossReviewState());
    expect((await state()).actors.some((a:any)=>a.texture==='boss-v2'&&Number(a.frame)===3)).toBe(true);
    if(pattern==='slam')await page.evaluate(()=>(window as any).__seedE2E.dodgeBossReview());
    await page.evaluate(()=>(window as any).__seedE2E.advanceEvolution(1.2));
    const after=await state();expect(after.boss.encounter.phase).toBe('recover');
    if(pattern==='slam')expect(after.hp).toBe(initial.hp);
    if(pattern==='fan')expect(after.projectiles).toBe(6);
    await page.screenshot({path:`test-results/browser/boss-v2-release-${pattern}-${lang}.png`});
  }
  await assertNoRawKeys(page);
});
test('four distinct imported hero atlases and posed combat states',async({page})=>{
  await startRun(page,'EPOCH-GOLDEN-001');
  for(const origin of ['hunters','engineers','resonant','sentinels']){
    await page.evaluate(o=>(window as any).__seedE2E.stageEvolution(o,3),origin);
    await page.evaluate(()=>(window as any).__seedE2E.primeSignature());
    expect(await page.evaluate(()=>(window as any).__seedE2E.stageVerdantReview().biome)).toBe('verdant');
    for(const kind of ['attack','hurt','special','dash'] as const){
      await page.evaluate(k=>(window as any).__seedE2E.heroActionReview(k),kind);await page.waitForTimeout(100);
      const hero=await page.evaluate(()=>(window as any).__seedE2E.actorPresentation()[0]);
      expect(hero.texture).toBe('hero-v2-'+origin);expect(hero.rotation).toBe(0);
      expect(Number(hero.frame)%8).toBe(kind==='attack'?3:kind==='hurt'?4:kind==='dash'?5:7);
      await page.screenshot({path:`test-results/browser/hero-v2-${origin}-${kind}.png`});
    }
  }
});
test('four weapon families show actual damage and distinct bounded feedback',async({page})=>{
  await startRun(page,'EPOCH-GOLDEN-001');
  await page.evaluate(()=>(window as any).__seedE2E.stageVerdantReview());
  for(const family of ['kinetic','energy','defense','field'] as const){
    const hp=await page.evaluate(f=>(window as any).__seedE2E.stageFamilyReview(f),family);
    await page.evaluate(()=>(window as any).__seedE2E.advanceEvolution(.1));
    const after=await page.evaluate(()=>(window as any).__seedE2E.signatureFeedback());
    expect(after.hp[0]).toBeLessThan(hp);expect(after.impacts).toBeGreaterThan(0);
    await page.waitForTimeout(100);await page.screenshot({path:`test-results/browser/family-v2-${family}.png`});
  }
});
