import {it,expect} from "vitest";
import type Phaser from "phaser";
import {FriendlyProjectileBatch} from "../../src/game/render/FriendlyProjectileBatch";

it("disposes the old cache on shutdown and never confuses it with a new run",()=>{
 let shutdown=()=>{};
 const scene={events:{once:(event:string,callback:()=>void)=>{expect(event).toBe("shutdown");shutdown=callback;}}} as unknown as Phaser.Scene;
 const old=new FriendlyProjectileBatch(scene);
 // Simulate populated CPU entries without requiring a GPU in a unit test.
 const cache=old as unknown as {frames:Map<string,number>;bounds:unknown[]};
 cache.frames.set("old-run-shot",0);cache.bounds.push({x:0,y:0,w:1,h:1,cell:96});
 const generation=old.counts().generation;
 shutdown();shutdown();
 expect(old.counts()).toMatchObject({disposed:true,glyphs:0,atlasBytes:0});
 expect(cache.bounds).toHaveLength(0);
 const fresh=new FriendlyProjectileBatch(scene);
 expect(fresh.counts().generation).toBeGreaterThan(generation);
 expect(fresh.counts()).toMatchObject({disposed:false,glyphs:0,maxGlyphs:64});
 expect(old.counts().disposed).toBe(true);
});
