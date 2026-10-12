import type Phaser from "phaser";
import type { SimEvent } from "../../core/sim/SimEvent";
import type { RunState } from "../../core/sim/RunState";
import { getWeaponStage } from "../../core/combat/weapons";
import { activeFamilies } from "../../core/progression/origins";
import { drawBeam } from "./ProjectileRenderer";
import { phaserColors } from "../../theme/tokens";

/** Fixed presentation pool. Seconds are canonical elapsed time: pause freezes FX. */
export const COMBAT_FEEDBACK_BUDGET = { beams: 8, impacts: 32, sparksPerImpact: 5, impactSprites: 8 } as const;
export const BEAM_RELEASE_SECONDS = 0.12;
export const IMPACT_SECONDS = 0.24;
type Slot = { until: number; x: number; y: number; tx: number; ty: number; color: number; width: number; shield: boolean };
const slot = (): Slot => ({ until: -Infinity, x: 0, y: 0, tx: 0, ty: 0, color: 0, width: 0, shield: false });

/** Charge is advisory readiness, never a damage telegraph or a gameplay timer. */
export function energyCharge(s: RunState): number {
  if (s.over || !activeFamilies(s.originId, s.expansionFamily).includes("energy")) return 0;
  const stage = getWeaponStage("energy", s.weaponStage.energy);
  if (stage.archetype !== "beam" && !s.build.beamUnlocked) return 0;
  const cd = s.weaponCd.energy;
  if (cd <= 0 || cd > 0.2) return 0;
  if (!s.enemies.some(e => e.active && Math.hypot(e.x - s.px, e.y - s.py) <= 800)) return 0;
  return 1 - cd / 0.2;
}

export class CombatFeedback {
  private beams = Array.from({ length: COMBAT_FEEDBACK_BUDGET.beams }, slot);
  private impacts = Array.from({ length: COMBAT_FEEDBACK_BUDGET.impacts }, slot);
  private world = "";
  private sprites: Phaser.GameObjects.Image[] = [];
  initialize(scene: Phaser.Scene): void {
    // Existing licensed original impact texture; no new asset or animation tween.
    this.sprites = Array.from({length: COMBAT_FEEDBACK_BUDGET.impactSprites}, () =>
      scene.add.image(0,0,"seed_hit_impact").setDepth(39).setVisible(false));
  }
  reset(world: string): void {
    this.world = world;
    for (const p of this.beams) p.until = -Infinity;
    for (const p of this.impacts) p.until = -Infinity;
    for (const image of this.sprites) image.setVisible(false);
  }
  syncWorld(world: string): void { if (world !== this.world) this.reset(world); }
  accept(e: SimEvent, time: number, reduced: boolean): void {
    if (e.type === "beam_fired") {
      const p = this.beams.find(p => p.until <= time);
      if (!p) return;
      const stage = getWeaponStage(e.family, e.tier);
      Object.assign(p, { until: time + BEAM_RELEASE_SECONDS, x: e.x1, y: e.y1, tx: e.x2, ty: e.y2,
        color: stage.color, width: Math.min(10, Math.max(4, stage.radius * 0.5)) });
    } else if (e.type === "energy_impact" && !reduced) {
      const p = this.impacts.find(p => p.until <= time);
      if (!p) return;
      Object.assign(p, { until: time + IMPACT_SECONDS, x: e.x, y: e.y,
        color: e.source === "relay" ? phaserColors.action : phaserColors.friendly,
        shield: e.shieldDamage > 0, width: Math.min(18, 6 + Math.sqrt(e.hpDamage + e.shieldDamage)) });
    }
  }
  counts(time: number): { beams: number; impacts: number } {
    return { beams: this.beams.filter(p => p.until > time).length, impacts: this.impacts.filter(p => p.until > time).length };
  }
  draw(g: Phaser.GameObjects.Graphics, time: number, reduced: boolean, visible: (x: number, y: number) => boolean): void {
    for (const image of this.sprites) image.setVisible(false);
    for (const p of this.beams) {
      if (p.until <= time || (!visible(p.x, p.y) && !visible(p.tx, p.ty))) continue;
      const f = (p.until - time) / BEAM_RELEASE_SECONDS;
      // Released line stays anchored to its actual shot origin, even while moving.
      drawBeam(g, p.x, p.y, p.tx, p.ty, p.width * (0.6 + f * 0.4), p.color);
      if (reduced) continue;
      const dx = p.tx - p.x, dy = p.ty - p.y, d = Math.max(1, Math.hypot(dx, dy));
      g.lineStyle(2, p.color, f);
      for (const side of [-1, 1]) g.lineBetween(p.x - dy / d * 8 * side, p.y + dx / d * 8 * side,
        p.x + dx / d * 18, p.y + dy / d * 18);
      g.fillStyle(phaserColors.text, f); g.fillCircle(p.x, p.y, 3 + f * 3);
    }
    if (reduced) return;
    for (let index=0;index<this.impacts.length;index++) {
      const p=this.impacts[index]!;
      if (p.until <= time || !visible(p.x, p.y)) continue;
      const f = (p.until - time) / IMPACT_SECONDS, travel = 1 - f * f;
      const image=this.sprites[index];
      if(image) image.setPosition(p.x,p.y).setDisplaySize(24+travel*24,24+travel*24)
        .setTint(p.color).setAlpha(f*0.55).setVisible(true);
      g.lineStyle(p.shield ? 3 : 1, p.color, f * 0.8);
      if (p.shield) g.strokeCircle(p.x, p.y, 8 + travel * p.width);
      for (let i = 0; i < COMBAT_FEEDBACK_BUDGET.sparksPerImpact; i++) {
        const a = i * Math.PI * 2 / COMBAT_FEEDBACK_BUDGET.sparksPerImpact + p.x * 0.01;
        const d = 5 + travel * p.width;
        g.lineBetween(p.x + Math.cos(a) * d, p.y + Math.sin(a) * d,
          p.x + Math.cos(a) * (d + 5 * f), p.y + Math.sin(a) * (d + 5 * f));
      }
      if (f > 0.65) { g.fillStyle(phaserColors.text, (f - 0.65) * 2); g.fillCircle(p.x, p.y, 4 * f); }
    }
  }
}
