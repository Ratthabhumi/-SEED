import type {TechNode} from './graph';
/** Existing canonical attack-pattern effects, not a cosmetic rarity label. */
export function changesAttackPattern(node:Pick<TechNode,'effects'>,chainUnlocked=false):boolean {
 return node.effects.some(e=>e.value>0&&!(e.kind==='chainAdd'&&chainUnlocked===true)&&['projectileAdd','chainAdd','mineAdd','orbitAdd','summonAdd','auraAdd','beamAdd','relayAdd'].includes(e.kind));
}
