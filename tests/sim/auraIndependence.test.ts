import {it,expect} from 'vitest';
import {RunSimulation} from '../../src/core/sim/RunSimulation';
const idle={moveX:0,moveY:0,dashPressed:false};
function arena(originId:string,energy:number,field:number){
 const sim=new RunSimulation({masterSeed:'EPOCH-GOLDEN-001',originId}),s=sim.state;
 s.spawnT=s.eliteT=s.mineT=999;s.weaponStage.energy=energy;s.weaponStage.field=field;
 for(const f of ['kinetic','energy','defense','field']as const)s.weaponCd[f]=999;
 s.weaponCd.field=0;for(const a of s.squad)a.active=false;
 const e=sim.spawnEnemy('chaser',false,false,0,40,[])!;e.speed=e.dmg=0;e.hp=e.maxHp=100000;e.shield=0;
 return sim;
}
function sample(sim:RunSimulation){const counts={energy:0,field:0};for(let i=0;i<120;i++)for(const e of sim.step(1/60,idle)){
 if(e.type==='energy_impact'&&e.source==='energy')counts.energy++;
 if(e.type==='weapon_impact'&&e.family==='field')counts.field++;
 }return counts;}
it('adding Field aura cannot steal Energy aura ticks and vice versa',()=>{
 const energy=sample(arena('resonant',2,0)),field=sample(arena('hunters',0,3)),both=sample(arena('resonant',2,3));
 expect(energy.energy).toBeGreaterThan(2);expect(field.field).toBeGreaterThan(2);
 expect(both.energy).toBe(energy.energy);expect(both.field).toBe(field.field);
});
it('coexisting auras replay identically',()=>{
 const a=arena('resonant',2,3),b=arena('resonant',2,3);expect(sample(a)).toEqual(sample(b));expect(a.snapshot()).toBe(b.snapshot());
});
