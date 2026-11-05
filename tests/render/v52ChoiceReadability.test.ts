import {it,expect} from 'vitest';
import {RunSimulation} from '../../src/core/sim/RunSimulation';
import {combatChoicePreview} from '../../src/game/ui/combatChoicePreview';
import {effectBeforeAfter} from '../../src/game/ui/techEffects';
import {drawMine} from '../../src/game/render/ProjectileRenderer';
it('shows actual base hit and minimum-clamped attack interval for an active projectile',()=>{
 const s=new RunSimulation({masterSeed:'CHOICE',originId:'hunters'}).state;
 expect(combatChoicePreview(s,[{kind:'damageMul',value:.12}])).toContainEqual({family:'kinetic',kind:'hitDamage',before:12,after:13.440000000000001});
 expect(combatChoicePreview(s,[{kind:'cooldownMul',value:-.1}])).toContainEqual({family:'kinetic',kind:'attackInterval',before:.9,after:.81});
 s.build.cooldownMul=.3;expect(combatChoicePreview(s,[{kind:'cooldownMul',value:-.1}])).toEqual([]);
});
it('never promises faster mines or aura from projectile cooldown reduction',()=>{
 const s=new RunSimulation({masterSeed:'CHOICE',originId:'resonant'}).state;s.weaponStage.energy=2;
 expect(combatChoicePreview(s,[{kind:'cooldownMul',value:-.1}])).toEqual([]);
});
function mineDraw(time:number){const calls:any[]=[];const g:any=new Proxy({}, {get:(_,name)=>(...args:any[])=>{calls.push([name,...args]);return g;}});
 drawMine(g,{x:10,y:20,radius:60} as any,{time,highContrast:true,reducedEffects:true,origin:'hunters'});return calls;}
it('high contrast reduced mines keep static white range and device outlines at actual canonical geometry',()=>{
 expect(mineDraw(0)).toEqual(mineDraw(.4));
 const calls=mineDraw(0);expect(calls).toContainEqual(['strokeCircle',10,20,60]);
 expect(calls.filter(c=>c[0]==='lineStyle').every(c=>c[2]===0xffffff)).toBe(true);
});

it('labels multipliers and bonus counters accurately and shows the actual cooldown floor',()=>{
 const s=new RunSimulation({masterSeed:'CHOICE',originId:'hunters'}).state;
 expect(effectBeforeAfter(s.build,[{kind:'damageMul',value:.12}])).toBe('Damage multiplier: ×1 → ×1.12');
 expect(effectBeforeAfter(s.build,[{kind:'projectileAdd',value:1}])).toBe('Bonus projectiles: 0 → 1');
 s.build.cooldownMul=.3;expect(effectBeforeAfter(s.build,[{kind:'cooldownMul',value:-.1}])).toBe('Cooldown multiplier: ×0.3 → ×0.3');
});
