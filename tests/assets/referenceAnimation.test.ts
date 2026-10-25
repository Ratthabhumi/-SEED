import {describe,it,expect} from "vitest";
import {ReferenceAnimation} from "../../src/game/render/ReferenceAnimation";
import authored from "../../src/game/assets/hunters-reference-v1.json";
declare const require:(id:string)=>any;
const {createHash}=require("node:crypto");
const {readFileSync}=require("node:fs");
const metadata={clips:{idle:{columns:[0],frameMs:1000,loop:true},walk:{columns:[1,2],frameMs:125,loop:true},attack:{columns:[3,4],frameMs:80,loop:false},death:{columns:[8],frameMs:1000,loop:false}},frames:Array.from({length:36},(_,frame)=>({frame,socket:[64,65]}))};
describe("reference motion clock",()=>{
 it("retains36 distinct authored source poses, locked feet/collision and source provenance",()=>{
  expect(authored.frameCount).toBe(36);
  expect(new Set(authored.frames.map(f=>f.sourcePoseHash)).size).toBe(36);
  const source=readFileSync('assets/original/content15-animation/hunters-reference-v1.png');
  expect(createHash('sha256').update(source).digest('hex')).toBe(authored.sourceSha256);
  for(const f of authored.frames){
   expect(f.ground).toEqual([64,116]);expect(f.collisionAnchor).toEqual([64,83.2]);
   expect(f.bounds[0]).toBeGreaterThanOrEqual(0);expect(f.bounds[1]).toBeGreaterThanOrEqual(0);
   expect(f.bounds[0]!+f.bounds[2]!).toBeLessThanOrEqual(128);
   expect(f.bounds[1]!+f.bounds[3]!).toBe(116);
   expect(f.socket.every(n=>n>=0&&n<=128)).toBe(true);
  }
 });
 it("advances distinct walk/attack frames, freezes with sim time, clamps non-loop clips",()=>{
  const a=new ReferenceAnimation(metadata);
  expect(a.sample(0,false,'walk',1).frame).toBe(1);
  expect(a.sample(0,false,'walk',1.13).frame).toBe(2);
  expect(a.sample(0,false,'walk',1.13).frame).toBe(2);
  expect(a.sample(0,false,'attack',2).frame).toBe(3);
  expect(a.sample(0,false,'attack',2.09).frame).toBe(4);
  expect(a.sample(0,false,'attack',20).frame).toBe(4);
  expect(a.sample(0,false,'attack',20.01,1).frame).toBe(3);
 });
 it("resets across clock rewind/age/facing, keeps feet and collision separate",()=>{
  const a=new ReferenceAnimation(metadata);a.sample(0,false,'walk',10);
  expect(a.sample(5,true,'walk',0).frame).toBe(28);
  expect(a.sample(5,true,'walk',.13).frame).toBe(29);
  expect(a.sample(5,false,'death',.2).frame).toBe(26);
  expect(a.sample(0,false,'idle',0).socket).toEqual([64,65]);
 });
});
