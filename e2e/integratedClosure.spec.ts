import {test,expect} from "@playwright/test";
import {startRun,assertNoRawKeys} from "./helpers";
for(const lang of ["en","th"] as const)test(`integrated raid countdown, actual defense and scale ${lang}`,async({page})=>{
  await page.setViewportSize({width:1600,height:900});await startRun(page,"EPOCH-GOLDEN-001",{lang});
  await page.evaluate(()=>(window as any).__seedE2E.stageAllocationRegression());await page.keyboard.press("M");
  await expect(page.locator("#civmap-screen")).toHaveCount(0);
  await page.evaluate(()=>(window as any).__seedE2E.stageRaidClosure());
  await expect(page.locator(".raid-readiness")).toContainText(lang==="en"?"preparation accelerated":"เร่งเวลา");
  expect((await page.evaluate(()=>(window as any).__seedE2E.integratedReview())).logistics.used).toBe(5);
  await page.evaluate(()=>(window as any).__seedE2E.advanceRaidReview(45));
  let review=await page.evaluate(()=>(window as any).__seedE2E.integratedReview());expect(review.raid.status).toBe("warning");expect(review.defenses).toBe(0);
  await page.screenshot({path:`test-results/browser/integrated-raid-warning-${lang}.png`});
  await page.evaluate(()=>(window as any).__seedE2E.advanceRaidReview(30));
  review=await page.evaluate(()=>(window as any).__seedE2E.integratedReview());expect(review.raid.status).toBe("active");expect(review.defenses).toBe(0);
  await page.screenshot({path:`test-results/browser/integrated-raid-fight-${lang}.png`});
  await page.evaluate(()=>(window as any).__seedE2E.advanceRaidReview(35));
  review=await page.evaluate(()=>(window as any).__seedE2E.integratedReview());expect(review.defenses).toBe(1);expect(review.age).toBeGreaterThanOrEqual(4);
  await assertNoRawKeys(page);await page.screenshot({path:`test-results/browser/integrated-raid-defended-${lang}.png`});
});
test("four viewport scale and blended floor atlas remain bounded",async({page})=>{
  await startRun(page,"EPOCH-GOLDEN-001");await page.evaluate(()=>(window as any).__seedE2E.stageEvolution("hunters",3));
  await page.evaluate(()=>(window as any).__seedE2E.stageBiomeReview("verdant"));
  for(const [width,height] of [[1280,720],[1600,900],[1920,1080],[2560,1272]]){
    await page.setViewportSize({width,height});await page.waitForTimeout(150);
    const data=await page.evaluate(()=>(window as any).__seedE2E.integratedReview());
    expect(data.actors.length).toBeGreaterThanOrEqual(3);
    expect(data.actors[0].width).toBe(112);expect(data.actors[1].width).toBe(56);
    expect(data.zoom).toBeGreaterThanOrEqual(1);expect(data.zoom).toBeLessThanOrEqual(1.25);
    expect(data.terrain.tiles).toBeLessThanOrEqual(64);expect(data.terrain.atlasBytes).toBe(16777216);
    await page.screenshot({path:`test-results/browser/integrated-scale-${width}.png`});
  }
});

test("all four authored floors use actual generated biome sites",async({page})=>{
  await page.setViewportSize({width:1600,height:900});await startRun(page,"EPOCH-GOLDEN-001");
  for(const biome of ["verdant","arid","tundra","badlands"]){
    const site=await page.evaluate(b=>(window as any).__seedE2E.stageBiomeReview(b),biome);
    expect(site.biome).toBe(biome);await page.waitForTimeout(150);
    const review=await page.evaluate(()=>(window as any).__seedE2E.integratedReview());
    expect(review.terrain.tiles).toBeGreaterThan(0);expect(review.terrain.tiles).toBeLessThanOrEqual(64);
    await assertNoRawKeys(page);await page.screenshot({path:`test-results/browser/integrated-biome-${biome}.png`});
  }
});
