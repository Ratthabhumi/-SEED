import type {RunState} from '../../core/sim/RunState';
import {activeFamilies} from '../../core/progression/origins';
import {getWeaponStage} from '../../core/combat/weapons';
/** Actual core enablement; bonuses do not conjure an inactive weapon family. */
export function guardianCount(s:RunState):number {
 if(!activeFamilies(s.originId,s.expansionFamily).includes('defense'))return 0;
 const stage=getWeaponStage('defense',s.weaponStage.defense);
 return Math.min(8,(stage.archetype==='summon'?stage.count:0)+s.build.bonusGuardians);
}
