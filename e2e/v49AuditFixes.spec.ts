import{test,expect}from'@playwright/test';import{startRun,prepareSave,resolveDrafts}from'./helpers';
test('Chronicle contains keyboard focus and returns to Main without changing earned collection',async({page})=>{
 await startRun(page,'EPOCH-GOLDEN-001');await page.evaluate(()=>(window as any).__seedE2E.kill());
 const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();await expect(dialog.locator('h2').first()).toBeFocused();
 await page.screenshot({path:'test-results/v49-visible/chronicle.png'});
 const collection=await page.evaluate(()=>JSON.parse(localStorage.getItem('seed-game-save-v1')!).collection);
 await page.keyboard.press('Shift+Tab');await expect(dialog.getByRole('button').last()).toBeFocused();await page.keyboard.press('Tab');await expect(dialog.locator('summary').first()).toBeFocused();
 await page.keyboard.press('Escape');await expect(page.locator('#start-btn')).toBeVisible();expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('seed-game-save-v1')!).collection)).toEqual(collection);
});
test('Civilization Map retains discovered unclaimed sites with an accessible state legend',async({page})=>{
 await startRun(page,'EPOCH-GOLDEN-001');await page.evaluate(()=>(window as any).__seedE2E.teleportToPOI());
 await expect.poll(()=>page.evaluate(()=>JSON.parse((window as any).__seedE2E.snapshot()).world[1].length)).toBeGreaterThan(0);
 await resolveDrafts(page);await page.keyboard.press('m');
 await expect(page.locator('#civmap-screen')).toBeVisible();await expect(page.locator('#civmap-screen canvas')).toHaveAccessibleDescription(/Visited: [1-9]/);
 await expect(page.locator('.civmap-key [data-map-state]')).toHaveCount(7);
 const before=await page.evaluate(()=>(window as any).__seedE2E.snapshot());await page.screenshot({path:'test-results/v49-visible/map-discovery.png'});expect(await page.evaluate(()=>(window as any).__seedE2E.snapshot())).toBe(before);
});
test('failed settings persistence restores the volume control instead of presenting an unapplied value',async({page})=>{
 await prepareSave(page);await page.goto('/?e2e');await page.getByRole('button',{name:'Settings',exact:true}).click();const volume=page.locator('#title-volume'),before=await volume.inputValue();
 await page.evaluate(()=>{Storage.prototype.setItem=()=>{throw new DOMException('staged quota failure','QuotaExceededError');};});await volume.fill('25');await expect(volume).toHaveValue(before);await expect(page.locator('.settings-error')).toBeVisible();
});
