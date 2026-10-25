import type {SimProj} from "../../core/sim/RunState";
import {projectileRole} from "./ageVisualIdentity";
const ORIGINS=["hunters","engineers","resonant","sentinels"];
export function originRow(origin:string):number{return Math.max(0,ORIGINS.indexOf(origin));}
export {weaponFrame as equipmentFrame} from '../../core/combat/weaponGeometry';
export function projectileFrame(origin:string,p:SimProj):number{
 const role=projectileRole(p),row=role==="energy"?1:role==="defense"||role==="squad"?2:role==="ability"&&origin==="resonant"?1:0;
 return row*4+originRow(origin);
}
