import type {WeaponFamily} from './weapons';
import {createWeaponRig,type WeaponRig} from './weaponGeometry';
import {activeFamilies,originById} from '../progression/origins';
export const WEAPON_SLOT_CAP=3;
export const WEAPON_FAMILIES:readonly WeaponFamily[]=['kinetic','energy','defense','field'];
export interface WeaponInstance {id:string;owner:'player';slot:number;family:WeaponFamily;rig:WeaponRig;auraCd:number;}
export function startingWeapons(origin:string,rig=createWeaponRig()):WeaponInstance[]{return [{id:'weapon-0-'+originById(origin).families[0],owner:'player',slot:0,family:originById(origin).families[0],rig,auraCd:0}];}
export function equippedFamilies(s:{originId:string;expansionFamily:WeaponFamily|'';weapons?:readonly WeaponInstance[]}):WeaponFamily[]{return s.weapons?s.weapons.map(w=>w.family):activeFamilies(s.originId,s.expansionFamily);}
export function weaponArtOrigin(origin:string,family:WeaponFamily,slot=0):string{return slot===0?origin:family==='energy'?'resonant':family==='kinetic'?'hunters':family==='defense'?'sentinels':'hunters';}
