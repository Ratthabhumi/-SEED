// Visual QA and Audit Evidence Capture V2 for v0.22 Open-Source Leverage
import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

const AUDIT_DIR_R2 = path.resolve("docs/visual_audit_v022_r2");

test.beforeAll(() => {
  if (!fs.existsSync(AUDIT_DIR_R2)) {
    fs.mkdirSync(AUDIT_DIR_R2, { recursive: true });
  }
});

test.use({
  viewport: { width: 1280, height: 720 },
});

test("visual audit R2: capture 11 human audit-grade screenshots", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));

  // --- 1. Leverage Visual Lab Normal (EN) ---
  await page.goto("/?visual=1");
  await page.evaluate(() => localStorage.clear());
  await page.goto("/?visual=1");
  await expect(page.locator("#visual-lab-bar")).toBeVisible();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(AUDIT_DIR_R2, "09_leverage_lab_normal.png") });

  // --- 2. Leverage Visual Lab Grayscale ---
  await page.getByRole("button", { name: "Grayscale", exact: true }).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(AUDIT_DIR_R2, "10_leverage_lab_grayscale.png") });

  // --- 3. Leverage Visual Lab High Contrast ---
  await page.getByRole("button", { name: "High contrast", exact: true }).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(AUDIT_DIR_R2, "11_leverage_lab_high_contrast.png") });

  // --- 4. Tech Map Full Graph in English (FIT) ---
  await page.getByRole("button", { name: "Normal", exact: true }).click();
  await page.locator("#lab-techmap-btn").click();
  await expect(page.locator("#techmap-screen")).toBeVisible();
  await page.locator(".techmap-btn-fit").click();
  await page.waitForTimeout(500);

  // Assert button text is "Fit", never raw key "ui.fit"
  const fitBtnText = await page.locator(".techmap-btn-fit").textContent();
  expect(fitBtnText).toBe("Fit");
  await page.screenshot({ path: path.join(AUDIT_DIR_R2, "01_techmap_fit_en.png") });

  // --- 5. Tech Map 1:1 View (1x Zoom) ---
  await page.locator(".techmap-btn-reset").click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(AUDIT_DIR_R2, "02_techmap_1x_en.png") });

  // --- 6. Tech Map Pinned Route ---
  await page.locator(".techmap-btn-fit").click();
  await page.waitForTimeout(300);
  const targetNode = page.locator(".techmap-node.available").first();
  await targetNode.dispatchEvent("click");
  await page.locator(".techmap-pin-btn").click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(AUDIT_DIR_R2, "03_techmap_pinned_en.png") });

  // Close lab Tech Map
  await page.locator(".techmap-btn-close").click();
  await expect(page.locator("#techmap-screen")).toHaveCount(0);

  // --- 7. Gameplay HUD with Normalized Input Prompts (EN) ---
  await page.goto("/?e2e");
  await page.evaluate(() => localStorage.clear());
  await page.goto("/?e2e");
  await page.locator("#seed-input").fill("EPOCH-AUDIT-R2");
  await page.getByRole("button", { name: "Begin New Run" }).click();
  await expect(page.locator(".hud")).toBeVisible({ timeout: 15000 });
  // Clean presentation (realistic HP 100/100, no godmode numbers)
  await page.evaluate(() => (window as unknown as { __seedE2E: { cleanPresentation: () => void } }).__seedE2E.cleanPresentation());
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(AUDIT_DIR_R2, "06_gameplay_hud_en.png") });

  // --- 8. Outpost Spec Picker with Normalized Structure Sprites (No Toast Overlap) ---
  await page.evaluate(() => (window as unknown as { __seedE2E: { teleportToPOI: () => boolean; advance: (n: number) => void; claimFirst: () => string; cleanPresentation: () => void; openSpecPicker: () => void } }).__seedE2E.teleportToPOI());
  await page.evaluate(() => (window as unknown as { __seedE2E: { advance: (n: number) => void } }).__seedE2E.advance(3));
  await page.evaluate(() => (window as unknown as { __seedE2E: { claimFirst: () => string } }).__seedE2E.claimFirst());
  await page.evaluate(() => (window as unknown as { __seedE2E: { cleanPresentation: () => void } }).__seedE2E.cleanPresentation());
  // Open spec picker modal directly
  await page.evaluate(() => (window as unknown as { __seedE2E: { openSpecPicker: () => void } }).__seedE2E.openSpecPicker());
  await expect(page.locator("#spec-screen")).toBeVisible();
  await page.waitForTimeout(400);
  // Assert no toast overlaps the modal title and options
  expect(await page.locator(".toast").count()).toBe(0);
  await page.screenshot({ path: path.join(AUDIT_DIR_R2, "08_outpost_picker.png") });
  await page.locator(".terr-spec-btn").first().click();
  await expect(page.locator("#spec-screen")).toHaveCount(0);


  // --- 9. Gameplay HUD in Thai ---
  await page.evaluate(() => (window as unknown as { __seedE2E: { setLang: (c: string) => void; cleanPresentation: () => void } }).__seedE2E.setLang("th"));
  await page.evaluate(() => (window as unknown as { __seedE2E: { cleanPresentation: () => void } }).__seedE2E.cleanPresentation());
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(AUDIT_DIR_R2, "07_gameplay_hud_th.png") });

  // --- 10. Tech Map Thai Localization (FIT) ---
  await page.keyboard.press("T");
  await expect(page.locator("#techmap-screen")).toBeVisible();
  await page.locator(".techmap-btn-fit").click();
  await page.waitForTimeout(500);

  const fitBtnThText = await page.locator(".techmap-btn-fit").textContent();
  expect(fitBtnThText).toBe("พอดีหน้าจอ");
  await page.screenshot({ path: path.join(AUDIT_DIR_R2, "04_techmap_fit_th.png") });

  // --- 11. Tech Map Thai Node Detail in Sidebar ---
  const firstThaiNode = page.locator(".techmap-node").first();
  await firstThaiNode.dispatchEvent("click");
  await page.waitForTimeout(400);
  await expect(page.locator(".techmap-side")).toBeVisible();
  await page.screenshot({ path: path.join(AUDIT_DIR_R2, "05_techmap_node_detail_th.png") });

  // Close Tech Map
  await page.locator(".techmap-btn-close").click();
  await expect(page.locator("#techmap-screen")).toHaveCount(0);

  expect(errors).toEqual([]);
});
