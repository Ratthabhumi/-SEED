import {it,expect} from 'vitest';
declare const require:(id:string)=>any;
const fs=require('node:fs');
import {ActorRenderer} from '../../src/game/render/ActorRenderer';
it('preserves source detail in the actual six-age hero atlas at native256px cells',()=>{
 const b=fs.readFileSync('assets/seed/content15/heroes-neutral-v1.png');expect(b.readUInt32BE(16)).toBe(1536);expect(b.readUInt32BE(20)).toBe(2048);
});
it('registers48 actual hero frame rectangles from atlas cell size without changing frame identities',()=>{
 const frames:any[]=[];const scene:any={textures:{exists:()=>true,get:(key:string)=>({getSourceImage:()=>({width:key==='hero-neutral'?1536:512}),has:()=>key!=='hero-neutral',add:(...args:any[])=>frames.push([key,...args])})},anims:{exists:()=>true}};
 ActorRenderer.frames(scene);expect(frames).toHaveLength(48);expect(frames[0].slice(1)).toEqual([0,0,0,0,256,256]);expect(frames[frames.length-1].slice(1)).toEqual([47,0,1280,1792,256,256]);
});
