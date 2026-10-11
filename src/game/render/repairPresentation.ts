import { CLAIM_REACH_RADIUS, REPAIR_NEED, type Territory } from "../../core/world/territory";
/** Read-only presentation of authoritative progress; no animation clock or resource changes. */
export function repairPresentation(territories: readonly Territory[],px:number,py:number,visible:(x:number,y:number)=>boolean = ()=>true) {
 let site: Territory | undefined; let distance=Infinity;
 for(const t of territories) { if(!t.disabled || !visible(t.x,t.y))continue; const d=Math.hypot(t.x-px,t.y-py); if(d<distance){distance=d;site=t;} }
 if(!site)return null;
 const inRange=distance<=CLAIM_REACH_RADIUS; const progress=inRange ? Math.max(0,Math.min(1,site.repairT/REPAIR_NEED)) : 0;
 return {site,inRange,progress,percent:Math.floor(progress*100),remaining:Math.max(0,REPAIR_NEED-(inRange?site.repairT:0))};
}
