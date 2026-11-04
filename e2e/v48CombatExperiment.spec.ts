import{test,expect}from'@playwright/test';
import{startRun,assertNoRawKeys}from'./helpers';
for(const lang of ['en','th']as const)test(`actual moving mine trail and pause ${lang}`,async({page})=>{
 await page.setViewportSize({width:1280,height:720});await startRun(page,'V48-CONTROL',{lang});
 await page.keyboard.down('d');
 // Sample frequently: a new mine's 0.3s age window can fall between default polls.
 await expect.poll(()=>page.evaluate(()=>{const s=JSON.parse((window as any).__seedE2E.snapshot());return s.mn.some((m:string)=>{const a=m.split(',').map(Number);return a[4]>11.7&&a[0]-s.p[0]<-50;});}),{intervals:[50]}).toBe(true);
 await page.keyboard.up('d');await assertNoRawKeys(page);
 await page.screenshot({path:`test-results/v48-visible/mine-trail-${lang}.png`});
 await page.keyboard.press('Escape');await expect(page.locator('#pause-screen')).toBeVisible();
 const snapshot=await page.evaluate(()=>(window as any).__seedE2E.snapshot());await page.waitForTimeout(150);expect(await page.evaluate(()=>(window as any).__seedE2E.snapshot())).toBe(snapshot);
 await expect(page.locator('#pause-screen .legacy-collection')).toHaveCount(0);await page.keyboard.press('Escape');
});
for(const lang of ['en','th']as const)test(`truthful build tactic and deliberate draft selection ${lang}`,async({page})=>{
 // Selected offline only for UI coverage: its initial canonical offer includes
 // a behavior upgrade. No gameplay/cohort seed or production offer is changed.
 await page.setViewportSize({width:1280,height:720});await startRun(page,'V48-UI-4',{lang});
 await page.evaluate(()=>(window as any).__seedE2E.grant(30));await expect(page.locator('#draft-screen')).toBeVisible();
 await expect(page.locator('.card-combat-tactic').first()).toBeVisible();await assertNoRawKeys(page);
 await page.screenshot({path:`test-results/v48-visible/upgrade-${lang}.png`});
 const before=await page.evaluate(()=>(window as any).__seedE2E.draftFacts().taken);
 await page.locator('.card-select').first().focus();await page.keyboard.press('Space');expect(await page.evaluate(()=>(window as any).__seedE2E.draftFacts().taken)).toBe(before);
 await page.keyboard.press('Enter');expect(await page.evaluate(()=>(window as any).__seedE2E.draftFacts().taken)).toBe(before+1);
});
