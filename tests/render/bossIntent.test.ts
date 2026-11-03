import {expect,test} from 'vitest';
import {createBossEncounter} from '../../src/core/combat/bossEncounter';
import {bossStrikeTargetsBase,bossThreat} from '../../src/game/ui/bossThreat';
import type {RunState} from '../../src/core/sim/RunState';
test('current strike remains base-directed through attack/recovery after the canonical cycle increments',()=>{
 const a=createBossEncounter();a.outpostId='real-base';a.assaultLeft=12;
 for(const phase of ['approach','warning','commit','attack','recover'] as const){a.phase=phase;a.cycle=phase==='attack'||phase==='recover'?1:0;expect(bossStrikeTargetsBase(a)).toBe(true);}
 a.phase='warning';a.cycle=1;expect(bossStrikeTargetsBase(a)).toBe(false);
 a.phase='attack';a.cycle=2;expect(bossStrikeTargetsBase(a)).toBe(false);
 a.outpostId='';expect(bossStrikeTargetsBase(a)).toBe(false);
 a.outpostId='real-base';a.assaultLeft=0;a.phase='commit';a.cycle=0;expect(bossStrikeTargetsBase(a)).toBe(true);
});
test('map keeps the actual target through an expired committed assault, removes disabled or cleared targets',()=>{
 const encounter=createBossEncounter();encounter.outpostId='base';encounter.phase='commit';encounter.assaultLeft=0;
 const target={poiId:'base',disabled:false};
 const s={enemies:[{active:true,boss:true,encounter}],territories:[target]} as RunState;
 expect(bossThreat(s)?.target).toBe(target);
 target.disabled=true;expect(bossThreat(s)).toBeUndefined();
 target.disabled=false;encounter.outpostId='';expect(bossThreat(s)).toBeUndefined();
});
