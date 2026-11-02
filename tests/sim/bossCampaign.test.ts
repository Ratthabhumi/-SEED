import {describe,it,expect} from 'vitest';
import {RunSimulation} from '../../src/core/sim/RunSimulation';
import {stepBossEncounter,bossWarningDuration,bossFanOffsets} from '../../src/core/combat/bossEncounter';
const idle={moveX:0,moveY:0,dashPressed:false};
function arena(distance=200){
 const sim=new RunSimulation({masterSeed:'V43-BOSS'}),s=sim.state;
 s.spawnT=s.eliteT=s.mineT=999;s.weaponCd={kinetic:999,energy:999,defense:999,field:999};
 s.build.hp=s.build.maxHp=10000;for(const a of s.squad)a.cd=999;
 const boss=sim.spawnEnemy('tank',false,true,0,distance,[])!;
 return {sim,s,boss};
}
describe('V4.3 bounded boss escalation',()=>{
 it('commits a bounded predictive target and adds warned fan lanes with the same central gap',()=>{
  const {boss}=arena();boss.encounter!.enraged=true;boss.encounter!.timer=0;
  stepBossEncounter(boss,0,0,1/60,()=>{},1000,0);
  expect(boss.encounter!.aimX).toBe(72);expect(boss.encounter!.aimY).toBe(0);
  const target=[boss.encounter!.aimX,boss.encounter!.aimY];
  stepBossEncounter(boss,-300,300,1/60,()=>{},-1000,1000);
  expect([boss.encounter!.aimX,boss.encounter!.aimY]).toEqual(target);
  expect(bossFanOffsets(true)).toHaveLength(10);expect(bossFanOffsets()).toHaveLength(6);
  expect(Math.min(...bossFanOffsets(true).map(Math.abs))).toBe(.2);
 });
 it('phase two changes approach movement and warning timing without moving a committed target',()=>{
  const {boss}=arena();boss.encounter!.enraged=true;boss.encounter!.timer=1;
  const y=boss.y;stepBossEncounter(boss,0,0,1/60,()=>{});
  expect(boss.y).not.toBe(y);
  expect(bossWarningDuration('cross',true)).toBeLessThan(bossWarningDuration('cross'));
  expect(bossWarningDuration('cross',true)).toBeGreaterThanOrEqual(.9);
  boss.encounter!.phase='warning';boss.encounter!.aimX=42;boss.encounter!.aimY=17;
  const before=[boss.x,boss.y];stepBossEncounter(boss,300,300,1/60,()=>{});
  expect([boss.encounter!.aimX,boss.encounter!.aimY]).toEqual([42,17]);expect([boss.x,boss.y]).toEqual(before);
 });
 it('announces one real base without creating a phantom raid or immediate damage',()=>{
  const {sim,s,boss}=arena();
  s.territories=[{poiId:'owned',poiType:'ruin',x:100,y:0,spec:'research',tier:1,hp:300,maxHp:300,disabled:false,garrisoned:false,heldSince:0,repairT:0}];
  boss.hp=boss.maxHp*.4;const events=sim.step(1/60,idle);
  expect(s.raid).toBeNull();expect(boss.encounter!.outpostId).toBe('owned');expect(s.territories[0]!.hp).toBe(300);
  expect(events).toContainEqual({type:'boss_outpost_targeted',poiId:'owned'});
  const raid=s.raid;sim.step(1/60,idle);expect(s.raid).toBe(raid);
 });
 it('does not create or replace independent raids',()=>{
  for(const existing of [false,true]){
   const {sim,s,boss}=arena();s.territories=[{poiId:'far',poiType:'ruin',x:1600,y:0,spec:'research',tier:1,hp:300,maxHp:300,disabled:false,garrisoned:false,heldSince:0,repairT:0}];
   if(existing)s.raid={poiId:'far',tMinus:20,landed:false,spawned:0};
   boss.hp=boss.maxHp*.4;const events=sim.step(1/60,idle);
   expect(events.some(e=>e.type==='raid_incoming')).toBe(false);expect(s.raid?.poiId??null).toBe(existing?'far':null);
  }
 });
});
