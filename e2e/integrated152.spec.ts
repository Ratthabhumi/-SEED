import {test,expect} from "@playwright/test";
import {startRun} from "./helpers";
test("HC cache preserves 800 canonical shots and remains bounded across restart",async({page})=>{
 await startRun(page,"EPOCH-GOLDEN-001");
 await page.evaluate(()=>(window as any).__seedE2E.streamingFixture(0,0,true,false,true));
 await expect.poll(()=>page.evaluate(()=>(window as any).__seedE2E.friendlyBatchCounts().glyphs)).toBeGreaterThan(0);
 const h=await page.evaluate(()=>{const h=(window as any).__seedE2E;return {cache:h.friendlyBatchCounts(),state:h.canonicalStressState()};});
 expect(h.state.projectiles).toBe(800);expect(h.cache.glyphs).toBeLessThanOrEqual(64);expect(h.cache.atlasBytes).toBe(2359296);
 await page.screenshot({path:"test-results/browser/content152-hc-cache.png"});
 await page.evaluate(()=>{(window as any).__previousFriendlyBatch=(window as any).__seedE2E.friendlyBatchLifetime();});
 await page.keyboard.press("Escape"); // fixture is paused: resumes, then pause explicitly
 await page.keyboard.press("Escape");await page.locator("#pause-restart-btn").click();
 // A live new run may already have fired. Verify ownership/disposal, not a
 // transient zero which incorrectly fails after legitimate new activity.
 await expect.poll(()=>page.evaluate(()=>(window as any).__seedE2E.friendlyBatchCounts().generation)).toBeGreaterThan(h.cache.generation);
 const restarted=await page.evaluate(()=>({old:(window as any).__previousFriendlyBatch(),fresh:(window as any).__seedE2E.friendlyBatchCounts()}));
 expect(restarted.old.disposed).toBe(true);expect(restarted.old.glyphs).toBe(0);expect(restarted.old.atlasBytes).toBe(0);
 expect(restarted.fresh.disposed).toBe(false);expect(restarted.fresh.glyphs).toBeLessThanOrEqual(64);
 await page.evaluate(()=>(window as any).__seedE2E.streamingFixture(0,0,true,false,true));
 await expect.poll(()=>page.evaluate(()=>(window as any).__seedE2E.friendlyBatchCounts().glyphs)).toBeGreaterThan(0);
 expect(await page.evaluate(()=>(window as any).__seedE2E.canonicalStressState().projectiles)).toBe(800);
});
for(const lang of ["en","th"] as const)test(`boss real phase cue and posed weapon grip ${lang}`,async({page})=>{
 await startRun(page,"EPOCH-GOLDEN-001",{lang,uiScale:2});
 await page.evaluate(()=>{const h=(window as any).__seedE2E;h.stageBossReview("slam");h.bossPhaseReview();});
 await expect(page.locator("#boss-encounter")).toHaveAttribute("data-phase","phase-transition");
 await expect(page.locator("#boss-encounter strong")).toContainText(lang==="en"?"PHASE II":"ระยะที่ 2");
 await page.evaluate(()=>(window as any).__seedE2E.notificationReset());
 const panel=await page.locator("#boss-encounter").boundingBox();expect(panel!.y+panel!.height).toBeLessThan(360);
 await page.screenshot({path:`test-results/browser/content152-boss-${lang}.png`});
 await page.evaluate(()=>(window as any).__seedE2E.stageEvolution("hunters",0));
 const initialX=await page.evaluate(()=>JSON.parse((window as any).__seedE2E.snapshot()).p[0]);await page.keyboard.down("d");
 await expect.poll(()=>page.evaluate(()=>JSON.parse((window as any).__seedE2E.snapshot()).p[0])).toBeGreaterThan(initialX+5);
 await expect.poll(()=>page.evaluate(()=>(window as any).__seedE2E.integratedReview().equipment)).not.toBeNull();
 const rig=await page.evaluate(()=>{const h=(window as any).__seedE2E,body=h.actorPresentation()[0],weapon=h.integratedReview().equipment;return {dx:weapon.x-body.x-weapon.socket[0],dy:weapon.y-body.y-weapon.socket[1]};});
 expect(Math.hypot(rig.dx,rig.dy)).toBeLessThanOrEqual(2.01);
 await page.screenshot({path:`test-results/browser/content152-grip-${lang}.png`});await page.keyboard.up("d");
});
