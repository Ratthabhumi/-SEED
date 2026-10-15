interface Arrival{poiId:string;discoveredSimTime:number;discoveredWall:number;x?:number;y?:number;firstRenderFrame?:number;discoveryToRenderMs?:number;}
/** Bounded read-only observation; never reveals or changes canonical sites. */
export class SiteArrival {
 private world='';private count=0;private rows=new Map<string,Arrival>();
 reset(){this.world='';this.count=0;this.rows.clear();}
 discover(world:string,ids:string[],simTime:number,wall:number){
  if(world!==this.world||ids.length<this.count){this.reset();this.world=world;}
  for(let i=this.count;i<ids.length;i++){
   if(this.rows.size>=64)this.rows.delete(this.rows.keys().next().value!);
   this.rows.set(ids[i]!,{poiId:ids[i]!,discoveredSimTime:simTime,discoveredWall:wall});
  }this.count=ids.length;
 }
 drawn(id:string,x:number,y:number){const r=this.rows.get(id);if(r){r.x=x;r.y=y;}}
 afterRender(contains:(x:number,y:number)=>boolean,frame:number,wall:number){
  for(const r of this.rows.values())if(r.firstRenderFrame===undefined&&r.x!==undefined&&r.y!==undefined&&contains(r.x,r.y)){
   r.firstRenderFrame=frame;r.discoveryToRenderMs=wall-r.discoveredWall;
  }
 }
 review(){return [...this.rows.values()].map(({discoveredWall,...r})=>({...r,classification:'POST_RENDER_CPU_OBSERVATION_NOT_GPU_PRESENTATION'}));}
}
