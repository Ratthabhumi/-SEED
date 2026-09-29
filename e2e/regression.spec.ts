// Round-3 regression E2E (?e2e hook): restart, queued drafts, death-once,
// language invariance, ascension. Production build via vite preview.
import { test, expect, type Page } from "@playwright/test";

declare global {
  interface Window {
    __seedE2E?: {
      grant: (n: number) => void;
      kill: () => void;
      readyAscend: () => void;
      hash: () => string;
      snapshot: () => string;
      seed: () => string;
      setLang: (code: "en" | "th") => void;
    };
  }
}

async function startRun(page: Page, seed: string): Promise<void> {
  await page.goto("/?e2e");
  await page.locator("#seed-input").fill(seed);
  await page.getByRole("button", { name: "Begin New Run" }).click();
  await expect(page.locator(".hud")).toBeVisible({ timeout: 15000 });
}

test("restart preserves the master seed", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await startRun(page, "EPOCH-RESTART-01");
  await expect(page.locator(".hud-seed")).toContainText("EPOCH-RESTART-01");
  await page.keyboard.down("d");
  await page.waitForTimeout(600);
  await page.keyboard.up("d");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Restart" }).click();
  await expect(page.locator(".hud")).toBeVisible({ timeout: 15000 });
  await expect(page.locator(".hud-seed")).toContainText("EPOCH-RESTART-01");
  expect(errors).toEqual([]);
});

test("queued multi-level draft: one surface, clean completion", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await startRun(page, "EPOCH-DRAFT-01");
  await page.evaluate(() => window.__seedE2E?.grant(500));
  await expect(page.locator("#draft-screen")).toBeVisible();
  for (let i = 0; i < 8; i++) {
    if ((await page.locator("#draft-screen").count()) === 0) break;
    expect(await page.locator("#draft-screen").count()).toBe(1);
    const cards = page.locator("#draft-screen .card");
    expect(await cards.count()).toBeLessThanOrEqual(3);
    await cards.first().click();
    await page.waitForTimeout(150);
  }
  await expect(page.locator("#draft-screen")).toHaveCount(0);
  await expect(page.locator(".hud")).toBeVisible();
  expect(errors).toEqual([]);
});

test("death persists exactly once across frames", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await startRun(page, "EPOCH-DEATH-01");
  const runsBefore: number = await page.evaluate(() => {
    const raw = localStorage.getItem("seed-game-save-v1");
    return raw ? (JSON.parse(raw).best.runs as number) : 0;
  });
  await page.evaluate(() => window.__seedE2E?.kill());
  await expect(page.getByText("Run Chronicle")).toBeVisible();
  await page.waitForTimeout(2000); // multiple render/event frames
  const after: { runs: number; history: string[] } = await page.evaluate(() => {
    const raw = localStorage.getItem("seed-game-save-v1") ?? "{}";
    const s = JSON.parse(raw);
    return { runs: s.best.runs as number, history: s.history as string[] };
  });
  expect(after.runs).toBe(runsBefore + 1);
  expect(after.history.filter((h) => h === "EPOCH-DEATH-01").length).toBe(1);
  expect(errors).toEqual([]);
});

test("language switch changes DOM only, never gameplay state", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await startRun(page, "EPOCH-LANG-01");
  await page.keyboard.down("d");
  await page.waitForTimeout(400);
  await page.keyboard.up("d");
  // Freeze the simulation first: snapshots minutes apart must still match.
  await page.keyboard.press("Escape");
  await expect(page.getByText("Paused")).toBeVisible();
  const before: string = await page.evaluate(() => window.__seedE2E?.snapshot() ?? "");
  expect(before.length).toBeGreaterThan(0);
  await page.evaluate(() => window.__seedE2E?.setLang("th"));
  await expect(page.getByText("หยุดชั่วคราว")).toBeVisible();
  const afterTh: string = await page.evaluate(() => window.__seedE2E?.snapshot() ?? "");
  expect(afterTh).toBe(before);
  await page.evaluate(() => window.__seedE2E?.setLang("en"));
  const afterEn: string = await page.evaluate(() => window.__seedE2E?.snapshot() ?? "");
  expect(afterEn).toBe(before);
  expect(errors).toEqual([]);
});

test("ascension smoke: child world, run stats retained, world reset", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await startRun(page, "EPOCH-ASCEND-01");
  await page.keyboard.down("d");
  await page.waitForTimeout(1500);
  await page.keyboard.up("d");
  const before: { runElapsed: number; world: string; asc: number } = await page.evaluate(() => {
    const snap = JSON.parse(window.__seedE2E?.snapshot() ?? "{}");
    return {
      runElapsed: (snap.run as number[])[0] as number,
      world: (snap.id as string[])[1] as string,
      asc: (snap.id as (string | number)[])[3] as number,
    };
  });
  expect(before.runElapsed).toBeGreaterThan(0);
  expect(before.asc).toBe(0);
  // Boss-kill trigger bypassed by hook; ascend() executes the real path.
  await page.evaluate(() => window.__seedE2E?.readyAscend());
  await page.getByRole("button", { name: "ASCEND to the Next World" }).click();
  await page.waitForTimeout(800);
  const after: { runElapsed: number; world: string; asc: number; age: number } = await page.evaluate(() => {
    const snap = JSON.parse(window.__seedE2E?.snapshot() ?? "{}");
    return {
      runElapsed: (snap.run as number[])[0] as number,
      world: (snap.id as string[])[1] as string,
      asc: (snap.id as (string | number)[])[3] as number,
      age: (snap.age as number[])[0] as number,
    };
  });
  expect(after.asc).toBe(1);
  expect(after.world).not.toBe(before.world);
  expect(after.age).toBe(0);
  expect(after.runElapsed).toBeGreaterThanOrEqual(before.runElapsed);
  await expect(page.locator(".hud")).toBeVisible();
  expect(errors).toEqual([]);
});
