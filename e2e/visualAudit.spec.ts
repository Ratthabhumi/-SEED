// Visual audit v0.22 — ARCHIVAL evidence verification + live UI invariants.
//
// Policy: docs/visual_audit_v022/ is immutable historical evidence. This spec
// NEVER writes screenshots into the archive dir (throwaway captures, if any,
// go to gitignored test-results/). It verifies the archive is intact and that
// the live product keeps the audited invariants (controls exist, no raw keys).
import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";
import { startRun, assertNoRawKeys } from "./helpers";

const AUDIT_DIR = path.resolve("docs/visual_audit_v022");

const EXPECTED = [
  "01_lab_normal_en.png",
  "02_lab_normal_th.png",
  "03_lab_grayscale.png",
  "04_lab_high_contrast.png",
  "05_techmap_full_en.png",
  "06_techmap_zoomed.png",
  "07_techmap_pinned_path.png",
  "08_gameplay_hud_prompts.png",
  "09_outpost_spec_picker.png",
  "10_techmap_thai.png",
];

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

test("v022 archival evidence intact", () => {
  expect(fs.existsSync(AUDIT_DIR)).toBe(true);
  for (const f of EXPECTED) {
    const p = path.join(AUDIT_DIR, f);
    expect(fs.existsSync(p), `missing ${f}`).toBe(true);
    const buf = fs.readFileSync(p);
    expect(buf.length, `${f} non-empty`).toBeGreaterThan(1000);
    expect(buf.subarray(0, 8).equals(PNG_MAGIC), `${f} is PNG`).toBe(true);
  }
});

test("live UI invariants: controls exist, no raw localization keys", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto("/?visual=1");
  await expect(page.locator("#visual-lab-bar")).toBeVisible();
  await page.getByRole("button", { name: "ไทย", exact: true }).click();
  await page.getByRole("button", { name: "Grayscale", exact: true }).click();
  await page.getByRole("button", { name: "High contrast", exact: true }).click();
  await page.getByRole("button", { name: "English", exact: true }).click();
  await page.getByRole("button", { name: "Normal", exact: true }).click();
  await page.locator("#lab-techmap-btn").click();
  await expect(page.locator("#techmap-screen")).toBeVisible();
  await page.locator(".techmap-btn-zoom-in").click();
  await page.locator(".techmap-btn-fit").click();
  await page.locator(".techmap-btn-close").click();
  await expect(page.locator("#techmap-screen")).toHaveCount(0);
  await assertNoRawKeys(page);

  await startRun(page, "EPOCH-AUDIT-01");
  await page.waitForTimeout(1000);
  await assertNoRawKeys(page);
  expect(errors).toEqual([]);
});
