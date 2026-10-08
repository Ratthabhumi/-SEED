// Zero-friction automation E2E: ?qa=1 → origin → hooks → ascend →
// fast-forward past the 120s target → auto-finalize POSTs → completion UI.
// The sink itself is unit-tested at Node level; here the browser POST is
// captured via route interception (preview has no sink — same as production).
import { test, expect } from "@playwright/test";
import { prepareSave, resolveDrafts } from "./helpers";

interface CapturedPost {
  kind: string;
  seed: string;
  reason: string;
  reportSequence: number;
  markdown: string;
  data: { checkpoints: Array<{ event: string }>; humanComment?: string; ratings: Array<{ score: number }> };
}

test("qa auto-finalize posts target-complete and shows completion", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const posts: CapturedPost[] = [];
  await page.route("/__seed_qa/report", async (route) => {
    try {
      posts.push(route.request().postDataJSON() as CapturedPost);
    } catch {
      // ignore malformed captures
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
  });

  await prepareSave(page);
  await page.goto("/?qa=1&e2e=1");
  await expect(page.locator("#qa-gate")).toBeVisible();
  await page.locator("#qa-origin-resonant").click();
  await page.locator("#qa-start-playtest").click();
  await expect(page.locator(".hud")).toBeVisible({ timeout: 15000 });

  // Bypass the boss fight; the ascend + legacy + origin path stays real.
  await page.evaluate(() => (window as unknown as { __seedE2E?: { readyAscend: () => void } }).__seedE2E?.readyAscend());
  // Resolve any legitimate blocking draft first (real modal sequencing).
  await resolveDrafts(page);
  await page.getByRole("button", { name: "ASCEND to the Next World" }).click();
  await expect(page.locator("#legacy-screen")).toBeVisible();
  await page.locator("#legacy-screen .card").first().click();
  await expect(page.locator("#origin-screen")).toBeVisible();
  await page.locator("#origin-screen .card").first().click();
  await page.waitForTimeout(500);

  // Fast-forward 150 sim-seconds past the 120s post-Ascension target.
  await page.evaluate(
    () => (window as unknown as { __seedE2E?: { advance: (s: number) => void } }).__seedE2E?.advance(150),
  );
  await expect(page.locator("#qa-complete")).toBeVisible({ timeout: 60000 });
  await expect(page.locator("#qa-complete")).toContainText("PLAYTEST COMPLETE");

  expect(posts.length).toBeGreaterThan(0);
  const last = posts[posts.length - 1] as CapturedPost;
  expect(last.kind).toBe("qa-report");
  expect(last.seed).toBe("EPOCH-GOLDEN-001");
  expect(last.reason).toBe("target-complete");
  expect(typeof last.markdown).toBe("string");
  expect(last.data.checkpoints.map((c) => c.event)).toContain("CHILD_WORLD_STARTED");
  await page.locator(".qa-comment-input").fill("Human pilot response");
  await page.locator(".qa-comment-btn.primary").click();
  await expect.poll(() => posts[posts.length - 1]?.data.humanComment).toBe("Human pilot response");
  expect(posts[posts.length - 1]!.reportSequence).toBeGreaterThan(last.reportSequence);
  await page.locator("#qa-rec-indicator").click();
  await page.locator(".qa-rate").first().click();
  await expect.poll(() => posts[posts.length - 1]?.data.ratings.length).toBeGreaterThan(0);
  await expect(page.locator(".hud")).toBeVisible();
  expect(errors).toEqual([]);
});
