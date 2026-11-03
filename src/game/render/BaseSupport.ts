import type Phaser from'phaser';
import{economyRegenAt,ECONOMY_REGEN_RADIUS,type Territory}from'../../core/world/territory';
import type{RunState}from'../../core/sim/RunState';
import{phaserColors as c}from'../../theme/tokens';
type Player=Pick<RunState,'px'|'py'|'build'|'over'>;
export function baseSupport(t:Territory,s:Player,multiplier=1){
 const regen=economyRegenAt([t],s.px,s.py,()=>multiplier);
 return{fraction:Math.max(0,Math.min(1,t.hp/Math.max(1,t.maxHp))),regen,healing:!s.over&&s.build.hp<s.build.maxHp&&regen>0};
}
/** Local ground affordance, never a collider, heal emitter or resource grant. */
export function drawBaseSupport(g:Phaser.GameObjects.Graphics,t:Territory,s:Player,hc:boolean,multiplier=1,boundary=false):void{
 const p=baseSupport(t,s,multiplier),color=hc?c.text:t.disabled?c.damaged:p.fraction<.35?c.damaged:c.friendly;
 if(t.hp<t.maxHp||t.disabled){
  g.fillStyle(c.canvas,.95);g.fillRect(t.x-46,t.y+34,92,10);
  g.fillStyle(color,1);g.fillRect(t.x-44,t.y+36,88*p.fraction,6);
  g.lineStyle(1,hc?c.text:c.secondary,1);g.strokeRect(t.x-46,t.y+34,92,10);
 }
 if(t.spec!=='economy'||t.disabled)return;
 if(boundary){
  g.lineStyle(hc?2:1,hc?c.text:c.friendly,hc?.6:.28);g.strokeCircle(t.x,t.y,ECONOMY_REGEN_RADIUS);
  // Plus signs identify recovery without depending on green alone.
  for(let i=0;i<4;i++){const a=i*Math.PI/2,x=t.x+Math.cos(a)*ECONOMY_REGEN_RADIUS,y=t.y+Math.sin(a)*ECONOMY_REGEN_RADIUS;g.lineBetween(x-7,y,x+7,y);g.lineBetween(x,y-7,x,y+7);}
 }
 if(p.healing&&boundary){g.lineStyle(2,hc?c.text:c.friendly,.85);g.lineBetween(s.px-16,s.py+38,s.px-4,s.py+38);g.lineBetween(s.px-10,s.py+32,s.px-10,s.py+44);}
}
