// Visual audit v0.22 R2 — ARCHIVAL evidence verification + live UI invariants.
//
// Policy: docs/visual_audit_v022_r2/ is immutable historical evidence. This
// spec NEVER writes into the archive dir. It verifies the 11 archived shots
// are intact and that the live product keeps the R2 invariants: "Overview"
// copy (never regressed to "Fit"), TH "พอดีหน้าจอ", working fit/pin flow,
// outpost picker without toast overlap. Product copy wins over old evidence.
import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";
import { startRun, assertNoRawKeys } from "./helpers";

const AUDIT_DIR_R2 = path.resolve("docs/visual_audit_v022_r2");

const EXPECTED_R2 = [
  "01_techmap_fit_en.png",
  "02_techmap_1x_en.png",
  "03_techmap_pinned_en.png",
  "04_techmap_fit_th.png",
  "05_techmap_node_detail_th.png",
  "06_gameplay_hud_en.png",
  "07_gameplay_hud_th.png",
  "08_outpost_picker.png",
  "09_leverage_lab_normal.png",
  "10_leverage_lab_grayscale.png",
  "11_leverage_lab_high_contrast.png",
];

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

test("v022 R2 archival evidence intact", () => {
  expect(fs.existsSync(AUDIT_DIR_R2)).toBe(true);
  for (const f of EXPECTED_R2) {
    const p = path.join(AUDIT_DIR_R2, f);
    expect(fs.existsSync(p), `missing ${f}`).toBe(true);
    const buf = fs.readFileSync(p);
    expect(buf.length, `${f} non-empty`).toBeGreaterThan(1000);
    expect(buf.subarray(0, 8).equals(PNG_MAGIC), `${f} is PNG`).toBe(true);
  }
});

test("live R2 invariants: Overview copy, fit/pin flow, picker without toast overlap", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));

  // --- Visual lab toggles exist ---
  await page.goto("/?visual=1");
  await expect(page.locator("#visual-lab-bar")).toBeVisible();
  await page.getByRole("button", { name: "Grayscale", exact: true }).click();
  await page.getByRole("button", { name: "High contrast", exact: true }).click();

  // --- Tech Map: Overview copy (deliberate product text, never "Fit") ---
  await page.getByRole("button", { name: "Normal", exact: true }).click();
  await page.locator("#lab-techmap-btn").click();
  await expect(page.locator("#techmap-screen")).toBeVisible();
  await expect(page.locator(".techmap-btn-fit")).toHaveText("Overview");
  await page.locator(".techmap-btn-reset").click();
  // Pin flow still works through the Overview entry point.
  const targetNode = page.locator(".techmap-node.available").first();
  await targetNode.dispatchEvent("click");
  await page.locator(".techmap-pin-btn").click();
  await expect(targetNode).toHaveClass(/pinned/);
  await page.locator(".techmap-btn-close").click();
  await expect(page.locator("#techmap-screen")).toHaveCount(0);
  await assertNoRawKeys(page);

  // --- Gameplay HUD (EN), outpost picker without toast overlap ---
  await startRun(page, "EPOCH-AUDIT-R2");
  await expect(page.locator(".hud")).toBeVisible({ timeout: 15000 });
  await page.evaluate(() => (window as unknown as { __seedE2E: { teleportToPOI: () => boolean; advance: (n: number) => void; claimFirst: () => string; openSpecPicker: () => void } }).__seedE2E.teleportToPOI());
  await page.evaluate(() => (window as unknown as { __seedE2E: { advance: (n: number) => void } }).__seedE2E.advance(3));
  await page.evaluate(() => (window as unknown as { __seedE2E: { claimFirst: () => string } }).__seedE2E.claimFirst());
  await page.evaluate(() => (window as unknown as { __seedE2E: { openSpecPicker: () => void } }).__seedE2E.openSpecPicker());
  await expect(page.locator("#spec-screen")).toBeVisible();
  expect(await page.locator(".toast").count()).toBe(0);
  await page.locator("#spec-screen .spec-later-btn").click();
  await expect(page.locator("#spec-screen")).toHaveCount(0);

  // --- Thai HUD + Thai Tech Map ("ภาพรวม" overview, node detail) ---
  // NOTE: "Overview"/"ภาพรวม" is deliberate product copy (macro structure
  // view); the old "Fit"/"พอดีหน้าจอ" text belongs to archived R2 evidence.
  await page.evaluate(() => (window as unknown as { __seedE2E: { setLang: (c: string) => void } }).__seedE2E.setLang("th"));
  await page.keyboard.press("T");
  await expect(page.locator("#techmap-screen")).toBeVisible();
  await expect(page.locator(".techmap-btn-fit")).toHaveText("ภาพรวม");
  const firstThaiNode = page.locator(".techmap-node").first();
  await firstThaiNode.dispatchEvent("click");
  await expect(page.locator(".techmap-side")).toBeVisible();
  await page.locator(".techmap-btn-close").click();
  await expect(page.locator("#techmap-screen")).toHaveCount(0);
  await assertNoRawKeys(page);

  expect(errors).toEqual([]);
});
