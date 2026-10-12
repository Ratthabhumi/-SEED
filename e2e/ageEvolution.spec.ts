import {test,expect} from '@playwright/test';
import {startRun,assertNoRawKeys} from './helpers';
for(const lang of ['en','th'] as const)test('upright movement, hold and reset '+lang,async({page})=>{
 await page.setViewportSize({width:1280,height:720});await startRun(page,'EPOCH-GOLDEN-001',{lang});
 await page.evaluate(()=>(window as any).__seedE2E.stageEvolution('hunters',0));
 const poses=()=>page.evaluate(()=>(window as any).__seedE2E.actorPresentation());
 for(const key of ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown']){
  await page.keyboard.down(key);await page.waitForTimeout(250);await page.keyboard.up(key);
  const actors=await poses();expect(actors.length).toBeGreaterThanOrEqual(3);expect(actors.every((a:any)=>a.rotation===0)).toBe(true);
  await page.screenshot({path:'test-results/browser/evolution-upright-'+lang+'-'+key+'.png'});
 }
 await page.keyboard.press('r');await page.waitForTimeout(250);expect(await page.evaluate(()=>(window as any).__seedE2E.evolutionState().squadMode)).toBe('hold');
 const held=(await poses()).slice(1,3);expect(held).toHaveLength(2);expect(held.every((a:any)=>a.texture==='hero-v2-hunters'&&Number(a.frame)%8===0)).toBe(true);
 await page.keyboard.press('q');await page.keyboard.press('e');await page.waitForTimeout(250);expect((await poses()).every((a:any)=>a.rotation===0)).toBe(true);
 await assertNoRawKeys(page);
 await page.keyboard.press('Escape');await page.locator('#pause-restart-btn').click();await expect(page.locator('.hud')).toBeVisible();
 await page.waitForTimeout(150);expect((await poses()).every((a:any)=>a.rotation===0||a.texture==='actor-guardian')).toBe(true);
});
for(const lang of ['en','th'] as const)for(let age=0;age<6;age++)test('Age roster '+age+' '+lang,async({page})=>{
 await page.setViewportSize({width:lang==='en'?1920:1280,height:lang==='en'?1080:720});await startRun(page,'EPOCH-GOLDEN-001',{lang});
 for(const origin of ['hunters','engineers','resonant','sentinels']){
  await page.evaluate(({origin,age})=>(window as any).__seedE2E.stageEvolution(origin,age),{origin,age});await page.waitForTimeout(180);
  const actors=await page.evaluate(()=>(window as any).__seedE2E.actorPresentation());const hero=actors[0];expect(hero.texture).toBe('hero-v2-'+origin);expect(hero.rotation).toBe(0);expect(hero.inView).toBe(true);expect(Number(hero.frame)).toBeGreaterThanOrEqual(0);expect(Number(hero.frame)).toBeLessThan(16);
  const guardians=actors.filter((a:any)=>a.texture==='actor-guardian');const expected=(origin==='engineers'||origin==='sentinels')&&age>=2?(age===2?1:age===3?2:3):0;
  expect(guardians).toHaveLength(expected);expect(guardians.every((a:any)=>Math.floor(Number(a.frame)/3)===age)).toBe(true);
  await page.screenshot({path:'test-results/browser/evolution-age-'+lang+'-'+origin+'-'+age+'.png'});
 }
 await assertNoRawKeys(page);
});
for(const lang of ['en','th'] as const)test('warned encounter canonical snapshots '+lang,async({page})=>{
 await page.setViewportSize({width:1280,height:720});await startRun(page,'EPOCH-GOLDEN-001',{lang});
 for(const [age,kind] of [[0,'rush'],[3,'burst']] as const){
  // Actual simulation fixed steps, frozen only for deterministic screenshot timing.
  await page.evaluate(({age,kind})=>(window as any).__seedE2E.stageEvolution('hunters',age,kind),{age,kind});
  const state=()=>page.evaluate(()=>(window as any).__seedE2E.evolutionState());
  expect((await state()).enemies[0].evolution.phase).toBe('warning');await page.waitForTimeout(100);
  await page.screenshot({path:'test-results/browser/evolution-warning-'+lang+'-'+kind+'.png'});
  await page.evaluate(()=>(window as any).__seedE2E.advanceEvolution(0.9));expect((await state()).enemies[0].evolution.phase).toBe('attack');await page.waitForTimeout(100);
  await page.screenshot({path:'test-results/browser/evolution-attack-'+lang+'-'+kind+'.png'});
  await page.evaluate(()=>(window as any).__seedE2E.advanceEvolution(0.35));expect((await state()).enemies[0].evolution.phase).toBe('recover');await page.waitForTimeout(100);
  await page.screenshot({path:'test-results/browser/evolution-recovery-'+lang+'-'+kind+'.png'});
 }
 await assertNoRawKeys(page);
});
