import {it,expect} from 'vitest';
import {combatSlice,V47_BUILDS} from '../../scripts/v47CombatSlice';
import {RunSimulation} from '../../src/core/sim/RunSimulation';
for(let i=0;i<3;i++)it(`real build behavior and deterministic replay ${V47_BUILDS[i]!.id}`,()=>{
 const base=combatSlice(RunSimulation,i,false),up=combatSlice(RunSimulation,i,true),replay=combatSlice(RunSimulation,i,true);
 expect(up.snapshot).toBe(replay.snapshot);expect(up.stoppedByDraft).toBe(false);expect(up.elapsed).toBeGreaterThan(11.9);expect(up.hpDamage).toBeGreaterThan(0);
 if(i===0)expect(up.shots).toBeGreaterThan(base.shots);
 if(i===1){expect(base.arcs).toBe(0);expect(up.arcs).toBeGreaterThan(0);}
 if(i===2)expect(up.detonations).toBeGreaterThan(base.detonations);
});
