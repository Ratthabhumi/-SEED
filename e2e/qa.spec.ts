// QA harness E2E: ?qa=1 → gate panel → golden-seed start → recorder live →
// END PLAYTEST → downloadable machine-readable report. Read-only: no cheats.
import fs from "node:fs";
import { test, expect } from "@playwright/test";

test("qa mode: gate start, live panel, report export", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto("/?qa=1");
  await expect(page.locator("#qa-gate")).toBeVisible();
  await expect(page.locator("#qa-start-playtest")).toBeVisible();

  await page.locator("#qa-start-playtest").click();
  await expect(page.locator(".hud")).toBeVisible({ timeout: 15000 });
  await expect(page.locator(".hud-seed")).toContainText("EPOCH-GOLDEN-001");
  await expect(page.locator("#qa-panel")).toBeVisible();

  // Subjective marker must not crash the run.
  await page.locator(".qa-fb-btn").first().click();
  await expect(page.locator(".hud")).toBeVisible();

  // End playtest → report downloads appear → JSON parses with golden seed.
  await page.getByRole("button", { name: "END PLAYTEST" }).click();
  const dlBtn = page.getByRole("button", { name: "DOWNLOAD QA DATA (.json)" });
  await expect(dlBtn).toBeVisible();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    dlBtn.click(),
  ]);
  const path = await download.path();
  expect(path).toBeTruthy();
  const data = JSON.parse(fs.readFileSync(path as string, "utf-8")) as {
    seed: string;
    checkpoints: Array<{ event: string }>;
  };
  expect(data.seed).toBe("EPOCH-GOLDEN-001");
  expect(data.checkpoints.map((c) => c.event)).toContain("RUN_START");

  expect(errors).toEqual([]);
});
