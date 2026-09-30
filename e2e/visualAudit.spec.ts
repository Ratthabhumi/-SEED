// Visual QA and Audit Evidence capture for v0.22 Open-Source Leverage
import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

const AUDIT_DIR = path.resolve("docs/visual_audit_v022");

test.beforeAll(() => {
  if (!fs.existsSync(AUDIT_DIR)) {
    fs.mkdirSync(AUDIT_DIR, { recursive: true });
  }
});

test("visual audit: capture comprehensive visual evidence", async ({ page }) => {
  // 1. Visual Lab Normal EN
  await page.goto("/?visual=1");
  await page.evaluate(() => localStorage.clear());
  await page.goto("/?visual=1");
  await expect(page.locator("#visual-lab-bar")).toBeVisible();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(AUDIT_DIR, "01_lab_normal_en.png"), fullPage: false });

  // 2. Visual Lab Thai (TH)
  await page.getByRole("button", { name: "ไทย", exact: true }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(AUDIT_DIR, "02_lab_normal_th.png"), fullPage: false });

  // 3. Visual Lab Grayscale
  await page.getByRole("button", { name: "Grayscale", exact: true }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(AUDIT_DIR, "03_lab_grayscale.png"), fullPage: false });

  // 4. Visual Lab High Contrast
  await page.getByRole("button", { name: "High contrast", exact: true }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(AUDIT_DIR, "04_lab_high_contrast.png"), fullPage: false });

  // 5. Tech Map Full Graph in English
  await page.getByRole("button", { name: "English", exact: true }).click();
  await page.getByRole("button", { name: "Normal", exact: true }).click();
  await page.locator("#lab-techmap-btn").click();
  await expect(page.locator("#techmap-screen")).toBeVisible();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(AUDIT_DIR, "05_techmap_full_en.png") });

  // 6. Tech Map Zoomed
  await page.locator(".techmap-btn-zoom-in").click();
  await page.waitForTimeout(300);
  await page.locator(".techmap-btn-zoom-in").click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(AUDIT_DIR, "06_techmap_zoomed.png") });

  // 7. Tech Map Pinned Path
  await page.locator(".techmap-btn-fit").click();
  await page.waitForTimeout(300);
  const targetNode = page.locator(".techmap-node.available").first();
  await targetNode.dispatchEvent("click");
  await page.locator(".techmap-pin-btn").click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(AUDIT_DIR, "07_techmap_pinned_path.png") });

  // Close lab Tech Map
  await page.locator(".techmap-btn-close").click();
  await expect(page.locator("#techmap-screen")).toHaveCount(0);

  // 8. Gameplay HUD with normalized prompts (Q/E/R/F/T/M)
  await page.goto("/?e2e");
  await page.evaluate(() => localStorage.clear());
  await page.goto("/?e2e");
  await page.locator("#seed-input").fill("EPOCH-AUDIT-01");
  await page.getByRole("button", { name: "Begin New Run" }).click();
  await expect(page.locator(".hud")).toBeVisible({ timeout: 15000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(AUDIT_DIR, "08_gameplay_hud_prompts.png") });

  // 9. Outpost Spec Picker with normalized structure assets
  try {
    await page.evaluate(() => (window as unknown as { __seedE2E: { teleportToPOI: () => boolean; advance: (n: number) => void; claimFirst: () => string } }).__seedE2E.teleportToPOI());
    await page.evaluate(() => (window as unknown as { __seedE2E: { teleportToPOI: () => boolean; advance: (n: number) => void; claimFirst: () => string } }).__seedE2E.advance(3));
    await page.evaluate(() => (window as unknown as { __seedE2E: { teleportToPOI: () => boolean; advance: (n: number) => void; claimFirst: () => string } }).__seedE2E.claimFirst());
    await page.waitForTimeout(600);
    const specBtn = page.locator(".terr-spec-btn").first();
    if (await specBtn.isVisible()) {
      await specBtn.click();
      await expect(page.locator("#spec-screen")).toBeVisible();
      await page.waitForTimeout(400);
    }
  } catch {
    // fallback if spec button not immediately active
  }
  await page.screenshot({ path: path.join(AUDIT_DIR, "09_outpost_spec_picker.png") });

  // 10. Tech Map Thai Localization
  await page.keyboard.press("Escape");
  await page.evaluate(() => (window as unknown as { __seedE2E: { setLang: (c: string) => void } }).__seedE2E?.setLang?.("th"));
  await page.waitForTimeout(300);
  await page.keyboard.press("T");
  await expect(page.locator("#techmap-screen")).toBeVisible();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(AUDIT_DIR, "10_techmap_thai.png") });
});
