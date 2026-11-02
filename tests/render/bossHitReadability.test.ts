import {it,expect} from 'vitest';
import {paintedBossPose} from '../../src/game/render/paintedBossPose';
import {createBossEncounter} from '../../src/core/combat/bossEncounter';
it('sustained incoming hits cannot replace a committed painted warning or attack pose',()=>{
 const a=createBossEncounter();a.phase='warning';a.timer=.7;
 expect(paintedBossPose(1,false,a,.15).frame).toBe(3);
 a.phase='attack';expect(paintedBossPose(1,false,a,.15).frame).toBe(4);
});
it('hit feedback does not shake a stationary painted body continuously',()=>{
 const a=createBossEncounter();a.phase='recover';a.timer=.8;
 expect(paintedBossPose(1,false,a,.15).rotation).toBe(paintedBossPose(1,false,a,0).rotation);
});
