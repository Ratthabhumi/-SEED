// Pause IA + replay-tutorial confirmation E2E (v0.23.1 §5/§6).
// Replay must confirm (never reset silently); Cancel = zero mutation;
// Confirm = same-seed fresh run, tutorial starts, settings preserved.
// Clear Save keeps its own separate confirmation. No simultaneous
// blocking surfaces: the confirm nests inside the single pause screen.
import { test, expect } from "@playwright/test";
import { startRun } from "./helpers";

declare global {
  interface Window {
    __seedE2E?: {
      snapshot: () => string;
    };
  }
}

async function openPause(page: import("@playwright/test").Page): Promise<void> {
  await page.keyboard.press("Escape");
  await expect(page.locator("#pause-screen")).toBeVisible();
}

test("pause menu has labeled sections with the danger zone separated", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await startRun(page, "EPOCH-PAUSE-01");
  await openPause(page);
  for (const heading of ["Primary", "Display", "Help", "Run", "Danger Zone"]) {
    await expect(page.locator("#pause-screen").getByRole("heading", { name: heading })).toBeVisible();
  }
  // Destructive action is visually separated and never beside Resume.
  const danger = page.locator("#pause-screen .danger-zone");
  await expect(danger).toBeVisible();
  await expect(danger.getByRole("button", { name: "Clear Save Data" })).toBeVisible();
  const resumeBox = await page.getByRole("button", { name: "Resume" }).boundingBox();
  const dangerBox = await danger.boundingBox();
  expect(resumeBox && dangerBox && dangerBox.y > resumeBox.y + resumeBox.height).toBe(true);
  expect(errors).toEqual([]);
});

test("replay tutorial asks first; cancel mutates nothing", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await startRun(page, "EPOCH-PAUSE-02");
  await openPause(page);
  await page.getByRole("button", { name: "Replay Tutorial" }).click();
  const confirm = page.locator("#tutorial-replay-confirm");
  await expect(confirm).toBeVisible();
  await expect(confirm).toContainText("Start the tutorial again?");
  await expect(confirm.getByRole("button", { name: "Cancel" })).toBeVisible();
  await expect(confirm.getByRole("button", { name: "Start Tutorial Again" })).toBeVisible();
  // Still exactly one screen surface (nested confirm, not a second modal).
  expect(await page.locator(".screen").count()).toBe(1);
  // Paused sim is frozen: snapshot identical across cancel.
  const before = (await page.evaluate(() => window.__seedE2E?.snapshot() ?? "")) as string;
  await confirm.getByRole("button", { name: "Cancel" }).click();
  await expect(confirm).toHaveCount(0);
  await expect(page.locator("#pause-screen")).toBeVisible();
  const after = (await page.evaluate(() => window.__seedE2E?.snapshot() ?? "")) as string;
  expect(after).toBe(before);
  expect(errors).toEqual([]);
});

test("replay confirm restarts the same seed with tutorial and settings kept", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await startRun(page, "EPOCH-PAUSE-03", { tutorialCompleted: false, lang: "th", uiScale: 1.5 });
  // Dismiss the first-run intro (this run's tutorial was already active).
  await expect(page.locator("#tutorial-intro-screen")).toBeVisible();
  await page.getByRole("button", { name: "เริ่มบันทึกประวัติศาสตร์" }).click();
  await expect(page.locator("#tutorial-intro-screen")).toHaveCount(0);
  await openPause(page);
  await page.getByRole("button", { name: "เล่นบทเรียนใหม่" }).click();
  await page.getByRole("button", { name: "เริ่มบทเรียนใหม่" }).click();
  // Same seed, fresh run, tutorial begins immediately.
  await expect(page.locator(".hud")).toBeVisible({ timeout: 15000 });
  await expect(page.locator(".hud-seed")).toContainText("EPOCH-PAUSE-03");
  await expect(page.locator("#tutorial-intro-screen")).toBeVisible({ timeout: 15000 });
  // Language/settings/UI scale preserved; only the tutorial flag flipped.
  const save = (await page.evaluate(
    () => JSON.parse(window.localStorage.getItem("seed-game-save-v1") ?? "{}"),
  )) as { settings?: { lang?: string; uiScale?: number; tutorialCompleted?: boolean } };
  expect(save.settings?.lang).toBe("th");
  expect(save.settings?.uiScale).toBe(1.5);
  expect(save.settings?.tutorialCompleted).toBe(false);
  expect(errors).toEqual([]);
});

test("clear save keeps a separate confirmation; dismissing is safe", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await startRun(page, "EPOCH-PAUSE-04");
  await openPause(page);
  let dialogSeen = false;
  page.on("dialog", async (d) => {
    dialogSeen = true;
    await d.dismiss();
  });
  await page.getByRole("button", { name: "Clear Save Data" }).click();
  expect(dialogSeen).toBe(true);
  // Dismissed: run continues untouched on the same seed.
  await expect(page.locator("#pause-screen")).toBeVisible();
  await expect(page.locator(".hud-seed")).toContainText("EPOCH-PAUSE-04");
  expect(errors).toEqual([]);
});
