// Visual lab E2E: ?visual=1 boots the presentation review surface with EN/TH,
// while normal / and ?qa=1 stay free of lab UI.
import { test, expect } from "@playwright/test";

test("visual lab: samples render and EN/TH toggle works", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto("/?visual=1");
  await expect(page.locator("#visual-lab-bar")).toBeVisible();
  await expect(page.locator("#visual-lab-bar")).toContainText("VISUAL LANGUAGE LAB");
  await expect(page.locator("#visual-lab-strings")).toBeVisible();
  await expect(page.locator("#visual-lab-strings")).toContainText("UI STRINGS (English)");

  await page.getByRole("button", { name: "ไทย", exact: true }).click();
  await expect(page.locator("#visual-lab-strings")).toContainText("UI STRINGS (ไทย)");
  // Thai age string proves localized rendering in the lab surface.
  await expect(page.locator("#visual-lab-strings")).toContainText("ยุคหิน");

  await page.screenshot({ path: "test-results/visual-lab.png" });
  expect(errors).toEqual([]);
});

test("normal and QA modes expose no visual-lab UI", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#visual-lab-bar")).toHaveCount(0);
  await expect(page.locator(".logo")).toContainText("-SEED");

  await page.goto("/?qa=1");
  await expect(page.locator("#visual-lab-bar")).toHaveCount(0);
  await expect(page.locator("#qa-gate")).toBeVisible();
});
