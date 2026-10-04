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
  // Use stable ID selector instead of fragile text-based selector (Thai copy may vary)
  await page.locator("#start-btn").click();
  await expect(page.locator(".hud")).toBeVisible({ timeout: 15000 });
}

/** Resolve legitimate blocking draft screens (bounded, real clicks only). */
export async function resolveDrafts(page: Page, maxRounds = 10): Promise<void> {
  for (let i = 0; i < maxRounds; i++) {
    if ((await page.locator("#draft-screen").count()) === 0) break;
    // Click the explicit SELECT button inside the first card
    const selectBtn = page.locator("#draft-screen .card .card-select").first();
    await selectBtn.waitFor({ state: "attached", timeout: 10000 });
    await selectBtn.click();
    await page.waitForTimeout(150);
  }
}

/** Fast drain for fat granted queues (tight RAF-paced polling). */
export async function drainDrafts(page: Page, maxRounds = 120): Promise<void> {
  for (let i = 0; i < maxRounds; i++) {
    const draftCount = await page.locator("#draft-screen").count();
    if (draftCount === 0) break;
    const cardCount = await page.locator("#draft-screen .card").count();
    const cardIds = await page.locator("#draft-screen .card").evaluateAll(cards => cards.map(c => c.textContent?.slice(0, 50)));
    console.log(`[drainDrafts] round ${i}: draftCount=${draftCount}, cardCount=${cardCount}, cards=${JSON.stringify(cardIds)}`);
    if (cardCount === 0) {
      console.log(`[drainDrafts] no cards found, breaking`);
      break;
    }
    // Click the explicit SELECT button inside the first card
    const selectBtn = page.locator("#draft-screen .card .card-select").first();
    await selectBtn.waitFor({ state: "attached", timeout: 10000 });
    await selectBtn.click();
    await page.waitForTimeout(60);
  }
  const finalDraftCount = await page.locator("#draft-screen").count();
  console.log(`[drainDrafts] finished: final draftCount=${finalDraftCount}`);
}

/** Open pause robustly: wall-time combat can pop a draft between actions
 * (ESC never pauses over an open draft), so drain-then-pause with retries. */
export async function openPause(page: Page, retries = 5): Promise<void> {
  for (let i = 0; i < retries; i++) {
    await drainDrafts(page, 40);
    await page.keyboard.press("Escape");
    try {
      await expect(page.locator("#pause-screen")).toBeVisible({ timeout: 3000 });
      return;
    } catch {
      if (i === retries - 1) throw new Error("pause never opened (draft storm?)");
    }
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
