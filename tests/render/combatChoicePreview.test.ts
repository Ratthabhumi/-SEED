import {equipWeapon} from '../helpers/equipWeapon';
import {it,expect} from 'vitest';
import {RunSimulation} from '../../src/core/sim/RunSimulation';
import {combatChoicePreview} from '../../src/game/ui/combatChoicePreview';
it('shows actual active volley totals rather than bonus counters, without mutating build',()=>{
 const s=new RunSimulation({masterSeed:'CHOICE',originId:'hunters'}).state;
 const before=JSON.stringify(s.build);
 expect(combatChoicePreview(s,[{kind:'projectileAdd',value:2}])).toContainEqual({family:'kinetic',kind:'volley',before:1,after:3});
 expect(JSON.stringify(s.build)).toBe(before);
 s.weaponStage.kinetic=5;expect(combatChoicePreview(s,[{kind:'projectileAdd',value:2}])).toEqual([]);
});
it('shows new chain and mine behavior only for active weapon families',()=>{
 const sim=new RunSimulation({masterSeed:'CHOICE',originId:'resonant'});equipWeapon(sim,'field');const s=sim.state;
 expect(combatChoicePreview(s,[{kind:'chainAdd',value:1},{kind:'mineAdd',value:2}])).toEqual([
 {family:'energy',kind:'chain',before:0,after:1},{family:'field',kind:'mines',before:1,after:3}]);
});
it('reports executed whole counts for quality-scaled effects and respects guardian saturation',()=>{
 const sim=new RunSimulation({masterSeed:'CHOICE',originId:'hunters'});equipWeapon(sim,'field');equipWeapon(sim,'defense');const s=sim.state;
 expect(combatChoicePreview(s,[{kind:'projectileAdd',value:1.25},{kind:'mineAdd',value:1.5}])).toEqual([
  {family:'kinetic',kind:'volley',before:1,after:3},{family:'field',kind:'mines',before:1,after:3}]);
 s.originId='engineers';s.weaponStage.defense=4;s.build.bonusGuardians=3;
 expect(combatChoicePreview(s,[{kind:'summonAdd',value:1.5}])).toEqual([]);
});
