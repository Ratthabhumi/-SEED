import {test,expect} from '@playwright/test';
import {startRun,assertNoRawKeys} from './helpers';
for(const lang of ['en','th'] as const)test('boss warnings, actual dodge, fan projectiles and native art '+lang,async({page})=>{
  await page.setViewportSize({width:1280,height:720});await startRun(page,'EPOCH-GOLDEN-001',{lang});
  for(const pattern of ['slam','fan','cross'] as const){
    const initial=await page.evaluate(p=>(window as any).__seedE2E.stageBossReview(p),pattern);
    await page.waitForTimeout(250);await page.screenshot({path:`test-results/browser/boss-v2-warning-${pattern}-${lang}.png`});
    const state=()=>page.evaluate(()=>(window as any).__seedE2E.bossReviewState());
    // Owner rejected the vector art; production restores the painted windup.
    expect((await state()).actors.filter((a:any)=>a.texture==='boss-v2')).toHaveLength(1);
    expect((await state()).actors.some((a:any)=>Number(a.frame)===3)).toBe(true);
    if(pattern==='slam')await page.evaluate(()=>(window as any).__seedE2E.dodgeBossReview());
    await page.evaluate(()=>(window as any).__seedE2E.advanceEvolution(2));
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
    expect(await page.evaluate(()=>(window as any).__seedE2E.stageBiomeReview('verdant').biome)).toBe('verdant');
    for(const kind of ['attack','hurt','special','dash'] as const){
      await page.evaluate(k=>(window as any).__seedE2E.heroActionReview(k),kind);await page.waitForTimeout(100);
      const hero=await page.evaluate(()=>(window as any).__seedE2E.actorPresentation()[0]);
      expect(hero.texture).toBe('hero-neutral');expect(Math.abs(hero.rotation)).toBeLessThanOrEqual(.1);
      expect(Number(hero.frame)%24).toBe(['hunters','engineers','resonant','sentinels'].indexOf(origin)*6+3);
      await page.screenshot({path:`test-results/browser/hero-v2-${origin}-${kind}.png`});
    }
  }
});
test('four weapon families show actual damage and distinct bounded feedback',async({page})=>{
  await startRun(page,'EPOCH-GOLDEN-001');
  await page.evaluate(()=>(window as any).__seedE2E.stageBiomeReview('verdant'));
  for(const family of ['kinetic','energy','defense','field'] as const){
    const hp=await page.evaluate(f=>(window as any).__seedE2E.stageFamilyReview(f),family);
    // Projectile families need real travel time. Stop at the first resolved hit
    // so the simulation-timed impact is still alive for the native capture.
    const after=await page.evaluate(initial=>{
      const h=(window as any).__seedE2E;
      let state=h.signatureFeedback();
      for(let i=0;i<90&&state.hp[0]>=initial;i++){
        h.advanceEvolution(1/60);state=h.signatureFeedback();
      }
      return state;
    },hp);
    expect(after.hp[0],family+' actual damage within 1.5 simulation seconds').toBeLessThan(hp);expect(after.impacts).toBeGreaterThan(0);
    await page.waitForTimeout(100);await page.screenshot({path:`test-results/browser/family-v2-${family}.png`});
  }
});
