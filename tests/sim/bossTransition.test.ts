import {describe,it,expect} from "vitest";
import {RunSimulation} from "../../src/core/sim/RunSimulation";
import {createBossEncounter,stepBossEncounter} from "../../src/core/combat/bossEncounter";
function boss(){const sim=new RunSimulation({masterSeed:"BOSS-TRANSITION-16"});return sim.spawnEnemy("tank",false,true,0,250,[])!;}
describe("boss safe-boundary phase transition",()=>{
 for(const phase of ["approach","warning","recover"] as const)it(`responds to half HP in ${phase} without waiting for approach`,()=>{
  const e=boss();e.encounter={...createBossEncounter(),phase,timer:2};e.hp=e.maxHp*.49;
  stepBossEncounter(e,0,0,1/60,()=>{throw Error("uncommitted attack fired");});
  expect(e.encounter.phase).toBe("phase-transition");expect(e.encounter.enraged).toBe(true);expect(e.hp).toBe(e.maxHp*.49);
 });
 it("finishes one committed attack, then escalates with a warned cross",()=>{
  const e=boss(),fired:string[]=[];e.hp=e.maxHp*.49;e.encounter={...createBossEncounter(),phase:"commit",timer:0};
  for(let i=0;i<240;i++)stepBossEncounter(e,0,0,1/60,p=>fired.push(p));
  expect(fired.slice(0,2)).toEqual(["slam","cross"]);expect(e.encounter.enraged).toBe(true);
 });
 it("does not rescue lethal damage or change healthy warning targets",()=>{
  const e=boss();e.encounter={...createBossEncounter(),phase:"warning",timer:1,aimX:42};
  stepBossEncounter(e,0,0,1/60,()=>{});expect(e.encounter.aimX).toBe(42);expect(e.encounter.enraged).toBe(false);
  e.hp=0;stepBossEncounter(e,0,0,1/60,()=>{});expect(e.hp).toBe(0);expect(e.encounter.enraged).toBe(false);
 });
});
