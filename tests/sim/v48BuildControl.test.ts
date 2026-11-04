import {it,expect} from 'vitest';
import {RunSimulation} from '../../src/core/sim/RunSimulation';
import {applyTechEffect} from '../../src/core/sim/progression';
import {angleDelta} from '../../src/core/combat/weaponGeometry';
const idle={moveX:0,moveY:0,dashPressed:false};
function arena(origin='hunters'){
 const sim=new RunSimulation({masterSeed:'V48-CONTROL',originId:origin}),s=sim.state;
 s.spawnT=s.eliteT=s.mineT=999;for(const a of s.squad)a.active=false;
 return {sim,s};
}
it('Kinetic upgrade keeps its aimed primary ray and adds distinct flank coverage',()=>{
 const {sim,s}=arena();applyTechEffect(s.build,{kind:'projectileAdd',value:1.25});
 const enemy=sim.spawnEnemy('tank',false,false,0,350,[])!;enemy.hp=enemy.maxHp=100000;enemy.speed=enemy.dmg=0;
 let shots:ReturnType<typeof sim.step>=[];
 for(let i=0;i<120;i++){shots=sim.step(1/60,idle).filter(e=>e.type==='weapon_fired'&&e.family==='kinetic'&&e.release);if(shots.length)break;}
 expect(shots).toHaveLength(3);
 const offsets=shots.map(e=>e.type==='weapon_fired'?angleDelta(e.release!.heading,e.release!.pose.heading):999);
 expect(offsets[0]).toBeCloseTo(0,9);expect(offsets[1]).toBeCloseTo(-.12,9);expect(offsets[2]).toBeCloseTo(.12,9);
});
it('Conduction changes positioning: actual energy hits hold cluster position while base energy still pushes',()=>{
 const distances=[];
 for(const chain of [false,true]){
  const {sim,s}=arena('resonant');if(chain)applyTechEffect(s.build,{kind:'chainAdd',value:1});
  const enemy=sim.spawnEnemy('tank',false,false,0,200,[])!;enemy.hp=enemy.maxHp=100000;enemy.speed=enemy.dmg=0;
  for(let i=0;i<180;i++){
   const x=enemy.x,y=enemy.y,events=sim.step(1/60,idle);
   if(events.some(e=>e.type==='energy_impact'&&e.source==='energy')){distances.push(Math.hypot(enemy.x-x,enemy.y-y));break;}
  }
 }
 expect(distances).toHaveLength(2);expect(distances[0]).toBeCloseTo(14,8);expect(distances[1]).toBeCloseTo(0,8);
});
it('Field upgrade lays a wider rear trail for every movement direction, without changing RNG consumption',()=>{
 for(const [moveX,moveY] of [[1,0],[-1,0],[0,1],[0,-1]]){
  const {sim,s}=arena(),control=arena();s.mineT=control.s.mineT=0;
  applyTechEffect(s.build,{kind:'mineAdd',value:2});applyTechEffect(control.s.build,{kind:'mineAdd',value:2});
  sim.step(1/60,{...idle,moveX,moveY});control.sim.step(1/60,idle);
  const mines=s.mines.filter(m=>m.active);expect(mines).toHaveLength(3);
  for(const mine of mines)expect((mine.x-s.px)*moveX+(mine.y-s.py)*moveY).toBeLessThan(-50);
  const lateral=mines.map(m=>(m.x-s.px)*-moveY+(m.y-s.py)*moveX);
  expect(Math.max(...lateral)-Math.min(...lateral)).toBeGreaterThan(80);
  expect(JSON.parse(sim.snapshot()).rng).toEqual(JSON.parse(control.sim.snapshot()).rng);
 }
});
it('changed build control replays the same movement and upgrades exactly',()=>{
 const a=arena(),b=arena();for(const item of [a,b]){item.s.mineT=0;applyTechEffect(item.s.build,{kind:'mineAdd',value:2});}
 for(let tick=0;tick<180;tick++){const input={...idle,moveX:tick<90?1:0,moveY:tick<90?0:1};a.sim.step(1/60,input);b.sim.step(1/60,input);}
 expect(a.sim.snapshot()).toBe(b.sim.snapshot());
});
