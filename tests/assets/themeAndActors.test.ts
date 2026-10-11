import {describe,it,expect} from "vitest";
import {colors} from "../../src/theme/tokens";
import {ACTOR_ASSETS,actorFor} from "../../src/game/assets/actorAssets";
import {ORIGINS} from "../../src/core/progression/origins";
import {drawPlayer} from "../../src/game/render/PlayerRenderer";
import {drawEnemy} from "../../src/game/render/EnemyRenderer";
declare const require:(name:string)=>any; const fs=require("fs");
const lum=(hex:string)=> { const rgb=hex.slice(1).match(/../g)!.map(c=>parseInt(c,16)/255).map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4);return rgb[0]!*0.2126+rgb[1]!*0.7152+rgb[2]!*0.0722; };
describe("shared presentation contracts",()=>{
 it("generated CSS agrees with typed canonical palette",()=>{const css=fs.readFileSync("src/styles/tokens.css","utf8");for(const [key,value] of Object.entries(colors))expect(css).toContain("--color-"+key+": "+value+";");});
 it("standard text and meaningful status text meet contrast on both surfaces",()=>{for(const bg of [colors.canvas,colors.surface,colors.raised])for(const fg of [colors.text,colors.secondary,colors.disabled,colors.friendly,colors.hostile,colors.action,colors.research,colors.legacy])expect((Math.max(lum(fg),lum(bg))+0.05)/(Math.min(lum(fg),lum(bg))+0.05)).toBeGreaterThanOrEqual(4.5);});
 it("covers actual Origins and runtime enemy families plus guardians",()=>{expect(Object.keys(ACTOR_ASSETS).sort()).toEqual(["hunters","engineers","resonant","sentinels","chaser","ranged","tank","swarm","boss","guardian"].sort());for(const o of ORIGINS)expect(actorFor(o.id)).toBe(o.id);for(const id of Object.keys(ACTOR_ASSETS)){const svg=fs.readFileSync("assets/seed/actors/"+id+".svg","utf8");expect(svg).toContain('width="1152"');expect(svg.match(/<g transform=/g)).toHaveLength(18);}});
 it("production sprite mode omits player and ordinary enemy body graphics",()=>{
  const calls:string[]=[];const graphics:any=new Proxy({}, {get:(_target,key)=> (..._args:unknown[])=>{calls.push(String(key));return graphics;}});
  drawPlayer(graphics,0,0,16,{spriteBody:true,facing:0,dashing:false,iframe:false,hurtFlash:false,time:0,highContrast:false,originId:"hunters",ageIndex:5});
  drawEnemy(graphics,{active:true,x:0,y:0,hp:100,maxHp:100,shield:0,family:"chaser",speed:1,dmg:1,radius:14,xp:1,elite:false,affix:"",flash:0,shootT:5,boss:false,hitCd:0,siege:false},{spriteBody:true,bodyColor:0xffffff,facing:0,time:0,highContrast:false,hpBar:false,ageIndex:5});
  expect(calls).toEqual([]);
 });
});
