import {test,expect} from '@playwright/test';
import {startRun} from './helpers';
test('culled static ground preserves actual visible raster at biome and negative chunk boundaries',async({page})=>{
 await startRun(page,'EPOCH-GOLDEN-001');
 for(const [x,y] of [[0,0],[-513,-1],[511,512],[1500,-1500]]){
  const r=await page.evaluate(([x,y])=>{const h=(window as any).__seedE2E;h.streamingFixture(x,y,true,false,true);const hash=h.hash(),r=h.groundRasterReview();return {...r,unchanged:h.hash()===hash};},[x,y]);
  expect(r.unchanged).toBe(true);expect(r.different).toBe(0);expect(r.opaque).toBe(640*360);expect(r.commands[1]).toBeLessThan(r.commands[0]);
 }
 await page.screenshot({path:'test-results/browser/ground-culled-negative.png'});
});
