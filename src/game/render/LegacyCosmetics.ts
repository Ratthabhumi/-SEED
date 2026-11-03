import type Phaser from 'phaser';
import type {LegacyCollection} from '../../core/progression/legacyCollection';
/** Bounded geometric presentation beside genuine painted actors, not new anatomy. */
export function drawLegacyCosmetics(g:Phaser.GameObjects.Graphics,c:LegacyCollection,x:number,y:number,age:number,hc:boolean):void {
 const r=27+age*2,color=hc?0xffffff:age>=4?0x80d9ff:age>=2?0x62e5cc:0xffd36b;
 // Six discrete age markers; presentation never changes the hit radius.
 g.lineStyle(2,color,.75);for(let i=0;i<=age;i++){const a=Math.PI*.65+i*Math.PI*.34;g.lineBetween(x+Math.cos(a)*r,y+Math.sin(a)*r,x+Math.cos(a)*(r+5),y+Math.sin(a)*(r+5));}
 if(c.equipped.emblem){g.lineStyle(2,c.equipped.emblem==='ward'?0x62e5cc:0xffd36b,1);g.strokeCircle(x-25,y-26,7);g.lineBetween(x-29,y-26,x-21,y-26);g.lineBetween(x-25,y-30,x-25,y-22);}
 if(c.equipped.ornament){g.lineStyle(2,c.equipped.ornament==='star'?0x80d9ff:0xffd36b,1);g.strokeTriangle(x,y-45,x-9,y-32,x+9,y-32);}
}
