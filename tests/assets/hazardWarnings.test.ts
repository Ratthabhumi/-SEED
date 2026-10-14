import {it,expect} from "vitest";
import {drawEnemyTelegraph} from "../../src/game/render/enemyTelegraph";
import {HAZARD_GEOMETRY} from "../../src/core/combat/hazardGeometry";
it("burst warning covers canonical flight length and player/projectile hit width without generic rings",()=>{
 const lines:number[][]=[];let rings=0;
 const g:any={lineStyle(){},fillStyle(){},fillTriangle(){},lineBetween(...p:number[]){lines.push(p);},strokeCircle(){rings++;}};
 const e:any={x:0,y:0,radius:12,evolution:{id:"burst",phase:"warning",aimX:100,aimY:0}};
 drawEnemyTelegraph(g,e,false);
 const length=HAZARD_GEOMETRY.burstSpeed*HAZARD_GEOMETRY.projectileLife,w=HAZARD_GEOMETRY.burstRadius+HAZARD_GEOMETRY.playerRadius;
 expect(lines).toContainEqual([0,w,length,w]);expect(lines).toContainEqual([0,-w,length,-w]);expect(rings).toBe(0);
});
