import {WEAPON_SOCKETS} from '../../content/weaponSockets';
import type {WeaponFamily} from './weapons';
import {originById} from '../progression/origins';
export function primaryTier(origin:string,stages:Record<WeaponFamily,number>){return stages[originById(origin).families.find(f=>f==='kinetic'||f==='energy')??'kinetic'];}
export type WeaponMount='hand'|'float';
export interface WeaponRig {mode:WeaponMount;x:number;y:number;heading:number;firedAt:number;flipY:boolean;}
export interface WeaponTransform {frame:number;tier:number;x:number;y:number;heading:number;rotation:number;flipY:boolean;scale:number;pivotX:number;pivotY:number;muzzleX:number;muzzleY:number;}
export interface PrimaryRelease {owner:'player-primary';time:number;pose:WeaponTransform;heading:number;index:number;count:number;projectileIndex?:number;targetX?:number;targetY?:number;}
const ORIGINS=['hunters','engineers','resonant','sentinels'];
export function weaponFrame(origin:string,tier:number){return Math.max(0,ORIGINS.indexOf(origin))*6+Math.max(0,Math.min(5,Math.floor(tier)));}
export const angleDelta=(to:number,from:number)=>Math.atan2(Math.sin(to-from),Math.cos(to-from));
export function createWeaponRig(mode:WeaponMount='float'):WeaponRig{return {mode,x:mode==='float'?84:18,y:mode==='float'?-112:-12,heading:0,firedAt:-1e6,flipY:false};}
export function socketWorld(pose:WeaponTransform,x:number,y:number){
 const dx=(x-pose.pivotX)*pose.scale,dy=(y-pose.pivotY)*pose.scale*(pose.flipY?-1:1),c=Math.cos(pose.rotation),s=Math.sin(pose.rotation);
 return {x:pose.x+dx*c-dy*s,y:pose.y+dx*s+dy*c};
}
export function weaponTransform(origin:string,tier:number,px:number,py:number,rig:WeaponRig,time:number):WeaponTransform{
 const frame=weaponFrame(origin,tier),m=WEAPON_SOCKETS[frame]!,flipY=m[6]&&rig.flipY;
 const sourceAxis=Math.atan2(m[3]-m[5],m[2]-m[4])*(flipY?-1:1),age=time-rig.firedAt;
 const recoil=age>0&&age<.16?.8*Math.sin(Math.PI*age/.16):0;
 const pose:WeaponTransform={frame,tier,x:px+rig.x-Math.cos(rig.heading)*recoil,y:py+rig.y-Math.sin(rig.heading)*recoil,heading:rig.heading,rotation:rig.heading-sourceAxis,flipY,scale:(56+tier*2)/128,pivotX:m[0],pivotY:m[1],muzzleX:0,muzzleY:0};
 const muzzle=socketWorld(pose,m[2],m[3]);pose.muzzleX=muzzle.x;pose.muzzleY=muzzle.y;return pose;
}
/** Solve the barrel ray from the actual offset exit, not from the player. A
 * negative forward distance is a genuinely unsafe near-muzzle configuration. */
export function aimFromPivot(origin:string,tier:number,px:number,py:number,rig:WeaponRig,tx:number,ty:number){
 const direction=Math.atan2(ty-py-rig.y,tx-px-rig.x);
 const initial=weaponTransform(origin,tier,px,py,{...rig,heading:direction,firedAt:-1e6},0);
 const dx=tx-initial.x,dy=ty-initial.y,d=Math.hypot(dx,dy);
 // With a fixed authored mirror, lateral offset is rotation invariant.
 const lateral=-(initial.muzzleX-initial.x)*Math.sin(direction)+(initial.muzzleY-initial.y)*Math.cos(direction);
 const angle=direction-Math.asin(Math.max(-.99,Math.min(.99,lateral/Math.max(.01,d))));
 const p=weaponTransform(origin,tier,px,py,{...rig,heading:angle,firedAt:-1e6},0);
 return {heading:angle,forward:(tx-p.muzzleX)*Math.cos(angle)+(ty-p.muzzleY)*Math.sin(angle)};
}
export function sweptHit(x:number,y:number,nx:number,ny:number,ex:number,ey:number,r:number):number|null{
 const dx=nx-x,dy=ny-y,ox=x-ex,oy=y-ey,c=ox*ox+oy*oy-r*r;
 if(c<=0)return 0;const a=dx*dx+dy*dy;if(a===0)return null;
 const b=ox*dx+oy*dy,discriminant=b*b-a*c;if(discriminant<0)return null;
 const t=(-b-Math.sqrt(discriminant))/a;return t>=0&&t<=1?t:null;
}
