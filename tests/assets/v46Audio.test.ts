import{test,expect}from'vitest';
import{impactCue,ImpactSoundGate}from'../../src/game/audio/impactCue';
test('audio confirms actual damage only and coalesces crowds, prioritizing shield contact',()=>{
 expect(impactCue([{type:'energy_impact',x:0,y:0,hpDamage:0,shieldDamage:0,source:'energy'}])).toBeUndefined();
 const events:any[]=[{type:'weapon_impact',family:'kinetic',hpDamage:100,shieldDamage:0},{type:'energy_impact',hpDamage:0,shieldDamage:5,source:'energy'}];
 expect(impactCue(events)).toEqual({family:'energy',shield:true,damage:5});
});
test('impact channel has a bounded75ms cadence and ignores invalid time',()=>{const g=new ImpactSoundGate();expect(g.allow(1)).toBe(true);for(let i=0;i<100;i++)expect(g.allow(1.01)).toBe(false);expect(g.allow(1.08)).toBe(true);expect(g.allow(NaN)).toBe(false);});
