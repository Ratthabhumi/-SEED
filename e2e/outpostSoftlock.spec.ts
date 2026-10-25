import { test, expect, type Page } from "@playwright/test";
import { startRun, assertNoRawKeys } from "./helpers";

type SpecState = { ageIndex: number; elapsed: number; logistics: number; maxLogistics: number; signalSecured: boolean;
  territories: Array<{poiId: string; spec: string}> };
type Hook = {stageSpecRegression: (signal: boolean, full: boolean) => string;
  specRegressionState: () => SpecState; openSpecPicker: (id: string) => void;
  queueSpecRegression: (id: string) => void};
const state = (page: Page) => page.evaluate(() => (window as unknown as {__seedE2E: Hook}).__seedE2E.specRegressionState());
const stage = (page: Page, signal = false, full = true) => page.evaluate(({signal, full}) =>
  (window as unknown as {__seedE2E: Hook}).__seedE2E.stageSpecRegression(signal, full), {signal, full});

for (const lang of ["en", "th"] as const) {
  test(`6/6 Industrial claim: Later, Escape, keyboard and FIFO resume (${lang})`, async ({page}) => {
    await startRun(page, "EPOCH-SOFTLOCK-01", {lang});
    const id = await stage(page);
    const picker = page.locator("#spec-screen");
    await expect(picker).toBeVisible();
    for (const b of await picker.locator(".terr-spec-btn").all()) await expect(b).toBeDisabled();
    const before = await state(page);
    expect(before.logistics).toBe(6);
    expect(before.maxLogistics).toBe(6);
    expect(before.elapsed).toBe(703);
    expect(before.ageIndex).toBe(3);
    await expect(picker.locator(".terr-spec-btn")).toHaveCount(3);
    const later = picker.locator(".spec-later-btn");
    await expect(later).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(later).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(later).toBeFocused();
    await assertNoRawKeys(page);
    if (lang === "th") {
      expect(await later.evaluate(el => parseFloat(getComputedStyle(el).lineHeight) / parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(1.7);
    }
    await page.screenshot({path: `test-results/outpost-softlock-${lang}.png`});
    await page.waitForTimeout(150);
    expect(await state(page)).toEqual(before);
    await later.click();
    await expect(picker).toHaveCount(0);
    await expect.poll(async () => (await state(page)).elapsed).toBeGreaterThan(703);
    expect((await state(page)).territories.find(t => t.poiId === id)?.spec).toBe("");
    await page.locator("#context-stack .terr-spec-btn").click();
    await expect(picker).toBeVisible();
    await page.evaluate(id => (window as unknown as {__seedE2E: Hook}).__seedE2E.queueSpecRegression(id), id);
    await page.keyboard.press("Escape");
    await expect(page.locator("#spec-regression-beat")).toBeVisible();
    const paused = (await state(page)).elapsed;
    await page.waitForTimeout(150);
    expect((await state(page)).elapsed).toBe(paused);
    await page.keyboard.press("Escape");
    await expect(picker).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(picker).toHaveCount(0);
    await expect(page.locator("#pause-screen")).toHaveCount(0);
    await expect.poll(async () => (await state(page)).elapsed).toBeGreaterThan(paused);
    expect((await state(page)).logistics).toBe(6);
  });
}

test("affordable specialization charges once and keyboard selection resumes", async ({page}) => {
  await startRun(page, "EPOCH-SOFTLOCK-02");
  const id = await stage(page, false, false);
  await expect(page.locator("#spec-screen .terr-spec-btn").first()).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#spec-screen")).toHaveCount(0);
  const s = await state(page);
  expect(s.logistics).toBe(1);
  expect(s.territories.find(t => t.poiId === id)?.spec).toBe("research");
  await expect.poll(async () => (await state(page)).elapsed).toBeGreaterThan(703);
});

test("first Signal at 6/6 is enabled and charges its documented exemption", async ({page}) => {
  await startRun(page, "EPOCH-SOFTLOCK-03");
  const id = await stage(page, true);
  const buttons = page.locator("#spec-screen .terr-spec-btn");
  for (const b of await buttons.all()) await expect(b).toBeEnabled();
  await buttons.nth(1).click();
  await expect(page.locator("#spec-screen")).toHaveCount(0);
  const s = await state(page);
  expect(s.logistics).toBe(8);
  expect(s.maxLogistics).toBe(6);
  expect(s.signalSecured).toBe(true);
  expect(s.territories.find(t => t.poiId === id)?.spec).toBe("military");
  await expect.poll(async () => (await state(page)).elapsed).toBeGreaterThan(703);
});


test("deferred ordinary claim does not hide first Signal; second Signal receives no exemption", async ({page}) => {
  await startRun(page, "EPOCH-SOFTLOCK-04");
  await stage(page);
  await page.locator("#spec-screen .spec-later-btn").click();
  const first = await stage(page, true);
  await page.locator("#spec-screen .spec-later-btn").click();
  await page.locator("#context-stack .terr-spec-btn").click();
  await expect(page.locator("#spec-screen .terr-spec-btn").first()).toBeEnabled();
  await page.locator("#spec-screen .terr-spec-btn").first().click();
  expect((await state(page)).territories.find(t => t.poiId === first)?.spec).toBe("research");
  await stage(page, true);
  for (const b of await page.locator("#spec-screen .terr-spec-btn").all()) await expect(b).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(page.locator("#spec-screen")).toHaveCount(0);
});


test("Thai Later remains reachable at 200% on 1280x720", async ({page}) => {
  await page.setViewportSize({width: 1280, height: 720});
  await startRun(page, "EPOCH-SOFTLOCK-SCALE", {lang: "th", uiScale: 2});
  await stage(page);
  const later = page.locator("#spec-screen .spec-later-btn");
  await expect(later).toBeFocused();
  await expect(later).toBeInViewport();
  await page.screenshot({path: "test-results/outpost-softlock-th-200.png"});
  await page.keyboard.press("Enter");
  await expect(page.locator("#spec-screen")).toHaveCount(0);
  await expect.poll(async () => (await state(page)).elapsed).toBeGreaterThan(703);
});
