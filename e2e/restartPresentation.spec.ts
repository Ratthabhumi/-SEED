import {test,expect} from "@playwright/test";
import {startRun,openPause} from "./helpers";
test("real damage feedback remains usable after scene restart",async({page})=>{
 const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
 await startRun(page,"EPOCH-GOLDEN-001");
 await page.evaluate(()=>{const h=(window as any).__seedE2E;h.stageFamilyReview("energy");h.advanceEvolution(1.5);});
 await page.locator(".hud").evaluate(hud=>(hud as HTMLElement).dataset.beforeRestart="true");
 await openPause(page);await page.locator("#pause-restart-btn").click();
 await expect(page.locator('.hud[data-before-restart="true"]')).toHaveCount(0);await expect(page.locator(".hud")).toBeVisible();
 await page.evaluate(()=>{const h=(window as any).__seedE2E;h.stageFamilyReview("energy");h.advanceEvolution(1.5);});
 await page.waitForTimeout(200);expect(errors).toEqual([]);
});
