// Round-3 regression E2E (?e2e hook): restart, queued drafts, death-once,
// language invariance, ascension. Production build via vite preview.
import { test, expect, type Page } from "@playwright/test";
import { startRun as sharedStartRun, resolveDrafts } from "./helpers";

declare global {
  interface Window {
    __seedE2E?: {
      grant: (n: number) => void;
      kill: () => void;
      readyAscend: () => void;
      readyExpansion: () => void;
      hash: () => string;
      snapshot: () => string;
      seed: () => string;
      setLang: (code: "en" | "th") => void;
    };
  }
}

async function startRun(page: Page, seed: string): Promise<void> {
  await sharedStartRun(page, seed);
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
  await page.getByRole("button", { name: "Restart Current Run" }).click();
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
    // Click the explicit SELECT button inside the first card
    const selectBtn = page.locator("#draft-screen .card .card-select").first();
    await selectBtn.waitFor({ state: "attached", timeout: 10000 });
    await selectBtn.click();
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
  // Resolve any legitimate blocking draft first (real modal sequencing).
  await resolveDrafts(page);
  await page.getByRole("button", { name: "ASCEND to the Next World" }).click();
  // Legacy prestige choice, then child-world origin choice.
  await expect(page.locator("#legacy-screen")).toBeVisible();
  expect(await page.locator("#legacy-screen .card").count()).toBe(3);
  await page.locator("#legacy-screen .card").first().click();
  // First offer on a fresh sim is the kinetic affinity: only the two
  // Kinetic origins are compatible (P1-05), never a dead pick.
  await expect(page.locator("#origin-screen")).toBeVisible();
  expect(await page.locator("#origin-screen .card").count()).toBe(2);
  await page.locator("#origin-screen .card").first().click();
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

test("industrial payoff precedes expansion choice, one modal at a time", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await startRun(page, "EPOCH-EXPAND-01");
  // Pause FIRST so the staged transition cannot fire before we read the HUD:
  // an open blocking modal (e.g. expansion choice) swallows Escape.
  await page.keyboard.press("Escape");
  await expect(page.locator("#pause-screen")).toBeVisible();
  // Staging must satisfy the CURRENT canonical gates (Phase A A1) — assert
  // the self-diagnostics before expecting any age screen.
  const diag = (await page.evaluate(() => window.__seedE2E?.readyExpansion())) as {
    ready: boolean;
    gates: Array<{ id: string; have: number; need: number; done: boolean }>;
    activeOutposts: number;
    specialized: number;
    breakthroughs: number;
  };
  expect(diag.ready).toBe(true);
  expect(diag.activeOutposts).toBeGreaterThanOrEqual(2);
  expect(diag.specialized).toBeGreaterThanOrEqual(1);
  expect(diag.breakthroughs).toBeGreaterThanOrEqual(1);
  for (const g of diag.gates) expect(g.done).toBe(true);
  // Dominion HUD truth: while paused, the age card renders the SAME canonical
  // gates, all done (3 rows). Pause holds the sim so nothing can race this.
  await expect(page.locator(".age-card .gate-row")).toHaveCount(3);
  expect(await page.locator(".age-card .gate-row.done").count()).toBe(3);
  // Arm the modal spy BEFORE resuming: MutationObserver callbacks run
  // synchronously on DOM insertion, so no payoff can slip past polling.
  await page.evaluate(() => {
    const w = window as unknown as { __modalLog?: string[] };
    w.__modalLog = [];
    new MutationObserver((muts) => {
      for (const m of muts) {
        for (const n of m.addedNodes) {
          if (n instanceof HTMLElement && (n.id === "age-screen" || n.id === "expansion-screen")) {
            const other = n.id === "age-screen" ? "expansion-screen" : "age-screen";
            const overlap = !!document.getElementById(other);
            (w.__modalLog as string[]).push(`${n.id}:${overlap ? "OVERLAP" : "alone"}`);
          }
        }
      }
    }).observe(document.body, { childList: true, subtree: true });
  });
  // Resume: the staged transition fires for real from here.
  await page.keyboard.press("Escape");
  await expect(page.locator("#pause-screen")).toHaveCount(0);
  // Race-free sequencing proof: a MutationObserver records every modal
  // insertion synchronously, so even a sub-polling-lifetime age payoff is
  // observed. Overlap at insertion time is recorded too — and forbidden.
  await expect(page.locator("#expansion-screen")).toBeVisible({ timeout: 30000 });
  const log = (await page.evaluate(
    () => (window as unknown as { __modalLog?: string[] }).__modalLog ?? [],
  )) as string[];
  expect(log.length).toBeGreaterThan(0);
  expect(log[0]).toMatch(/^age-screen:/);
  expect(log.join("|")).not.toContain("OVERLAP");
  // Dismiss whatever payoff/questions remain, then choose the expansion.
  const cont = page.locator("#age-screen").getByRole("button", { name: "Continue" });
  if ((await cont.count()) > 0) await cont.click({ timeout: 2000 }).catch(() => {});
  await expect(page.locator("#expansion-screen")).toBeVisible({ timeout: 10000 });
  expect(await page.locator("#age-screen").count()).toBe(0);
  expect(await page.locator("#expansion-screen .card").count()).toBe(2);
  await page.locator("#expansion-screen .card").first().click();
  await expect(page.locator("#expansion-screen")).toHaveCount(0);
  const snap = JSON.parse((await page.evaluate(() => window.__seedE2E?.snapshot() ?? "{}")) as string) as {
    origin: [string, string, string[], string[]];
  };
  expect(["energy", "defense"]).toContain(snap.origin[1]); // hunters + one unlock
  await expect(page.locator(".hud")).toBeVisible();
  expect(errors).toEqual([]);
});
