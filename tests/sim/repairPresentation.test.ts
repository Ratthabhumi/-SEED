import {it,expect} from "vitest";
import {repairPresentation} from "../../src/game/render/repairPresentation";
import {CLAIM_REACH_RADIUS,type Territory} from "../../src/core/world/territory";
const site=(id="a",x=0):Territory=>({poiId:id,poiType:"ruin",x,y:0,spec:"research",tier:1,hp:0,maxHp:300,disabled:true,garrisoned:false,heldSince:0,repairT:0});
it("uses canonical progress, clamps near completion and shows no stale progress outside range",()=>{const t=site();expect(repairPresentation([t],0,0)?.percent).toBe(0);t.repairT=6.4;expect(repairPresentation([t],0,0)).toMatchObject({percent:64,inRange:true});t.repairT=9.99;expect(repairPresentation([t],0,0)?.percent).toBe(99);expect(repairPresentation([t],CLAIM_REACH_RADIUS+1,0)).toMatchObject({percent:0,inRange:false});t.disabled=false;expect(repairPresentation([t],0,0)).toBeNull();});
it("chooses one nearest visible damaged site without mutating state or advancing on presentation reads",()=>{const a=site(),b=site("b",200);a.repairT=2;const before=JSON.stringify([a,b]);expect(repairPresentation([a,b],190,0)?.site).toBe(b);expect(repairPresentation([a,b],190,0,x=>x===0)?.site).toBe(a);for(let i=0;i<100;i++)repairPresentation([a,b],0,0);expect(JSON.stringify([a,b])).toBe(before);expect(repairPresentation([a,b],0,0,()=>false)).toBeNull();});

import {RunSimulation} from "../../src/core/sim/RunSimulation";
it("actual simulation repairs after ten seconds, resets on exit and emits one restoration",()=>{
 const sim=new RunSimulation({masterSeed:"REPAIR-REAL"});const s=sim.state;s.spawnT=s.eliteT=s.mineT=999;
 const t=site();t.x=s.px;t.y=s.py;s.territories=[t];
 const input={moveX:0,moveY:0,dashPressed:false};
 for(let i=0;i<120;i++)sim.step(1/60,input);expect(t.repairT).toBeCloseTo(2);
 const paused=sim.snapshot();for(let i=0;i<20;i++)repairPresentation(s.territories,s.px,s.py);expect(sim.snapshot()).toBe(paused);
 s.px=t.x+CLAIM_REACH_RADIUS+1;sim.step(1/60,input);expect(t.repairT).toBe(0);s.px=t.x;
 let restores=0;for(let i=0;i<610;i++)restores+=sim.step(1/60,input).filter(e=>e.type==="outpost_repaired").length;
 expect(t.disabled).toBe(false);expect(t.hp).toBe(150);expect(restores).toBe(1);expect(repairPresentation(s.territories,s.px,s.py)).toBeNull();
});
