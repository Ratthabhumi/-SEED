import type Phaser from "phaser";
import type {SimProj} from "../../core/sim/RunState";
import {PaintedQuadBatch} from "./PaintedQuadBatch";
import {VL} from "./VisualLanguage";
import {hostileArtFrame} from "./hostileArt";

const KEY="hostile-vector-glyphs",CELL=64,MAX=64;
/** Cache the existing six-point threat glyph, exact radius/outline/tip geometry.
 * One bounded mesh instead of interpreting/tessellating each polygon per frame.
 * Canvas and overflow retain the existing vector fallback. No collision changes.
 */
export class HostileProjectileBatch {
  private atlas?:Phaser.Textures.CanvasTexture;
  private batch?:PaintedQuadBatch;
  private frames=new Map<string,number>();
  private painted?:PaintedQuadBatch;
  private paintedShots=0;private paintedRoles=new Set<number>();
  constructor(private scene:Phaser.Scene){
    if(!("gl" in scene.game.renderer))return;
    this.atlas=(scene.textures.exists(KEY)?scene.textures.get(KEY):scene.textures.createCanvas(KEY,512,512)) as Phaser.Textures.CanvasTexture;
    // A fresh renderer object after restart reuses the source safely, rebuilding
    // metadata; texture source itself remains manager-owned until game destroy.
    this.batch=new PaintedQuadBatch(scene,KEY,1000,7);
    this.painted=new PaintedQuadBatch(scene,"hostile-painted",1000,7);
  }
  begin(){this.batch?.begin();this.painted?.begin();this.paintedShots=0;this.paintedRoles.clear();}
  draw(p:SimProj,highContrast:boolean):boolean {
    const role=hostileArtFrame(p.src);
    if(!highContrast&&this.painted&&role!==undefined){
      const size=Math.max(24,p.radius*5);
      this.painted.draw(this.scene.textures.get("hostile-painted").get(role),p.x,p.y,size,size,Math.atan2(p.vy,p.vx));this.paintedShots++;this.paintedRoles.add(role);return true;
    }
    if(!this.batch||!this.atlas)return false;
    const id=`${p.radius}:${p.color}:${highContrast?3:2}`;
    let frame=this.frames.get(id);
    if(frame===undefined){
      if(this.frames.size>=MAX||p.radius>14)return false;
      frame=this.frames.size;this.frames.set(id,frame);
      const x=(frame%8)*CELL,y=Math.floor(frame/8)*CELL,ctx=this.atlas.getContext(),r=p.radius*1.25;
      ctx.clearRect(x,y,CELL,CELL);ctx.save();ctx.translate(x+CELL/2,y+CELL/2);
      ctx.beginPath();ctx.moveTo(r*1.6,0);ctx.lineTo(0,r*.85);ctx.lineTo(-r*.7,r*.5);
      ctx.lineTo(-r*.35,0);ctx.lineTo(-r*.7,-r*.5);ctx.lineTo(0,-r*.85);ctx.closePath();
      ctx.fillStyle='#'+p.color.toString(16).padStart(6,'0');ctx.fill();
      ctx.strokeStyle='#'+VL.hostileOutline.toString(16).padStart(6,'0');ctx.lineWidth=highContrast?3:2;ctx.stroke();
      ctx.globalAlpha=.9;ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(r*1.1,0,Math.max(1.5,r*.28),0,Math.PI*2);ctx.fill();ctx.restore();
      if(!this.atlas.has(String(frame)))this.atlas.add(frame,0,x,y,CELL,CELL);
      this.atlas.refresh();
    }
    this.batch.draw(this.atlas.get(frame),p.x,p.y,CELL,CELL,Math.atan2(p.vy,p.vx));return true;
  }
  end(){this.batch?.end();this.painted?.end();}
  counts(){return {glyphs:this.frames.size,maxGlyphs:MAX,atlasBytes:this.atlas?512*512*4:0,paintedAtlasBytes:512*128*4,paintedShots:this.paintedShots,paintedRoles:[...this.paintedRoles]};}
}
