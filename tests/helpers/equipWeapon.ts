import type {RunSimulation} from '../../src/core/sim/RunSimulation';
import type {WeaponFamily} from '../../src/core/combat/weapons';
/** Staged regression setup: acquire via an actual eligible offer and chooseDraft. */
export function equipWeapon(sim:RunSimulation,family:WeaponFamily){
 if(sim.state.weapons.some(w=>w.family===family))return;
 const n=sim.techGraph().find(n=>n.weaponFamily===family)!;if(!n||!sim.canAcquireWeapon(family))throw Error('No legal acquisition');
 sim.state.draftOpen=true;sim.state.pendingLevels=1;sim.state.draftOffers=[{nodeId:n.id,quality:'COMMON',modifierIds:[],effectiveEffects:[]}];sim.chooseDraft(0);
}
