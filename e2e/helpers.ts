// Shared Playwright setup: deterministic save-state preparation.
//
// Tests NOT about onboarding boot with tutorialCompleted=true so the intro
// modal never intercepts clicks. Onboarding tests pass tutorialCompleted=false
// explicitly. No force:true clicks anywhere.
import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export const SAVE_KEY = "seed-game-save-v1";

export interface TestSaveOptions {
  tutorialCompleted?: boolean;
  lang?: "en" | "th";
  uiScale?: 1 | 1.25 | 1.5 | 2;
}

/** Seed localStorage BEFORE first navigation so GameScene boots with it. */
export async function prepareSave(page: Page, opts: TestSaveOptions = {}): Promise<void> {
  const save = {
    schema: 1,
    settings: {
      lang: opts.lang ?? "en",
      shake: true,
      volume: 0.6,
      contrast: "normal",
      uiScale: opts.uiScale ?? 1,
      tutorialCompleted: opts.tutorialCompleted ?? true,
    },
    archive: [],
    best: { bestTimeSec: 0, bestKills: 0, bestAge: "stone", bestAscension: 0, runs: 0 },
    history: [],
  };
  await page.addInitScript(
    ({ key, value }: { key: string; value: string }) => {
      window.localStorage.setItem(key, value);
    },
    { key: SAVE_KEY, value: JSON.stringify(save) },
  );
}

export async function startRun(page: Page, seed: string, opts: TestSaveOptions = {}): Promise<void> {
  await prepareSave(page, opts);
  await page.goto("/?e2e");
  await page.locator("#seed-input").fill(seed);
  await page.getByRole("button", { name: /Begin New Run|เริ่มเกม/i }).click();
  await expect(page.locator(".hud")).toBeVisible({ timeout: 15000 });
}

/** Resolve legitimate blocking draft screens (bounded, real clicks only). */
export async function resolveDrafts(page: Page, maxRounds = 10): Promise<void> {
  for (let i = 0; i < maxRounds; i++) {
    if ((await page.locator("#draft-screen").count()) === 0) break;
    await page.locator("#draft-screen .card").first().click();
    await page.waitForTimeout(150);
  }
}

/** No visible UI text may be an unlocalized raw key (e.g. "ui.fit"). */
export async function assertNoRawKeys(page: Page): Promise<void> {
  const hits = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll("button, h1, h2, h3, .toast-title, .hud-objective, .techmap-title"));
    const re = /\b(ui|tutorial|age|domain|family|rarity|tech|poi|chronicle|qa|squad|ability|gate|mission|objective)\.[A-Za-z0-9_.]+/;
    return els
      .map((el) => (el.textContent ?? "").trim())
      .filter((t) => t.length > 0 && re.test(t));
  });
  expect(hits).toEqual([]);
}
