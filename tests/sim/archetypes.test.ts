import { describe, it, expect } from "vitest";
import { RunSimulation } from "../../src/core/sim/RunSimulation";
import { getWeaponStage, type WeaponFamily } from "../../src/core/combat/weapons";
import type { InputFrame } from "../../src/core/sim/InputFrame";

const IDLE: InputFrame = { moveX: 0, moveY: 0, dashPressed: false };
const FAMS: WeaponFamily[] = ["kinetic", "energy", "defense", "field"];
// Origin covering each family under test (origin gating is the v0.2 contract).
const FAM_ORIGIN: Record<WeaponFamily, string> = {
  kinetic: "hunters",
  energy: "resonant",
  defense: "engineers",
  field: "hunters",
};

// P1-04: every family × tier archetype must have a working executable path.
describe("weapon archetype execution", () => {
  for (const fam of FAMS) {
    for (let tier = 0; tier < 6; tier++) {
      it(`${fam} tier ${tier} (${getWeaponStage(fam, tier).archetype}) damages enemies`, () => {
        const sim = new RunSimulation({ masterSeed: "EPOCH-GOLDEN-001", originId: FAM_ORIGIN[fam] });
        sim.state.spawnT = 99999;
        sim.state.eliteT = 99999;
        sim.state.build.hp = 99999;
        sim.state.build.maxHp = 99999;
        sim.state.weaponStage = { kinetic: 0, energy: 0, defense: 0, field: 0 };
        sim.state.weaponStage[fam] = tier;
        // Durable target that walks into every weapon system.
        const ev: never[] = [];
        const enemy = sim.spawnEnemy("tank", false, false, 0, 120, ev);
        expect(enemy).not.toBeNull();
        const arch = getWeaponStage(fam, tier).archetype;
        if (fam === "field" && arch === "mine") {
          // Deterministic: let a mine arm, then place the target on top of it.
          for (let i = 0; i < 90 && !sim.state.mines.some((m) => m.active); i++) sim.step(1 / 60, IDLE);
          const mine = sim.state.mines.find((m) => m.active);
          expect(mine, "mine armed").toBeDefined();
          const tgt = sim.state.enemies.find((e) => e.active);
          expect(tgt, "target alive").toBeDefined();
          tgt!.x = mine!.x;
          tgt!.y = mine!.y;
          for (let i = 0; i < 10; i++) sim.step(1 / 60, IDLE);
        } else {
          for (let i = 0; i < 300 && !sim.state.over; i++) {
            const e2 = sim.step(1 / 60, IDLE);
            for (const e of e2) if (e.type === "draft_opened") sim.chooseDraft(0);
          }
        }
        expect(sim.state.damageBySource[fam] ?? 0, `${fam}@${tier}`).toBeGreaterThan(0);
      });
    }
  }

  it("Space kinetic beam never creates a zero-velocity projectile", () => {
    const sim = new RunSimulation({ masterSeed: "EPOCH-GOLDEN-001" });
    expect(getWeaponStage("kinetic", 5).archetype).toBe("beam");
    sim.state.spawnT = 99999;
    sim.state.eliteT = 99999;
    sim.state.build.hp = 99999;
    sim.state.build.maxHp = 99999;
    sim.state.weaponStage = { kinetic: 5, energy: 0, defense: 0, field: 0 };
    sim.spawnEnemy("tank", false, false, 0, 150, []);
    for (let i = 0; i < 180; i++) sim.step(1 / 60, IDLE);
    expect(sim.state.damageBySource["kinetic"] ?? 0).toBeGreaterThan(0);
    for (const p of sim.state.projs) {
      if (p.active && p.friendly) {
        expect(p.vx !== 0 || p.vy !== 0, "stationary friendly projectile").toBe(true);
      }
    }
  });
});
