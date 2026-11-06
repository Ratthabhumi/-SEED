import {it,expect} from 'vitest';
import {RunSimulation} from '../../src/core/sim/RunSimulation';
import {ORIGINS} from '../../src/core/progression/origins';
it('restores each original Origin pair as two real independently owned instances',()=>{
 for(const o of ORIGINS){const sim=new RunSimulation({masterSeed:'EPOCH-GOLDEN-001',originId:o.id}),s=sim.state;
 expect(s.weapons.map(w=>w.family)).toEqual(o.families);expect(s.weaponSerial).toBe(2);expect(s.weapons[0]!.rig).toBe(s.weaponRig);expect(s.weapons[1]!.rig).not.toBe(s.weaponRig);expect(new Set(s.weapons.map(w=>w.id)).size).toBe(2);
 expect(s.build.damageMul).toBe(1);expect(s.build.hp).toBe(100);
 const extra=sim.techGraph().find(n=>n.weaponFamily&&!o.families.includes(n.weaponFamily))!;s.draftOpen=true;s.pendingLevels=1;s.draftOffers=[{nodeId:extra.id,quality:'COMMON',modifierIds:[],effectiveEffects:[]}];sim.chooseDraft(0);expect(s.weapons).toHaveLength(3);expect(s.weapons.map(w=>w.slot)).toEqual([0,1,2]);
 }
});
it('optional Archive Energy occupies the third slot once; restart returns to the original pair',()=>{
 for(const o of ORIGINS){const sim=new RunSimulation({masterSeed:'EPOCH-GOLDEN-001',originId:o.id,archivePerks:['energy-kit'],archiveEnergyStart:true});expect(sim.state.weapons.length).toBe(o.families.includes('energy')?2:3);expect(new Set(sim.state.weapons.map(w=>w.family)).size).toBe(sim.state.weapons.length);}
 expect(new RunSimulation({masterSeed:'EPOCH-GOLDEN-001'}).state.weapons).toHaveLength(2);
});
