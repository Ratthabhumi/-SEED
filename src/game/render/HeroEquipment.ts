import type Phaser from "phaser";
import {combatPresentation} from "./combatPresentation";
import type {RunState} from "../../core/sim/RunState";
import {activeFamilies} from "../../core/progression/origins";
import {NOVA_RADIUS,BULWARK_IFRAME} from "../../core/combat/squad";
import type {WeaponFamily} from "../../core/combat/weapons";
import {primaryTier,weaponTransform} from "../../core/combat/weaponGeometry";
import {playerRelease} from "./weaponPose";
import type {SimEvent} from "../../core/sim/SimEvent";
/** Original equipment art, posed from the canonical simulation release rig. */
export class HeroEquipment {
  private socketX=0;private socketY=-16;
  socket(x:number,y:number){this.socketX=x;this.socketY=y;}
  private lastPose?:ReturnType<typeof weaponTransform>;
  private debug=false;
  private lastRelease?:Extract<SimEvent,{type:'weapon_fired'|'beam_fired'}>;
  reviewOverlay(enabled:boolean){this.debug=enabled;}
  releaseReview(){return this.lastRelease;}
  private weapon?:Phaser.GameObjects.Image;
  constructor(private scene?:Phaser.Scene,private mount:"hand"|"float"="float"){}

  review(){return this.weapon&&this.weapon.visible?{mount:this.mount,pose:this.lastPose,release:this.lastRelease,texture:this.weapon.texture.key,frame:this.weapon.frame.name,width:this.weapon.displayWidth,rotation:this.weapon.rotation,flipY:this.weapon.flipY,x:this.weapon.x,y:this.weapon.y,grip:[this.weapon.originX,this.weapon.originY],socket:[this.socketX,this.socketY]}:null;}
  private world="";private released=-Infinity;
  private releasedFamily:WeaponFamily="kinetic";
  private ability="";private abilityAt=-Infinity;private abilityX=0;private abilityY=0;
  accept(event:SimEvent,world:string,time:number,x:number,y:number){
    const shot=playerRelease(event,x,y);
    if(shot){this.fire(world,time,shot.x,shot.y,shot.tx,shot.ty,shot.family);this.lastRelease=event as typeof this.lastRelease;}
  }
  reset(world:string){this.world=world;this.released=-Infinity;this.abilityAt=-Infinity;this.lastRelease=undefined;}
  activate(world:string,time:number,id:string,x:number,y:number){if(this.world!==world)this.reset(world);this.ability=id;this.abilityAt=time;this.abilityX=x;this.abilityY=y;}
  fire(world:string,time:number,x:number,y:number,tx:number,ty:number,family:WeaponFamily){
    if(family!=="kinetic"&&family!=="energy")return;
    if(this.world!==world)this.reset(world);this.released=time;this.releasedFamily=family;
  }
  draw(g:Phaser.GameObjects.Graphics,s:RunState,_facing:number,reduced:boolean,highContrast=false){
    if(this.world!==s.worldNonce)this.reset(s.worldNonce);
    const enabled=activeFamilies(s.originId,s.expansionFamily);
    // Field traps and autonomous Defense units are separate world objects,
    // never a second handheld weapon substituted into the primary mount.
    const handheld=this.releasedFamily==="kinetic"||this.releasedFamily==="energy";
    const family=s.elapsed-this.released<.16&&handheld&&enabled.includes(this.releasedFamily)?this.releasedFamily:enabled[0]!;
    const art=combatPresentation(s.originId,family,s.weaponStage[family]);
    this.mount=s.weaponRig.mode;
    const pose=weaponTransform(s.originId,primaryTier(s.originId,s.weaponStage),s.px,s.py,s.weaponRig,s.elapsed);
    this.lastPose=pose;
    const fresh=Math.min(1,Math.max(0,1-(s.elapsed-this.released)/.16)),ang=pose.heading;
    const nx=Math.cos(ang),ny=Math.sin(ang),px=-ny,py=nx,len=art.weaponLength;
    const x=pose.muzzleX-nx*len,y=pose.muzzleY-ny*len;
    if(this.scene&&!highContrast){
      const frame=pose.frame;
      if(!this.weapon)this.weapon=this.scene.add.image(0,0,"combat-equipment",frame).setDepth(5);
      if(this.weapon.frame.name!==String(frame))this.weapon.setTexture("combat-equipment",frame);
      this.weapon.setOrigin(pose.pivotX/128,pose.flipY?1-pose.pivotY/128:pose.pivotY/128)
        .setPosition(pose.x,pose.y).setDisplaySize(pose.scale*128,pose.scale*128)
        .setRotation(pose.rotation).setFlipY(pose.flipY).setVisible(!s.over);
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
      g.lineStyle(2,art.color,1);g.lineBetween(x-nx*8,y-ny*8,pose.muzzleX,pose.muzzleY);
      g.fillStyle(art.color,1);g.fillTriangle(pose.muzzleX,pose.muzzleY,pose.muzzleX-nx*6+px*3,pose.muzzleY-ny*6+py*3,pose.muzzleX-nx*6-px*3,pose.muzzleY-ny*6-py*3);
    }else if(art.shape==="fork"){
      g.lineStyle(6,0x0b1218,1);g.lineBetween(x-nx*10,y-ny*10,x+nx*len,y+ny*len);
      g.lineStyle(3,art.material,1);g.lineBetween(x-nx*10,y-ny*10,x+nx*len,y+ny*len);
      for(const side of [-1,1]){g.lineStyle(3,art.color,1);g.lineBetween(x+nx*(len-8),y+ny*(len-8),x+nx*len+px*9*side,y+ny*len+py*9*side);}
      g.fillStyle(art.color,1);g.fillTriangle(pose.muzzleX,pose.muzzleY,x+nx*(len-5)+px*4,y+ny*(len-5)+py*4,x+nx*(len-5)-px*4,y+ny*(len-5)-py*4);
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
    if(this.debug){
      for(const [cx,cy,color] of [[s.px,s.py,0xffffff],[pose.x,pose.y,0x00ffff],[pose.muzzleX,pose.muzzleY,0xffff00]]){g.lineStyle(2,color,1);g.strokeCircle(cx!,cy!,5);}
      const e=this.lastRelease;
      if(e?.release){const birth=e.release.pose,p=s.projs[e.release.projectileIndex??-1];
        g.lineStyle(2,0xff00ff,1);g.strokeCircle(birth.muzzleX,birth.muzzleY,4);
        if(e.release.targetX!==undefined&&e.release.targetY!==undefined){g.lineStyle(2,0xff5555,1);g.strokeCircle(e.release.targetX,e.release.targetY,6);}
        if(p?.active){g.lineStyle(2,0x00ff00,1);g.strokeCircle(p.x,p.y,5);g.lineBetween(birth.muzzleX,birth.muzzleY,p.x,p.y);}
      }
    }
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
