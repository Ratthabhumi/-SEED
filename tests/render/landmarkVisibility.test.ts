import {it,expect} from 'vitest';
import {landmarkEligible} from '../../src/game/render/landmarkVisibility';
it('prepares art that can enter view anywhere in the same player chunk, including negative chunks',()=>{
 for(const base of [0,-1024])for(const start of [1,510]){
  const px=base+start,py=base+256;
  // A 400u move stays in this chunk. Site is outside old +256 pad initially,
  // then inside the 1280u-wide camera; no chunk refresh occurs along the route.
  const end=base+(start===1?401:110),site=end+(start===1?600:-600);
  expect(landmarkEligible(px,py,site,py,1280,720,1)).toBe(true);
 }
});
