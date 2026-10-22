import Phaser from "phaser";

type Context = {camera:Phaser.Cameras.Scene2D.Camera;useCanvas:boolean};
type Batch = {batch(context:Context,indices:number[],vertices:number[],colors:number[],lighting:unknown):void};
type Render = (renderer:Phaser.Renderer.WebGL.WebGLRenderer,src:Phaser.GameObjects.Graphics,context:Context,parent?:Phaser.GameObjects.Components.TransformMatrix)=>void;
type NativeGraphics = {renderWebGL:Render;addRenderStep(fn:Render,index:number):void;defaultRenderNodes:{Submitter:Batch};customRenderNodes:{Submitter?:Batch}};
interface Geometry {indices:number[];vertices:number[];colors:number[];translated:number[];}
// Capture before opt-in diagnostics wraps the shared prototype. The instance
// wrapper is measured once, including both cache hits and cold preparation.
const nativeRender=(Phaser.GameObjects.Graphics.prototype as unknown as NativeGraphics).renderWebGL;

/** Retain the complete native flat-triangle submission, not individual paths or
 * pixels. Camera translation reuses triangles; linear transforms rebuild them.
 * Owned only by this static Graphics. No shared render-node mutation or GL state.
 * clear() must invalidate before rebuilding the command stream.
 */
export class PreparedGround {
  enabled=true;
  private geometry:Geometry[]=[];
  private key="";
  private tx=0;private ty=0;
  private builds=0;private hits=0;
  private overflow=false;
  constructor(graphics:Phaser.GameObjects.Graphics) {
    const native=graphics as unknown as NativeGraphics;
    const render=nativeRender;
    native.renderWebGL=(renderer,src,context,parent)=>{
      if(!this.enabled||this.overflow||src.lighting||!src.commandBuffer.length){render.call(src,renderer,src,context,parent);return;}
      const matrix=Phaser.GameObjects.GetCalcMatrix(src,context.camera,parent,!context.useCanvas).calc;
      const tx=matrix.e,ty=matrix.f;
      const key=[matrix.a,matrix.b,matrix.c,matrix.d,src.alpha,src.pathDetailThreshold,(renderer.config as {pathDetailThreshold?:number}).pathDetailThreshold,context.useCanvas].join(':');
      const submitter=native.customRenderNodes.Submitter??native.defaultRenderNodes.Submitter;
      if(this.key===key&&this.geometry.length){
        context.camera.addToRenderList(src);
        const dx=tx-this.tx,dy=ty-this.ty;
        for(const g of this.geometry){
          for(let i=0;i<g.vertices.length;i+=2){g.translated[i]=g.vertices[i]+dx;g.translated[i+1]=g.vertices[i+1]+dy;}
          submitter.batch(context,g.indices,g.translated,g.colors,false);
        }
        this.hits++;return;
      }
      const geometry:Geometry[]=[];
      let coordinates=0;
      // A private proxy records native output while forwarding the first draw.
      // Primitive ordering, tessellation, colors and native batching are retained.
      const recorder:Batch={batch:(ctx,indices,vertices,colors,lighting)=>{
        coordinates+=vertices.length;
        if(coordinates<=131072)geometry.push({indices:indices.slice(),vertices:vertices.slice(),colors:colors.slice(),translated:new Array(vertices.length)});
        else this.overflow=true; // bounded CPU retention; native draw still completes
        submitter.batch(ctx,indices,vertices,colors,lighting);
      }};
      const previous=native.customRenderNodes.Submitter;
      native.customRenderNodes.Submitter=recorder;
      try {render.call(src,renderer,src,context,parent);this.geometry=this.overflow?[]:geometry;this.key=key;this.tx=tx;this.ty=ty;this.builds++;}
      finally {if(previous)native.customRenderNodes.Submitter=previous;else delete native.customRenderNodes.Submitter;}
    };
    // Phaser4 captures renderWebGL during GameObject construction. Install a
    // public render step rather than relying on a later method replacement.
    native.addRenderStep((...args)=>native.renderWebGL(...args),0);
    graphics.once('destroy',()=>this.invalidate());
  }
  invalidate(){this.geometry=[];this.key="";this.overflow=false;}
  review(){return {enabled:this.enabled,builds:this.builds,hits:this.hits,overflow:this.overflow,primitives:this.geometry.length,vertices:this.geometry.reduce((n,g)=>n+g.vertices.length/2,0)};}
}
