import type {WeaponFamily} from '../../core/combat/weapons';
/** Observed state deltas only; this helper never predicts or applies an upgrade. */
export function changedWeaponForms(before:Readonly<Record<WeaponFamily,number>>,after:Readonly<Record<WeaponFamily,number>>,families:readonly WeaponFamily[]){
 return families.filter(f=>before[f]!==after[f]).map(f=>({family:f,before:before[f],after:after[f]}));
}
