import {test,expect} from "@playwright/test";
import {startRun} from "./helpers";

for(const lang of ["en","th"] as const)test(`Space never commits a focused Draft ${lang}`,async({page})=>{
 await startRun(page,"EPOCH-GOLDEN-001",{lang});
 await page.evaluate(()=>(window as any).__seedE2E.grant(100));
 const select=page.locator("#draft-screen .card-select").first();
 await expect(select).toBeVisible();await select.focus();
 const before=await page.locator("#draft-screen").innerHTML();
 await page.keyboard.down("Space");await page.keyboard.down("Space");await page.keyboard.up("Space");
 await expect(page.locator("#draft-screen")).toHaveCount(1);
 expect(await page.locator("#draft-screen").innerHTML()).toBe(before);
 await page.keyboard.press("Enter");
 await expect.poll(async()=>page.locator("#draft-screen").count().then(async n=>n?await page.locator("#draft-screen").innerHTML():"")).not.toBe(before);
});

test("held Space cannot cross queued Drafts and a fresh gameplay press still dashes",async({page})=>{
 await startRun(page,"EPOCH-GOLDEN-001");await page.evaluate(()=>(window as any).__seedE2E.stageEvolution("hunters",0));
 await page.keyboard.down("Space");await page.keyboard.down("w");
 await page.evaluate(()=>(window as any).__seedE2E.grant(100));
 await expect(page.locator("#draft-screen")).toBeVisible();
 const before=await page.locator("#draft-screen").innerHTML();await page.keyboard.down("Space");
 expect(await page.locator("#draft-screen").innerHTML()).toBe(before);
 await page.keyboard.up("Space");await page.keyboard.up("w");
 for(let i=0;i<8&&await page.locator("#draft-screen").count();i++){
  const current=await page.locator("#draft-screen").innerHTML();await page.keyboard.press("Space");
  expect(await page.locator("#draft-screen").innerHTML()).toBe(current);
  await page.locator("#draft-screen .card-select").first().click();
 }
 await expect(page.locator("#draft-screen")).toHaveCount(0);
 await expect.poll(()=>page.evaluate(()=>JSON.parse((window as any).__seedE2E.snapshot()).p[5])).toBeLessThanOrEqual(0);
 // Canonical Dash requires a direction (il>0); stationary Space is not a Dash.
 await page.keyboard.down("d");
 await page.keyboard.press("Space");
 await expect.poll(()=>page.evaluate(()=>JSON.parse((window as any).__seedE2E.snapshot()).p[5])).toBeGreaterThan(0);
 await page.keyboard.up("d");
});

for(const surface of ["draft","pause","tech","civ","blur"])test(`physical movement release survives ${surface} boundary`,async({page})=>{
 await startRun(page,"EPOCH-GOLDEN-001");
 await page.evaluate(()=>(window as any).__seedE2E.stageEvolution("hunters",0));
 const pos=()=>page.evaluate(()=>{const s=JSON.parse((window as any).__seedE2E.snapshot());return {x:s.p[0],y:s.p[1]};});
 const initial=await pos();await page.keyboard.down("w");await page.keyboard.down("d");
 await expect.poll(async()=>(await pos()).x).toBeGreaterThan(initial.x+5);
 if(surface==="draft")await page.evaluate(()=>(window as any).__seedE2E.grant(100));
 else if(surface==="blur")await page.evaluate(()=>window.dispatchEvent(new Event("blur")));
 else await page.keyboard.press(surface==="pause"?"Escape":surface==="tech"?"t":"m");
 await page.keyboard.up("w");await page.keyboard.up("d");
 if(surface==="draft")for(let i=0;i<8&&await page.locator("#draft-screen").count();i++)await page.locator("#draft-screen .card-select").first().click();
 else if(surface!=="blur")await page.keyboard.press("Escape");
 await page.waitForTimeout(150);const stopped=await pos();await page.waitForTimeout(250);
 expect(await pos()).toEqual(stopped);
 await page.keyboard.down("w");await expect.poll(async()=>(await pos()).y).toBeLessThan(stopped.y-5);await page.keyboard.up("w");
});
test("editable focus clears held movement and typing cannot move the hero",async({page})=>{
 await startRun(page,"EPOCH-GOLDEN-001");await page.evaluate(()=>(window as any).__seedE2E.stageEvolution("hunters",0));
 const pos=()=>page.evaluate(()=>JSON.parse((window as any).__seedE2E.snapshot()).p.slice(0,2));
 const begin=await pos();await page.keyboard.down("d");await expect.poll(async()=>(await pos())[0]).toBeGreaterThan(begin[0]+5);
 await page.evaluate(()=>{const edit=document.createElement("textarea");edit.id="input-context-editor";document.getElementById("ui")!.appendChild(edit);edit.focus();});
 await page.keyboard.up("d");await page.keyboard.down("w");const stopped=await pos();await page.waitForTimeout(250);expect(await pos()).toEqual(stopped);await page.keyboard.up("w");
 await page.keyboard.type("tf ");await expect(page.locator("#techmap-screen")).toHaveCount(0);await expect(page.locator("#input-context-editor")).toHaveValue("wtf ");
 await page.evaluate(()=>document.getElementById("input-context-editor")!.remove());
 await page.keyboard.down("d");await expect.poll(async()=>(await pos())[0]).toBeGreaterThan(stopped[0]+5);await page.keyboard.up("d");
});
