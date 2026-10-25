import {test,expect} from "@playwright/test";
import {startRun,assertNoRawKeys} from "./helpers";
import {mkdirSync,writeFileSync} from "node:fs";
test.use({trace:"on"});
test("terrain worker stays bounded across fast traversal, cached visits, contrast and child world",async({page})=>{
 await page.setViewportSize({width:1280,height:720});const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
 await startRun(page,"EPOCH-GOLDEN-001");
 const rows=[];
 for(const [x,y,dense,reduced,hc] of [[0,0,false,false,false],[512,0,false,false,false],[1024,512,false,false,false],[4096,4096,false,false,false],[-4096,-4096,false,true,false],[0,0,false,false,false],[0,0,true,false,false],[512,512,true,true,false],[0,0,false,false,true],[0,0,false,false,false]]){
  const data=await page.evaluate(v=>(window as any).__seedE2E.streamingFixture(...v),[x,y,dense,reduced,hc]);rows.push(data);
  await page.waitForTimeout(350);
  const next=await page.evaluate(()=>(window as any).__seedE2E.integratedReview());
  expect(next.terrain.workerFailed).toBe(false);expect(next.terrain.tiles).toBeLessThanOrEqual(64);expect(next.terrain.pending).toBeLessThanOrEqual(65);
  expect(next.combatSprites.allocated).toBeLessThanOrEqual(1060);
  if(dense){expect(next.combatSprites.visible).toBeGreaterThanOrEqual(800);expect(next.combatSprites.renderObjects).toBe(3);}
 }
 // No main-thread tile preparation remains; wait for the bounded queue to drain.
 await expect.poll(async()=>(await page.evaluate(()=>(window as any).__seedE2E.integratedReview())).terrain.pending,{timeout:45000}).toBe(0);
 const ready=await page.evaluate(()=>(window as any).__seedE2E.integratedReview());expect(ready.terrain.ready).toBeGreaterThan(0);
 const uploaded=ready.terrain.uploads;
 await page.evaluate(()=>(window as any).__seedE2E.streamingFixture(0,0));await page.waitForTimeout(250);
 expect((await page.evaluate(()=>(window as any).__seedE2E.integratedReview())).terrain.uploads).toBe(uploaded);
 expect(ready.terrain.uploadBytes).toBe(ready.terrain.uploads*262144);
 await page.screenshot({path:"test-results/browser/streaming-ready-floor.png"});
 // Existing canonical Ascension UI, not direct replacement of world identity.
 await page.evaluate(()=>(window as any).__seedE2E.readyAscend());await page.locator(".hud-ascend button").click();
 await page.locator("#legacy-screen .card").first().click();await page.locator("#origin-screen .card").first().click();await page.locator("#child-intro-screen button").click();
 const child=await page.evaluate(()=>(window as any).__seedE2E.integratedReview());expect(child.terrain.ready).toBeLessThan(64);
 await expect.poll(async()=>(await page.evaluate(()=>(window as any).__seedE2E.integratedReview())).terrain.ready,{timeout:45000}).toBeGreaterThan(0);
 expect(errors).toEqual([]);mkdirSync("test-results/browser",{recursive:true});writeFileSync("test-results/browser/streaming-counters.json",JSON.stringify({fixture:true,rows,ready,child},null,2));
});
test("failed terrain Worker retains source artwork and playable scene without throwing",async({page})=>{
 const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
 await page.route("**/terrainWorker-*.js",route=>route.abort());
 await startRun(page,"EPOCH-GOLDEN-001");
 await expect.poll(async()=>(await page.evaluate(()=>(window as any).__seedE2E.integratedReview())).terrain.workerFailed).toBe(true);
 await page.evaluate(()=>(window as any).__seedE2E.streamingFixture(-2048,1024));await page.waitForTimeout(100);
 const review=await page.evaluate(()=>(window as any).__seedE2E.integratedReview());
 expect(review.terrain.mode).toBe("source-fallback");expect(review.terrain.images).toBeGreaterThan(0);expect(review.terrain.pending).toBe(0);expect(review.terrain.tiles).toBeLessThanOrEqual(64);
 await expect(page.locator(".hud")).toBeVisible();expect(errors).toEqual([]);
 await page.screenshot({path:"test-results/browser/terrain-worker-fallback.png"});
});
for(const lang of ["en","th"] as const)for(const [row,origin] of ["hunters","engineers","resonant","sentinels"].entries())test(`painted ${origin} releases and six tier mounts ${lang}`,async({page})=>{
 await page.setViewportSize({width:1600,height:900});const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
  await startRun(page,"EPOCH-GOLDEN-001",{lang});
  for(let age=0;age<6;age++){
   await page.evaluate(v=>(window as any).__seedE2E.stageEvolution(v.origin,v.age),{origin,age});
   await page.evaluate(()=>(window as any).__seedE2E.advanceEvolution(.08));
   await page.waitForTimeout(100);
   const data=await page.evaluate(()=>(window as any).__seedE2E.integratedReview());
   expect(data.equipment.texture).toBe("combat-equipment");expect(Number(data.equipment.frame)).toBe(row*6+age);
   expect(data.combatSprites.allocated).toBeLessThanOrEqual(1060);
   if(age===0||age===3||age===5)await page.screenshot({path:`test-results/browser/painted-combat-${origin}-${age}-${lang}.png`});
  }
  await assertNoRawKeys(page);
 expect(errors).toEqual([]);
});
