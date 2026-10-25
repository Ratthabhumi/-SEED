import {test,expect} from "@playwright/test";
import {prepareSave} from "./helpers";

for(const lang of ["en","th"] as const)test(`resource-gated loading is visible and clears on real startup ${lang}`,async({page})=>{
 await page.setViewportSize({width:lang==="th"?1920:1280,height:lang==="th"?1080:720});
 await prepareSave(page,{lang,uiScale:2});
 let release=()=>{};const gate=new Promise<void>(resolve=>{release=resolve;});
 await page.route("**/boss-v2-*.png",async route=>{await gate;await route.continue();});
 try{
  await page.goto("/?e2e");await page.locator("#start-btn").click();
  const loading=page.locator(".run-loading");
  await expect(loading).toBeVisible();
  await expect(loading).toHaveAttribute("role","status");
  await expect(loading).toContainText(lang==="th"?"กำลังเตรียมโลกของคุณ":"Preparing your world");
  await expect(page.locator(".hud")).toHaveCount(0);
  const box=await loading.locator(".panel").boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);expect(box!.x+box!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  await page.screenshot({path:`test-results/browser/v33-loading-${lang}.png`});
  release();
  await page.waitForFunction(()=>!!(window as any).__seedE2E?.snapshot&&document.fonts.status==="loaded",undefined,{timeout:45000});
  await expect(page.locator(".hud")).toBeVisible();await expect(loading).toHaveCount(0);
 }finally{release();}
});
