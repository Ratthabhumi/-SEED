import {test,expect} from "vitest";
import {glyphBounds} from "../../src/game/render/glyphBounds";
test("alpha crop retains faint projectile tips and bilinear gutters",()=>{
 const data=new Uint8Array(16*16*4);data[(4*16+5)*4+3]=1;data[(7*16+8)*4+3]=255;
 expect(glyphBounds(data,16)).toEqual({x:3,y:2,w:8,h:8,cell:16});
});
test("edge glyph gutters stay in the cell; blank glyphs cannot be cached invisibly",()=>{
 const data=new Uint8Array(16*16*4);expect(glyphBounds(data,16)).toBeUndefined();
 data[3]=1;data[data.length-1]=1;expect(glyphBounds(data,16)).toEqual({x:0,y:0,w:16,h:16,cell:16});
});
