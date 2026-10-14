import {test,expect} from '@playwright/test';
test.beforeEach(async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('seed-game-save-v1',JSON.stringify({schema:1,settings:{lang:'en',tutorialCompleted:true,volume:0,uiScale:1},archive:[],history:[],best:{}})));
 await page.goto('/?e2e');await page.locator('#seed-input').fill('EPOCH-GOLDEN-001');await page.locator('#start-btn').click();await page.waitForFunction(()=>!!(window as any).__seedE2E?.content153Review);
});
test('real canonical burst uses painted art and bounded atlas',async({page})=>{
 await page.evaluate(()=>(window as any).__seedE2E.stageEvolution('hunters',5,'burst'));
 let painted=false;
 for(let i=0;i<25&&!painted;i++){
  await page.evaluate(()=>(window as any).__seedE2E.advanceEvolution(.1));await page.waitForTimeout(25);
  painted=await page.evaluate(()=>(window as any).__seedE2E.content153Review().hostiles.paintedShots>0);
 }
 expect(painted).toBe(true);await page.screenshot({path:'test-results/browser/content153-real-burst.png'});
 const before=await page.evaluate(()=>(window as any).__seedE2E.content153Review());expect(before.hostiles.paintedRoles).toContain(0);expect(before.hostiles.paintedAtlasBytes).toBe(262144);
});
test('new release/recovery follows canonical time and pause',async({page})=>{
 await page.evaluate(()=>(window as any).__seedE2E.stageEvolution('hunters',0));
 const frames=new Set<number>();
 for(let i=0;i<50;i++){await page.waitForTimeout(25);const r=await page.evaluate(()=>(window as any).__seedE2E.content153Review().motion);if(r?.texture==='hero-reference-attack')frames.add(r.frame);}
 expect(frames.size).toBeGreaterThanOrEqual(2);
 await page.keyboard.press('Escape');const before=await page.evaluate(()=>(window as any).__seedE2E.content153Review().motion);await page.waitForTimeout(150);
 expect(await page.evaluate(()=>(window as any).__seedE2E.content153Review().motion)).toEqual(before);
});
test('shared periodic fallback remains bounded with prepared terrain',async({page})=>{
 await page.evaluate(()=>(window as any).__seedE2E.stageEvolution('hunters',5));await page.waitForFunction(()=>(window as any).__seedE2E.content153Review().terrain.pending===0);
 const r=await page.evaluate(()=>(window as any).__seedE2E.content153Review());expect(r.heroSize).toBe(126);expect(r.terrain.fallbackAtlasBytes).toBe(1048576);expect(r.terrain.tiles).toBeLessThanOrEqual(64);
 await page.screenshot({path:'test-results/browser/content153-shared-terrain.png'});
});
