import {it,expect} from "vitest";
import {frontierDecoration} from "../../src/game/render/frontierDecoration";
import {CHUNK_SIZE} from "../../src/core/world/chunks";
it("cosmetic layout is bounded, reproducible and varies by seed/chunk",()=>{
 const a=frontierDecoration("A",-2,3);
 expect(a).toEqual(frontierDecoration("A",-2,3));expect(a).not.toEqual(frontierDecoration("B",-2,3));
 expect(a).not.toEqual(frontierDecoration("A",-1,3));expect(a).toHaveLength(12);
 for(const p of a){expect(p.x).toBeGreaterThanOrEqual(-2*CHUNK_SIZE+24);expect(p.x).toBeLessThan(-CHUNK_SIZE-24);expect(p.y).toBeGreaterThanOrEqual(3*CHUNK_SIZE+24);expect(p.y).toBeLessThan(4*CHUNK_SIZE-24);}
});
