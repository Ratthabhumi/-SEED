import {test,expect} from "@playwright/test";
import {prepareSave,startRun,SAVE_KEY,assertNoRawKeys} from "./helpers";
const sizes=[[1920,1080],[1366,768],[1280,720],[1024,768],[390,844],[844,390]];
for(const lang of ["en","th"] as const) for(const [width,height] of sizes) test(`Title and Archive responsive matrix ${lang} ${width}x${height}`,async({page})=>{
 await prepareSave(page,{lang}); await page.goto("/?e2e");
 for(const scale of [1,1.25,1.5,2]) {
  await page.setViewportSize({width:width!,height:height!});
  await page.evaluate(scale=>document.documentElement.style.setProperty("--ui-scale",String(scale)),scale);
  const start=page.locator("#start-btn"); await expect(start).toBeInViewport();
  const summary=page.locator("#archive-panel summary");await summary.focus();await page.keyboard.press("Space");
  for(const buy of await page.locator("[data-archive-id]").all()){await buy.scrollIntoViewIfNeeded();await expect(buy).toBeInViewport();}
  expect(await page.locator(".title-layout").evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);
  expect(await page.locator("#archive-panel").evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);
  await start.focus();await expect(start).toBeFocused();await page.keyboard.press("Tab");await page.keyboard.press("Shift+Tab");await expect(start).toBeFocused();
  await assertNoRawKeys(page);
  if((width===1280&&scale===1)||(width===1920&&scale===1)||(width===390&&scale===2))await page.screenshot({path:`test-results/browser/unified-title-${lang}-${width}-${scale}.png`});
  await summary.click();await expect(start).toBeInViewport();
 }
 });
for(const lang of ["en","th"] as const) test("Archive funded native purchases "+lang,async({page})=>{
 await prepareSave(page,{lang});await page.goto("/?e2e");
 await page.setViewportSize({width:1280,height:720});await page.evaluate(key=>{const s=JSON.parse(localStorage.getItem(key)!);s.schema=2;s.meta={insight:12,purchased:[],nextAttempt:1,lastSettled:0,energyStart:false};localStorage.setItem(key,JSON.stringify(s));},SAVE_KEY);
 await page.getByRole("button",{name:lang==="en"?"ไทย":"English",exact:true}).click();
 await page.getByRole("button",{name:lang==="en"?"English":"ไทย",exact:true}).click();
 await expect(page.locator("html")).toHaveAttribute("lang",lang);
 await page.locator("#archive-panel summary").click();
 for(const id of ["survival-kit","energy-kit","choice-kit"]){const buy=page.locator('[data-archive-id="'+id+'"]');await buy.scrollIntoViewIfNeeded();await buy.focus();await page.keyboard.press("Enter");await expect(buy).toBeDisabled();}
 await page.locator("#archive-energy-start").check();await page.screenshot({path:"test-results/browser/unified-archive-owned-"+lang+".png"});
});
for(const lang of ["en","th"] as const) test("canonical repair progress, pause, exit, resume and restoration "+lang,async({page})=>{
 await page.setViewportSize({width:1280,height:720});await startRun(page,"EPOCH-GOLDEN-001",{lang});
 await page.evaluate(()=>(window as any).__seedE2E.stageRepair());
 const state=()=>page.evaluate(()=>(window as any).__seedE2E.repairState());
 await expect.poll(async()=> (await state()).territories[0].repairT).toBeGreaterThan(1);
 const partial=await state();expect(partial.label).toContain("%");await page.screenshot({path:"test-results/browser/unified-repair-partial-"+lang+".png"});
 await page.keyboard.press("Escape");const paused=(await state()).territories[0].repairT;await page.waitForTimeout(700);expect((await state()).territories[0].repairT).toBe(paused);await page.keyboard.press("Escape");
 await page.evaluate(()=>(window as any).__seedE2E.moveRepairOutside());await expect.poll(async()=> (await state()).territories[0].repairT).toBe(0);await page.screenshot({path:"test-results/browser/unified-repair-broken-"+lang+".png"});
 await page.evaluate(()=>(window as any).__seedE2E.moveRepairInside());await expect.poll(async()=> (await state()).territories[0].disabled,{timeout:60000}).toBe(false);expect((await state()).territories[0].hp).toBe(150);await page.screenshot({path:"test-results/browser/unified-repair-restored-"+lang+".png"});
 await page.evaluate(()=>(window as any).__seedE2E.stageActorReview());await page.waitForTimeout(150);await page.screenshot({path:"test-results/browser/unified-mixed-actors-"+lang+".png"});
 await page.evaluate(()=>(window as any).__seedE2E.stageActorReview(true));await page.waitForTimeout(150);await page.screenshot({path:"test-results/browser/unified-dense-actors-"+lang+".png"});
 await page.locator("canvas").first().evaluate(el=>(el as HTMLElement).style.filter="grayscale(1)");await page.screenshot({path:"test-results/browser/unified-grayscale-"+lang+".png"});await page.locator("canvas").first().evaluate(el=>(el as HTMLElement).style.filter="");
 await page.evaluate(key=>{const saved=JSON.parse(localStorage.getItem(key)!);saved.settings.contrast="high";localStorage.setItem(key,JSON.stringify(saved));document.documentElement.dataset.contrast="high";},SAVE_KEY);await page.waitForTimeout(150);await page.screenshot({path:"test-results/browser/unified-high-contrast-"+lang+".png"});
 const perf=await page.evaluate(()=>(window as any).__seedE2E.performanceSamples());expect(perf.pools.enemyActors).toBeLessThanOrEqual(650);expect(perf.pools.allyActors).toBeLessThanOrEqual(128);
 await page.keyboard.press("Escape");await page.screenshot({path:"test-results/browser/unified-pause-"+lang+".png"});await page.keyboard.press("Escape");
 await page.keyboard.press("t");await page.screenshot({path:"test-results/browser/unified-techmap-"+lang+".png"});await page.keyboard.press("Escape");await page.keyboard.press("m");await page.screenshot({path:"test-results/browser/unified-civmap-"+lang+".png"});await page.keyboard.press("Escape");await page.evaluate(()=>(window as any).__seedE2E.kill());await page.screenshot({path:"test-results/browser/unified-chronicle-"+lang+".png"});
 const urls=await page.evaluate(()=>(window as any).__seedE2E.actorAssetUrls());
 await page.evaluate(urls=>{const sheet=document.createElement("div");sheet.id="actor-sheet";sheet.style.cssText="position:fixed;inset:0;z-index:1000;background:#0B1218;display:flex;align-content:center;justify-content:center;flex-wrap:wrap;gap:24px;color:#F1F5F2";for(const [id,url] of Object.entries(urls)){const box=document.createElement("div");box.style.cssText="width:160px;height:160px;text-align:center;background:#17242C;padding:24px";const crop=document.createElement("div");crop.style.cssText="width:64px;height:64px;overflow:hidden;margin:auto";const img=document.createElement("img");img.src=url as string;img.style.cssText="width:1152px;height:64px;max-width:none";crop.append(img);box.append(crop,document.createTextNode(id));sheet.append(box);}document.body.append(sheet);},urls);
 await page.screenshot({path:"test-results/browser/unified-actor-sheet-"+lang+".png"});
});
