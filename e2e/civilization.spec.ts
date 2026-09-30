// Civilization command-loop E2E: tech map truth, draft agency buttons,
// claim flow, squad keys, age checklist, TH rendering. Uses ?e2e staging
// hooks for travel; every clicked path runs real game code.
import { test, expect, type Page } from "@playwright/test";

async function startRun(page: Page, seed: string): Promise<void> {
  await page.goto("/?e2e");
  await page.locator("#seed-input").fill(seed);
  await page.getByRole("button", { name: "Begin New Run" }).click();
  await expect(page.locator(".hud")).toBeVisible({ timeout: 15000 });
}

interface E2E {
  grant: (n: number) => void;
  advance: (s: number) => void;
  teleportToPOI: () => boolean;
  claimFirst: () => string;
  setLang: (code: "en" | "th") => void;
}

async function hook(page: Page): Promise<E2E> {
  return (await page.evaluate(() => (window as unknown as { __seedE2E: E2E }).__seedE2E)) as E2E;
}

test("tech map shows the real graph and pinning reaches the HUD", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await startRun(page, "EPOCH-CIV-001");

  await page.keyboard.press("T");
  await expect(page.locator("#techmap-screen")).toBeVisible();
  expect(await page.locator(".techmap-col").count()).toBe(6);
  const nodes = await page.locator(".techmap-node").count();
  expect(nodes).toBeGreaterThan(20);
  // Details + pin path on the first available node.
  await page.locator(".techmap-node.available").first().click();
  await expect(page.locator(".techmap-side")).toContainText("Requires:");
  await page.getByRole("button", { name: "PIN PATH" }).click();
  await expect(page.locator(".hud-goals")).toContainText("BUILD PLAN");
  await page.keyboard.press("T");
  await expect(page.locator("#techmap-screen")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("draft agency: reserve, reroll, skip, owned-stays note", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await startRun(page, "EPOCH-CIV-002");
  const h = await hook(page);
  await page.evaluate(() => (window as unknown as { __seedE2E: E2E }).__seedE2E.grant(100000));
  await expect(page.locator("#draft-screen")).toBeVisible();
  await expect(page.locator(".draft-stays")).toContainText("remain active");
  await expect(page.getByRole("button", { name: /^RESERVE/ }).first()).toBeVisible();
  await page.getByRole("button", { name: /^RESERVE/ }).first().click();
  await page.getByRole("button", { name: /^REROLL/ }).click();
  await expect(page.locator("#draft-screen .card")).toHaveCount(3);
  await page.getByRole("button", { name: "SKIP" }).click();
  await page.waitForTimeout(500);
  expect(errors).toEqual([]);
  void h;
});

test("claim flow creates territory visible on minimap and civ map", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await startRun(page, "EPOCH-CIV-003");
  await page.evaluate(() => (window as unknown as { __seedE2E: E2E }).__seedE2E.teleportToPOI());
  await page.evaluate(() => (window as unknown as { __seedE2E: E2E }).__seedE2E.advance(3));
  const claimed = await page.evaluate(() => (window as unknown as { __seedE2E: E2E }).__seedE2E.claimFirst());
  expect(claimed).not.toBe("");
  await expect(page.locator("#minimap")).toBeVisible();
  await page.keyboard.press("M");
  await expect(page.locator("#civmap-screen")).toBeVisible();
  await expect(page.locator(".civmap-list")).toContainText("T1");
  await page.keyboard.press("M");
  await expect(page.locator("#civmap-screen")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("squad keys and ability update the status card without errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await startRun(page, "EPOCH-CIV-004");
  await page.keyboard.press("R");
  await expect(page.locator(".status-squad")).toContainText("HOLD");
  await page.keyboard.press("Q");
  await expect(page.locator(".status-squad")).toContainText("FOLLOW");
  await page.keyboard.press("F");
  await page.waitForTimeout(500);
  expect(errors).toEqual([]);
});

test("age card shows exactly three gates and Thai renders", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await startRun(page, "EPOCH-CIV-005");
  await expect(page.locator(".age-card .gate-row")).toHaveCount(3);
  await page.evaluate(() => (window as unknown as { __seedE2E: E2E }).__seedE2E.setLang("th"));
  await expect(page.locator(".age-card")).toContainText("องค์ความรู้");
  await expect(page.locator(".age-card")).toContainText("ภารกิจยุค");
  expect(errors).toEqual([]);
});
