import type Phaser from "phaser";
import type { OutpostSpec } from "../../core/world/territory";
import { phaserColors as c } from "../../theme/tokens";

export interface OutpostVisualState {
  spec: OutpostSpec | ""; ageIndex: number; tier: 1|2; disabled: boolean; repairing?: boolean;
}
const materials=[c.secondary,c.action,c.secondary,c.disabled,c.research,c.friendly] as const;
const eraKits=["timber","bronze-frame","riveted","pipework","antenna","conduit-grid"] as const;
export function outpostVisual(a:OutpostVisualState) {
  return { silhouette:a.spec==="research"?"observatory":a.spec==="military"?"bastion":a.spec==="economy"?"workshop":"claim-pad",
    material:materials[Math.max(0,Math.min(5,Math.floor(a.ageIndex)))]!,
    eraKit:eraKits[Math.max(0,Math.min(5,Math.floor(a.ageIndex)))]!,
    condition:a.disabled?(a.repairing?"repairing":"damaged"):"active",annex:a.tier===2 } as const;
}
/** Original code-native architecture, cached with ground. No guns, production or collision implied. */
export function drawSpecializedOutpost(g:Phaser.GameObjects.Graphics,a:OutpostVisualState & {x:number;y:number}):void {
  const v=outpostVisual(a),x=a.x,y=a.y,alpha=a.disabled?.65:1;
  if(v.silhouette==="claim-pad"){
    // Owned land is not an operational factory/fort before a specialization is chosen.
    g.fillStyle(c.canvas,.65);g.fillEllipse(x,y+5,58,20);
    g.lineStyle(2,c.secondary,.8);g.strokeRect(x-20,y-16,40,32);
    for(const side of [-1,1]){g.lineBetween(x+side*24,y-12,x+side*24,y+12);}
    g.lineStyle(1,c.action,.8);g.strokeCircle(x,y,5);
    return;
  }
  const metal=a.disabled?c.disabled:v.material,light=a.disabled?c.disabled:c.friendly;
  g.fillStyle(c.canvas,.8);g.fillEllipse(x,y+22,86,34);
  g.fillStyle(c.raised,alpha);g.fillRect(x-30,y-20,60,42);
  g.lineStyle(2,metal,alpha);g.strokeRect(x-30,y-20,60,42);
  if(v.silhouette==="observatory"){
    g.fillStyle(metal,alpha);g.fillEllipse(x,y-18,44,30);
    g.fillStyle(c.surface,alpha);g.fillRect(x-22,y-16,44,20);
    g.lineStyle(2,light,alpha);g.strokeCircle(x,y-16,11);
    g.lineStyle(3,metal,alpha);g.lineBetween(x-7,y-10,x+16,y-30);
    g.fillStyle(light,alpha);g.fillCircle(x+16,y-30,4);
    g.lineStyle(1,c.secondary,alpha);g.lineBetween(x-18,y+8,x+18,y+8);
    g.fillStyle(light,alpha);g.fillRect(x-15,y+12,10,3);g.fillRect(x+5,y+12,10,3);
  }else if(v.silhouette==="bastion"){
    g.fillStyle(metal,alpha);g.fillRect(x-30,y-26,14,48);g.fillRect(x+16,y-26,14,48);
    for(const side of [-1,1])for(let i=0;i<3;i++)g.fillRect(x+side*23-6+i*4,y-33,3,9);
    g.fillStyle(c.canvas,alpha);g.fillRect(x-10,y-5,20,27);
    g.lineStyle(2,metal,alpha);g.lineBetween(x-10,y-5,x+10,y-5);
    g.lineBetween(x,y-20,x,y-45);g.fillStyle(c.action,alpha);g.fillTriangle(x,y-44,x+18,y-38,x,y-32);
    g.lineStyle(1,c.secondary,alpha);g.lineBetween(x-28,y+7,x-18,y+7);g.lineBetween(x+18,y+7,x+28,y+7);
  }else if(v.silhouette==="workshop"){
    g.fillStyle(metal,alpha);g.fillTriangle(x-34,y-14,x+24,y-14,x-8,y-36);
    g.fillStyle(c.surface,alpha);g.fillRect(x-23,y-12,43,25);
    g.fillStyle(c.action,alpha);g.fillRect(x-18,y-5,9,8);g.fillRect(x-4,y-5,9,8);
    g.fillStyle(metal,alpha);g.fillRect(x+16,y-37,7,24);
    g.fillStyle(c.raised,alpha);g.fillRect(x+18,y+5,18,17);
    g.lineStyle(2,metal,alpha);g.strokeRect(x+18,y+5,18,17);g.lineBetween(x+18,y+5,x+36,y+22);
    g.lineStyle(2,light,alpha);g.lineBetween(x-20,y+19,x+12,y+19);
  }
  if(v.annex){
    g.fillStyle(c.surface,alpha);g.fillRect(x-43,y-6,12,23);
    g.lineStyle(2,c.action,alpha);g.strokeRect(x-43,y-6,12,23);
    g.fillStyle(metal,alpha);g.fillRect(x-40,y-3,6,4);g.fillRect(x-40,y+5,6,4);
  }
  // Equipment changes geometry across Ages while preserving specialization silhouette.
  g.lineStyle(2,metal,alpha);
  if(v.eraKit==="timber"){
    for(const side of [-1,1])g.lineBetween(x+side*28,y-20,x+side*28,y+20);
  }else if(v.eraKit==="bronze-frame"){
    g.strokeRect(x-26,y+10,52,9);
  }else if(v.eraKit==="riveted"){
    g.fillStyle(metal,alpha);for(const side of [-1,1])for(let i=0;i<3;i++)g.fillCircle(x+side*27,y-14+i*12,2);
  }else if(v.eraKit==="pipework"){
    g.lineBetween(x-32,y-16,x-38,y-16);g.lineBetween(x-38,y-16,x-38,y+24);g.lineBetween(x-38,y+24,x-16,y+24);
  }else if(v.eraKit==="antenna"){
    g.lineBetween(x+28,y-20,x+28,y-42);g.lineBetween(x+23,y-37,x+33,y-37);
  }else{
    for(const side of [-1,1]){g.strokeRect(x+side*35-5,y-20,10,8);g.lineBetween(x+side*35,y-12,x+side*35,y+22);}
  }
  if(a.ageIndex>=4 && !a.disabled){g.lineStyle(1,light,.65);g.lineBetween(x-26,y+25,x+26,y+25);}
  if(a.disabled){
    g.lineStyle(3,c.canvas,1);g.lineBetween(x-15,y-20,x-3,y-5);g.lineBetween(x-3,y-5,x-11,y+3);g.lineBetween(x-11,y+3,x+5,y+16);
    g.fillStyle(c.disabled,.8);g.fillRect(x+20,y+26,8,4);g.fillRect(x-23,y+26,11,3);
    if(v.condition==="repairing"){g.lineStyle(2,c.repairing,.8);g.lineBetween(x-36,y+31,x+36,y+31);}
  }
}
