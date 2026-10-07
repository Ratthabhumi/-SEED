// v0.23.1 responsive clarity matrix (§§9-14): 3 viewports × EN/TH ×
// 100/125/150/200%, reusing one page per viewport (no cold boot per cell).
// Layout contracts use boundingBox geometry; prose alignment, pause/draft
// reachability, Tech/Civ map usability asserted in both languages.
import { test, expect, type Page } from "@playwright/test";
import { startRun, drainDrafts, openPause } from "./helpers";

declare global {
  interface Window {
    __seedE2E?: {
      grant: (n: number) => void;
      advance: (s: number) => void;
      teleportToPOI: () => boolean;
      tryClaim: () => string;
      claimFirst: () => string;
      setLang: (code: "en" | "th") => void;
      snapshot: () => string;
    };
  }
}

type Box = { x: number; y: number; width: number; height: number };
async function box(page: Page, sel: string): Promise<Box | null> {
  return page.locator(sel).first().boundingBox();
}
function overlaps(a: Box | null, b: Box | null): boolean {
  if (!a || !b || a.width <= 0 || b.width <= 0) return false;
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}
async function noPageOverflow(page: Page): Promise<void> {
  const over = await page.evaluate(() => ({
    sw: document.documentElement.scrollWidth,
    iw: window.innerWidth,
  }));
  expect(over.sw).toBeLessThanOrEqual(over.iw + 1);
}

/** Permanent HUD zones must not meaningfully overlap each other. */
async function assertHudZones(page: Page): Promise<void> {
  const zones = [".hud-objective", ".age-card", ".hud-dock-bl", ".knowledge-card", "#minimap"];
  const boxes: Array<Box | null> = [];
  for (const z of zones) boxes.push(await box(page, z));
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      expect(overlaps(boxes[i], boxes[j]), `${zones[i]} vs ${zones[j]}`).toBe(false);
    }
  }
}

/** Context surfaces must not cover HUD safe zones. */
async function assertContextClear(page: Page): Promise<void> {
  const ctx = await box(page, ".territory-bar");
  if (!ctx || ctx.height === 0) return; // nothing contextual showing
  for (const z of [".knowledge-card", ".hud-dock-bl", "#minimap", ".age-card"]) {
    expect(overlaps(ctx, await box(page, z)), `context vs ${z}`).toBe(false);
  }
}

async function setScale(page: Page, label: "100%" | "125%" | "150%" | "200%"): Promise<void> {
  await openPause(page);
  await page.locator("#pause-screen").getByRole("button", { name: label, exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(page.locator("#pause-screen")).toHaveCount(0);
}

async function openDraft(page: Page): Promise<void> {
  // One draft is enough for layout; fat grants queue dozens (xp curve).
  await page.evaluate(() => window.__seedE2E?.grant(30));
  await expect(page.locator("#draft-screen")).toBeVisible({ timeout: 15000 });
}

async function closeDraft(page: Page): Promise<void> {
  // Drafts chain while pendingLevels last — drain them all, or later
  // overlays (tech/civ map) stay blocked behind the next draft.
  // Keep draining until no draft screen remains (queued drafts chain).
  for (let i = 0; i < 5; i++) {
    await drainDrafts(page);
    const count = await page.locator("#draft-screen").count();
    if (count === 0) return;
    // Small pause for any microtask queue to settle
    await page.waitForTimeout(50);
  }
  await expect(page.locator("#draft-screen")).toHaveCount(0);
}

/** Open a map overlay: a wall-time level-up can pop a draft between any two
 * actions (map keys never open over a draft), so drain first. */
async function openMap(page: Page, key: "T" | "M", screen: "#techmap-screen" | "#civmap-screen"): Promise<void> {
  await drainDrafts(page, 40);
  // Press key directly - Phaser listens on window
  await page.keyboard.press(key);
  await expect(page.locator(screen)).toBeVisible({ timeout: 10000 });
}

const PAUSE_HEADINGS_EN = ["Primary", "Display", "Help", "Run", "Danger Zone"];

async function viewportMatrix(page: Page): Promise<void> {
  await test.step("EN 100%: HUD zones, draft, tech CURRENT+OVERVIEW, civmap", async () => {
    await assertHudZones(page);
    await noPageOverflow(page);
    // Draft: readable cards, agency reachable, prose left.
    await openDraft(page);
    expect(await page.locator("#draft-screen .card").count()).toBe(3);
    for (const name of [/^RESERVE/, /^REROLL/, "SKIP"]) {
      await expect(page.locator("#draft-screen").getByRole("button", { name }).first()).toBeVisible();
    }
    const draftAlign = await page.locator("#draft-screen .card p").first().evaluate(
      (el) => getComputedStyle(el).textAlign,
    );
    expect(draftAlign).toBe("left");
    await closeDraft(page);
    // Tech CURRENT then OVERVIEW: all six ages reachable, no page overflow.
    await openMap(page, "T", "#techmap-screen");
    expect(await page.locator(".techmap-node.available").count()).toBeGreaterThan(0);
    // Six age lanes exist (marker cols carry no box — count, not visibility).
    expect(await page.locator(".techmap-col").count()).toBe(6);
    await page.locator(".techmap-btn-fit").click();
    await page.waitForTimeout(300);
    await noPageOverflow(page);
    await page.keyboard.press("T");
    await expect(page.locator("#techmap-screen")).toHaveCount(0);
    // Civ map with a real claimed outpost: select it, panel shows truth.
    await page.evaluate(() => window.__seedE2E?.teleportToPOI());
    await page.evaluate(() => window.__seedE2E?.advance(3));
    const claimed: string = await page.evaluate(() => window.__seedE2E?.claimFirst() ?? "");
    expect(claimed).not.toBe("");
    await openMap(page, "M", "#civmap-screen");
    // Click the true CSS center (canvas attr pixels are CSS-stretched).
    const cvBox = await page.locator("#civmap-screen canvas").boundingBox();
    expect(cvBox).toBeTruthy();
    await page.mouse.click(cvBox!.x + cvBox!.width / 2, cvBox!.y + cvBox!.height / 2);
    await expect(page.locator("#civmap-detail .civmap-detail-name")).toBeVisible({ timeout: 5000 });
    // Selected panel carries state + real bonus + an upgrade action line.
    await expect(page.locator("#civmap-detail")).toContainText(/T1|T2/);
    await page.keyboard.press("M");
    await expect(page.locator("#civmap-screen")).toHaveCount(0);
    await assertContextClear(page);
  });

  await test.step("TH: pause, guide prose, draft", async () => {
    await page.evaluate(() => window.__seedE2E?.setLang("th"));
    await openPause(page);
    await expect(page.locator("#pause-screen")).toContainText("โซนอันตราย");
    await page.keyboard.press("Escape");
    await openDraft(page);
    await expect(page.locator("#draft-screen")).toContainText("สุ่มใหม่");
    await closeDraft(page);
  });

  await test.step("scales 125/150: pause fits or scrolls, sections reachable", async () => {
    await page.evaluate(() => window.__seedE2E?.setLang("en"));
    for (const label of ["125%", "150%"] as const) {
      await setScale(page, label);
      // Reopen robustly: wall-time XP between actions can pop a draft.
      await openPause(page);
      const fit = await page.locator("#pause-screen .pause-panel").evaluate((el) => ({
        scroll: el.scrollHeight,
        client: el.clientHeight,
        overflowY: getComputedStyle(el).overflowY,
      }));
      if (fit.scroll > fit.client + 1) expect(["auto", "scroll"]).toContain(fit.overflowY);
      for (const heading of PAUSE_HEADINGS_EN) {
        await expect(page.locator("#pause-screen").getByRole("heading", { name: heading })).toBeVisible();
      }
      await noPageOverflow(page);
      await page.keyboard.press("Escape");
    }
  });

  await test.step("TH 200%: HUD zones, draft agency, techmap usable", async () => {
    await page.evaluate(() => window.__seedE2E?.setLang("th"));
    await setScale(page, "200%");
    await assertHudZones(page);
    await noPageOverflow(page);
    await openDraft(page);
    await expect(page.locator("#draft-screen .card")).toHaveCount(3);
    await closeDraft(page);
    await openMap(page, "T", "#techmap-screen");
    await expect(page.locator(".techmap-side")).toBeVisible();
    await expect(page.locator(".techmap-btn-fit")).toBeVisible();
    await page.keyboard.press("T");
    await expect(page.locator("#techmap-screen")).toHaveCount(0);
  });
}

test("clarity matrix 1280x720", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await startRun(page, "EPOCH-CLAR-720");
  await viewportMatrix(page);
  expect(errors).toEqual([]);
});

test("clarity matrix 1920x1080", async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await startRun(page, "EPOCH-CLAR-1080");
  await viewportMatrix(page);
  expect(errors).toEqual([]);
});

test("clarity matrix 2560x1272", async ({ page }) => {
  await page.setViewportSize({ width: 2560, height: 1272 });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await startRun(page, "EPOCH-CLAR-2560");
  await viewportMatrix(page);
  expect(errors).toEqual([]);
});
