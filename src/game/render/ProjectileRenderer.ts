// Weapon / projectile / pickup rendering — presentation only.
// Strict channels: player-side = round + light core; hostile = angular + dark
// outline. Knowledge is an open codex; mines are ground devices.
import type Phaser from "phaser";
import type { SimProj, SimPickup, SimMine } from "../../core/sim/RunState";
import {projectileIdentity,projectileRole} from "./ageVisualIdentity";
import { VL } from "./VisualLanguage";
import { fillPoly, strokePoly } from "./paths";
import { drawKnowledgeCodex } from "./knowledgeIdentity";
import {combatPresentation} from "./combatPresentation";
import {hostileGlyph} from "./hostileGlyph";

export interface WeaponDrawOpts {
  time: number;
  highContrast: boolean;
  reducedEffects?:boolean;
  origin?:string;
}

/** Source and spawn-tier presentation; canonical coordinates/collision stay untouched. */
export function drawFriendlyProj(g:Phaser.GameObjects.Graphics,p:SimProj,opts?:WeaponDrawOpts):void {
 const identity=projectileIdentity(p),role=projectileRole(p);
 const speed=Math.max(1,Math.hypot(p.vx,p.vy)),nx=p.vx/speed,ny=p.vy/speed,px=-ny,py=nx,r=p.radius;
 const trail=opts?.reducedEffects?0:Math.min(24,identity.trail);
 if(trail>0){g.lineStyle(2,p.color,0.5);g.lineBetween(p.x-nx*trail,p.y-ny*trail,p.x,p.y);}
 if(role==='energy'){
  const art=combatPresentation(opts?.origin??'resonant','energy',p.visualTier??0);
  g.lineStyle(2,art.color,1);
  if(art.shape==='fork'){
    g.lineBetween(p.x-nx*r*2,p.y-ny*r*2,p.x+px*r,p.y+py*r);g.lineBetween(p.x+px*r,p.y+py*r,p.x+nx*r*2,p.y+ny*r*2);
    g.lineBetween(p.x,p.y,p.x-px*r-nx*r,p.y-py*r-ny*r);
  }else{
    fillPoly(g,[[p.x+nx*r*2,p.y+ny*r*2],[p.x+px*r,p.y+py*r],[p.x-nx*r,p.y-ny*r],[p.x-px*r,p.y-py*r]],art.color,1);
  }
  g.lineStyle(2,VL.friendlyCore,1);g.lineBetween(p.x-nx*r,p.y-ny*r,p.x+nx*r,p.y+ny*r);
 }else if(identity.form==='shard'){
  fillPoly(g,[[p.x+nx*r,p.y+ny*r],[p.x+px*r,p.y+py*r],[p.x-nx*r,p.y-ny*r],[p.x-px*r*0.5,p.y-py*r*0.5]],p.color,1);
  g.lineStyle(2,VL.friendlyCore,1);g.lineBetween(p.x,p.y,p.x+nx*r,p.y+ny*r);
 }else{
  const length=identity.form==='tracer'?r*2.5:identity.form==='bullet'?r*1.6:r*1.2;
  g.lineStyle(Math.max(3,r),p.color,1);g.lineBetween(p.x-nx*length,p.y-ny*length,p.x+nx*r,p.y+ny*r);
  g.lineStyle(2,VL.friendlyCore,1);g.lineBetween(p.x,p.y,p.x+nx*r,p.y+ny*r);
  if(identity.form==='arrow'||identity.form==='bolt'){g.lineBetween(p.x-nx*r+px*r,p.y-ny*r+py*r,p.x+nx*r,p.y+ny*r);g.lineBetween(p.x-nx*r-px*r,p.y-ny*r-py*r,p.x+nx*r,p.y+ny*r);}
 }
 if(role==='defense'||role==='squad'){g.lineStyle(1,VL.summon,1);g.strokeCircle(p.x,p.y,r+2);}
}

/** Hostile projectile: aggressive arrowhead/spike along velocity.
 *  Never a diamond, never a pickup — reads as threat even in grayscale. */
export function drawHostileProj(g: Phaser.GameObjects.Graphics, p: SimProj, opts: WeaponDrawOpts): void {
  const speed = Math.hypot(p.vx, p.vy) || 1;
  const dx = p.vx / speed;
  const dy = p.vy / speed;
  const px = -dy;
  const py = dx;
  const r = p.radius * 1.25;
  const pts:Array<[number,number]>=hostileGlyph(p.src).map(([x,y])=>[p.x+(dx*x+px*y)*r,p.y+(dy*x+py*y)*r]);
  fillPoly(g, pts, p.color, 1);
  strokePoly(g, pts, VL.hostileOutline, opts.highContrast ? 3 : 2, 1);
  // Hot tip spark — directional emphasis no pickup ever has.
  g.fillStyle(0xffffff, 0.9);
  g.fillCircle(p.x + dx * r * 1.1, p.y + dy * r * 1.1, Math.max(1.5, r * 0.28));
}

/** Beam: origin → target bar with a bright core. */
export function drawBeam(
  g: Phaser.GameObjects.Graphics, x1: number, y1: number, x2: number, y2: number, width: number, color: number,
): void {
  g.lineStyle(Math.max(3, width), color, 0.85);
  g.lineBetween(x1, y1, x2, y2);
  g.lineStyle(Math.max(2, width * 0.4), 0xffffff, 0.95);
  g.lineBetween(x1, y1, x2, y2);
}

/** Aura: thin translucent edge — area readability without opaque noise. */
export function drawAura(g: Phaser.GameObjects.Graphics, x: number, y: number, radius: number, color: number): void {
  g.fillStyle(color, 0.05);
  g.fillCircle(x, y, radius);
  g.lineStyle(2, color, 0.45);
  g.strokeCircle(x, y, radius);
}

/** Orbit blades with a visible tether to the player. */
export function drawOrbit(
  g: Phaser.GameObjects.Graphics, px: number, py: number, radius: number,
  blades: number, angle: number, color: number, bladeR: number,
): void {
  for (let i = 0; i < blades; i++) {
    const a = angle + (i * Math.PI * 2) / Math.max(1, blades);
    const bx = px + Math.cos(a) * radius;
    const by = py + Math.sin(a) * radius;
    g.lineStyle(1, color, 0.4);
    g.lineBetween(px, py, bx, by);
    g.fillStyle(color, 1);
    g.fillCircle(bx, by, bladeR);
    g.lineStyle(1, VL.friendlyCore, 0.9);
    g.strokeCircle(bx, by, bladeR);
  }
}

/** Allied summon: round body, cyan outline, tether to the player. */
export function drawSummon(
  g: Phaser.GameObjects.Graphics, x: number, y: number, r: number, color: number, px: number, py: number,
): void {
  g.lineStyle(1, VL.summon, 0.35);
  g.lineBetween(px, py, x, y);
  g.fillStyle(color, 1);
  g.fillCircle(x, y, r);
  g.lineStyle(2, VL.summon, 1);
  g.strokeCircle(x, y, r);
}

/** Mine: recognizable ground device — base plate + blinking core. */
export function drawMine(g: Phaser.GameObjects.Graphics, m: SimMine, opts: WeaponDrawOpts): void {
  const art=combatPresentation(opts.origin??"hunters","field",0);
  const blink = 0.55 + 0.45 * Math.sin(opts.time * 5 + m.x * 0.01 + m.y * 0.01);
  g.fillStyle(0x2a2416, 1);
  g.fillRect(m.x - 7, m.y - 7, 14, 14);
  g.lineStyle(2, art.color, 1);
  g.strokeRect(m.x - 7, m.y - 7, 14, 14);
  g.fillStyle(art.color, blink);
  if(opts.origin==="resonant"){g.fillTriangle(m.x,m.y-6,m.x-6,m.y+5,m.x+6,m.y+5);}
  else {for(const side of [-1,1]){g.lineStyle(3,art.material,1);g.lineBetween(m.x+side*11,m.y-9,m.x+side*8,m.y+9);}}
  g.lineStyle(1, 0xc9b458, 0.22);
  g.strokeCircle(m.x, m.y, m.radius);
}

/** Knowledge: an open codex, matching the HUD icon. Cosmetic bob never moves the pickup. */
export function drawKnowledge(g: Phaser.GameObjects.Graphics, k: SimPickup, time=0, reduced=false): void {
  const r = 12 + Math.min(4, k.value * 0.25);
  const y=k.y+(reduced?0:Math.sin(time*3+k.x*.01)*2);
  drawKnowledgeCodex(g,k.x,y,r);
}
