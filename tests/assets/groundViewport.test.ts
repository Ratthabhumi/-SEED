import {it,expect} from "vitest";
import {groundViewport} from "../../src/game/render/groundViewport";
it("retains every viewport chunk plus a full chunk at negative coordinates and supported zooms",()=>{
 for(const [width,height] of [[1280,720],[1920,1080],[2560,1305]])for(const zoom of [1,1.2,1.25])for(const scroll of [-1100,-512,-1,0,511,1300]){
  const b=groundViewport(scroll,-scroll,width!,height!,zoom),cx=scroll+width!/2,cy=-scroll+height!/2;
  for(const x of [cx-width!/zoom/2,cx+width!/zoom/2])for(const y of [cy-height!/zoom/2,cy+height!/zoom/2]){
   const chunkX=Math.floor(x/512),chunkY=Math.floor(y/512);
   expect(b.left).toBeLessThanOrEqual(chunkX-1);expect(b.right).toBeGreaterThanOrEqual(chunkX+1);
   expect(b.top).toBeLessThanOrEqual(chunkY-1);expect(b.bottom).toBeGreaterThanOrEqual(chunkY+1);
  }
 }
});
