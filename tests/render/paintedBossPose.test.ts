import {describe,it,expect} from "vitest";
import {paintedBossPose} from "../../src/game/render/paintedBossPose";
import {createBossEncounter,bossRecoveryDuration} from "../../src/core/combat/bossEncounter";
describe('painted boss canonical presentation',()=>{
 it('distinguishes windup, release and the real recovery window',()=>{
  for(const pattern of ['slam','cross','fan'] as const){
   const a={...createBossEncounter(),pattern};
   expect(paintedBossPose(4,false,{...a,phase:'warning',timer:.5}).frame).toBe(3);
   expect(paintedBossPose(4,false,{...a,phase:'attack',timer:.1}).frame).toBe(pattern==='fan'?5:4);
   expect(paintedBossPose(4,false,{...a,phase:'recover',timer:bossRecoveryDuration(pattern)-.5}).frame).toBe(0);
  }
 });
 it('retains historical baseline and shows the authored hit and transition cells',()=>{
  const a={...createBossEncounter(),phase:'recover' as const,timer:.1};
  expect(paintedBossPose(8,false,a,0,false,true).frame).toBe(4);
  expect(paintedBossPose(8,false,a,.1).frame).toBe(6);
  expect(paintedBossPose(8,false,{...a,phase:'phase-transition'}).frame).toBe(3);
 });
 it('has no wall-clock drift and suppresses secondary motion for Reduced Effects',()=>{
  const a={...createBossEncounter(),phase:'warning' as const,timer:.2};
  const p=paintedBossPose(10,true,a);
  paintedBossPose(100,true,a);
  expect(paintedBossPose(10,true,a)).toEqual(p);
  expect(paintedBossPose(10,true,a,0,true)).toMatchObject({lift:0,rotation:0});
 });
});
