import { describe, it, expect } from "vitest";
import { RunSimulation } from "../../src/core/sim/RunSimulation";
import { applyTechEffect, defaultEffectTarget, scaleKnowledge } from "../../src/core/sim/progression";
import { BREAKTHROUGHS, checkBreakthroughs } from "../../src/core/tech/synergy";
import { ELITE_AFFIXES, ELITE_AFFIX_DEFS } from "../../src/core/director/director";
import { en } from "../../src/i18n/en";
import { th } from "../../src/i18n/th";
import type { InputFrame } from "../../src/core/sim/InputFrame";

const IDLE: InputFrame = { moveX: 0, moveY: 0, dashPressed: false };

function quiet(sim: RunSimulation): void {
  // Silence the director so only our fixtures matter.
  sim.state.spawnT = 99999;
  sim.state.eliteT = 99999;
  for (const e of sim.state.enemies) e.active = false;
  for (const p of sim.state.projs) p.active = false;
}

describe("knowledge exactly-once semantics", () => {
  it("gainKnowledge applies the multiplier exactly once to XP and total", () => {
    const sim = new RunSimulation({ masterSeed: "EPOCH-GOLDEN-001" });
    const m0 = sim.state.build.knowledgeMul; // spine-tools grants +10% at run start
    expect(m0).toBeCloseTo(1.1, 9);
    sim.gainKnowledge(100, "test", []);
    expect(sim.state.knowledgeTotal).toBeCloseTo(100 * m0, 9);
    sim.state.build.knowledgeMul = 1.15;
    sim.gainKnowledge(100, "test", []);
    expect(sim.state.knowledgeTotal).toBeCloseTo(100 * m0 + 115, 9);
    // No double application: exactly base * mult, added once.
    expect(scaleKnowledge(100, 1.15)).toBeCloseTo(115, 9);
  });

  it("pickup collection flows through the single canonical op", () => {
    const sim = new RunSimulation({ masterSeed: "EPOCH-GOLDEN-001" });
    quiet(sim);
    sim.state.build.knowledgeMul = 1.2;
    sim.dropPickup(sim.state.px, sim.state.py, 10);
    for (let i = 0; i < 30 && sim.state.knowledgeTotal === 0; i++) sim.step(1 / 60, IDLE);
    expect(sim.state.knowledgeTotal).toBe(12);
    expect(sim.state.stats.knowledgeEarned).toBe(12);
  });
});

describe("pickup value conservation", () => {
  it("overflowing the pool never destroys earned value", () => {
    const sim = new RunSimulation({ masterSeed: "EPOCH-GOLDEN-001" });
    let dropped = 0;
    for (let i = 0; i < 500; i++) {
      const v = 1 + (i % 3);
      dropped += v;
      sim.dropPickup(i * 7 - 1000, i * 13 - 1000, v);
    }
    let held = 0;
    let active = 0;
    for (const p of sim.state.pickups) {
      if (p.active) { active++; held += p.value; }
    }
    expect(active).toBeLessThanOrEqual(400);
    expect(held).toBe(dropped);
  });
});

describe("breakthrough description/effect contracts", () => {
  it("every breakthrough has typed effects + localized title/description", () => {
    for (const b of BREAKTHROUGHS) {
      expect(b.effects.length, b.id).toBeGreaterThan(0);
      expect(en[b.titleKey], b.id).toBeDefined();
      expect(en[b.descriptionKey], b.id).toBeDefined();
      expect(th[b.titleKey], b.id).toBeDefined();
      expect(th[b.descriptionKey], b.id).toBeDefined();
    }
  });

  it("metallurgy (fire+tools) grants damage AND knowledge through one system", () => {
    const found = checkBreakthroughs(new Set(["fire", "tools"]), new Set());
    expect(found.map((b) => b.id)).toContain("metallurgy");
    const build = defaultEffectTarget();
    const m = found.find((b) => b.id === "metallurgy")!;
    for (const e of m.effects) applyTechEffect(build, e);
    expect(build.damageMul).toBeCloseTo(1.15, 9);
    expect(build.knowledgeMul).toBeCloseTo(1.1, 9);
  });

  it("war-machine grants projectile + cooldown (not generic damage)", () => {
    const build = defaultEffectTarget();
    const w = BREAKTHROUGHS.find((b) => b.id === "war-machine")!;
    for (const e of w.effects) applyTechEffect(build, e);
    expect(build.bonusProjectiles).toBe(1);
    expect(build.cooldownMul).toBeLessThan(1);
    expect(build.damageMul).toBe(1);
  });
});

describe("elite affix behavior contracts", () => {
  it("every pooled affix has a definition with real behavior", () => {
    for (const id of ELITE_AFFIXES) {
      const d = ELITE_AFFIX_DEFS[id];
      expect(d, id).toBeDefined();
      const hasBehavior =
        d.speedMul !== 1 || d.maxHpMul !== 1 || d.incomingDamageMul !== 1 ||
        d.shieldFrac > 0 || d.volatileRadius > 0 || d.splitterCount > 0;
      expect(hasBehavior, id).toBe(true);
    }
  });

  it("armored reduces incoming damage, never its own outgoing damage", () => {
    const a = ELITE_AFFIX_DEFS.armored;
    expect(a.incomingDamageMul).toBeLessThan(1);
    expect(a.outgoingDamageMul).toBe(1);
  });

  it("swift / volatile / shielded are real", () => {
    expect(ELITE_AFFIX_DEFS.swift.speedMul).toBeGreaterThan(1);
    expect(ELITE_AFFIX_DEFS.volatile.volatileRadius).toBeGreaterThan(0);
    expect(ELITE_AFFIX_DEFS.volatile.volatileDamage).toBeGreaterThan(0);
    expect(ELITE_AFFIX_DEFS.shielded.shieldFrac).toBeGreaterThan(0);
    expect(ELITE_AFFIX_DEFS.splitter.splitterCount).toBeGreaterThan(0);
  });
});
