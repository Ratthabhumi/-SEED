import type Phaser from "phaser";
import {drawGround,type GroundDrawArgs} from "./WorldRenderer";
import {groundViewport,type GroundBounds} from "./groundViewport";
/** E2E-only caller: rasterize actual old/new command streams at identical time.
 * Canvas pixel parity checks clipping; native WebGL performance is separate. */
export function groundRasterReview(scene:Phaser.Scene,args:GroundDrawArgs,x:number,y:number,width=640,height=360,zoom=1,bounds?:GroundBounds,detailBounds?:GroundBounds){
 const results:Uint8ClampedArray[]=[],commands:number[]=[];
 for(const culled of [false,true]){
  const g=scene.make.graphics({x:0,y:0}),canvas=document.createElement("canvas");canvas.width=width;canvas.height=height;
  try{
   g.scaleCanvas(zoom,zoom);g.translateCanvas(-x,-y);drawGround(g,{...args,detailBounds:culled?detailBounds:undefined,bounds:culled?(bounds??groundViewport(x,y,width,height,1)):undefined});
   commands.push(g.commandBuffer.length);g.generateTexture(canvas,width,height);
   results.push(canvas.getContext("2d")!.getImageData(0,0,width,height).data);
  }finally{g.destroy();}
 }
 let different=0,opaque=0,nonblank=0;for(let i=0;i<results[0]!.length;i++)if(results[0]![i]!==results[1]![i])different++;
 for(let i=3;i<results[0]!.length;i+=4){if(results[0]![i]===255)opaque++;if(results[0]![i]!>0)nonblank++;}
 return {different,opaque,nonblank,bytes:results[0]!.length,commands};
}
