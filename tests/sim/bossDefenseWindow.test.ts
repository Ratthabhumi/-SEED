import {it,expect} from 'vitest';
import {RunSimulation} from '../../src/core/sim/RunSimulation';
import {createBossEncounter} from '../../src/core/combat/bossEncounter';
function arena(x:number){const sim=new RunSimulation({masterSeed:'DEFENSE-WINDOW'}),s=sim.state;s.spawnT=s.eliteT=s.mineT=999;s.build.hp=s.build.maxHp=10000;s.weaponCd={kinetic:999,energy:999,defense:999,field:999};for(const a of s.squad)a.cd=999;
 const b=sim.spawnEnemy('tank',false,true,0,200,[])!;b.hp=b.maxHp*.4;
 s.territories=[{poiId:'base',poiType:'ruin',x,y:0,spec:'research',tier:1,hp:300,maxHp:300,disabled:false,garrisoned:false,heldSince:0,repairT:0}];return {sim,s,b};}
const idle={moveX:0,moveY:0,dashPressed:false};
it('does not start an expedition toward a distant outpost',()=>{const {sim,b}=arena(4000);const ev=sim.step(1/60,idle);expect(ev.some(e=>e.type==='boss_outpost_targeted')).toBe(false);expect(b.encounter!.outpostId).toBe('');});
it('bounds assault time and returns to player engagement without teleporting',()=>{
 const {sim,b}=arena(900);sim.step(1/60,idle);expect(b.encounter!.outpostId).toBe('base');
 const before=sim.hash();b.encounter!.assaultLeft=.01;expect(sim.hash()).not.toBe(before);
 b.encounter!.phase='approach';const x=b.x;sim.step(1/60,idle);
 expect(b.encounter!.outpostId).toBe('');expect(b.encounter!.defenseCd).toBeGreaterThan(20);expect(Math.abs(b.x-x)).toBeLessThan(5);
});
it('never expires a committed target before its warned strike and recovery finish',()=>{
 const {sim,b}=arena(100);b.encounter={...createBossEncounter(),enraged:true,outpostId:'base',assaultLeft:.001,phase:'commit',timer:.1,aimX:100};
 sim.step(1/60,idle);expect(b.encounter.outpostId).toBe('base');expect(b.encounter.phase).toBe('commit');
});
it('returns to engagement after a target is lost instead of chaining fresh assaults',()=>{
 const {sim,s,b}=arena(900);sim.step(1/60,idle);s.territories[0]!.disabled=true;b.encounter!.phase='approach';sim.step(1/60,idle);
 expect(b.encounter!.outpostId).toBe('');expect(b.encounter!.defenseCd).toBeGreaterThan(20);
});
