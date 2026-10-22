import {test,expect} from '@playwright/test';
import {startRun} from './helpers';
import {writeFileSync} from 'node:fs';
import {readPreviewBuild} from '../scripts/read-preview-build.mjs';

for(const width of [1280,1920])test(`prepared native ground preserves pixels across biomes, six ages, zoom and fractional translation at ${width}`,async({page,baseURL})=>{
 const build=await readPreviewBuild(baseURL!);
 await page.setViewportSize({width,height:width===1280?720:1080});await startRun(page,'EPOCH-GOLDEN-001');
 await page.addStyleTag({content:'#ui{visibility:hidden!important}'});
 const rows=[];
 for(const biome of ['verdant','arid','tundra','badlands'])for(const age of [0,1,2,3,4,5])for(const zoom of [1,1.25]){
  await page.evaluate(({biome,age,zoom})=>{const h=(window as any).__seedE2E,p=h.findTerrainBiome(biome);h.stageEvolution('hunters',age);h.streamingFixture(p.x+.375,p.y+.125,true,false,true);h.cameraReviewSet(zoom);h.preparedGroundFixture(true);},{biome,age,zoom});
  const settle=()=>page.evaluate(()=>new Promise<void>(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r()))));
  await settle();
  // Translate without rebuilding commands: this must exercise the cache hit path.
  const hash=await page.evaluate(()=>(window as any).__seedE2E.preparedGroundFixture(true,.137,-.219));await settle();
  const prepared=(await page.screenshot()).toString('base64');
  const review=await page.evaluate(()=>{const h=(window as any).__seedE2E,r=h.preparedGroundReview();h.preparedGroundFixture(false);return r;});await settle();
  const legacy=(await page.screenshot()).toString('base64');
  const different=await page.evaluate(async pictures=>{
   const arrays=[];for(const p of pictures){const b=await createImageBitmap(await(await fetch('data:image/png;base64,'+p)).blob()),c=document.createElement('canvas');c.width=b.width;c.height=b.height;const ctx=c.getContext('2d')!;ctx.drawImage(b,0,0);arrays.push(ctx.getImageData(0,0,c.width,c.height).data);b.close();}
   let n=0;for(let i=0;i<arrays[0].length;i++)if(arrays[0][i]!==arrays[1][i])n++;return n;
  },[prepared,legacy]);
  rows.push({biome,age,zoom,different,review});
  expect(review.hits).toBeGreaterThan(0);expect(different,JSON.stringify({biome,age,zoom,width})).toBe(0);
  expect(await page.evaluate(()=>(window as any).__seedE2E.hash())).toBe(hash);
 }
 writeFileSync(`test-results/browser/v31-prepared-ground-native-${width}.json`,JSON.stringify({classification:'NATIVE_EXACT_PIXEL_PARITY_NOT_HUMAN_ART_PASS',build,rows},null,2));
});
