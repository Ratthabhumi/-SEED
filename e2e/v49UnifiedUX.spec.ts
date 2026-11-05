import{test,expect}from'@playwright/test';import{prepareSave,startRun,assertNoRawKeys}from'./helpers';
import fs from'node:fs';
test('natural opening reaches a deliberate first technology without review grants',async({page})=>{
 await startRun(page,'EPOCH-GOLDEN-001');const snapshot=()=>page.evaluate(()=>JSON.parse((window as any).__seedE2E.snapshot()));
 const origin=(await snapshot()).p;await page.keyboard.down('d');await expect.poll(async()=>(await snapshot()).p[0]).toBeGreaterThan(origin[0]+5);await page.keyboard.up('d');
 await expect(page.locator('#draft-screen')).toBeVisible({timeout:90000});const before=await snapshot();expect(before.st[0]).toBeGreaterThan(0);
 const offers=await page.locator('.card').allInnerTexts(),behaviorPreviewCount=await page.locator('.choice-outcome').count();await page.locator('.card-select').first().click();expect((await snapshot()).st[3]).toBe(before.st[3]+1);
 fs.mkdirSync('test-results/v49-visible',{recursive:true});fs.writeFileSync('test-results/v49-visible/opening.json',JSON.stringify({classification:'BOUNDED_REAL_BROWSER_NOT_HUMAN_FUN',seed:'EPOCH-GOLDEN-001',firstDraftCanonicalSeconds:before.age[1],kills:before.st[0],offers,behaviorPreviewCount},null,2));
});
test('optional menus reverse Tab reaches Back from the initial heading',async({page})=>{
 await prepareSave(page);await page.goto('/?e2e');await page.getByRole('button',{name:'Settings',exact:true}).click();
 await page.keyboard.press('Shift+Tab');await expect(page.getByRole('button',{name:'Back',exact:true})).toBeFocused();
});
for(const lang of ['en','th']as const){
 test(`main settings retain choices and expose collection without nested card scroll ${lang}`,async({page})=>{
  await page.setViewportSize({width:1280,height:720});await prepareSave(page,{lang});await page.goto('/?e2e');
  await page.locator('#seed-input').fill('V49-KEEP-MY-SEED');await page.locator('.origin-choice').nth(1).click();
  await page.getByRole('button',{name:lang==='en'?'Settings':'ตั้งค่า',exact:true}).click();
  await page.keyboard.press('Escape');await expect(page.locator('#start-btn')).toBeVisible();
  await expect(page.locator('#seed-input')).toHaveValue('V49-KEEP-MY-SEED');await expect(page.locator('.origin-choice').nth(1)).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('.title-legacy .legacy-card').last().locator('button')).toBeInViewport();
  await page.locator('#title-help-btn').click();await expect(page.locator('#guide-screen')).toHaveAttribute('role','dialog');await page.keyboard.press('Escape');await expect(page.locator('#title-help-btn')).toBeFocused();await assertNoRawKeys(page);
  await page.screenshot({path:`test-results/v49-visible/main-${lang}.png`});
 });
 test(`focused pause shares accessible settings and Help returns without resuming ${lang}`,async({page})=>{
  await page.setViewportSize({width:1280,height:720});await startRun(page,'EPOCH-GOLDEN-001',{lang});await page.keyboard.press('Escape');
  const snap=()=>page.evaluate(()=>(window as any).__seedE2E.snapshot());const before=await snap();
  await expect(page.locator('#pause-settings')).not.toHaveAttribute('open','');await expect(page.locator('#pause-screen input[type=range]')).toBeHidden();
  await page.screenshot({path:`test-results/v49-visible/pause-${lang}.png`});
  await page.locator('#pause-settings summary').click();await expect(page.locator('#pause-volume')).toHaveAccessibleName(lang==='en'?'Volume':'เสียง');
  await page.locator('#pause-volume').fill('25');await page.locator('#pause-reducedEffects').check();
  await page.locator('#pause-screen').getByRole('button',{name:lang==='en'?'High':'สูง',exact:true}).click();
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('seed-game-save-v1')!).settings.volume)).toBe(.25);expect(await snap()).toBe(before);
  await page.screenshot({path:`test-results/v49-visible/settings-${lang}.png`});
  await page.locator('#pause-help-btn').click();await expect(page.locator('#guide-screen')).toBeVisible();await page.keyboard.press('Escape');await expect(page.locator('#pause-screen')).toBeVisible();await expect(page.locator('#pause-help-btn')).toBeFocused();expect(await snap()).toBe(before);
  await page.keyboard.press('Escape');await expect(page.locator('#pause-screen')).toHaveCount(0);
 });
}
