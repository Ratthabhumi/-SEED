import {describe,it,expect} from "vitest";
import {ReferenceAnimation} from "../../src/game/render/ReferenceAnimation";
import base from "../../src/game/assets/hunters-reference-v1.json";
import extra from "../../src/game/assets/hunters-attack-v2.json";
describe("reviewed release/recovery supplement",()=>{
 it("retains eight distinct original frames and stable baseline",()=>{
  expect(extra.frames).toHaveLength(8);expect(new Set(extra.frames.map(f=>f.sourcePoseHash)).size).toBe(8);
  for(const f of extra.frames){expect(f.ground).toEqual([64,116]);expect(f.bounds[1]!+f.bounds[3]!).toBe(116);expect(f.socket.every(v=>v>=0&&v<128)).toBe(true);}
 });
 it("uses canonical time, clamps recovery and preserves old back/walk clips",()=>{
  const a=new ReferenceAnimation({...base,overrides:extra.overrides});
  expect(a.sample(0,false,'attack',1).frame).toBe(0);
  expect(a.sample(0,false,'attack',1.05).frame).toBe(1);
  expect(a.sample(0,false,'attack',1.05).frame).toBe(1);
  expect(a.sample(0,false,'attack',2).frame).toBe(3);
  expect(a.sample(5,false,'attack',3).frame).toBe(4);
  expect(a.sample(0,true,'attack',4).texture).toBeUndefined();
  expect(a.sample(0,false,'walk',5).frame).toBe(1);
 });
});
