import type Phaser from'phaser';
import{phaserColors as c}from'../../theme/tokens';
type Kind='age'|'breakthrough'|'phase'|'hit'|'lost'|'repaired';
/** Eight immutable-origin world confirmations. No anatomy tween or clock hold. */
export class CivilizationBeats{
 private slots=Array.from({length:8},()=>({until:-Infinity,x:0,y:0,kind:'age' as Kind}));
 reset(){for(const p of this.slots)p.until=-Infinity;}
 add(kind:Kind,x:number,y:number,time:number){const p=this.slots.find(p=>p.until<=time);if(p)Object.assign(p,{kind,x,y,until:time+(kind==='hit'?.35:1.2)});}
 count(time:number){return this.slots.filter(p=>p.until>time).length;}
 draw(g:Phaser.GameObjects.Graphics,time:number,reduced:boolean,hc:boolean,visible:(x:number,y:number)=>boolean){
  for(const p of this.slots){if(p.until<=time||!visible(p.x,p.y))continue;
   const f=Math.min(1,(p.until-time)/(p.kind==='hit'?.35:1.2)),r=reduced?44:44+(1-f)*32;
   const color=hc?c.text:p.kind==='hit'||p.kind==='lost'?c.damaged:p.kind==='phase'?c.hostile:c.action;
   g.lineStyle(hc?3:2,color,reduced?.9:f);
   // Discontinuous chevrons leave the real body/pose and danger areas unobscured.
   if(p.kind==='lost'){g.lineBetween(p.x-30,p.y-30,p.x+30,p.y+30);g.lineBetween(p.x+30,p.y-30,p.x-30,p.y+30);}
   else for(let i=0;i<(p.kind==='phase'?3:4);i++){const a=i*Math.PI/2,dx=Math.cos(a),dy=Math.sin(a),x=p.x+dx*r,y=p.y+dy*r;g.lineBetween(x-dy*7-dx*6,y+dx*7-dy*6,x,y);g.lineBetween(x,y,x+dy*7-dx*6,y-dx*7-dy*6);}
  }
 }
}
