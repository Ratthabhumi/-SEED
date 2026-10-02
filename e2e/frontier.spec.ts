// Frontier v023 browser coverage: contested → clear → claim through the
// real UI-mirroring hook, two coexisting territories, civmap frontier sites.
// Staging hooks only travel/clear; every clicked path runs real game code.
import { test, expect, type Page } from "@playwright/test";
import { startRun } from "./helpers";

declare global {
  interface Window {
    __seedE2E?: {
      advance: (s: number) => void;
      teleportToPOI: () => boolean;
      tryClaim: () => string;
      snapshot: () => string;
      setAgeIndex: (i: number) => number;
    };
  }
}

async function hook(page: Page) {
  const h = await page.evaluate(() => window.__seedE2E);
  expect(h).toBeDefined();
  return h!;
}

function terrEntries(snapJson: string): string[][] {
  const snap = JSON.parse(snapJson) as { terr?: string[] };
  return (snap.terr ?? []).map((t) => t.split(","));
}

test("contested site blocks claim; clearing unblocks; capacity gates the second", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await startRun(page, "EPOCH-FRONT-01");
  const h = await hook(page);

  // First territory via the UI-mirroring claim path.
  expect(await page.evaluate(() => window.__seedE2E?.teleportToPOI())).toBe(true);
  await page.evaluate(() => window.__seedE2E?.advance(12));
  let contested = false;
  let claimedA = "";
  for (let i = 0; i < 20 && claimedA === ""; i++) {
    const r: string = await page.evaluate(() => window.__seedE2E?.tryClaim() ?? "");
    if (r === "") {
      contested = true;
    } else {
      claimedA = r;
      break;
    }
    await page.evaluate(() => window.__seedE2E?.advance(2));
  }
  expect(contested).toBe(true); // foes within the clear radius blocked it
  expect(claimedA).not.toBe("");

  // Stone frontier holds ONE outpost: a second claim is rejected with zero
  // mutation, and the UI explains capacity instead of offering the claim.
  expect(await page.evaluate(() => window.__seedE2E?.teleportToPOI())).toBe(true);
  let blocked = 0;
  for (let i = 0; i < 10; i++) {
    const r: string = await page.evaluate(() => window.__seedE2E?.tryClaim() ?? "");
    if (r === "") blocked++;
    await page.evaluate(() => window.__seedE2E?.advance(2));
  }
  expect(blocked).toBe(10);
  const snap1 = JSON.parse((await page.evaluate(() => window.__seedE2E?.snapshot() ?? "{}")) as string) as {
    terr?: string[];
  };
  expect((snap1.terr ?? []).filter((t) => t.split(",")[0] === claimedA)).toHaveLength(1);
  expect(snap1.terr ?? []).toHaveLength(1);
  await expect(page.locator(".territory-bar")).toContainText("OUTPOST CAPACITY FULL", { timeout: 20000 });

  // Iron frontier holds three: the second territory coexists (not replaced,
  // not disabled) once capacity allows. Generous budget: iron-age threat
  // takes longer to clear than stone.
  expect(await page.evaluate(() => window.__seedE2E?.setAgeIndex(2))).toBe(2);
  expect(await page.evaluate(() => window.__seedE2E?.teleportToPOI())).toBe(true);
  await page.evaluate(() => window.__seedE2E?.advance(3));
  let claimedB = "";
  for (let i = 0; i < 30 && claimedB === ""; i++) {
    const r: string = await page.evaluate(() => window.__seedE2E?.tryClaim() ?? "");
    if (r !== "" && r !== claimedA) {
      claimedB = r;
      break;
    }
    await page.evaluate(() => window.__seedE2E?.advance(2));
  }
  expect(claimedB).not.toBe("");
  expect(claimedB).not.toBe(claimedA);
  void h;

  const terrs = terrEntries((await page.evaluate(() => window.__seedE2E?.snapshot() ?? "{}")) as string);
  const live = terrs.filter((t) => t[0] === claimedA || t[0] === claimedB);
  expect(live).toHaveLength(2);
  for (const t of live) expect(t[7]).toBe("0"); // both active, neither disabled
  expect(errors).toEqual([]);
});

test("civ map shows claimed territories and frontier sites", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await startRun(page, "EPOCH-FRONT-02");
  // Iron frontier (capacity 3) so two claims fit; stone would hold one.
  expect(await page.evaluate(() => window.__seedE2E?.setAgeIndex(2))).toBe(2);
  await page.evaluate(() => window.__seedE2E?.teleportToPOI());
  await page.evaluate(() => window.__seedE2E?.advance(3));
  // Claim two sites (poll until both land; combat may contest).
  const claimed: string[] = [];
  for (let i = 0; i < 30 && claimed.length < 2; i++) {
    const r: string = await page.evaluate(() => window.__seedE2E?.tryClaim() ?? "");
    if (r !== "" && !claimed.includes(r)) claimed.push(r);
    await page.evaluate(() => window.__seedE2E?.teleportToPOI());
    await page.evaluate(() => window.__seedE2E?.advance(3));
  }
  expect(claimed).toHaveLength(2);

  await page.keyboard.press("M");
  await expect(page.locator("#civmap-screen")).toBeVisible();
  const listText = (await page.locator(".civmap-list").textContent()) ?? "";
  expect(listText.match(/T1/g)?.length ?? 0).toBeGreaterThanOrEqual(2);
  // Frontier gold dots (#ffd166) are painted on the civmap canvas.
  const gold = await page.evaluate(() => {
    const cv = document.querySelector("#civmap-screen canvas") as HTMLCanvasElement | null;
    if (!cv) return -1;
    const ctx = cv.getContext("2d");
    if (!ctx) return -1;
    const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
    let n = 0;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i] as number;
      const g = d[i + 1] as number;
      const b = d[i + 2] as number;
      if (r > 200 && g > 150 && b < 120) n++;
    }
    return n;
  });
  expect(gold).toBeGreaterThan(5);
  await page.keyboard.press("M");
  await expect(page.locator("#civmap-screen")).toHaveCount(0);
  expect(errors).toEqual([]);
});
