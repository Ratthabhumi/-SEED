import type Phaser from "phaser";
import { phaserColors } from "../../theme/tokens";
/** Original open-codex grammar shared by pickup and HUD; code-native MIT artwork. */
export const KNOWLEDGE_ICON = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#85ECFF" stroke="#0B1218" stroke-width="2" d="M12 6 3 3v15l9 3 9-3V3z"/><path fill="none" stroke="#F3EFE5" stroke-width="1.5" d="M12 6v15M5 7l5 2M5 11l5 2M14 9l5-2M14 13l5-2"/></svg>');
export function drawKnowledgeCodex(g: Phaser.GameObjects.Graphics,x:number,y:number,r:number):void {
  g.lineStyle(3,phaserColors.canvas,1);g.fillStyle(phaserColors.research,1);
  g.fillTriangle(x,y-r*.6,x-r,y-r,x-r,y+r*.65);g.fillTriangle(x,y-r*.6,x-r,y+r*.65,x,y+r);
  g.fillTriangle(x,y-r*.6,x+r,y-r,x+r,y+r*.65);g.fillTriangle(x,y-r*.6,x+r,y+r*.65,x,y+r);
  g.lineBetween(x-r,y-r,x-r,y+r*.65);g.lineBetween(x+r,y-r,x+r,y+r*.65);
  g.lineStyle(1.5,phaserColors.text,1);g.lineBetween(x,y-r*.6,x,y+r);
  for(const offset of [-.2,.25]){
    g.lineBetween(x-r*.7,y+r*offset,x-r*.25,y+r*(offset+.15));
    g.lineBetween(x+r*.7,y+r*offset,x+r*.25,y+r*(offset+.15));
  }
}
