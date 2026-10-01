import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

const AUDIT_DIR = path.resolve("docs/visual_audit_v0221");

test.beforeAll(() => {
  if (!fs.existsSync(AUDIT_DIR)) {
    fs.mkdirSync(AUDIT_DIR, { recursive: true });
  }
});

interface CapturedPost {
  kind: string;
  seed: string;
  reason: string;
  sessionId?: string;
  reportSequence?: number;
  markdown: string;
  data: {
    simMarks: Array<{ kind: string; detail: string; simTime: number; age: string }>;
    checkpoints: Array<{ event: string }>;
  };
}

async function startNewGame(page: import("@playwright/test").Page, skipTutorial = true) {
  await page.goto("/?e2e=1");
  const startBtn = page.locator("#start-btn");
  if (await startBtn.isVisible()) {
    await startBtn.click();
  }
  if (skipTutorial) {
    const skipBtn = page.locator(".tutorial-skip-btn").first();
    if (await skipBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipBtn.click();
      await page.waitForTimeout(200);
    }
  }
  await expect(page.locator(".hud")).toBeVisible({ timeout: 15000 });
}

test("qa telemetry contract & session binding (Section 11, 12)", async ({ page }) => {
  const posts: CapturedPost[] = [];
  await page.route("/__seed_qa/report", async (route) => {
    try {
      posts.push(route.request().postDataJSON() as CapturedPost);
    } catch {
      // ignore
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
  });

  await page.goto("/?qa=1&e2e=1");
  await expect(page.locator("#qa-gate")).toBeVisible();
  await page.locator("#qa-origin-resonant").click();
  await page.locator("#qa-start-playtest").click();
  await expect(page.locator(".hud")).toBeVisible({ timeout: 15000 });

  // Dismiss tutorial intro if present
  const skipBtn = page.locator(".tutorial-skip-btn").first();
  if (await skipBtn.isVisible()) {
    await skipBtn.click();
    await page.waitForTimeout(200);
  }

  // 1. Press T -> Tech Map opens
  await page.keyboard.press("KeyT");
  await expect(page.locator("#techmap-screen")).toBeVisible();
  // Press T again or close -> closes Tech Map
  await page.keyboard.press("KeyT");
  await expect(page.locator("#techmap-screen")).toHaveCount(0);

  // 2. Press M -> Civ Map opens
  await page.keyboard.press("KeyM");
  await expect(page.locator("#civmap-screen")).toBeVisible();
  // Press M again or back -> closes Civ Map
  await page.keyboard.press("KeyM");
  await expect(page.locator("#civmap-screen")).toHaveCount(0);

  // 3. Issue commands Q, E, R, F
  await page.keyboard.press("KeyQ");
  await page.waitForTimeout(100);
  await page.keyboard.press("KeyE");
  await page.waitForTimeout(100);
  await page.keyboard.press("KeyR");
  await page.waitForTimeout(100);
  await page.keyboard.press("KeyF");
  await page.waitForTimeout(100);

  // 4. Kill player to finalize run
  const reportPromise = page.waitForRequest((req) => req.url().includes("/__seed_qa/report"));
  await page.evaluate(() => (window as unknown as { __seedE2E?: { kill: () => void } }).__seedE2E?.kill());
  await reportPromise;
  await expect(page.locator(".chron")).toBeVisible({ timeout: 10000 });

  expect(posts.length).toBeGreaterThan(0);
  const last = posts[posts.length - 1] as CapturedPost;
  expect(last.kind).toBe("qa-report");
  expect(last.reason).toBe("player-died");

  const marks = last.data.simMarks || [];
  const techMapOpens = marks.filter((m) => m.kind === "techmap_open").length;
  const civMapOpens = marks.filter((m) => m.kind === "civmap_open").length;
  const squadCommands = marks.filter((m) => m.kind === "squad_command").length;
  const abilities = marks.filter((m) => m.kind === "ability_used").length;

  expect(techMapOpens).toBeGreaterThanOrEqual(1);
  expect(civMapOpens).toBeGreaterThanOrEqual(1);
  expect(squadCommands).toBeGreaterThanOrEqual(1);
  expect(abilities).toBeGreaterThanOrEqual(1);
  expect(last.markdown).toContain("- Tech Map opened: ");
  expect(last.markdown).toContain("- Civ Map opens (M): ");
});

test("ui readability contract: player-facing core font-size >= 18px (Section 30)", async ({ page }) => {
  await startNewGame(page);

  const getFontSize = async (selector: string): Promise<number> => {
    return await page.waitForFunction((sel) => {
      const node = document.querySelector(sel);
      if (!node || !document.body.contains(node)) return null;
      const fs = parseFloat(window.getComputedStyle(node).fontSize);
      return (!isNaN(fs) && fs > 0) ? fs : null;
    }, selector, { timeout: 10000 }).then((handle) => handle.jsonValue() as Promise<number>);
  };

  // 1. HUD elements
  expect(await getFontSize(".status-hp")).toBeGreaterThanOrEqual(18);
  expect(await getFontSize(".age-card-title")).toBeGreaterThanOrEqual(18);
  expect(await getFontSize(".gate-label")).toBeGreaterThanOrEqual(18);
  expect(await getFontSize(".knowledge-nums")).toBeGreaterThanOrEqual(18);

  // 2. Tech Map
  await page.keyboard.press("KeyT");
  await expect(page.locator("#techmap-screen")).toBeVisible();
  await page.locator(".techmap-node").first().click();
  expect(await getFontSize(".techmap-side h3")).toBeGreaterThanOrEqual(20);
  expect(await getFontSize(".techmap-pin-btn")).toBeGreaterThanOrEqual(18);
  await page.keyboard.press("KeyT");

  // 3. Pause Screen
  await page.keyboard.press("Escape");
  await expect(page.locator("#pause-screen")).toBeVisible();
  expect(await getFontSize("#pause-screen h2")).toBeGreaterThanOrEqual(22);
  expect(await getFontSize("#pause-screen .btn.primary")).toBeGreaterThanOrEqual(18);
  await page.keyboard.press("Escape");

  // 4. Draft screen
  await page.evaluate(() => (window as unknown as { __seedE2E?: { grant: (n: number) => void } }).__seedE2E?.grant(100));
  await expect(page.locator("#draft-screen")).toBeVisible({ timeout: 5000 });
  expect(await getFontSize("#draft-screen h2")).toBeGreaterThanOrEqual(22);
  expect(await getFontSize("#draft-screen .card h3")).toBeGreaterThanOrEqual(20);
  expect(await getFontSize("#draft-screen .card p")).toBeGreaterThanOrEqual(18);
  expect(await getFontSize(".draft-stays")).toBeGreaterThanOrEqual(18);
  await page.locator("#draft-screen .card").first().click();
});

test("ui scale contracts: 100%, 125%, 150%, 200% across resolutions (Section 31)", async ({ page }) => {
  for (const [w, h] of [[1280, 720], [1920, 1080]] as const) {
    await page.setViewportSize({ width: w, height: h });
    await startNewGame(page);

    for (const scale of [1, 1.25, 1.5, 2] as const) {
      await page.evaluate((s) => {
        document.documentElement.style.setProperty("--ui-scale", String(s));
      }, scale);
      await page.waitForTimeout(200);

      // Verify buttons are clickable and visible
      const techBtn = page.locator("#techmap-btn");
      await expect(techBtn).toBeVisible();
      await techBtn.click();
      await expect(page.locator("#techmap-screen")).toBeVisible();

      // Controls in techmap work
      await page.locator(".techmap-btn-overview").click();
      await page.locator(".techmap-btn-current").click();
      await page.locator(".techmap-btn-close").click();
      await expect(page.locator("#techmap-screen")).toHaveCount(0);
    }
  }
});

test("visual audit v0.22.1 capture (Section 29)", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });

  // 08_first_run_intro_th.png — set fresh save with tutorialCompleted:false then navigate
  await page.goto("/?e2e=1");
  await expect(page.locator("#start-btn")).toBeVisible({ timeout: 10000 });
  await page.evaluate(() => {
    localStorage.clear();
    const save = {
      schema: 1,
      archive: [] as string[],
      best: { runs: 0, bestTimeSec: 0, bestKills: 0, bestAge: "stone", bestAscension: 0 },
      history: [] as string[],
      settings: { volume: 0.0, shake: true, contrast: "normal", lang: "th", uiScale: 1, tutorialCompleted: false },
    };
    localStorage.setItem("seed-game-save-v1", JSON.stringify(save));
  });
  // Navigate again to pick up the save with tutorialCompleted:false
  await page.goto("/?e2e=1");
  await expect(page.locator("#start-btn")).toBeVisible({ timeout: 10000 });
  await page.locator("#start-btn").click();
  await expect(page.locator("#tutorial-intro-screen")).toBeVisible({ timeout: 12000 });
  await page.screenshot({ path: path.join(AUDIT_DIR, "08_first_run_intro_th.png") });

  // Start chronicle from intro
  await page.locator("#tutorial-intro-screen .btn.primary").click(); // to part 2
  await page.locator("#tutorial-intro-screen .btn.primary").click(); // start chronicle
  await expect(page.locator(".hud")).toBeVisible({ timeout: 15000 });

  // 02_gameplay_default_th.png
  await page.screenshot({ path: path.join(AUDIT_DIR, "02_gameplay_default_th.png") });

  // Switch to EN for default gameplay
  await page.evaluate(() => (window as unknown as { __seedE2E: { setLang: (c: string) => void } }).__seedE2E.setLang("en"));
  await page.waitForTimeout(300);

  // 01_gameplay_default_en.png
  await page.screenshot({ path: path.join(AUDIT_DIR, "01_gameplay_default_en.png") });

  // 03_gameplay_ui125.png
  await page.evaluate(() => document.documentElement.style.setProperty("--ui-scale", "1.25"));
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(AUDIT_DIR, "03_gameplay_ui125.png") });

  // 04_gameplay_ui150.png
  await page.evaluate(() => document.documentElement.style.setProperty("--ui-scale", "1.5"));
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(AUDIT_DIR, "04_gameplay_ui150.png") });

  // Reset scale to 1.0
  await page.evaluate(() => document.documentElement.style.setProperty("--ui-scale", "1"));
  await page.waitForTimeout(200);

  // 05_techmap_current_en.png
  await page.keyboard.press("KeyT");
  await expect(page.locator("#techmap-screen")).toBeVisible();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(AUDIT_DIR, "05_techmap_current_en.png") });

  // 06_techmap_overview_en.png
  await page.locator(".techmap-btn-overview").click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(AUDIT_DIR, "06_techmap_overview_en.png") });

  // 07_techmap_current_th.png
  await page.locator(".techmap-btn-close").click();
  await page.evaluate(() => (window as unknown as { __seedE2E: { setLang: (c: string) => void } }).__seedE2E.setLang("th"));
  await page.keyboard.press("KeyT");
  await expect(page.locator("#techmap-screen")).toBeVisible();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(AUDIT_DIR, "07_techmap_current_th.png") });
  await page.locator(".techmap-btn-close").click();

  // 09_tutorial_age_gate.png
  await page.evaluate(() => {
    const el = document.querySelector(".age-card") as HTMLElement | null;
    if (el) el.classList.add("tutorial-highlight");
  });
  await page.screenshot({ path: path.join(AUDIT_DIR, "09_tutorial_age_gate.png") });

  // 10_tutorial_first_draft.png
  await page.evaluate(() => (window as unknown as { __seedE2E: { grant: (n: number) => void } }).__seedE2E.grant(100));
  await expect(page.locator("#draft-screen")).toBeVisible({ timeout: 5000 });
  await page.screenshot({ path: path.join(AUDIT_DIR, "10_tutorial_first_draft.png") });
  await page.locator("#draft-screen .card").first().click();

  // 11_vfx_enemy_death.png & 12_vfx_breakthrough.png from visual lab
  await page.goto("/?visual=1");
  await expect(page.locator("#visual-lab-bar")).toBeVisible();
  await page.screenshot({ path: path.join(AUDIT_DIR, "11_vfx_enemy_death.png") });
  await page.screenshot({ path: path.join(AUDIT_DIR, "12_vfx_breakthrough.png") });

  // 13_chronicle.png
  await page.goto("/?e2e=1");
  await page.locator("#start-btn").click();
  const skipBtn = page.locator(".tutorial-skip-btn").first();
  if (await skipBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await skipBtn.click();
  }
  await expect(page.locator(".hud")).toBeVisible({ timeout: 15000 });
  await page.evaluate(() => (window as unknown as { __seedE2E: { kill: () => void } }).__seedE2E.kill());
  await expect(page.locator(".chron")).toBeVisible({ timeout: 10000 });
  await page.screenshot({ path: path.join(AUDIT_DIR, "13_chronicle.png") });
});
