import {test,expect} from "@playwright/test";
import {startRun,prepareSave,SAVE_KEY,assertNoRawKeys} from "./helpers";
for(const lang of ["en","th"] as const){
test("FPS, original slice, canonical pause and reduced effects ("+lang+")",async({page})=>{
 const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
 await page.setViewportSize({width:lang==="en"?1920:1280,height:lang==="en"?1080:720});
 await startRun(page,"EPOCH-GOLDEN-001",{lang});
 const fps=page.locator("#fps-hud");await expect(fps).toHaveCount(1);await expect(fps).toContainText(/FPS: \d+/);await expect(fps).toContainText(lang==="en"?"Attempt 1":"รอบเล่น 1");
 await page.keyboard.press("Escape");await expect(page.locator("#pause-screen")).toBeVisible();
 const snap=()=>page.evaluate(()=>(window as any).__seedE2E.snapshot());
 const before=await snap();await page.locator("#pause-reducedEffects").check();await page.locator("#pause-shake").uncheck();
 await page.waitForTimeout(600);expect(await snap()).toBe(before);
 const layout=await page.locator("#pause-screen .pause-panel").evaluate(el=>({height:el.clientHeight,scroll:el.scrollHeight}));
 console.log(lang+" pause layout",layout);await page.screenshot({path:"test-results/browser/evolution-pause-100-"+lang+".png"});
 expect(layout.scroll).toBeLessThanOrEqual(layout.height+1);
 await page.screenshot({path:"test-results/browser/evolution-pause-100-"+lang+".png"});
 await page.locator("#pause-screen").getByRole("button",{name:"200%",exact:true}).click();
 const b=await fps.boundingBox();expect(b?.x).toBeGreaterThanOrEqual(0);expect((b?.x??0)+(b?.width??0)).toBeLessThanOrEqual(lang==="en"?1920:1280);
 await assertNoRawKeys(page);await page.screenshot({path:"test-results/browser/evolution-pause-"+lang+".png"});
 await page.keyboard.press("Escape");await expect(page.locator("#pause-screen")).toHaveCount(0);
 await page.screenshot({path:"test-results/browser/evolution-world-"+lang+".png"});
 const perf=await page.evaluate(()=>(window as any).__seedE2E.performanceSamples());
 expect(perf.pools.mites).toBeLessThanOrEqual(64);expect(perf.pools.landmarks).toBeLessThanOrEqual(48);expect(perf.pools.vfx).toBeLessThanOrEqual(16);
 await page.keyboard.press("Escape");await page.locator("#pause-restart-btn").click();
 await expect(fps).toHaveCount(1);await expect(fps).toContainText(lang==="en"?"Attempt 2":"รอบเล่น 2");expect(errors).toEqual([]);
});
}
test("Archive purchases persist once, optional energy choice survives settings and E2E deaths earn zero",async({page})=>{
 await prepareSave(page);await page.goto("/?e2e");
 await page.evaluate(key=>{const s=JSON.parse(localStorage.getItem(key)!);s.schema=2;s.meta={insight:12,purchased:[],nextAttempt:1,lastSettled:0,energyStart:false};localStorage.setItem(key,JSON.stringify(s));},SAVE_KEY);
 // The fixture's init script applies on each navigation; remove it by using the
 // in-app scene restart through the title language button, preserving storage.
 await page.getByRole("button",{name:"ไทย",exact:true}).click();
 await page.locator("#archive-panel summary").click();
 await page.locator('[data-archive-id="energy-kit"]').click();
 await expect(page.locator('[data-archive-id="energy-kit"]')).toBeDisabled();
 await page.locator("#archive-energy-start").check();
 await page.locator('[data-archive-id="survival-kit"]').click();
 const stored=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).meta,SAVE_KEY);
 expect(stored.insight).toBe(4);expect(stored.purchased).toEqual(["energy-kit","survival-kit"]);expect(stored.energyStart).toBe(true);
 await page.locator("#start-btn").click();await expect(page.locator(".hud")).toBeVisible();
 const state=await page.evaluate(()=>JSON.parse((window as any).__seedE2E.snapshot()));
 expect(state.b[1]).toBe(115);expect(state.origin[1]).toBe("energy");
 await page.evaluate(()=>(window as any).__seedE2E.kill());
 await expect(page.locator(".archive-result")).toContainText("+0");
 expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).meta.insight,SAVE_KEY)).toBe(4);
});

test("measured parent and child frame samples plus HUD lifecycle",async({page})=>{
 await page.addInitScript(()=>{
   const probe={calls:0,vertices:0,frames:[] as Array<{calls:number;vertices:number}>,driver:"unknown"};(window as any).__seedRenderProbe=probe;
   for(const Type of [window.WebGLRenderingContext,window.WebGL2RenderingContext])if(Type){
     for(const name of ["drawElements","drawArrays"] as const){
       const original=Type.prototype[name] as any;if(original.__seedProbe)continue;
       const wrapped=function(this:WebGLRenderingContext,...args:any[]){
         probe.calls++;probe.vertices+=Number(args[name==="drawArrays"?2:1])||0;
         if(probe.driver==="unknown"){const ext=this.getExtension("WEBGL_debug_renderer_info");probe.driver=ext?String(this.getParameter(ext.UNMASKED_RENDERER_WEBGL)):"masked WebGL";}
         return original.apply(this,args);
       };(wrapped as any).__seedProbe=true;(Type.prototype[name] as any)=wrapped;
     }
   }
   const sample=()=>{if(probe.calls){probe.frames.push({calls:probe.calls,vertices:probe.vertices});if(probe.frames.length>240)probe.frames.shift();probe.calls=probe.vertices=0;}requestAnimationFrame(sample);};requestAnimationFrame(sample);
 });
 await page.setViewportSize({width:1920,height:1080});await startRun(page,"EPOCH-GOLDEN-001");
 const measure=async()=>{
  await page.evaluate(()=>{(window as any).__seedE2E.resetPerformanceSamples();(window as any).__seedRenderProbe.frames=[];});
  await page.waitForTimeout(4500);
  return page.evaluate(()=>({...((window as any).__seedE2E.performanceSamples()),gpuSubmission:(window as any).__seedRenderProbe}));
 };
 const parent=await measure();
 await page.evaluate(()=>(window as any).__seedE2E.readyAscend());await page.locator(".hud-ascend button").click();
 await page.locator("#legacy-screen .card").first().click();await page.locator("#origin-screen .card").first().click();
 await page.keyboard.press("Escape");await expect(page.locator("#child-intro-screen")).toHaveCount(0);
 const child=await measure();await expect(page.locator("#fps-hud")).toHaveCount(1);await expect(page.locator("#fps-hud")).toContainText("World 2");
 const percentile=(xs:number[],p:number)=>{const v=[...xs].sort((a,b)=>a-b);return Number((v[Math.min(v.length-1,Math.floor(v.length*p))]??0).toFixed(3));};
 const summary=(s:any)=>({samples:s.frame.length,frameMs:[.5,.95,.99].map(p=>percentile(s.frame,p)),simMs:[.5,.95,.99].map(p=>percentile(s.sim,p)),presentationCommandsMs:[.5,.95,.99].map(p=>percentile(s.rendererCpuSubmit,p)),gpuSubmission:{driver:s.gpuSubmission.driver,drawCallsP95:percentile(s.gpuSubmission.frames.map((f:any)=>f.calls),.95),verticesP95:percentile(s.gpuSubmission.frames.map((f:any)=>f.vertices),.95)},sceneObjects:s.sceneObjects,pools:s.pools,rendererType:s.rendererType,viewport:s.viewport,age:s.age,ascension:s.ascension});
 const report={classification:"LOCAL_BROWSER_MEASUREMENT",limitations:"Short sparse trace, driver reported explicitly. Presentation command construction excludes Phaser render/GPU completion. Draw/vertex counts are WebGL submissions, not GPU execution time; no stress-load or hardware60FPS certification.",parent:summary(parent),child:summary(child)};
 const fs=await import("node:fs/promises");await fs.writeFile("test-results/evolution-performance.json",JSON.stringify(report,null,2));
 expect(parent.frame.length).toBeGreaterThan(20);expect(child.frame.length).toBeGreaterThan(20);
 await page.screenshot({path:"test-results/browser/evolution-child.png"});
});
