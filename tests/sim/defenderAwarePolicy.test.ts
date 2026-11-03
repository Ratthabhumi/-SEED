import {it,expect} from 'vitest';
import {RunSimulation} from '../../src/core/sim/RunSimulation';
import {defenderAwarePolicy} from '../../scripts/defenderAwarePolicy';
it('intercepts the actual boss and produces the same snapshot on replay',()=>{
 const run=()=>{const sim=new RunSimulation({masterSeed:'DEFENDER-ROUTE'}),s=sim.state;s.spawnT=s.eliteT=s.mineT=999;s.build.hp=s.build.maxHp=10000;s.ageIndex=5;s.weaponStage={kinetic:5,energy:5,defense:5,field:5};sim.spawnEnemy('tank',false,true,Math.PI,400,[]);
  const report=defenderAwarePolicy(sim,2,{onStep:sim=>sim.state.elapsed>=.5});return {sim,report};};
 const a=run(),b=run();expect(a.sim.state.px).toBeLessThan(0);expect(a.sim.snapshot()).toBe(b.sim.snapshot());expect(a.report.policy).toBe('defender-aware-intercept-v1');expect(a.report.defenseMetrics.inAttackRangeSeconds).toBeGreaterThan(0);
});
it('counts real direct Origin-power events rather than reporting their absence from step events as zero use',()=>{
 const sim=new RunSimulation({masterSeed:'DIRECT-ACTION-OBSERVATION'});sim.state.spawnT=sim.state.eliteT=sim.state.mineT=999;
 sim.spawnEnemy('swarm',false,false,0,180,[]);sim.spawnEnemy('swarm',false,false,Math.PI,180,[]);
 const report=defenderAwarePolicy(sim,.1);expect(report.defenseMetrics.abilityUses).toBe(1);expect(sim.state.abilityCd).toBeGreaterThan(0);
});
