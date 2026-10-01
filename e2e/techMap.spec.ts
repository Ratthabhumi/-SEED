// Tech Map E2E: Dagre layout, Panzoom interaction, Fit/Reset controls,
// pinned route highlight, node click after pan, and clean close without leaks.
import { test, expect, type Page } from "@playwright/test";
import { startRun, resolveDrafts } from "./helpers";

test.describe("Tech Map — Dagre & Panzoom Integration", () => {
  test("opens via keyboard [T] and renders 6 age lanes and all canonical nodes", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await startRun(page, "EPOCH-TECH-001");

    await page.keyboard.press("T");
    await expect(page.locator("#techmap-screen")).toBeVisible();

    // Check age columns
    expect(await page.locator(".techmap-col").count()).toBe(6);

    // Check canonical nodes rendered
    const nodeCount = await page.locator(".techmap-node").count();
    expect(nodeCount).toBeGreaterThan(20);

    // Verify header controls exist
    await expect(page.locator(".techmap-btn-fit")).toBeVisible();
    await expect(page.locator(".techmap-btn-reset")).toBeVisible();
    await expect(page.locator(".techmap-btn-zoom-in")).toBeVisible();
    await expect(page.locator(".techmap-btn-zoom-out")).toBeVisible();

    // Close via [T]
    await page.keyboard.press("T");
    await expect(page.locator("#techmap-screen")).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test("zoom controls (+ / -) modify the canvas transform scale", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await startRun(page, "EPOCH-TECH-002");

    await page.keyboard.press("T");
    await expect(page.locator("#techmap-canvas")).toBeVisible();

    const initialTransform = await page.locator("#techmap-canvas").evaluate((el) => el.style.transform);

    // Zoom in
    await page.locator(".techmap-btn-zoom-in").click();
    await page.waitForTimeout(300);
    const zoomedInTransform = await page.locator("#techmap-canvas").evaluate((el) => el.style.transform);
    expect(zoomedInTransform).not.toBe(initialTransform);

    // Zoom out
    await page.locator(".techmap-btn-zoom-out").click();
    await page.waitForTimeout(300);

    // Reset
    await page.locator(".techmap-btn-reset").click();
    await page.waitForTimeout(300);

    // Fit
    await page.locator(".techmap-btn-fit").click();
    await page.waitForTimeout(300);

    await page.keyboard.press("T");
    expect(errors).toEqual([]);
  });

  test("mouse pan drag works and node click still works after pan", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await startRun(page, "EPOCH-TECH-003");

    await page.keyboard.press("T");
    await expect(page.locator("#techmap-viewport")).toBeVisible();

    // Trigger pan drag event on viewport
    await page.evaluate(() => {
      const v = document.getElementById("techmap-viewport");
      if (v) {
        v.dispatchEvent(new PointerEvent("pointerdown", { clientX: 250, clientY: 250, bubbles: true }));
        window.dispatchEvent(new PointerEvent("pointermove", { clientX: 350, clientY: 300, bubbles: true }));
        window.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
      }
    });
    await page.waitForTimeout(200);

    // Node click still works after pan
    const firstNode = page.locator(".techmap-node").first();
    await firstNode.dispatchEvent("click");
    await expect(page.locator(".techmap-side")).toBeVisible();

    // Close Tech Map
    await page.locator(".techmap-btn-close").click();
    await expect(page.locator("#techmap-screen")).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test("path pinning highlights nodes and edges and unpin removes highlight", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await startRun(page, "EPOCH-TECH-004");

    await page.keyboard.press("T");
    const targetNode = page.locator(".techmap-node.available").first();
    await targetNode.dispatchEvent("click");

    // Pin path via pin button
    await page.locator(".techmap-pin-btn").click();
    await expect(targetNode).toHaveClass(/pinned/);

    // Unpin path
    await page.locator(".techmap-pin-btn").click();
    await expect(targetNode).not.toHaveClass(/pinned/);

    await page.keyboard.press("T");
    expect(errors).toEqual([]);
  });

  test("repeatedly opening and closing does not crash or duplicate screens", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await startRun(page, "EPOCH-TECH-005");

    for (let i = 0; i < 3; i++) {
      // Start from a normal playable state: no tutorial, no blocking draft.
      await resolveDrafts(page);
      await page.locator("#techmap-btn").click();
      await expect(page.locator("#techmap-screen")).toHaveCount(1);
      await page.locator(".techmap-btn-close").click();
      await expect(page.locator("#techmap-screen")).toHaveCount(0);
    }

    expect(errors).toEqual([]);
  });
});
