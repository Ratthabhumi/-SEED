import {it,expect} from "vitest";
import {equipmentPose,playerRelease,floatingWeaponPosition} from "../../src/game/render/weaponPose";
import {HeroActions} from "../../src/game/render/heroActions";

it("tracks the actual beam and projectile direction, excluding autonomous sources",()=>{
 const actions=new HeroActions();actions.sync("parent");
 const shot={type:"beam_fired" as const,family:"energy" as const,tier:4,x1:10,y1:20,x2:-90,y2:20};
 expect(playerRelease(shot,10,20)?.heading).toBe(Math.PI);
 actions.accept(shot,5,10,20);
 expect(actions.facing(5.1)).toBe(Math.PI);expect(actions.facing(5.1)).toBe(Math.PI);
 expect(actions.facing(5.2)).toBeUndefined();
 actions.sync("child");expect(actions.facing(0)).toBeUndefined();
 expect(playerRelease({...shot,x1:100},10,20)).toBeUndefined();
 expect(playerRelease({type:"weapon_fired",family:"defense",x:10,y:20,tx:-90,ty:20},10,20)).toBeUndefined();
 expect(playerRelease({type:"weapon_fired",family:"field",x:10,y:20,tx:-90,ty:20},10,20)).toBeUndefined();
});

it("maps painted source axes to aim in every quadrant without an inverted left grip",()=>{
 for(const aim of [0,.8,Math.PI,-2.4]){
  const p=equipmentPose(aim,.08);
  expect(p.rotation).toBeCloseTo(aim);expect(p.flipY).toBe(Math.cos(aim)<0);
  expect(p.recoil).toBe(.5);
 }
 expect(equipmentPose(0,.16).recoil).toBe(0);expect(equipmentPose(0,Infinity).recoil).toBe(0);
});

it("keeps the floating primary outside the hero and freezes it with canonical pause/reduced effects",()=>{
 for(let t=0;t<20;t+=.1){
  const p=floatingWeaponPosition(t,false);
  expect(Math.hypot(p.x,p.y)).toBeGreaterThanOrEqual(99.9);
  expect(Math.hypot(p.x,p.y)).toBeLessThan(130);
 }
 expect(floatingWeaponPosition(5,false)).toEqual(floatingWeaponPosition(5,false));
 expect(floatingWeaponPosition(5,false)).not.toEqual(floatingWeaponPosition(6,false));
 expect(floatingWeaponPosition(5,true)).toEqual(floatingWeaponPosition(60,true));
});
