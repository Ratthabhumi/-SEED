import { test, expect } from "@playwright/test";
import { startRun, openPause, assertNoRawKeys, resolveDrafts } from "./helpers";

for (const lang of ["en", "th"] as const) {
  test(`pause and draft use the desktop viewport (${lang})`, async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await startRun(page, "PLAYABILITY-UI", { lang });
    await openPause(page);
    const panel = page.locator("#pause-screen .pause-panel");
    expect(await panel.evaluate((el) => el.clientWidth)).toBeGreaterThan(900);
    expect(await panel.evaluate((el) => el.scrollHeight - el.clientHeight)).toBeLessThanOrEqual(2);
    await assertNoRawKeys(page);
    await page.screenshot({ path: `test-results/browser/pause-responsive-${lang}.png` });
    await page.keyboard.press("Escape");
    await page.evaluate(() => (window as unknown as { __seedE2E: { grant: (n: number) => void } }).__seedE2E.grant(1000));
    await expect(page.locator("#draft-screen .card")).toHaveCount(3);
    const boxes = await page.locator("#draft-screen .card").evaluateAll((els) => els.map((el) => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, right: r.right }; }));
    expect(Math.max(...boxes.map((b) => b.y)) - Math.min(...boxes.map((b) => b.y))).toBeLessThan(2);
    expect(boxes[1]!.x).toBeGreaterThan(boxes[0]!.right);
    await expect(page.locator("#draft-screen .card-preview img")).toHaveCount(3);
    await expect(page.locator("#draft-screen .card-effects")).toHaveCount(3);
    expect(await page.locator("#draft-screen").innerText()).not.toMatch(/QUALITY\.|MODIFIER\.|quality\.|modifier\./);
    await page.screenshot({ path: `test-results/browser/draft-responsive-${lang}.png` });
    await page.keyboard.press("1");
  });
}

test("200% Thai draft keeps choice toolbar within the viewport", async ({page}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await startRun(page, "PLAYABILITY-SCALE", { lang: "th", uiScale: 2 });
  await page.evaluate(() => (window as unknown as { __seedE2E: { grant: (n: number) => void } }).__seedE2E.grant(1000));
  const toolbar = page.locator("#draft-screen .draft-agency");
  await expect(toolbar).toBeVisible();
  const r = await toolbar.boundingBox();
  expect(r!.y).toBeGreaterThanOrEqual(0); expect(r!.y + r!.height).toBeLessThanOrEqual(720);
  expect(await page.locator("#draft-screen").evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
  await page.screenshot({path:"test-results/browser/draft-200-th.png"});
});

test("exhausted technology pool disables reroll before a player spends it", async ({page}) => {
  await startRun(page, "PLAYABILITY-EMPTY");
  await page.evaluate(() => (window as unknown as { __seedE2E: { stageNoAlternativeDraft: () => void } }).__seedE2E.stageNoAlternativeDraft());
  const reroll = page.locator("#draft-reroll-btn");
  await expect(reroll).toBeVisible(); await expect(reroll).toBeDisabled();
  await expect(reroll).toContainText("No other technologies");
  await expect(page.locator("#draft-skip-btn")).toBeEnabled();
  await resolveDrafts(page, 20);
  await expect(page.locator("#draft-screen")).toHaveCount(0);
  await page.keyboard.press("T");
  await expect(page.locator("#techmap-screen")).toBeVisible();
  await expect.poll(() => page.locator(".techmap-node").evaluateAll(els => { const v = document.querySelector(".techmap-viewport")!.getBoundingClientRect(); return els.filter(el => { const r = el.getBoundingClientRect(); return r.right > v.left && r.left < v.right && r.bottom > v.top && r.top < v.bottom; }).length; })).toBeGreaterThan(0);
});

test("logistics allocation can be corrected through the Civilization Map", async ({ page }) => {
  await startRun(page, "PLAYABILITY-ALLOCATE");
  await page.evaluate(() => (window as unknown as { __seedE2E: { stageAllocationRegression: () => void } }).__seedE2E.stageAllocationRegression());
  await expect(page.locator("#civmap-screen")).toBeVisible();
  await page.locator(".civmap-site").first().click();
  const release = page.locator("#outpost-dismantle-btn");
  await expect(release).toBeVisible();
  page.once("dialog", (d) => d.dismiss());
  await release.click();
  const read = () => page.evaluate(() => (window as unknown as { __seedE2E: { specRegressionState: () => { logistics: number } } }).__seedE2E.specRegressionState());
  expect((await read()).logistics).toBe(6);
  page.once("dialog", (d) => d.accept());
  await release.click();
  expect((await read()).logistics).toBe(4);
  await page.keyboard.press("Escape");
  await expect(page.locator("#civmap-screen")).toHaveCount(0);
});

for (const lang of ["en", "th"] as const) {
  test(`mobile decisions remain contained and keyboard reachable (${lang})`, async ({page}) => {
    await page.setViewportSize({width:390,height:844});
    await startRun(page,"PLAYABILITY-MOBILE",{lang});
    await openPause(page);
    expect(await page.locator("#pause-screen .pause-panel").evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    await page.keyboard.press("Escape");
    await page.evaluate(() => (window as unknown as {__seedE2E:{grant:(n:number)=>void}}).__seedE2E.grant(100));
    expect(await page.locator("#draft-screen").evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    const skip = page.locator("#draft-skip-btn");
    await skip.focus();
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => document.activeElement?.closest("#draft-screen") !== null)).toBe(true);
    await expect(page.locator("#draft-screen summary").first()).toBeFocused();
    await assertNoRawKeys(page);
    await page.screenshot({path:`test-results/browser/draft-mobile-${lang}.png`});
    await resolveDrafts(page, 20);
    await expect(page.locator("#draft-screen")).toHaveCount(0);
    await page.keyboard.press("T");
    await expect(page.locator("#techmap-screen")).toBeVisible();
    expect(await page.locator(".techmap-wrap").evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    const close = await page.locator(".techmap-btn-close").boundingBox();
    expect(close!.x + close!.width).toBeLessThanOrEqual(390);
    expect(close!.y + close!.height).toBeLessThanOrEqual(844);
    await expect.poll(() => page.locator(".techmap-node").evaluateAll(els => { const v = document.querySelector(".techmap-viewport")!.getBoundingClientRect(); return els.filter(el => { const r = el.getBoundingClientRect(); return r.right > v.left && r.left < v.right && r.bottom > v.top && r.top < v.bottom; }).length; })).toBeGreaterThan(0);
    await page.screenshot({path:`test-results/browser/radial-mobile-${lang}.png`});
  });
}

for (const lang of ["en","th"] as const) {
  test(`radial map exposes four directions around the root (${lang})`, async ({page}) => {
    await page.setViewportSize({width:1920,height:1080});
    await startRun(page,"PLAYABILITY-RADIAL",{lang});
    await page.keyboard.press("T");
    await page.locator(".techmap-btn-center").click();
    await expect(page.locator(".techmap-node[data-node-id=spine-tools]")).toBeVisible();
    const positions = await page.locator(".techmap-node").evaluateAll(els => Object.fromEntries(els.map(el => { const r=el.getBoundingClientRect(); return [(el as HTMLElement).dataset.nodeId,{x:r.x+r.width/2,y:r.y+r.height/2}]; })));
    const root = positions["spine-tools"]!;
    const quadrants = ["science","warfare","industry","culture"].map(domain => { const p=positions[`foundation-${domain}`]!; return `${Math.sign(p.x-root.x)},${Math.sign(p.y-root.y)}`; });
    expect(new Set(quadrants).size).toBe(4);
    expect(root.x).toBeGreaterThan(0); expect(root.x).toBeLessThan(1920);
    expect(root.y).toBeGreaterThan(0); expect(root.y).toBeLessThan(1080);
    await assertNoRawKeys(page);
    await page.screenshot({path:`test-results/browser/radial-current-${lang}.png`});
    await page.locator(".techmap-btn-overview").click();
    await page.screenshot({path:`test-results/browser/radial-overview-${lang}.png`});
  });
}
