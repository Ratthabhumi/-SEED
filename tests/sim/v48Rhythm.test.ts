import {it,expect} from 'vitest';
import {RunSimulation} from '../../src/core/sim/RunSimulation';
import {ordinaryWaveInterval} from '../../src/core/director/ordinaryRhythm';
it('first-choice handoff never schedules back-to-back packets near any cycle boundary',()=>{
 for(let tick=0;tick<396;tick++){
  const delay=ordinaryWaveInterval(tick/60,0,true,false);
  expect(delay).toBeGreaterThanOrEqual(1.2);expect(delay).toBeLessThanOrEqual(4.2);
 }
});
function packets(seconds:number,chosen=false,child=false,boss=false){
 const sim=new RunSimulation({masterSeed:'V48-RHYTHM'}),s=sim.state;s.stats.techsTaken=Number(chosen);s.ascension=Number(child);s.bossSpawned=boss;
 s.build.hp=s.build.maxHp=1e8;s.eliteT=s.mineT=999;for(const a of s.squad)a.active=false;for(const f of ['kinetic','energy','defense','field'] as const)s.weaponCd[f]=999;
 const times:number[]=[];for(let i=0;i<seconds*60;i++){const before=s.spawnT;sim.step(1/60,{moveX:0,moveY:0,dashPressed:false});if(s.spawnT>before)times.push(s.elapsed);}
 return times;
}
it('post-choice World1 pressure contains short attacks and a real recovery interval at unchanged long-run packet density',()=>{
 const before=packets(66),after=packets(66,true),gaps=after.slice(1).map((t,i)=>t-after[i]!);
 expect(Math.min(...gaps)).toBeLessThan(1.3);expect(Math.max(...gaps)).toBeGreaterThan(4);
 expect(Math.max(...gaps)).toBeLessThan(4.3);expect(Math.abs(after.length-before.length)).toBeLessThanOrEqual(1);
});
it('initial survival, child worlds and boss encounters retain the existing ordinary cadence',()=>{
 for(const [chosen,child,boss] of [[false,false,false],[true,true,false],[true,false,true]]){
  const times=packets(8,chosen,child,boss),gaps=times.slice(1).map((t,i)=>t-times[i]!);
  for(const gap of gaps){expect(gap).toBeGreaterThanOrEqual(2.19);expect(gap).toBeLessThan(2.24);}
 }
});
