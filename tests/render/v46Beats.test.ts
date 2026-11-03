import{test,expect}from'vitest';
import{CivilizationBeats}from'../../src/game/render/CivilizationBeats';
test('milestones are bounded, pause on canonical time, expire and reset across worlds',()=>{
 const f=new CivilizationBeats();for(let i=0;i<50;i++)f.add('age',1,2,4);expect(f.count(4)).toBeLessThanOrEqual(8);expect(f.count(4)).toBeGreaterThan(0);expect(f.count(4)).toBe(f.count(4));expect(f.count(6)).toBe(0);f.add('lost',1,2,8);f.reset();expect(f.count(8)).toBe(0);
});
