import {it,expect} from 'vitest';
import anchors from '../../src/game/assets/site-anchors.json';
import {siteOriginY} from '../../src/game/render/siteGrounding';
declare const require:(id:string)=>any;
const {readFileSync}=require('node:fs'),{createHash}=require('node:crypto');
it('anchors the occupied source support edge to the site contact plane at every scale',()=>{
 for(const texture of ['world-props','outposts-v2'] as const){
  const data=anchors.textures[texture];expect(createHash('sha256').update(readFileSync(data.path)).digest('hex')).toBe(data.sha256);
  for(const f of data.frames)for(const scale of [112,144,176,208]){
   const origin=siteOriginY(texture,f.frame);expect(origin).toBeGreaterThan(.5);expect(origin).toBeLessThanOrEqual(1);
   expect(Math.abs((f.groundY/128-origin)*scale)).toBeLessThan(.0001);
  }
 }
});
