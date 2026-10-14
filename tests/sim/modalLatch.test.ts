import {it,expect} from "vitest";
import {InputLatch} from "../../src/core/sim/InputLatch";
it("decision transitions discard old dash edges without changing held movement or ordinary zero-step retention",()=>{
 const latch=new InputLatch();latch.setMove(1,0);latch.pressDash();
 expect(latch.hasLatchedDash).toBe(true);latch.discardEdges();expect(latch.hasLatchedDash).toBe(false);
 expect(latch.frameForStep(0)).toEqual({moveX:1,moveY:0,dashPressed:false});
 latch.pressDash();expect(latch.frameForStep(0).dashPressed).toBe(true);expect(latch.frameForStep(1).dashPressed).toBe(false);
});
