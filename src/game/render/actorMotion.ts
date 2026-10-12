import type {ActorId} from '../assets/actorAssets';
export type FacingPolicy = 'upright' | 'heading';
export const facingPolicy = (id:ActorId):FacingPolicy => ['hunters','engineers','resonant','sentinels','boss'].includes(id)?'upright':'heading';
export const humanoid = (id:ActorId):boolean => ['hunters','engineers','resonant','sentinels'].includes(id);
export interface MotionPose { heading:number; moving:boolean; flip:boolean; back:boolean; }
interface Sample extends MotionPose {x:number;y:number;t:number;lastMove:number;}
/** Read-only adapter history. Fixed-step time keeps paused poses frozen; reset per world. */
export class ActorMotion {
 private samples=new WeakMap<object,Sample>();
 reset():void {this.samples=new WeakMap();}
 sample(key:object,x:number,y:number,t:number):MotionPose {
  let s=this.samples.get(key);
  if(!s || t<s.t){s={x,y,t,lastMove:-1,heading:Math.PI/2,moving:false,flip:false,back:false};this.samples.set(key,s);return s;}
  const dx=x-s.x,dy=y-s.y;
  if(Math.hypot(dx,dy)>0.05){s.heading=Math.atan2(dy,dx);s.lastMove=t;if(Math.abs(dx)>Math.abs(dy)*0.5)s.flip=dx<0;s.back=dy<0&&Math.abs(dy)>Math.abs(dx);}
  s.moving=t-s.lastMove<0.1;s.x=x;s.y=y;s.t=t;return s;
 }
}
