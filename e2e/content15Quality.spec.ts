import {test,expect} from "@playwright/test";
import {startRun,assertNoRawKeys} from "./helpers";
for(const lang of ["en","th"] as const)test(`notification bursts, priority, pause and power HUD ${lang}`,async({page})=>{
 await page.setViewportSize({width:1600,height:900});await startRun(page,"EPOCH-GOLDEN-001",{lang});
 for(const count of [5,10,20]){
  const counts=await page.evaluate(n=>{const h=(window as any).__seedE2E;h.notificationReset();return h.notificationBurst(n);},count);
  expect(counts).toEqual({visible:3,queued:count-3});
  const rects=await page.locator("#notification-stack .toast").evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return {top:r.top,bottom:r.bottom};}));
  expect(rects[1]!.top).toBeGreaterThan(rects[0]!.bottom);expect(rects[2]!.top).toBeGreaterThan(rects[1]!.bottom);
 }
 await page.evaluate(()=>(window as any).__seedE2E.notificationBurst(1,true));
 await expect(page.locator('#notification-stack [data-priority="critical"]')).toBeVisible();
 const before=await page.evaluate(()=>(window as any).__seedE2E.notificationCounts());
 await page.keyboard.press("Escape");await expect(page.locator("#pause-screen")).toBeVisible();
 await expect(page.locator("#notification-stack")).toBeHidden();
 expect(await page.evaluate(()=>(window as any).__seedE2E.notificationCounts())).toEqual(before);
 await page.keyboard.press("Escape");await expect(page.locator("#pause-screen")).toHaveCount(0);
 await expect(page.locator("#ability-loadout [data-power=origin]")).toBeVisible();
 await page.locator("#ability-loadout [data-power=origin]").click();
 await expect(page.locator("#ability-loadout small")).toBeVisible();await assertNoRawKeys(page);
 await page.screenshot({path:`test-results/browser/content15-loadout-notifications-${lang}.png`});
});
for(const origin of ["hunters","engineers","resonant","sentinels"])test(`neutral body six-age progression ${origin}`,async({page})=>{
 await startRun(page,"EPOCH-GOLDEN-001");
 for(let age=0;age<6;age++){
  await page.evaluate(([o,a])=>(window as any).__seedE2E.stageEvolution(o,a),[origin,age]);
  await page.waitForTimeout(100);
  const hero=(await page.evaluate(()=>(window as any).__seedE2E.actorPresentation()))[0];
  expect(hero.texture).toBe("hero-neutral");expect(Number(hero.frame)%24).toBe(["hunters","engineers","resonant","sentinels"].indexOf(origin)*6+age);
  await assertNoRawKeys(page);await page.screenshot({path:`test-results/browser/content15-body-${origin}-${age}.png`});
 }
});
for(const lang of ["en","th"] as const)test(`boss phase transition has living windup pose and feedback ${lang}`,async({page})=>{
 await startRun(page,"EPOCH-GOLDEN-001",{lang});
 await page.evaluate(()=>{const h=(window as any).__seedE2E;h.stageBossReview("slam");h.bossPhaseReview();});
 const state=await page.evaluate(()=>(window as any).__seedE2E.bossReviewState());expect(state.boss.encounter.phase).toBe("phase-transition");
 await expect(page.locator("#notification-stack")).toContainText(lang==="en"?"attack sequence changing":"ลำดับโจมตีใหม่");
 await page.waitForTimeout(100);const view=await page.evaluate(()=>(window as any).__seedE2E.bossReviewState());expect(view.actors.some((a:any)=>a.texture==="boss-v2"&&Number(a.frame)===3)).toBe(true);
 await assertNoRawKeys(page);await page.screenshot({path:`test-results/browser/content15-boss-phase-${lang}.png`});
});
