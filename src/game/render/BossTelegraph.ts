import type Phaser from "phaser";
import type {SimEnemy} from "../../core/sim/RunState";
import {BOSS_ENCOUNTER,bossWarningDuration} from "../../core/combat/bossEncounter";
import {HAZARD_GEOMETRY} from "../../core/combat/hazardGeometry";
import {fillPoly,strokePoly} from './paths';
import {bossCrossOutline} from './bossWarningOutline';
export function drawBossTelegraph(g:Phaser.GameObjects.Graphics,e:SimEnemy):void {
  const a=e.encounter;if(!e.boss||!a)return;
  if(a.phase==="recover"){g.lineStyle(3,0x8de4ff,.8);g.lineBetween(e.x-20,e.y+e.radius+8,e.x+20,e.y+e.radius+8);return;}
  if(a.phase==="phase-transition"){g.lineStyle(5,0xffdfab,1);for(let i=0;i<6;i++){const t=i*Math.PI/3;g.lineBetween(e.x+Math.cos(t)*e.radius,e.y+Math.sin(t)*e.radius,e.x+Math.cos(t)*(e.radius+30),e.y+Math.sin(t)*(e.radius+30));}return;}
  if(!["warning","commit","attack"].includes(a.phase))return;
  const progress=a.phase==="warning"?Math.max(0,Math.min(1,1-a.timer/bossWarningDuration(a.pattern))):1;
  g.lineStyle(3,0xff8878,1);g.fillStyle(0xff665a,.08+.08*progress);
  if(a.pattern==="slam") {
    g.fillCircle(a.aimX,a.aimY,BOSS_ENCOUNTER.slamRadius);
    g.lineStyle(7,0x11151b,1);g.strokeCircle(a.aimX,a.aimY,BOSS_ENCOUNTER.slamRadius);
    g.lineStyle(3,0xff8878,1);g.strokeCircle(a.aimX,a.aimY,BOSS_ENCOUNTER.slamRadius);
    // Fractures build inward; the thin outer edge remains the exact hit radius.
    g.lineStyle(3,0xffdfab,1);
    for(let i=0;i<7;i++){const angle=i*Math.PI*2/7,r=BOSS_ENCOUNTER.slamRadius,x=a.aimX+Math.cos(angle)*r,y=a.aimY+Math.sin(angle)*r;
      const inner=r*(1-.8*progress),mx=a.aimX+Math.cos(angle+.1)*inner,my=a.aimY+Math.sin(angle+.1)*inner;
      g.lineBetween(x,y,mx,my);g.lineBetween(mx,my,mx+Math.cos(angle+.8)*18,my+Math.sin(angle+.8)*18);}
  } else if(a.pattern==="fan") {
    const angle=Math.atan2(a.aimY-e.y,a.aimX-e.x);
    const range=BOSS_ENCOUNTER.shotSpeed*HAZARD_GEOMETRY.projectileLife;
    for(const o of [-.6,-.4,-.2,.2,.4,.6])g.lineBetween(e.x,e.y,e.x+Math.cos(angle+o)*range,e.y+Math.sin(angle+o)*range);
    // Safe central gap also indicated by shape and pale line, not only color.
    g.lineStyle(2,0xe6fff1,.9);g.lineBetween(e.x,e.y,a.aimX,a.aimY);
  } else {
    const angle=Math.atan2(a.aimY-e.y,a.aimX-e.x);
    const outline=bossCrossOutline(a.aimX,a.aimY,angle);
    fillPoly(g,outline,0xff665a,.08+.08*progress);
    strokePoly(g,outline,0x11151b,7);
    strokePoly(g,outline,0xff8878,3);
  }
}
