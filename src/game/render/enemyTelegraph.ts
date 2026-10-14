import type Phaser from 'phaser';
import type {SimEnemy} from '../../core/sim/RunState';
import {phaserColors} from '../../theme/tokens';
import {HAZARD_GEOMETRY} from '../../core/combat/hazardGeometry';
/** Functional warning survives Reduced Effects and uses the locked canonical target. */
export function drawEnemyTelegraph(g:Phaser.GameObjects.Graphics,e:SimEnemy,hc:boolean):void {
 const a=e.evolution;if(!a||e.siege||!(a.phase==='warning'||a.phase==='attack'))return;
 const heading=Math.atan2(a.aimY-e.y,a.aimX-e.x),dx=Math.cos(heading),dy=Math.sin(heading);
 const length=a.id==='rush'?Math.hypot(a.aimX-e.x,a.aimY-e.y):HAZARD_GEOMETRY.burstSpeed*HAZARD_GEOMETRY.projectileLife,width=a.id==='rush'?e.radius+HAZARD_GEOMETRY.playerRadius:HAZARD_GEOMETRY.burstRadius+HAZARD_GEOMETRY.playerRadius;
 const endX=e.x+dx*length,endY=e.y+dy*length;
 g.fillStyle(phaserColors.hostile,hc?.25:.13);
 g.fillTriangle(e.x-dy*width,e.y+dx*width,e.x+dy*width,e.y-dx*width,endX-dy*width,endY+dx*width);
 g.fillTriangle(e.x+dy*width,e.y-dx*width,endX+dy*width,endY-dx*width,endX-dy*width,endY+dx*width);
 g.lineStyle(hc?4:2,phaserColors.hostile,1);
 for(const side of [-1,1])g.lineBetween(e.x-dy*width*side,e.y+dx*width*side,endX-dy*width*side,endY+dx*width*side);
 // Directional teeth and charged muzzle replace the old generic yellow rings.
 g.lineStyle(3,0xffe7c5,1);
 for(let d=24;d<length;d+=48){const x=e.x+dx*d,y=e.y+dy*d;g.lineBetween(x-dx*8-dy*6,y-dy*8+dx*6,x,y);g.lineBetween(x-dx*8+dy*6,y-dy*8-dx*6,x,y);}
 if(a.id==='burst'){g.fillStyle(phaserColors.hostile,1);g.fillTriangle(e.x+dx*24,e.y+dy*24,e.x-dy*7,e.y+dx*7,e.x+dy*7,e.y-dx*7);}
}

/** Committed attacks face their real locked target, even after the player sidesteps. */
export function enemyDisplayHeading(e:SimEnemy,px:number,py:number):number {const a=e.evolution;return a&&(a.phase==='warning'||a.phase==='attack')?Math.atan2(a.aimY-e.y,a.aimX-e.x):Math.atan2(py-e.y,px-e.x);}
export function enemyDisplayMoving(e:SimEnemy):boolean {const a=e.evolution;return !a||a.phase==='ready'||(a.id==='rush'&&a.phase==='attack');}
