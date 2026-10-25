import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";
import { prepareSave, resolveDrafts } from "./helpers";

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
  await prepareSave(page, { tutorialCompleted: skipTutorial });
  await page.goto("/?e2e=1");
  const startBtn = page.locator("#start-btn");
  if (await startBtn.isVisible()) {
    await startBtn.click();
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
        const w = window as any;
        if (w.__seedE2E) w.__seedE2E.cleanPresentation();
      }, scale);
      await page.waitForTimeout(200);

      // Verify buttons are clickable and visible (clean modal state first).
      await resolveDrafts(page);
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

const V0221_FILES = [
  "01_gameplay_default_en.png",
  "02_gameplay_default_th.png",
  "03_gameplay_ui125.png",
  "04_gameplay_ui150.png",
  "05_techmap_current_en.png",
  "06_techmap_overview_en.png",
  "07_techmap_current_th.png",
  "08_first_run_intro_th.png",
  "09_tutorial_age_gate.png",
  "10_tutorial_first_draft.png",
  "11_vfx_enemy_death.png",
  "12_vfx_breakthrough.png",
  "13_chronicle.png",
];

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

test("v0221 archival evidence intact", () => {
  expect(fs.existsSync(AUDIT_DIR)).toBe(true);
  for (const f of V0221_FILES) {
    const p = path.join(AUDIT_DIR, f);
    expect(fs.existsSync(p), `missing ${f}`).toBe(true);
    const buf = fs.readFileSync(p);
    expect(buf.length, `${f} non-empty`).toBeGreaterThan(1000);
    expect(buf.subarray(0, 8).equals(PNG_MAGIC), `${f} is PNG`).toBe(true);
  }
});

test("first-run onboarding flow works end to end (tutorial NOT skipped)", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1280, height: 720 });

  // Fresh save with tutorialCompleted:false, then boot.
  await prepareSave(page, { tutorialCompleted: false, lang: "th" });
  await page.goto("/?e2e=1");
  await expect(page.locator("#start-btn")).toBeVisible({ timeout: 10000 });
  await page.locator("#start-btn").click();
  await expect(page.locator("#tutorial-intro-screen")).toBeVisible({ timeout: 12000 });

  // Intro part 1 -> part 2 -> chronicle start.
  await page.locator("#tutorial-intro-screen .btn.primary").click(); // to part 2
  await page.locator("#tutorial-intro-screen .btn.primary").click(); // start chronicle
  await expect(page.locator(".hud")).toBeVisible({ timeout: 15000 });

  // Tech map opens and closes from keyboard.
  await page.keyboard.press("KeyT");
  await expect(page.locator("#techmap-screen")).toBeVisible();
  await page.locator(".techmap-btn-close").click();
  await expect(page.locator("#techmap-screen")).toHaveCount(0);

  // First draft surfaces and resolves with real clicks (queued levels chain).
  await page.evaluate(() => (window as unknown as { __seedE2E: { grant: (n: number) => void } }).__seedE2E.grant(100));
  await expect(page.locator("#draft-screen")).toBeVisible({ timeout: 5000 });
  await resolveDrafts(page);
  await expect(page.locator("#draft-screen")).toHaveCount(0);

  // Death reaches the chronicle.
  await page.evaluate(() => (window as unknown as { __seedE2E: { kill: () => void } }).__seedE2E.kill());
  await expect(page.locator(".chron")).toBeVisible({ timeout: 10000 });
  expect(errors).toEqual([]);
});
