import {it,expect} from "vitest";
import {hostileArtFrame} from "../../src/game/render/hostileArt";
it("maps actual ordinary, burst and boss shots; never invents energy gameplay",()=>{
 expect(hostileArtFrame("enemy-burst")).toBe(0);expect(hostileArtFrame("enemy")).toBe(1);expect(hostileArtFrame("boss-fan")).toBe(3);
 expect(hostileArtFrame("energy")).toBeUndefined();expect(hostileArtFrame("unknown")).toBeUndefined();
});
