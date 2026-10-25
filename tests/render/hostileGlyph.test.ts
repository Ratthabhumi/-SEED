import {it,expect} from 'vitest';
import {hostileGlyph} from '../../src/game/render/hostileGlyph';
it('retains three source silhouettes without moving their forward extent',()=>{
 const shapes=['enemy','enemy-burst','boss-fan'].map(hostileGlyph);
 expect(new Set(shapes.map(s=>JSON.stringify(s))).size).toBe(3);
 for(const points of shapes){
  expect(Math.max(...points.map(([x])=>x))).toBe(1.6);
  expect(Math.max(...points.map(([,y])=>y))).toBe(-Math.min(...points.map(([,y])=>y)));
 }
 expect(hostileGlyph('unknown')).toBe(shapes[0]);
});
