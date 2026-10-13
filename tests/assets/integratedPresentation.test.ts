import {describe,it,expect} from "vitest";
import {biomeWeights,mirroredTexel} from "../../src/game/render/terrainBlend";
import {combatPresentation,gameZoom,WORLD_SCALE,enemyArtSize} from "../../src/game/render/combatPresentation";
import {ActorRenderer} from "../../src/game/render/ActorRenderer";
describe("integrated presentation contracts",()=>{
  it("biome transitions form a continuous partition, including negative coordinates and four-biome corners",()=>{
    const at=(x:number,y:number)=>x<0?(y<0?"verdant":"arid"):(y<0?"tundra":"badlands");
    expect(biomeWeights(0,0,at)).toEqual({verdant:.25,arid:.25,tundra:.25,badlands:.25});
    for(const x of [-513,-512,-1,0,511,512,513]){
      const a=biomeWeights(x-1e-5,123,at),b=biomeWeights(x+1e-5,123,at);
      expect(Object.values(a).reduce((s,w)=>s+w,0)).toBeCloseTo(1);
      for(const id of ["verdant","arid","tundra","badlands"] as const)expect(Math.abs(a[id]-b[id])).toBeLessThan(1e-6);
    }
    for(const edge of [-512,0,512,1024])expect(mirroredTexel(edge-1)).toBe(mirroredTexel(edge));
  });
  it("four Origins resolve genuine distinct family geometries and six visible equipment materials",()=>{
    expect(combatPresentation("hunters","kinetic",0).shape).toBe("arrow");
    expect(combatPresentation("engineers","kinetic",0).shape).toBe("mechanical");
    expect(combatPresentation("resonant","energy",3).shape).toBe("fork");
    expect(combatPresentation("sentinels","energy",3).shape).toBe("prism");
    expect(new Set(Array.from({length:6},(_,age)=>combatPresentation("engineers","kinetic",age).material)).size).toBe(6);
    expect(WORLD_SCALE.squad).toBeLessThan(WORLD_SCALE.hero);expect(WORLD_SCALE.outpost1).toBeGreaterThan(WORLD_SCALE.hero);
    expect(enemyArtSize("tank",14,true,false)).toBeGreaterThan(enemyArtSize("tank",14,false,false));
    expect(gameZoom(720)).toBe(1);expect(gameZoom(1272)).toBe(1.25);
  });
  it("idle pool reuse avoids redundant texture/size/tint work but moving pose reapplies pivot",()=>{
    const calls:Record<string,number>={},image:any={};
    for(const key of ["setDepth","setTexture","setDisplaySize","setOrigin","setTint","setPosition","setRotation","setFlipX","setVisible"])
      image[key]=()=>{calls[key]=(calls[key]??0)+1;return image;};
    const renderer=new ActorRenderer({add:{image:()=>image}} as any,1,4);
    const pose={heading:0,moving:false,flip:false,back:false};
    for(let i=0;i<60;i++){renderer.begin();renderer.draw("hunters",i,0,112,0,i/60,false,0xffffff,0,pose,"idle");renderer.end();}
    expect(calls.setTexture).toBe(1);expect(calls.setDisplaySize).toBe(1);expect(calls.setOrigin).toBe(1);expect(calls.setTint).toBe(1);
    renderer.begin();renderer.draw("hunters",60,0,112,0,1,true,0xffffff,0,pose,"walk");
    expect(calls.setTexture).toBe(2);expect(calls.setOrigin).toBe(2);
  });
});
