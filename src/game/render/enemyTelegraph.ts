import type Phaser from 'phaser';
import type {SimEnemy} from '../../core/sim/RunState';
import {phaserColors} from '../../theme/tokens';
/** Functional warning survives Reduced Effects and uses the locked canonical target. */
export function drawEnemyTelegraph(g:Phaser.GameObjects.Graphics,e:SimEnemy,hc:boolean):void {
 const a=e.evolution;if(!a||e.siege||!(a.phase==='warning'||a.phase==='attack'))return;
 g.lineStyle(hc?5:3,phaserColors.hostile,1);g.lineBetween(e.x,e.y,a.aimX,a.aimY);
 g.lineStyle(1,0xffffff,1);g.lineBetween(e.x,e.y,a.aimX,a.aimY);
 g.lineStyle(2,phaserColors.hostile,1);g.strokeCircle(a.aimX,a.aimY,a.id==='rush'?18:24);
 g.strokeCircle(e.x,e.y,e.radius+8);
}
