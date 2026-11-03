import type Phaser from 'phaser';
import type {LegacyCollection} from '../../core/progression/legacyCollection';
import {LEGACY_SHAPES} from './legacyShapes';
/** Bounded geometric presentation beside genuine painted actors, not new anatomy. */
export function drawLegacyCosmetics(g:Phaser.GameObjects.Graphics,c:LegacyCollection,x:number,y:number,age:number,hc:boolean):void {
 const r=27+age*2,color=hc?0xffffff:age>=4?0x80d9ff:age>=2?0x62e5cc:0xffd36b;
 // Six discrete age markers; presentation never changes the hit radius.
 g.lineStyle(2,color,.75);for(let i=0;i<=age;i++){const a=Math.PI*.65+i*Math.PI*.34;g.lineBetween(x+Math.cos(a)*r,y+Math.sin(a)*r,x+Math.cos(a)*(r+5),y+Math.sin(a)*(r+5));}
 for(const slot of ['emblem','ornament'] as const){
  const id=c.equipped[slot];if(!id)continue;
  g.lineStyle(2,hc?0xffffff:id==='ward'?0x62e5cc:id==='star'?0x80d9ff:0xffd36b,1);
  const ox=slot==='emblem'?x-25:x,oy=slot==='emblem'?y-26:y-39;
  for(const [a,b,c,d] of LEGACY_SHAPES[id])g.lineBetween(ox+a,oy+b,ox+c,oy+d);
 }
}
