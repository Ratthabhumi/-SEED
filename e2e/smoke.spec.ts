// Browser smoke: title → run → move → pause → EN/TH → F3 → title.
// Production build served via `vite preview` (see playwright.config.ts).
import { test, expect } from "@playwright/test";
import { prepareSave } from "./helpers";

test("v0.1.1 smoke: launch, run, pause, language switch, back to title", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));

  await prepareSave(page);
  await page.goto("/");
  await expect(page.locator(".logo")).toContainText("-SEED");

  // Random seed button fills the input.
  await page.getByRole("button", { name: "Random Seed" }).click();
  const seedInput = page.locator("#seed-input");
  await expect(seedInput).not.toHaveValue("");
  const seedVal = await seedInput.inputValue();
  expect(seedVal).toMatch(/^EPOCH-[A-Z2-9]{4}-[A-Z2-9]{4}$/);

  // Manual seed + start.
  await seedInput.fill("EPOCH-GOLDEN-001");
  await page.getByRole("button", { name: "Begin New Run" }).click();
  await expect(page.locator(".hud")).toBeVisible({ timeout: 15000 });

  // Movement accepted, game keeps running.
  await page.keyboard.down("d");
  await page.waitForTimeout(800);
  await page.keyboard.up("d");
  await expect(page.locator(".hud")).toBeVisible();

  // Pause → switch to Thai mid-run (must not restart the run).
  await page.keyboard.press("Escape");
  await expect(page.getByText("Paused")).toBeVisible();
  await page.getByRole("button", { name: "ไทย", exact: true }).click();
  await expect(page.getByText("หยุดชั่วคราว")).toBeVisible();
  await expect(page.getByRole("button", { name: "เล่นต่อ" })).toBeVisible();
  // Back to English.
  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(page.getByText("Paused")).toBeVisible();

  // Resume → F3 debug → pause → quit to title.
  await page.getByRole("button", { name: "Resume" }).click();
  await page.keyboard.press("F3");
  await page.waitForTimeout(500);
  await page.keyboard.press("Escape");
  await expect(page.getByText("Paused")).toBeVisible();
  await page.getByRole("button", { name: "Quit to Title" }).click();
  await expect(page.locator(".logo")).toContainText("-SEED");

  // No uncaught page errors through the whole flow.
  expect(errors).toEqual([]);
});
