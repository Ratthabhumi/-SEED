import {test,expect} from "@playwright/test";
import {prepareSave,startRun,openPause} from "./helpers";
test.use({video:{mode:'on',size:{width:1280,height:720}}});
test.afterEach(async({page},info)=>{
 const video=page.video();await page.close();
 if(video)await video.saveAs(`test-results/browser/render-closure-${info.title.replace(/[^a-zA-Z0-9]+/g,'-')}.webm`);
});

test('optional profiler records bounded unique frames and restores on restart',async({page})=>{
 await prepareSave(page);await page.goto('/?e2e&profile=1');await page.locator('#start-btn').click();
 await page.waitForFunction(()=>(window as any).__seedE2E?.renderDiagnostics());
 await page.evaluate(()=>(window as any).__seedE2E.canonicalStressStart(false));await page.waitForTimeout(1200);
 const d=await page.evaluate(()=>(window as any).__seedE2E.renderDiagnostics());
 expect(d.frames.length).toBeGreaterThan(10);expect(d.frames.length).toBeLessThanOrEqual(1200);
 expect(new Set(d.frames.map((f:any)=>f.frame)).size).toBe(d.frames.length);
 expect(d.frames.some((f:any)=>f.spans['render.Graphics']!==undefined)).toBe(true);
 expect(d.frames.some((f:any)=>f.spans['simulation.step']!==undefined)).toBe(true);
 await openPause(page);await page.locator('#pause-restart-btn').click();
 await page.waitForFunction(()=>(window as any).__seedE2E?.renderDiagnostics()?.frames.length>3);
 const next=await page.evaluate(()=>(window as any).__seedE2E.renderDiagnostics());expect(next.frames.length).toBeLessThan(1200);
});

for(const age of [0,5])test(`reference key poses, frame progression, pause and sockets age${age}`,async({page})=>{
 await startRun(page,'EPOCH-GOLDEN-001');await page.evaluate(a=>(window as any).__seedE2E.stageEvolution('hunters',a),age);
 await page.keyboard.down('w');
 const gait=await page.evaluate(()=>new Promise<number[]>(resolve=>{
  const frames=new Set<number>(),until=performance.now()+1200;
  const observe=()=>{const pose=(window as any).__seedE2E.referenceAnimation();if(pose?.action==='walk')frames.add(pose.index);
   if(performance.now()<until)requestAnimationFrame(observe);else resolve([...frames]);};observe();
 }));await page.keyboard.up('w');expect(gait.sort()).toEqual([0,1]);
 for(const action of ['attack','hurt','dash','special','death']){
  await page.evaluate(k=>(window as any).__seedE2E.heroActionReview(k),action);await page.waitForTimeout(70);
  const sample=await page.evaluate(()=>({pose:(window as any).__seedE2E.referenceAnimation(),hero:(window as any).__seedE2E.actorPresentation()[0]}));
  expect(sample.hero.texture).toBe('hero-reference');expect(sample.hero.rotation).toBe(0);expect(sample.pose.action).toBe(action);expect(sample.pose.socket).toHaveLength(2);
  await page.waitForTimeout(100);expect(await page.evaluate(()=>(window as any).__seedE2E.referenceAnimation())).toEqual(sample.pose);
  await page.screenshot({path:`test-results/browser/reference-${age}-${action}.png`});
 }
});

test('hostile glyph cache is bounded, profiler absent normally, numeric prototype restart safe',async({page})=>{
 await prepareSave(page);await page.goto('/?e2e&numbers=atlas');await page.locator('#start-btn').click();
 await page.waitForFunction(()=>(window as any).__seedE2E?.canonicalStressStart);
 expect(await page.evaluate(()=>(window as any).__seedE2E.renderDiagnostics())).toBeNull();
 await page.evaluate(()=>(window as any).__seedE2E.canonicalStressStart(false));
 // Software-rendered CI can advance far less than2.2 simulation seconds in
 //2.2 wall seconds. Require the real rendered shot; do not assume wall=sim.
 await expect.poll(()=>page.evaluate(()=>(window as any).__seedE2E.hostileBatchCounts().glyphs),{timeout:30000}).toBeGreaterThan(0);
 const counts=await page.evaluate(()=>(window as any).__seedE2E.hostileBatchCounts());expect(counts.glyphs).toBeGreaterThan(0);expect(counts.glyphs).toBeLessThanOrEqual(64);
 const before=await page.evaluate(()=>(window as any).__seedE2E.numericFeedbackCounts());expect(before.allocated).toBeLessThanOrEqual(12);
 await openPause(page);await page.locator('#pause-restart-btn').click();await page.waitForTimeout(500);
 await page.evaluate(()=>(window as any).__seedE2E.canonicalStressStart(false));await page.waitForTimeout(1000);
 expect((await page.evaluate(()=>(window as any).__seedE2E.numericFeedbackCounts())).allocated).toBeLessThanOrEqual(12);
});
