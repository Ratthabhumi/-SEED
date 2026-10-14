import {test,expect} from "@playwright/test";
import {startRun} from "./helpers";
for(const lang of ["en","th"] as const)for(const held of ["Space","Enter","1"])test(`held gameplay ${held} cannot choose technology ${lang}`,async({page})=>{
 await startRun(page,"EPOCH-GOLDEN-001",{lang});
 await page.keyboard.down(held);
 await page.evaluate(()=>(window as any).__seedE2E.grant(30));
 await expect(page.locator("#draft-screen")).toBeVisible();
 const ids=await page.locator("#draft-screen .card").evaluateAll(cards=>cards.map(c=>(c as HTMLElement).dataset.nodeId));
 await page.keyboard.down(held); await page.keyboard.up(held);
 await expect(page.locator("#draft-screen")).toBeVisible();
 expect(await page.locator("#draft-screen .card").evaluateAll(cards=>cards.map(c=>(c as HTMLElement).dataset.nodeId))).toEqual(ids);
 await page.keyboard.press("Enter");
 await expect(page.locator("#draft-screen")).toHaveCount(0);
});
test("queued drafts replace stale surface before a second click can commit",async({page})=>{
 await startRun(page,"EPOCH-GOLDEN-001");await page.evaluate(()=>(window as any).__seedE2E.grant(100));
 await expect(page.locator("#draft-screen")).toBeVisible();
 await page.locator("#draft-screen").evaluate(screen=>{
  (screen as HTMLElement).dataset.old="true";
  const button=screen.querySelector<HTMLButtonElement>(".card-select")!;button.click();button.click();
 });
 await expect(page.locator("#draft-screen")).not.toHaveAttribute("data-old","true");
 const facts=await page.evaluate(()=>(window as any).__seedE2E.draftFacts());
 expect(facts.taken).toBe(1);expect(await page.locator("#draft-screen .card").evaluateAll(cards=>cards.map(c=>(c as HTMLElement).dataset.nodeId))).toEqual(facts.offers);
});
