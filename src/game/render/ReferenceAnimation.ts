import type {HeroAction} from "./heroActions";
export interface MotionMetadata {
  clips: Record<string,{columns:number[];frameMs:number;loop:boolean}>;
  frames:Array<{frame:number;socket:number[]}>;
  overrides?:Record<string,{frames:number[];frameMs:number;loop:boolean;sockets:number[][]}>;
  socketOverrides?:Record<string,number[]>;
}
/** Display clock follows canonical elapsed time. No action/input owned here. */
export class ReferenceAnimation {
  private key="";private started=0;private last=-Infinity;
  private selected?:{frame:number;socket:number[];action:string;index:number;texture?:string};
  constructor(private metadata:MotionMetadata){}
  sample(age:number,back:boolean,action:HeroAction,time:number,revision=0){
    const key=`${age}:${back}:${action}:${revision}`;
    if(key!==this.key||time<this.last){this.key=key;this.started=time;}
    this.last=time;
    const extra=this.metadata.overrides?.[`${age}:${back?"back":"front"}:${action}`];
    if(extra){
      const tick=Math.max(0,Math.floor((time-this.started)*1000/extra.frameMs));
      const index=extra.loop?tick%extra.frames.length:Math.min(tick,extra.frames.length-1);
      this.selected={frame:extra.frames[index]!,socket:extra.sockets[index]!,action,index,texture:"hero-reference-attack"};return this.selected;
    }
    const clip=this.metadata.clips[action]!;
    const tick=Math.max(0,Math.floor((time-this.started)*1000/clip.frameMs));
    const index=clip.loop?tick%clip.columns.length:Math.min(tick,clip.columns.length-1);
    const row=(age===5?2:0)+(back?1:0),frame=row*9+clip.columns[index]!;
    this.selected={frame,socket:this.metadata.socketOverrides?.[String(frame)]??this.metadata.frames[frame]!.socket,action,index};return this.selected;
  }
  review(){return this.selected??null;}
}
