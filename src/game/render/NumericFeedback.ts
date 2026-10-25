import Phaser from "phaser";
const KEY="numeric-feedback-glyphs",CHARS="0123456789+-.";
/** Experimental opt-in numeric-only atlas. Thai and arbitrary labels stay Text. */
export class NumericFeedback {
  private pool:Phaser.GameObjects.BitmapText[]=[];
  constructor(private scene:Phaser.Scene){
    if(!scene.textures.exists(KEY)){
      const atlas=scene.textures.createCanvas(KEY,CHARS.length*10,20)!;
      const ctx=atlas.getContext();ctx.font="14px monospace";ctx.textBaseline="top";
      for(let i=0;i<CHARS.length;i++){
        ctx.fillStyle="rgba(0,0,0,0.55)";ctx.fillRect(i*10,0,10,20);
        ctx.fillStyle="#ffffff";ctx.fillText(CHARS[i]!,i*10,2);
      }
      atlas.refresh();
    }
    if(!scene.cache.bitmapFont.exists(KEY))scene.cache.bitmapFont.add(KEY,Phaser.GameObjects.RetroFont.Parse(scene,{image:KEY,width:10,height:20,chars:CHARS,charsPerRow:CHARS.length,"offset.x":0,"offset.y":0,"spacing.x":0,"spacing.y":0,lineSpacing:0}));
  }
  show(x:number,y:number,text:string,color:string):boolean {
    if(!/^[+\-]?\d+(\.\d+)?$/.test(text)||text.length>16)return false;
    let item=this.pool.find(p=>!p.visible);
    if(!item){if(this.pool.length>=12)return true;item=this.scene.add.bitmapText(0,0,KEY,"",14).setDepth(44);this.pool.push(item);}
    item.setText(text).setTint(Number.parseInt(color.slice(1),16)).setPosition(x-18,y-10).setAlpha(1).setVisible(true);
    const ref=item;this.scene.time.delayedCall(700,()=>ref.setVisible(false));return true;
  }
  counts(){return {allocated:this.pool.length,cap:12,glyphs:CHARS.length,atlasBytes:CHARS.length*10*20*4};}
}
