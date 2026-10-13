import type Phaser from "phaser";
/** Phaser4.2 Mesh2D consumes already ordered quad pairs. One display-list
 * object per atlas/tint, fixed buffers, no Image traversal per projectile.
 */
export class PaintedQuadBatch {
 private vertices:Float32Array;private indices:Uint16Array;private mesh:Phaser.GameObjects.Mesh2D;private count=0;
 constructor(scene:Phaser.Scene,private key:string,private cap:number,depth:number,tint=0xffffff){
  this.vertices=new Float32Array(cap*16);this.indices=new Uint16Array(cap*8);
  for(let i=0;i<cap;i++){const v=i*4;this.indices.set([v,v+1,v+2,0,v+1,v+2,v+3,0],i*8);}
  this.mesh=scene.add.mesh2d(0,0,key,this.vertices as unknown as number[],[],false).setDepth(depth);
  // Installed4.2.1 implements tint, omitted by its generated Mesh2D typings.
  (this.mesh as Phaser.GameObjects.Mesh2D&{tint:number}).tint=tint;
  this.mesh.setUseOrderedIndices(true);this.mesh.indicesOrdered=[];
 }
 begin(){this.count=0;}
 draw(frame:Phaser.Textures.Frame,x:number,y:number,w:number,h:number,angle=0,bounds?:{x:number;y:number;w:number;h:number;cell:number}){
  if(this.count>=this.cap)return;
  const offset=this.count++*16,cs=Math.cos(angle),sn=Math.sin(angle);
  let u0=frame.u0,v0=frame.v0,u1=frame.u1,v1=frame.v1;
  if(bounds){
   const dx=((bounds.x+bounds.w/2)/bounds.cell-.5)*w,dy=((bounds.y+bounds.h/2)/bounds.cell-.5)*h;
   x+=cs*dx-sn*dy;y+=sn*dx+cs*dy;
   u0=frame.u0+(frame.u1-frame.u0)*bounds.x/bounds.cell;u1=frame.u0+(frame.u1-frame.u0)*(bounds.x+bounds.w)/bounds.cell;
   v0=frame.v0+(frame.v1-frame.v0)*bounds.y/bounds.cell;v1=frame.v0+(frame.v1-frame.v0)*(bounds.y+bounds.h)/bounds.cell;
   w*=bounds.w/bounds.cell;h*=bounds.h/bounds.cell;
  }
  const hx=w/2,hy=h/2;
  const vx=cs*hx,vy=sn*hx,ux=-sn*hy,uy=cs*hy;
  const v=this.vertices;
  v[offset]=x-vx-ux;v[offset+1]=y-vy-uy;v[offset+2]=u0;v[offset+3]=v0;
  v[offset+4]=x-vx+ux;v[offset+5]=y-vy+uy;v[offset+6]=u0;v[offset+7]=v1;
  v[offset+8]=x+vx-ux;v[offset+9]=y+vy-uy;v[offset+10]=u1;v[offset+11]=v0;
  v[offset+12]=x+vx+ux;v[offset+13]=y+vy+uy;v[offset+14]=u1;v[offset+15]=v1;
 }
 end(){this.mesh.indicesOrdered=this.indices.subarray(0,this.count*8) as unknown as number[];this.mesh.setVisible(this.count>0);}
}
