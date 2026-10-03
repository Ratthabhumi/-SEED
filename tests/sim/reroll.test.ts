// v0.23.1 deterministic reroll contract: if an alternative exists the redraw
// MUST change >= 1 visible non-reserved card; the compatible reserved card
// stays; with no alternative the reroll is NOT consumed and an explicit
// `draft_reroll_unavailable` event is returned. Same seed + same decisions
// always yields the same result.
import { describe, it, expect } from "vitest";
import { RunSimulation } from "../../src/core/sim/RunSimulation";
import type { InputFrame } from "../../src/core/sim/InputFrame";

const IDLE: InputFrame = { moveX: 0, moveY: 0, dashPressed: false };

function testSim(seed = "EPOCH-GOLDEN-001"): RunSimulation {
  return new RunSimulation({ masterSeed: seed, originId: "engineers" });
}

/** Open a level draft with a fat pool to choose from. */
function openDraft(sim: RunSimulation): void {
  const ev: never[] = [];
  sim.gainKnowledge(200000, "test", ev);
  expect(sim.state.draftOpen).toBe(true);
}

function shownIds(sim: RunSimulation): string[] {
  return sim.state.draftOffers.map((o) => o.nodeId);
}

/** Non-reserved, non-fallback ids currently visible. */
function shownReal(sim: RunSimulation): string[] {
  const s = sim.state;
  return s.draftOffers
    .filter((o) => !o.nodeId.startsWith("fb-") && o.nodeId !== s.reservedTech)
    .map((o) => o.nodeId);
}

/** Non-reserved real ids the pool could show (what a redraw draws from). */
function poolReal(sim: RunSimulation): string[] {
  const s = sim.state;
  return sim
    .nodeStates()
    .filter((x) => x.available && x.id !== s.reservedTech)
    .map((x) => x.id);
}

/** Directed trace with a proven alternative (validated staging: after three
 * owned drafts the pool holds an unshown real node). The staging
 * precondition is asserted loudly — if the DAG ever moves, this fails at
 * setup, never mysteriously mid-contract. Searches seeds dynamically since
 * offer engine v0.24 changes draft selection (Gumbel-Top-k with quality). */
function stagedAlternative(): RunSimulation {
  const origins = ["sentinels", "hunters", "engineers", "resonant"];
  const seeds = [];
  for (let i = 1; i <= 50; i++) {
    seeds.push(`EPOCH-PROBE-${i}`);
    seeds.push(`EPOCH-REROLL-${i}`);
    seeds.push(`EPOCH-GOLDEN-${i}`);
  }
  for (const origin of origins) {
    for (const seed of seeds) {
      const sim = new RunSimulation({ masterSeed: seed, originId: origin });
      const ev: never[] = [];
      sim.gainKnowledge(500000, "test", ev);
      for (let i = 0; i < 3; i++) {
        if (sim.state.draftOpen) sim.chooseDraft(0);
        else {
          const e2: never[] = [];
          sim.gainKnowledge(500000, "test", e2);
        }
      }
      if (!sim.state.draftOpen) continue;
      const pool = new Set(poolReal(sim));
      const shown = new Set(shownReal(sim));
      const outside = [...pool].filter((id) => !shown.has(id));
      if (outside.length > 0) return sim;
    }
  }
  throw new Error("No seed/origin found with staged alternative for offer engine v0.24");
}

describe("reroll meaningful-change contract", () => {
  it("alternative exists → changed >= 1 non-reserved visible card", () => {
    const sim = stagedAlternative();
    const before = shownReal(sim);
    const ev = sim.rerollDraft();
    const ok = ev.find((e) => e.type === "draft_rerolled");
    expect(ok, "expected draft_rerolled, got " + JSON.stringify(ev.map((e) => e.type))).toBeDefined();
    if (ok?.type !== "draft_rerolled") throw new Error("unreachable");
    expect(ok.changed).toBeGreaterThanOrEqual(1);
    expect(ok.rerollsLeft).toBe(0);
    // Telemetry is exact: prev/new ids and the changed count agree.
    expect(new Set(ok.prevIds)).toEqual(new Set(before));
    expect(new Set(ok.newIds)).toEqual(new Set(shownReal(sim)));
    expect(ok.newIds.filter((id) => !before.includes(id)).length).toBe(ok.changed);
    expect(sim.state.draftOpen).toBe(true);
    expect(sim.state.draftOffers).toHaveLength(3);
    // No duplicate cards on screen after a forced swap.
    expect(new Set(shownIds(sim)).size).toBe(shownIds(sim).length);
  });

  it("reserved compatible card stays and never counts as a change", () => {
    const sim = stagedAlternative();
    const realIdx = sim.state.draftOffers.findIndex((o) => !o.nodeId.startsWith("fb-"));
    expect(realIdx).toBeGreaterThanOrEqual(0);
    const reserved = sim.state.draftOffers[realIdx]?.nodeId as string;
    sim.reserveCard(realIdx);
    const ev = sim.rerollDraft();
    const ok = ev.find((e) => e.type === "draft_rerolled");
    expect(ok?.type).toBe("draft_rerolled");
    expect(sim.state.draftOffers.map((o) => o.nodeId)).toContain(reserved);
    if (ok?.type !== "draft_rerolled") throw new Error("unreachable");
    expect(ok.newIds).not.toContain(reserved);
    expect(ok.changed).toBeGreaterThanOrEqual(1);
    expect(new Set(shownIds(sim)).size).toBe(shownIds(sim).length);
  });

  it("no alternative → reroll not consumed, explicit unavailable result", () => {
    // Find a trace whose whole real pool is already on screen (tiny frontier).
    let sim: RunSimulation | null = null;
    const seeds = ["EPOCH-REROLL-10", "EPOCH-REROLL-11", "EPOCH-REROLL-12", "EPOCH-REROLL-13"];
    for (const seed of seeds) {
      const cand = testSim(seed);
      openDraft(cand);
      const pool = new Set(poolReal(cand));
      const shown = new Set(shownReal(cand));
      if ([...pool].every((id) => shown.has(id))) {
        sim = cand;
        break;
      }
    }
    expect(sim, "expected a seed with an exhausted tiny pool").not.toBeNull();
    const s = sim?.state;
    if (!sim || !s) throw new Error("unreachable");
    const beforeChoices = shownIds(sim);
    const ev = sim.rerollDraft();
    expect(ev).toHaveLength(1);
    expect(ev[0]?.type).toBe("draft_reroll_unavailable");
    // Zero mutation: uses kept, choices identical, still open.
    expect(s.rerolls).toBe(1);
    expect(shownIds(sim)).toEqual(beforeChoices);
    expect(s.draftOpen).toBe(true);
  });

  it("contract holds across a seed spread (change or clean unavailable)", () => {
    for (let i = 0; i < 20; i++) {
      const a = testSim(`EPOCH-REROLL-S${i}`);
      const b = testSim(`EPOCH-REROLL-S${i}`);
      openDraft(a);
      openDraft(b);
      const beforeA = shownIds(a);
      const evA = a.rerollDraft();
      const evB = b.rerollDraft();
      // Same seed + same decisions → same reroll result (events + snapshot).
      expect(evB.map((e) => e.type)).toEqual(evA.map((e) => e.type));
      expect(b.snapshot()).toBe(a.snapshot());
      const t = evA[0]?.type;
      if (t === "draft_rerolled") {
        const ok = evA.find((e) => e.type === "draft_rerolled");
        if (ok?.type !== "draft_rerolled") throw new Error("unreachable");
        expect(ok.changed).toBeGreaterThanOrEqual(1);
        expect(a.state.rerolls).toBe(0);
      } else {
        expect(t).toBe("draft_reroll_unavailable");
        expect(a.state.rerolls).toBe(1);
        expect(shownIds(a)).toEqual(beforeA);
      }
      void IDLE;
    }
  });
});
