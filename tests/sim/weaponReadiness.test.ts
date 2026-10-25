import {it,expect} from 'vitest';
import {RunSimulation} from '../../src/core/sim/RunSimulation';
import {advanceWeaponRig,aimFromPivot,angleDelta,createWeaponRig} from '../../src/core/combat/weaponGeometry';
import {combatDiagnostics} from '../../scripts/combatDiagnostics';
const idle={moveX:0,moveY:0,dashPressed:false};
function arena(origin:string,mount:'float'|'hand',tier:number){
 const sim=new RunSimulation({masterSeed:'READINESS-REGRESSION',originId:origin,weaponMount:mount}),s=sim.state;
 s.spawnT=s.eliteT=s.mineT=999;s.weaponStage.kinetic=s.weaponStage.energy=tier;
 for(const a of s.squad)a.active=false;
 const enemy=sim.spawnEnemy('tank',false,false,0,300,[])!;enemy.hp=enemy.maxHp=100000;enemy.speed=enemy.dmg=0;
 return {sim,s,enemy};
}
it('retracts an unreachable hand/float muzzle and actually damages adjacent targets for every origin',()=>{
 for(const origin of ['hunters','engineers','resonant','sentinels'])for(const mount of ['hand','float'] as const)for(const tier of [0,4,5]){
  const {sim,s,enemy}=arena(origin,mount,tier);enemy.x=s.px;enemy.y=s.py;let released=false;
  for(let t=0;t<180;t++)for(const e of sim.step(1/60,idle))if((e.type==='weapon_fired'||e.type==='beam_fired')&&e.release){
   released=true;const x=e.type==='weapon_fired'?e.x:e.x1,y=e.type==='weapon_fired'?e.y:e.y1;
   expect(x).toBe(e.release.pose.muzzleX);expect(y).toBe(e.release.pose.muzzleY);
  }
  expect(released,`${origin} ${mount}@${tier}`).toBe(true);expect(enemy.hp).toBeLessThan(enemy.maxHp);
  expect(s.damageBySource[origin==='hunters'||origin==='engineers'?'kinetic':'energy']??0).toBeGreaterThan(0);
 }
});
it('solves the final translated anchor without raising the turn-rate cap or snapping through a reversal',()=>{
 for(const origin of ['hunters','engineers','resonant','sentinels']){
  const r=createWeaponRig();for(let t=0;t<360;t++){
   const before=r.heading,tx=Math.cos(t/20)*150,ty=Math.sin(t/20)*150;
   advanceWeaponRig(origin,4,0,0,r,tx,ty,1/60);
   expect(Math.abs(angleDelta(r.heading,before))).toBeLessThanOrEqual(14/60+1e-9);
   expect([r.x,r.y,r.heading].every(Number.isFinite)).toBe(true);
  }
 }
});
it('does not discard a ready shot after moving a previously aligned mount',()=>{
 const {sim,s,enemy}=arena('hunters','float',0);enemy.x=s.px+100;enemy.y=s.py-80;
 s.weaponRig.heading=aimFromPivot('hunters',0,s.px,s.py,s.weaponRig,enemy.x,enemy.y).heading;
 expect(sim.step(1/60,idle).some(e=>e.type==='weapon_fired'&&e.release)).toBe(true);
});
it('offline diagnostics observe the same inputs without changing canonical state or RNG',()=>{
 const a=arena('engineers','float',4),b=arena('engineers','float',4),read=combatDiagnostics(a.sim);
 for(let t=0;t<360;t++){const input={...idle,moveX:Math.floor(t/30)%2?1:-1};a.sim.step(1/60,input);b.sim.step(1/60,input);expect(a.sim.hash()).toBe(b.sim.hash());}
 expect(read().counts.volleys).toBeGreaterThan(0);
});
