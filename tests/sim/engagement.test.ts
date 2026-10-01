import { describe, it, expect } from "vitest";
import { RunSimulation } from "../../src/core/sim/RunSimulation";
import { activeFamilies, lockedFamilies, ORIGINS, DEFAULT_ORIGIN } from "../../src/core/progression/origins";
import { legacyCandidates } from "../../src/core/progression/legacies";
import {
  breakthroughProgress, completingBreakthrough, checkBreakthroughs, tagDisplayKey,
  BREAKTHROUGHS,
} from "../../src/core/tech/synergy";
import { POI_DRAFT_FILTERS, POI_MAJOR_KIND, type POIType } from "../../src/core/world/poi";
import { AGE_DEFS } from "../../src/core/progression/ages";
import { CRITICAL_SPINE } from "../../src/core/tech/graph";
import { generateTechGraph } from "../../src/core/tech/generator";
import { worldToChunk } from "../../src/core/world/chunks";
import type { InputFrame } from "../../src/core/sim/InputFrame";

const IDLE: InputFrame = { moveX: 0, moveY: 0, dashPressed: false };

function quiet(sim: RunSimulation): void {
  sim.state.spawnT = 99999;
  sim.state.eliteT = 99999;
  for (const e of sim.state.enemies) e.active = false;
  for (const p of sim.state.projs) p.active = false;
}

describe("origins and active families", () => {
  it("fresh run begins level 1 with the default origin", () => {
    const sim = new RunSimulation({ masterSeed: "EPOCH-GOLDEN-001" });
    expect(sim.state.level).toBe(1);
    expect(sim.state.xp).toBe(0);
    expect(sim.state.knowledgeTotal).toBe(0);
    expect(sim.state.originId).toBe(DEFAULT_ORIGIN);
    expect(activeFamilies(sim.state.originId, "")).toEqual(["kinetic", "field"]);
  });

  it("each origin activates exactly two families", () => {
    expect(ORIGINS.length).toBe(4);
    for (const o of ORIGINS) {
      expect(activeFamilies(o.id, "")).toHaveLength(2);
      expect(lockedFamilies(o.id, "")).toHaveLength(2);
    }
  });

  it("expansion unlocks exactly one third family; second unlock rejected", () => {
    const sim = new RunSimulation({ masterSeed: "EPOCH-GOLDEN-001", originId: "hunters" });
    expect(activeFamilies("hunters", "")).toEqual(["kinetic", "field"]);
    const ev = sim.chooseExpansion("defense");
    expect(ev.some((e) => e.type === "expansion_unlocked")).toBe(true);
    expect(activeFamilies(sim.state.originId, sim.state.expansionFamily)).toHaveLength(3);
    expect(sim.state.expansionFamily).toBe("defense");
    // Second unlock + already-active picks are rejected with no events.
    expect(sim.chooseExpansion("energy")).toEqual([]);
    expect(sim.chooseExpansion("kinetic")).toEqual([]);
    expect(sim.state.expansionFamily).toBe("defense");
  });

  it("inactive weapon families deal zero damage", () => {
    const sim = new RunSimulation({ masterSeed: "EPOCH-GOLDEN-001", originId: "sentinels" });
    quiet(sim);
    sim.state.build.hp = 99999;
    sim.state.build.maxHp = 99999;
    // Max every stage so inactive families WOULD fire if ungated.
    sim.state.weaponStage = { kinetic: 5, energy: 5, defense: 5, field: 5 };
    const ev: never[] = [];
    const enemy = sim.spawnEnemy("tank", false, false, 0, 150, ev);
    expect(enemy).not.toBeNull();
    enemy!.hp = 1e9;
    enemy!.maxHp = 1e9;
    for (let i = 0; i < 180 && !sim.state.over; i++) sim.step(1 / 60, IDLE);
    expect(sim.state.damageBySource["kinetic"] ?? 0).toBe(0);
    expect(sim.state.damageBySource["field"] ?? 0).toBe(0);
    expect((sim.state.damageBySource["energy"] ?? 0) + (sim.state.damageBySource["defense"] ?? 0)).toBeGreaterThan(0);
  });

  it("draft pool never offers family-dead cards", () => {
    const sim = new RunSimulation({ masterSeed: "EPOCH-GOLDEN-001", originId: "hunters" });
    sim.state.ageIndex = 5;
    for (let i = 0; i <= 5; i++) {
      const id = CRITICAL_SPINE[i]?.id;
      if (id && !sim.state.owned.includes(id)) sim.state.owned.push(id);
    }
    const active = new Set(activeFamilies("hunters", ""));
    expect(sim.generatedOptionsCount()).toBeGreaterThan(0);
    // Drive real drafts and inspect every offered card.
    const ev: never[] = [];
    sim.gainKnowledge(100000, "test", ev);
    let rounds = 0;
    while (sim.state.draftOpen && rounds++ < 12) {
      for (const n of sim.state.draftChoices) {
        for (const e of n.effects) {
          expect(!e.family || active.has(e.family), `${n.id} offers dead ${e.family}`).toBe(true);
        }
      }
      sim.chooseDraft(0);
    }
    expect(rounds).toBeGreaterThan(0);
  });

  it("all origins can progress to Space", async () => {
    // v021 pacing simulation: an ENGAGED bot (steers to POIs, claims/specs/
    // upgrades territory, defends raids, picks first draft) must complete the
    // full mission chain. Same seed + same policy replays identically.
    const SPECS = ["research", "military", "economy"] as const;
    for (const o of ORIGINS) {
      const sim = new RunSimulation({ masterSeed: "EPOCH-GOLDEN-001", originId: o.id });
      sim.state.build.hp = 1e9;
      sim.state.build.maxHp = 1e9;
      let steps = 0;
      let specIdx = 0;
      let spaceAt = -1;
      while (sim.state.ageIndex < 5 && !sim.state.over && steps < 90000) {
        const s = sim.state;
        // Steering: defend an active raid, repair a disabled outpost,
        // else head for the nearest undiscovered POI, else breathe and fight.
        let tx: number | null = null;
        let ty: number | null = null;
        if (s.raid) {
          const t = s.territories.find((x) => x.poiId === s.raid?.poiId);
          if (t) { tx = t.x; ty = t.y; }
        }
        if (tx === null) {
          let bd = 1e9;
          for (const t of s.territories) {
            if (!t.disabled) continue;
            const d = Math.hypot(t.x - s.px, t.y - s.py);
            if (d < bd) { bd = d; tx = t.x; ty = t.y; }
          }
        }
        if (tx === null) {
          const { cx, cy } = worldToChunk(s.px, s.py);
          let bd = 2500;
          for (let ox = -3; ox <= 3; ox++) {
            for (let oy = -3; oy <= 3; oy++) {
              const desc = sim.chunks.get(s.worldSeed, s.worldNonce, cx + ox, cy + oy);
              for (const poi of desc.poi) {
                if (s.poisWorld.includes(poi.id)) continue;
                const d = Math.hypot(poi.wx - s.px, poi.wy - s.py);
                if (d < bd) { bd = d; tx = poi.wx; ty = poi.wy; }
              }
            }
          }
        }
        let input: InputFrame;
        if (tx === null || ty === null) {
          input = { moveX: Math.cos(steps / 40), moveY: Math.sin(steps / 40), dashPressed: false };
        } else {
          const dx = tx - s.px;
          const dy = ty - s.py;
          const d = Math.max(1, Math.hypot(dx, dy));
          input = d < 40
            ? { moveX: 0, moveY: 0, dashPressed: false }
            : { moveX: dx / d, moveY: dy / d, dashPressed: false };
        }
        const ev = sim.step(1 / 60, input);
        for (const e of ev) {
          if (e.type === "draft_opened") sim.chooseDraft(0);
          else if (e.type === "expansion_offered") sim.chooseExpansion(e.families[0] as "kinetic");
        }
        // Drain any open draft every step (an already-open draft emits no event).
        let guard = 0;
        while (sim.state.draftOpen && guard++ < 8) sim.chooseDraft(0);
        // Engaged decisions every step (all idempotent when ineligible).
        for (const c of sim.claimablePOIs()) {
          if (!c.clear) continue;
          sim.claimTerritory(c.poiId);
          const terr = sim.state.territories.find((x) => x.poiId === c.poiId);
          if (terr && terr.spec === "") {
            sim.setOutpostSpec(c.poiId, SPECS[specIdx % SPECS.length] as "research" | "military" | "economy");
            specIdx++;
          }
        }
        for (const terr of sim.state.territories) sim.upgradeOutpost(terr.poiId);
        if (sim.state.ageIndex >= 5 && spaceAt < 0) spaceAt = sim.state.elapsed;
        steps++;
      }
      expect(sim.state.ageIndex, `origin ${o.id} reached space`).toBe(5);
      expect(spaceAt, `origin ${o.id} space time recorded`).toBeGreaterThan(0);
      // Pacing: engaged godmode play reaches Space well inside 25 minutes,
      // and the mission chain (not the clock) sets the pace floor.
      expect(spaceAt, `origin ${o.id} pacing`).toBeLessThan(1500);
      expect(sim.state.territories.length, `origin ${o.id} claimed territory`).toBeGreaterThan(0);
      expect(sim.state.history.length, `origin ${o.id} build history`).toBeGreaterThan(10);
    }
  }, 240000);
});

describe("synergy plan truth", () => {
  it("progress counts and completion preview match actual unlock", () => {
    const owned = ["fire", "tools"];
    const prog = breakthroughProgress(owned, []);
    const met = prog.find((p) => p.id === "metallurgy")!;
    expect([met.have, met.need]).toEqual([2, 2]);
    // A node carrying no new tags completes nothing already completable... use fresh tags:
    const done = completingBreakthrough(["fire", "tools"], [], []);
    expect(done?.id).toBe("metallurgy");
    // And the canonical unlock agrees with the preview.
    const unlocked = checkBreakthroughs(new Set(["fire", "tools"]), new Set());
    expect(unlocked.map((b) => b.id)).toContain(done?.id);
    expect(completingBreakthrough(["rail"], ["fire"], [])).toBeNull();
  });

  it("every breakthrough require-tag has a display key", () => {
    for (const b of BREAKTHROUGHS) {
      for (const t of b.requires) {
        expect(tagDisplayKey(t), `${b.id} needs ${t}`).not.toBeNull();
      }
    }
  });
});

describe("POI major reward contracts", () => {
  it("six families, distinct contracts (5 drafts + 1 cache)", () => {
    const kinds = new Set(Object.values(POI_MAJOR_KIND));
    expect(Object.keys(POI_MAJOR_KIND)).toHaveLength(6);
    expect(kinds.has("draft")).toBe(true);
    expect(kinds.has("cache")).toBe(true);
    expect(POI_MAJOR_KIND["megasite"]).toBe("cache");
  });

  it("draft filters are distinct and non-empty on a real graph", () => {
    const graph = generateTechGraph("EPOCH-GOLDEN-001", 0).nodes;
    const sets = new Map<string, string>();
    for (const type of Object.keys(POI_DRAFT_FILTERS) as POIType[]) {
      const hit = graph.filter(POI_DRAFT_FILTERS[type]).map((n) => n.id).sort().join(",");
      expect(hit.length, `${type} matches something`).toBeGreaterThan(0);
      sets.set(type, hit);
    }
    const uniq = new Set(sets.values());
    expect(uniq.size).toBeGreaterThanOrEqual(5); // contracts differ per family
  });

  it("first discovery pays major, repeat pays base knowledge", () => {
    const sim = new RunSimulation({ masterSeed: "EPOCH-GOLDEN-001", originId: "hunters" });
    quiet(sim);
    // Find two POIs of the same common family.
    const found: Array<{ x: number; y: number; type: POIType }> = [];
    outer: for (let r = 1; r < 12; r++) {
      for (let cx = -r; cx <= r; cx++) {
        for (let cy = -r; cy <= r; cy++) {
          if (Math.max(Math.abs(cx), Math.abs(cy)) !== r) continue;
          const desc = sim.chunks.get(sim.state.worldSeed, sim.state.worldNonce, cx, cy);
          for (const poi of desc.poi) {
            found.push({ x: poi.wx, y: poi.wy, type: poi.type });
            if (found.length >= 12) break outer;
          }
        }
      }
    }
    const byType = new Map<POIType, typeof found>();
    for (const f of found) {
      const arr = byType.get(f.type) ?? [];
      arr.push(f);
      byType.set(f.type, arr);
    }
    const entry = [...byType.entries()].find(([, v]) => v.length >= 2 && POI_MAJOR_KIND[v[0]!.type] === "draft");
    expect(entry, "need two same-family draft POIs").toBeDefined();
    const [type, pair] = entry!;
    const stepTo = (x: number, y: number) => {
      sim.state.px = x;
      sim.state.py = y;
      for (const e of sim.state.enemies) e.active = false;
      return sim.step(1 / 60, IDLE);
    };
    const ev1 = stepTo(pair[0]!.x, pair[0]!.y);
    expect(sim.state.poiFamiliesClaimed).toContain(type);
    expect(ev1.some((e) => e.type === "poi_major")).toBe(true);
    expect(sim.state.draftOpen).toBe(true); // major = modal draft
    expect(sim.state.draftContext).toBe("poi");
    sim.chooseDraft(0);
    const majorsBefore = sim.state.poiFamiliesClaimed.length;
    const ev2 = stepTo(pair[1]!.x, pair[1]!.y);
    // Repeat family: claimed set unchanged, no new major modal.
    expect(ev2.some((e) => e.type === "poi_major")).toBe(false);
    expect(sim.state.poiFamiliesClaimed.length).toBe(majorsBefore);
  });
});

describe("knowledge gates (evidence-calibrated)", () => {
  it("uses the v0.2 curve", () => {
    expect(AGE_DEFS.map((d) => d.knowledgeThreshold)).toEqual([0, 500, 1500, 2800, 4500, 6500]);
  });
});

describe("ascension legacy prestige", () => {
  function readySim(): RunSimulation {
    const sim = new RunSimulation({ masterSeed: "EPOCH-GOLDEN-001", originId: "hunters" });
    sim.state.ascendReady = true;
    return sim;
  }

  it("candidates are deterministic, distinct, and three", () => {
    const a = legacyCandidates({ breakthroughs: ["metallurgy"], topDamageSource: "kinetic", ascension: 1 });
    const b = legacyCandidates({ breakthroughs: ["metallurgy"], topDamageSource: "kinetic", ascension: 1 });
    expect(a.map((d) => d.id)).toEqual(b.map((d) => d.id));
    expect(a).toHaveLength(3);
    expect(new Set(a.map((d) => d.id)).size).toBe(3);
    expect(a[0]?.id).toBe("heir-metallurgy");
  });

  it("invalid legacy or origin rejects with no state change", () => {
    const sim = readySim();
    const before = sim.snapshot();
    expect(sim.ascend("nope", "hunters")).toEqual([]);
    expect(sim.ascend("affinity-kinetic", "nope-origin")).toEqual([]);
    expect(sim.snapshot()).toBe(before);
    expect(sim.state.ascension).toBe(0);
  });

  it("child world resets build but keeps run totals + legacy", () => {
    const sim = readySim();
    sim.state.stats.kills = 100;
    sim.state.runKills = 100;
    sim.state.runElapsed = 700;
    // Energy affinity pairs with the Sentinels origin (P1-05 compatibility).
    sim.state.worldTopDamageSource = "energy";
    const ev = sim.ascend("affinity-energy", "sentinels");
    expect(ev.some((e) => e.type === "legacy_granted")).toBe(true);
    expect(ev.some((e) => e.type === "ascended")).toBe(true);
    const s = sim.state;
    expect(s.ascension).toBe(1);
    expect(s.level).toBe(1);
    expect(s.xp).toBe(0);
    expect(s.knowledgeTotal).toBe(0);
    expect(s.ageIndex).toBe(0);
    expect(s.owned).toEqual(["spine-tools"]);
    expect(s.weaponStage).toEqual({ kinetic: 0, energy: 0, defense: 0, field: 0 });
    expect(s.originId).toBe("sentinels");
    expect(s.legacies).toEqual(["affinity-energy"]);
    expect(s.stats.kills).toBe(100);
    expect(s.runKills).toBe(100);
    expect(s.runElapsed).toBe(700);
    // Legacy effect applied: beam weapons unlocked from world start.
    expect(s.build.beamUnlocked).toBe(true);
  });

  it("legacy slots cap at 3 across ascensions", () => {
    const sim = readySim();
    // asc0 offers [affinity-kinetic, trait-swift, trait-keen]; later worlds
    // rotate the trait slot deterministically.
    const picks = ["affinity-kinetic", "trait-keen", "trait-sturdy", "trait-swift"];
    for (const id of picks) {
      sim.state.ascendReady = true;
      const offers = sim.legacyOffers().map((d) => d.id);
      expect(offers, `ascension ${sim.state.ascension}`).toContain(id);
      sim.ascend(id, "hunters");
    }
    expect(sim.state.legacies).toHaveLength(3);
    expect(sim.state.legacies).toEqual(["trait-keen", "trait-sturdy", "trait-swift"]);
    expect(sim.state.ascension).toBe(4);
  });

  it("same trace replays equally with origins and legacies", () => {
    const play = (): string => {
      const sim = new RunSimulation({ masterSeed: "EPOCH-GOLDEN-001", originId: "sentinels" });
      for (let i = 0; i < 900; i++) {
        const ev = sim.step(1 / 60, { moveX: Math.cos(i / 25), moveY: Math.sin(i / 25), dashPressed: i % 90 === 0 });
        for (const e of ev) if (e.type === "draft_opened") sim.chooseDraft(0);
        if (sim.state.over) break;
      }
      return sim.snapshot();
    };
    expect(play()).toBe(play());
  });
});
