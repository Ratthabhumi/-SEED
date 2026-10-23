import {describe,it,expect} from "vitest";
import {paintedBossPose,paintedBossGround,BOSS_FOOT_Y} from "../../src/game/render/paintedBossPose";
import {createBossEncounter,bossRecoveryDuration} from "../../src/core/combat/bossEncounter";
import detail from "../../src/game/assets/boss-frame-detail.json";
declare const require:(id:string)=>any;
const {readFileSync}=require("node:fs"),{createHash}=require("node:crypto");
describe('painted boss canonical presentation',()=>{
 it('retains original painted source and recovers real detail in eight256px cells',()=>{
  const sha=(b:Uint8Array)=>createHash('sha256').update(b).digest('hex');
  const original=readFileSync('assets/original/actors/boss-v2.png'),production=readFileSync('assets/seed/actors/boss-v2.png');
  expect(sha(original)).toBe(detail.sourceSha256);expect(sha(production)).toBe(detail.productionSha256);
  expect(production.readUInt32BE(16)).toBe(1024);expect(production.readUInt32BE(20)).toBe(512);
  expect(detail.frames).toHaveLength(8);expect(detail.cell).toBe(256);
 });
 it('plants every existing cell on the same ground contact and eases recovery',()=>{
  for(let frame=0;frame<8;frame++){
   const ground=paintedBossGround(frame,240);
   expect(ground.originY*128).toBe(BOSS_FOOT_Y[frame]);
   expect(ground.offsetY).toBeCloseTo(63.375);
  }
  expect(paintedBossPose(1,false).lift).toBe(0);
  const a={...createBossEncounter(),phase:'recover' as const};
  const start=paintedBossPose(4,false,{...a,timer:bossRecoveryDuration(a.pattern)});
  const settle=paintedBossPose(4,false,{...a,timer:bossRecoveryDuration(a.pattern)-.2});
  expect(start.rotation).toBeGreaterThan(settle.rotation);
  expect(paintedBossPose(4,false,{...a,timer:1}).rotation).toBe(0);
 });
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
