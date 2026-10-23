import type Phaser from "phaser";
import {combatPresentation} from "./combatPresentation";
import type {RunState} from "../../core/sim/RunState";
import {activeFamilies} from "../../core/progression/origins";
import {NOVA_RADIUS,BULWARK_IFRAME} from "../../core/combat/squad";
import type {WeaponFamily} from "../../core/combat/weapons";
import {equipmentFrame} from "./combatSpriteIdentity";
import {equipmentPose,playerRelease} from "./weaponPose";
import type {SimEvent} from "../../core/sim/SimEvent";
/** Original equipment rig. Posed bodies remain original atlases, no fake attacks. */
export class HeroEquipment {
  private socketX=0;private socketY=-16;
  socket(x:number,y:number){this.socketX=x;this.socketY=y;}
  private weapon?:Phaser.GameObjects.Image;
  constructor(private scene?:Phaser.Scene,private mount:"hand"|"float"="hand"){}
  setMount(mode:"hand"|"float"){this.mount=mode;}
  review(){return this.weapon&&this.weapon.visible?{texture:this.weapon.texture.key,frame:this.weapon.frame.name,width:this.weapon.displayWidth,rotation:this.weapon.rotation,flipY:this.weapon.flipY,x:this.weapon.x,y:this.weapon.y,grip:[this.weapon.originX,this.weapon.originY],socket:[this.socketX,this.socketY]}:null;}
  private world="";private released=-Infinity;private aim=0;
  private releasedFamily:WeaponFamily="kinetic";
  private ability="";private abilityAt=-Infinity;private abilityX=0;private abilityY=0;
  accept(event:SimEvent,world:string,time:number,x:number,y:number){
    const shot=playerRelease(event,x,y);
    if(shot)this.fire(world,time,shot.x,shot.y,shot.tx,shot.ty,shot.family);
  }
  reset(world:string){this.world=world;this.released=-Infinity;this.abilityAt=-Infinity;}
  activate(world:string,time:number,id:string,x:number,y:number){if(this.world!==world)this.reset(world);this.ability=id;this.abilityAt=time;this.abilityX=x;this.abilityY=y;}
  fire(world:string,time:number,x:number,y:number,tx:number,ty:number,family:WeaponFamily){
    if(family!=="kinetic"&&family!=="energy")return;
    if(this.world!==world)this.reset(world);this.released=time;this.aim=Math.atan2(ty-y,tx-x);this.releasedFamily=family;
  }
  draw(g:Phaser.GameObjects.Graphics,s:RunState,facing:number,reduced:boolean,highContrast=false){
    if(this.world!==s.worldNonce)this.reset(s.worldNonce);
    const enabled=activeFamilies(s.originId,s.expansionFamily);
    // Field traps and autonomous Defense units are separate world objects,
    // never a second handheld weapon substituted into the primary mount.
    const handheld=this.releasedFamily==="kinetic"||this.releasedFamily==="energy";
    const family=s.elapsed-this.released<.16&&handheld&&enabled.includes(this.releasedFamily)?this.releasedFamily:enabled[0]!;
    const art=combatPresentation(s.originId,family,s.weaponStage[family]);
    const fresh=Math.min(1,Math.max(0,1-(s.elapsed-this.released)/.16)),ang=fresh?this.aim:facing;
    const nx=Math.cos(ang),ny=Math.sin(ang),px=-ny,py=nx;
    // Float is a shoulder companion, not a carousel crossing the hero every
    // revolution. Small canonical-time hover stops in Reduced Effects.
    const hover=reduced?0:Math.sin(s.elapsed*2)*2;
    const row=Math.floor(equipmentFrame(s.originId,s.weaponStage[family])/6);
    const pose=equipmentPose(ang,s.elapsed-this.released);
    const x=s.px+(this.mount==="float"?46:this.socketX)-nx*pose.recoil,y=s.py+(this.mount==="float"?-30+hover:this.socketY)-ny*pose.recoil,len=art.weaponLength;
    if(this.mount==="float"){
      // A visible tether anchors this cosmetic mount to the unchanged canonical
      // emitter. Never move projectile origins or imply a second weapon hitbox.
      g.lineStyle(1,highContrast?0xffffff:art.color,.5);g.lineBetween(s.px,s.py,x,y);
      g.lineStyle(2,art.color,.7);g.strokeCircle(s.px,s.py,3);
    }
    if(this.scene&&!highContrast){
      const frame=equipmentFrame(s.originId,s.weaponStage[family]);
      if(!this.weapon)this.weapon=this.scene.add.image(0,0,"combat-equipment",frame).setDepth(5);
      if(this.weapon.frame.name!==String(frame))this.weapon.setTexture("combat-equipment",frame);
      // Original source grips, normalized to each 128px cell. The grip sits on
      // the body's posed hand instead of placing the texture center 27u away.
      const col=frame%6;
      const grip=row===0?(col<3?[92,64]:[43,74]):row===1?[49,93]:row===2?[30,64]:[63,67];
      // Phaser flips around the frame center: reflect the origin too, keeping
      // the same authored grip pixel at the hand in either direction.
      this.weapon.setOrigin(grip[0]!/128,pose.flipY?1-grip[1]!/128:grip[1]!/128).setPosition(x,y).setDisplaySize(56+art.stage*2,56+art.stage*2).setRotation(pose.rotation).setFlipY(pose.flipY).setVisible(!s.over);
    }else{
    this.weapon?.setVisible(false);
    // Age equipment: collar/material, physical braces and energy conduits.
    g.lineStyle(3,0x0b1218,1);g.lineBetween(s.px-12,s.py-17,s.px+12,s.py-17);
    g.lineStyle(2,art.material,1);g.lineBetween(s.px-12,s.py-18,s.px+12,s.py-18);
    for(const side of [-1,1]){
      g.fillStyle(0x172027,1);g.fillRoundedRect(s.px+side*(14+art.stage)-6,s.py-22,12,9,2);
      g.lineStyle(2,art.material,1);g.strokeRoundedRect(s.px+side*(14+art.stage)-6,s.py-22,12,9,2);
      if(art.stage>=3){g.lineStyle(2,art.color,1);g.lineBetween(s.px+side*18,s.py-12,s.px+side*22,s.py+2);}
    }
    if(art.shape==="arrow"){
      g.lineStyle(6,0x0b1218,1);g.lineBetween(x-px*17,y-py*17,x+px*17,y+py*17);
      g.lineStyle(3,art.material,1);g.lineBetween(x-px*17,y-py*17,x+px*17,y+py*17);
      g.lineStyle(1,art.color,1);g.lineBetween(x-px*17,y-py*17,x-nx*8,y-ny*8);g.lineBetween(x+px*17,y+py*17,x-nx*8,y-ny*8);
    }else if(art.shape==="fork"){
      g.lineStyle(6,0x0b1218,1);g.lineBetween(x-nx*10,y-ny*10,x+nx*len,y+ny*len);
      g.lineStyle(3,art.material,1);g.lineBetween(x-nx*10,y-ny*10,x+nx*len,y+ny*len);
      for(const side of [-1,1]){g.lineStyle(3,art.color,1);g.lineBetween(x+nx*(len-8),y+ny*(len-8),x+nx*len+px*9*side,y+ny*len+py*9*side);}
      g.fillStyle(art.color,1);g.fillTriangle(x+nx*(len+5),y+ny*(len+5),x+nx*len+px*4,y+ny*len+py*4,x+nx*len-px*4,y+ny*len-py*4);
    }else if(art.shape==="prism"){
      g.fillStyle(0x172027,1);g.fillTriangle(x+nx*len,y+ny*len,x+px*12,y+py*12,x-px*12,y-py*12);
      g.lineStyle(3,art.material,1);g.strokeTriangle(x+nx*len,y+ny*len,x+px*12,y+py*12,x-px*12,y-py*12);
      g.lineStyle(2,art.color,1);g.lineBetween(x,y,x+nx*len,y+ny*len);
    }else{
      g.lineStyle(8,0x0b1218,1);g.lineBetween(x,y,x+nx*len,y+ny*len);
      g.lineStyle(5,art.material,1);g.lineBetween(x,y,x+nx*len,y+ny*len);
      g.lineStyle(2,art.color,1);g.lineBetween(x+px*4,y+py*4,x+nx*len+px*4,y+ny*len+py*4);
      const ribs=2+Math.min(3,art.stage);for(let i=0;i<ribs;i++){const d=4+i*4;g.lineStyle(2,0x172027,1);g.lineBetween(x+nx*d-px*4,y+ny*d-py*4,x+nx*d+px*4,y+ny*d+py*4);}
    }
    }
    if(fresh&&!reduced){g.lineStyle(2,art.color,fresh);g.lineBetween(x+nx*len,y+ny*len,x+nx*(len+9*fresh),y+ny*(len+9*fresh));}
    const age=s.elapsed-this.abilityAt;
    if(this.ability==="nova"&&age<.35){
      const fade=1-age/.35,r=NOVA_RADIUS*(.25+.75*age/.35);
      g.lineStyle(reduced?2:3,art.color,fade);
      for(let i=0;i<6;i++){const a=i*Math.PI/3,ax=this.abilityX+Math.cos(a)*r,ay=this.abilityY+Math.sin(a)*r;
        g.lineBetween(this.abilityX+Math.cos(a+.15)*r*.65,this.abilityY+Math.sin(a+.15)*r*.65,ax,ay);
        g.lineBetween(ax,ay,this.abilityX+Math.cos(a+.28)*r*.82,this.abilityY+Math.sin(a+.28)*r*.82);}
    }
    if(s.overdriveT>0&&!reduced){g.lineStyle(2,art.color,.8);for(const side of [-1,1])g.strokeRect(s.px+side*22-5,s.py-17,10,16);}
    if(this.ability==="bulwark"&&age<BULWARK_IFRAME&&s.iframe>0){
      g.lineStyle(3,art.color,.85);for(let i=0;i<6;i++){const a=i*Math.PI/3,b=a+.75;g.lineBetween(s.px+Math.cos(a)*43,s.py+Math.sin(a)*43,s.px+Math.cos(b)*43,s.py+Math.sin(b)*43);}
    }
  }
}
