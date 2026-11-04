import {it,expect} from 'vitest';
import {RunSimulation} from '../../src/core/sim/RunSimulation';
it('Industrial energy releases its authored two projectile volley with distinct owned emitters',()=>{
 const sim=new RunSimulation({masterSeed:'V47-ENERGY-VOLLEY',originId:'resonant'}),s=sim.state;
 s.weaponStage.energy=3;s.spawnT=s.eliteT=s.mineT=999;
 for(const a of s.squad)a.active=false;
 const e=sim.spawnEnemy('tank',false,false,0,300,[])!;e.hp=e.maxHp=10000;e.speed=0;
 let shots:ReturnType<typeof sim.step>=[];
 for(let i=0;i<120;i++){shots=sim.step(1/60,{moveX:0,moveY:0,dashPressed:false}).filter(e=>e.type==='weapon_fired'&&e.family==='energy'&&e.release);if(shots.length)break;}
 expect(shots).toHaveLength(2);
 const releases=shots.map(e=>e.type==='weapon_fired'?e.release!:null!);
 expect(releases.map(r=>r.index)).toEqual([0,1]);expect(new Set(releases.map(r=>r.projectileIndex)).size).toBe(2);
});
