import type Phaser from "phaser";
/** Small floor contact, not a danger/selection ring. Bounded to hero, boss and
 * focused enemy: dense swarms do not add hundreds of new Graphics ellipses. */
export function groundContact(g:Phaser.GameObjects.Graphics,x:number,y:number,width:number){
  g.fillStyle(0x080b10,.16);g.fillEllipse(x,y,width,width*.27);
  g.fillStyle(0x080b10,.28);g.fillEllipse(x,y,width*.65,width*.14);
}
