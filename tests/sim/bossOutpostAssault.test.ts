import {it,expect} from 'vitest';
import {RunSimulation} from '../../src/core/sim/RunSimulation';
import {createBossEncounter} from '../../src/core/combat/bossEncounter';
const idle={moveX:0,moveY:0,dashPressed:false};
function arena(){const sim=new RunSimulation({masterSeed:'V43-DIRECT-DEFENSE'}),s=sim.state;s.spawnT=s.eliteT=s.mineT=999;s.build.hp=s.build.maxHp=10000;s.weaponCd={kinetic:999,energy:999,defense:999,field:999};for(const a of s.squad)a.cd=999;
 const boss=sim.spawnEnemy('tank',false,true,0,200,[])!;s.territories=[{poiId:'base',poiType:'ruin',x:900,y:0,spec:'research',tier:1,hp:300,maxHp:300,disabled:false,garrisoned:false,heldSince:0,repairT:0}];return {sim,s,boss};}
it('announces a real distant base and physically approaches it instead of remotely damaging it',()=>{
 const {sim,s,boss}=arena();boss.hp=boss.maxHp*.4;const events=sim.step(1/60,idle);
 expect(events).toContainEqual({type:'boss_outpost_targeted',poiId:'base'});expect((boss.encounter as any).outpostId).toBe('base');expect(s.raid).toBeNull();
 const x=boss.x;for(let i=0;i<90;i++)sim.step(1/60,idle);
 expect(boss.x).toBeGreaterThan(x);expect(s.territories[0]!.hp).toBe(300);
});
it('only committed in-range geometry damages the existing base HP and records accepted damage',()=>{
 const {sim,s,boss}=arena();const post=s.territories[0]!;post.x=100;
 boss.encounter={...createBossEncounter(),enraged:true,phase:'commit',timer:0,aimX:100,aimY:0,...{outpostId:'base',assaultLeft:12}};
 const events=sim.step(1/60,idle);expect(post.hp).toBe(300-boss.dmg);
 expect(events).toContainEqual({type:'boss_outpost_hit',poiId:'base',damage:boss.dmg});
 post.x=1600;boss.encounter.phase='commit';boss.encounter.timer=0;boss.encounter.aimX=1600;
 sim.step(1/60,idle);expect(post.hp).toBe(300-boss.dmg);
});
it('coordinates with an existing raid and includes target identity in the canonical snapshot',()=>{
 const {sim,s,boss}=arena();s.raid={poiId:'base',tMinus:20,landed:false,spawned:0};const raid=s.raid;
 boss.hp=boss.maxHp*.4;sim.step(1/60,idle);expect(s.raid).toBe(raid);expect((boss.encounter as any).outpostId).toBe('base');
 const hash=sim.hash();(boss.encounter as any).outpostId='another';expect(sim.hash()).not.toBe(hash);
});
it('uses the existing outpost loss path and reports only remaining HP as accepted damage',()=>{
 const {sim,s,boss}=arena();const post=s.territories[0]!;post.x=100;post.hp=1;
 boss.encounter={...createBossEncounter(),enraged:true,outpostId:'base',assaultLeft:12,phase:'commit',timer:0,aimX:100};
 const events=sim.step(1/60,idle);expect(post.hp).toBe(0);expect(post.disabled).toBe(true);
 expect(events).toContainEqual({type:'boss_outpost_hit',poiId:'base',damage:1});
 expect(events).toContainEqual({type:'outpost_lost',poiId:'base'});
});
