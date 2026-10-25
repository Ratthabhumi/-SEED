import {createWeaponRig,weaponTransform} from '../../src/core/combat/weaponGeometry';
import {describe,it,expect} from "vitest";
import {HeroActions} from "../../src/game/render/heroActions";
declare const require:(id:string)=>any;
const {readFileSync}=require("fs");
describe("original hero atlas integration",()=>{
  it("four real RGBA atlases, 16 ×128px anchored cells and provenance files",()=>{
    for(const origin of ["hunters","engineers","resonant","sentinels"]){
      const b=readFileSync(`assets/seed/heroes/${origin}-v2.png`);
      expect(b.subarray(1,4).toString()).toBe("PNG");expect(b.readUInt32BE(16)).toBe(512);expect(b.readUInt32BE(20)).toBe(512);expect(b[25]).toBe(6);
      expect(readFileSync(`assets/original/heroes/${origin}-v2.png`).length).toBeGreaterThan(b.length);
    }
  });
  it("actual events drive priority poses; simulation time pauses and world resets",()=>{
    const a=new HeroActions();a.sync("parent");
    expect(a.pose(1,false,false,false)).toBe("idle");
    a.accept({type:"weapon_fired",family:"kinetic",x:0,y:0,tx:100,ty:0,release:{owner:"player-primary",time:1,pose:weaponTransform("hunters",0,0,0,createWeaponRig(),1),heading:0,index:0,count:1}},1,0,0);
    expect(a.pose(1.1,false,false,false)).toBe("attack");expect(a.pose(1.1,false,false,false)).toBe("attack");
    a.accept({type:"player_hurt",damage:3},1.1,0,0);expect(a.pose(1.1,true,false,false)).toBe("hurt");
    expect(a.pose(1.1,true,true,false)).toBe("dash");expect(a.pose(1.1,true,true,true)).toBe("death");
    a.sync("child");expect(a.pose(0,false,false,false)).toBe("idle");
    a.accept({type:"weapon_fired",family:"defense",x:80,y:0,tx:100,ty:0},0,0,0);
    expect(a.pose(0,false,false,false)).toBe("idle");
    a.accept({type:"weapon_fired",family:"field",x:0,y:0,tx:100,ty:0},0,0,0);
    expect(a.pose(0,false,false,false)).toBe("idle");
    a.accept({type:"ability_used",id:"test"},0,0,0);expect(a.pose(.2,false,false,false)).toBe("special");expect(a.pose(.4,true,false,false)).toBe("walk");
  });
});
