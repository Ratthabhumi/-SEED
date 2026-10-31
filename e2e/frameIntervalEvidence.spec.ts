import {test,expect} from '@playwright/test';
import {prepareSave,startRun,openPause} from './helpers';

test('ordinary play keeps interval instrumentation disabled; profile explicitly enables it',async({page})=>{
  await startRun(page,'EPOCH-GOLDEN-001');
  expect(await page.evaluate(()=>(window as any).__seedE2E.frameIntervalEvidence())).toBeNull();
  await page.goto('/?e2e&profile=1');await page.locator('#start-btn').click();
  await page.waitForFunction(()=>!!(window as any).__seedE2E?.frameIntervalEvidence?.());
  await expect.poll(()=>page.evaluate(()=>(window as any).__seedE2E.frameIntervalEvidence().intervals.callbacks)).toBeGreaterThan(10);
});

for(const [width,height,lang] of [[1280,720,'en'],[1920,1080,'th']] as const){
  test(`QA aggregate download, pause, visibility boundaries and restart ${height} ${lang}`,async({page},info)=>{
    await page.setViewportSize({width,height});await prepareSave(page,{lang});
    await page.route('**/__qa/report',route=>route.fulfill({status:200,body:'{}'}));
    await page.goto('/?e2e&qa=1');await page.locator('#start-btn').click();
    await page.waitForFunction(()=>!!(window as any).__seedE2E?.frameIntervalEvidence?.()&&document.fonts.status==='loaded');
    await expect.poll(()=>page.evaluate(()=>(window as any).__seedE2E.frameIntervalEvidence().intervals.coverage)).toBeGreaterThan(10);
    await page.keyboard.press('F10');
    const button=page.locator('#qa-frame-interval-download');await expect(button).toBeVisible();
    await expect(button).toContainText(lang==='th'?'ดาวน์โหลด':'Download');
    const received=page.waitForEvent('download');await button.click();const download=await received;
    expect(download.suggestedFilename()).toBe('frame-interval-evidence.json');
    await download.saveAs(info.outputPath('frame-interval-evidence.json'));
    await page.screenshot({path:info.outputPath(`interval-qa-${height}-${lang}.png`)});
    // Explicit synthetic visibility events verify the adapter; not host/tab timing evidence.
    const boundary=await page.evaluate(()=>{
      const h=(window as any).__seedE2E;h.resetPerformanceSamples();
      Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));
      Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'));
      delete (document as any).hidden;return h.frameIntervalEvidence();
    });
    expect(boundary.intervals.visibilityTransitions).toBe(2);
    await expect.poll(()=>page.evaluate(()=>(window as any).__seedE2E.frameIntervalEvidence().intervals.reentryCallbacks)).toBe(1);
    await openPause(page);await expect.poll(()=>page.evaluate(()=>(window as any).__seedE2E.frameIntervalEvidence().intervals.pausedCallbacks)).toBeGreaterThan(1);
    await page.locator('#pause-restart-btn').click();
    await expect.poll(()=>page.evaluate(()=>(window as any).__seedE2E.frameIntervalEvidence()?.intervals.visibilityTransitions)).toBe(0);
  });
}
