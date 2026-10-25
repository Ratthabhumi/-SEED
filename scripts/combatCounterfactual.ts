import {aimFromPivot,angleDelta,primaryTier,weaponFrame} from '../src/core/combat/weaponGeometry';
import {WEAPON_SOCKETS} from '../src/content/weaponSockets';
/** Diagnostic-only ablation. Never imported by production. */
export function counterfactual(sim:any,mode:'placement'|'lock'|'both'){
 let locked:any=null,inside=0;
 const nearest=sim.nearestEnemy.bind(sim),release=sim.releasePose.bind(sim);
 if(mode!=='placement'){
  sim.nearestEnemy=(x:number,y:number,range:number)=>inside&&locked?.active&&Math.hypot(locked.x-x,locked.y-y)<range?locked:nearest(x,y,range);
  for(const name of ['updatePrimaryRig','fireProjectileSpread','beamStrike']){const orig=sim[name].bind(sim);sim[name]=(...args:any[])=>{inside++;try{return orig(...args);}finally{inside--;}};}
  sim.releasePose=(target:any)=>{const p=release(target);locked=p?null:target;return p;};
 }
 if(mode!=='lock'){
  sim.updatePrimaryRig=(dt:number)=>{
   const s=sim.state,r=s.weaponRig,tier=primaryTier(s.originId,s.weaponStage);inside++;const t=sim.nearestEnemy(s.px,s.py,800);inside--;if(!t)return;
   if(Math.abs(t.x-s.px-r.x)>2)r.flipY=t.x-s.px-r.x<0;
   const oldAim=aimFromPivot(s.originId,tier,s.px,s.py,r,t.x,t.y),m=WEAPON_SOCKETS[weaponFrame(s.originId,tier)]!,scale=(56+tier*2)/128;
   let x=(r.mode==='float'?96:18)*Math.cos(oldAim.heading),y=r.mode==='float'?-112:-12;
   const dx=s.px+x-t.x,dy=s.py+y-t.y,d=Math.hypot(dx,dy),room=Math.hypot(m[2]-m[0],m[3]-m[1])*scale+4;
   if(d<room){const nx=d>.001?dx/d:-Math.cos(r.heading),ny=d>.001?dy/d:-Math.sin(r.heading);x+=nx*(room-d);y+=ny*(room-d);}
   const blend=1-Math.exp(-10*dt);r.x+=(x-r.x)*blend;r.y+=(y-r.y)*blend;
   const aim=aimFromPivot(s.originId,tier,s.px,s.py,r,t.x,t.y);
   r.heading+=Math.max(-14*dt,Math.min(14*dt,angleDelta(aim.heading,r.heading)));
  };
 }
}
