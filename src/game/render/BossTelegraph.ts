import type Phaser from "phaser";
import type {SimEnemy} from "../../core/sim/RunState";
import {BOSS_ENCOUNTER} from "../../core/combat/bossEncounter";
export function drawBossTelegraph(g:Phaser.GameObjects.Graphics,e:SimEnemy):void {
  const a=e.encounter;if(!e.boss||!a)return;
  if(a.phase==="recover"){g.lineStyle(3,0x8de4ff,.8);g.strokeCircle(e.x,e.y,e.radius+8);return;}
  if(a.phase!=="warning")return;
  const progress=Math.max(0,Math.min(1,1-a.timer/BOSS_ENCOUNTER.warning));
  g.lineStyle(3,0xff8878,1);g.fillStyle(0xff665a,.08+.08*progress);
  if(a.pattern==="slam") {
    g.fillCircle(a.aimX,a.aimY,BOSS_ENCOUNTER.slamRadius);g.strokeCircle(a.aimX,a.aimY,BOSS_ENCOUNTER.slamRadius);
    g.lineStyle(4,0xffdfab,1);g.strokeCircle(a.aimX,a.aimY,BOSS_ENCOUNTER.slamRadius*progress);
  } else if(a.pattern==="fan") {
    const angle=Math.atan2(a.aimY-e.y,a.aimX-e.x);
    for(const o of [-.6,-.4,-.2,.2,.4,.6])g.lineBetween(e.x,e.y,e.x+Math.cos(angle+o)*360,e.y+Math.sin(angle+o)*360);
    // Safe central gap also indicated by shape and pale line, not only color.
    g.lineStyle(2,0xe6fff1,.9);g.lineBetween(e.x,e.y,a.aimX,a.aimY);
  } else {
    const angle=Math.atan2(a.aimY-e.y,a.aimX-e.x);
    for(const offset of [0,Math.PI/2]) {
      const dx=Math.cos(angle+offset),dy=Math.sin(angle+offset),r=BOSS_ENCOUNTER.crossLength,w=BOSS_ENCOUNTER.crossHalfWidth;
      for(const side of [-1,1])g.lineBetween(a.aimX-dx*r-dy*w*side,a.aimY-dy*r+dx*w*side,a.aimX+dx*r-dy*w*side,a.aimY+dy*r+dx*w*side);
    }
  }
}
