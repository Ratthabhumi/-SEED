// Frontier v023.1 browser coverage: contested blocks, deterministic clear
// staging, capacity gating with UI explanation, coexistence under capacity.
// Combat timing is NEVER load-bearing: clearing is staged via claimFirst()
// (field clear + real claim path); tryClaim() mirrors the UI button exactly.
import { test, expect, type Page } from "@playwright/test";
import { startRun } from "./helpers";

declare global {
  interface Window {
    __seedE2E?: {
      advance: (s: number) => void;
      teleportToPOI: () => boolean;
      tryClaim: () => string;
      claimFirst: () => string;
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

  // Freeze wall-time first: with the sim paused, ONLY explicit advance()
  // calls step the world — no realtime respawns, farming, or age-ups can
  // drift the trace between CDP calls. Every staging hook works paused
  // (direct state mutation + manual steps + auto-picked drafts).
  await page.keyboard.press("Escape");
  await expect(page.locator("#pause-screen")).toBeVisible();

  // PART A: contested site blocks the real UI-mirroring claim path.
  // Deterministic order: first PROVE threat inside the clear radius (from
  // the canonical snapshot), then the block follows necessarily — the probe
  // itself can never accidentally claim, so capacity accounting stays exact.
  expect(await page.evaluate(() => window.__seedE2E?.teleportToPOI())).toBe(true);
  await page.evaluate(() => window.__seedE2E?.advance(4));
  let threatSeen = false;
  for (let i = 0; i < 4 && !threatSeen; i++) {
    const s = JSON.parse((await page.evaluate(() => window.__seedE2E?.snapshot() ?? "{}")) as string) as {
      p?: number[];
      e?: string[];
    };
    const px = s.p?.[0] ?? 0;
    const py = s.p?.[1] ?? 0;
    threatSeen = (s.e ?? []).some((row) => {
      const c = row.split(",");
      return Math.hypot(Number(c[0]) - px, Number(c[1]) - py) < 400;
    });
    if (!threatSeen) await page.evaluate(() => window.__seedE2E?.advance(2));
  }
  expect(threatSeen).toBe(true); // live foe inside the claim-clear radius
  expect(await page.evaluate(() => window.__seedE2E?.tryClaim() ?? "CLAIMED")).toBe("");

  // PART B: deterministic clear staging, then the REAL claim path.
  // claimFirst() clears the field (staging) and runs claim + spec for real.
  expect(await page.evaluate(() => window.__seedE2E?.teleportToPOI())).toBe(true);
  await page.evaluate(() => window.__seedE2E?.advance(3));
  const claimedA: string = await page.evaluate(() => window.__seedE2E?.claimFirst() ?? "");
  expect(claimedA).not.toBe("");

  // PART C: fill the frontier to the CURRENT age's capacity (the bot may
  // have aged on wall-time farming — never assume stone), then prove the
  // next claim is rejected with zero mutation and the UI explains capacity.
  // Do-while: the final iteration always parks at a fresh POI, so the
  // probes below run on a discovered, in-reach, freshly-cleared site with
  // zero intervening steps (paused sim = pristine field).
  const capOf = (age: number): number => age + 1; // outpostCapacity
  let age = 0;
  let held = 1;
  let iters = 0;
  do {
    expect(await page.evaluate(() => window.__seedE2E?.teleportToPOI())).toBe(true);
    await page.evaluate(() => window.__seedE2E?.advance(2));
    await page.evaluate(() => window.__seedE2E?.claimFirst() ?? "");
    const s = JSON.parse((await page.evaluate(() => window.__seedE2E?.snapshot() ?? "{}")) as string) as {
      terr?: string[];
      age?: [number];
    };
    held = (s.terr ?? []).length;
    age = s.age?.[0] ?? age;
    iters++;
  } while (held < capOf(age) && iters < 6);
  // Full means held == cap — or cap+1 via the mission-critical first-signal
  // exemption (never capacity-blocked by design; see territoryEconomy.test).
  expect(held).toBeGreaterThanOrEqual(capOf(age));
  // Park at a fresh POI (teleport lands on it; one sim-second discovers it
  // while distant spawns stay outside the clear radius), then probe.
  expect(await page.evaluate(() => window.__seedE2E?.teleportToPOI())).toBe(true);
  await page.evaluate(() => window.__seedE2E?.advance(1));
  const probe: string = await page.evaluate(() => window.__seedE2E?.tryClaim() ?? "");
  if (probe === "") {
    // Rejected on a clear in-reach site: capacity is the only remaining
    // reason — and the UI must say exactly that.
    await expect(page.locator(".territory-bar")).toContainText("OUTPOST CAPACITY FULL", { timeout: 20000 });
  } else {
    // The only legal claim on a full frontier is the first-signal
    // exemption: prove it, then prove the SECOND signal follows economy.
    const after = JSON.parse((await page.evaluate(() => window.__seedE2E?.snapshot() ?? "{}")) as string) as {
      terr?: string[];
    };
    const got = (after.terr ?? []).find((t) => t.split(",")[0] === probe);
    expect(got?.split(",")[1]).toBe("signal");
    expect(await page.evaluate(() => window.__seedE2E?.teleportToPOI())).toBe(true);
    await page.evaluate(() => window.__seedE2E?.advance(1));
    expect(await page.evaluate(() => window.__seedE2E?.tryClaim() ?? "BLOCKED")).toBe("");
    await expect(page.locator(".territory-bar")).toContainText("OUTPOST CAPACITY FULL", { timeout: 20000 });
  }

  // PART D: a genuine second POI claims for real under a HIGHER capacity
  // and both territories coexist (not replaced, not disabled). The target
  // age is computed from current holdings (cap = age+1 > held always has
  // room), so wall-time aging can never close the window.
  const preD = JSON.parse((await page.evaluate(() => window.__seedE2E?.snapshot() ?? "{}")) as string) as {
    terr?: string[];
  };
  const heldD = (preD.terr ?? []).length;
  const target = Math.max(2, heldD);
  expect(await page.evaluate((t) => window.__seedE2E?.setAgeIndex(t) ?? -1, target)).toBe(target);
  expect(await page.evaluate(() => window.__seedE2E?.teleportToPOI())).toBe(true);
  await page.evaluate(() => window.__seedE2E?.advance(3));
  const claimedB: string = await page.evaluate(() => window.__seedE2E?.claimFirst() ?? "");
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
  // Deterministic: teleport (travel) + advance (discover) + claimFirst
  // (clear + real claim). No combat-timing dependence.
  expect(await page.evaluate(() => window.__seedE2E?.setAgeIndex(2))).toBe(2);
  const claimed: string[] = [];
  for (let i = 0; i < 4 && claimed.length < 2; i++) {
    expect(await page.evaluate(() => window.__seedE2E?.teleportToPOI())).toBe(true);
    await page.evaluate(() => window.__seedE2E?.advance(3));
    const r: string = await page.evaluate(() => window.__seedE2E?.claimFirst() ?? "");
    if (r !== "" && !claimed.includes(r)) claimed.push(r);
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
