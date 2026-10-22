import {test,expect} from '@playwright/test';
import {startRun} from './helpers';
import {writeFileSync} from 'node:fs';
import {readPreviewBuild} from '../scripts/read-preview-build.mjs';

for(const width of [1280,1920])test(`prepared native ground preserves pixels across biomes, six ages, zoom and fractional translation at ${width}`,async({page,baseURL})=>{
 test.setTimeout(300_000); // 48 native PNG pairs, not a single gameplay wait
 const build=await readPreviewBuild(baseURL!);
 await page.setViewportSize({width,height:width===1280?720:1080});await startRun(page,'EPOCH-GOLDEN-001');
 await page.addStyleTag({content:'#ui{visibility:hidden!important}'});
 const rows=[];
 for(const biome of ['verdant','arid','tundra','badlands'])for(const age of [0,1,2,3,4,5])for(const zoom of [1,1.25]){
  await page.evaluate(({biome,age,zoom})=>{const h=(window as any).__seedE2E,p=h.findTerrainBiome(biome);h.stageEvolution('hunters',age);h.streamingFixture(p.x+.375,p.y+.125,true,false,true);h.cameraReviewSet(zoom);h.preparedGroundFixture(true);},{biome,age,zoom});
  const settle=()=>page.evaluate(()=>new Promise<void>(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r()))));
  await settle();
  // Translate without rebuilding commands: this must exercise the cache hit path.
  const hash=await page.evaluate(()=>(window as any).__seedE2E.preparedGroundFixture(true,17.137,-9.219));await settle();
  const prepared=(await page.screenshot()).toString('base64');
  const review=await page.evaluate(()=>{const h=(window as any).__seedE2E,r=h.preparedGroundReview();h.preparedGroundFixture(false);return r;});await settle();
  const legacy=(await page.screenshot()).toString('base64');
  const different=await page.evaluate(async pictures=>{
   const arrays=[];for(const p of pictures){const b=await createImageBitmap(await(await fetch('data:image/png;base64,'+p)).blob()),c=document.createElement('canvas');c.width=b.width;c.height=b.height;const ctx=c.getContext('2d')!;ctx.drawImage(b,0,0);arrays.push(ctx.getImageData(0,0,c.width,c.height).data);b.close();}
   let n=0;for(let i=0;i<arrays[0].length;i++)if(arrays[0][i]!==arrays[1][i])n++;return n;
  },[prepared,legacy]);
  rows.push({biome,age,zoom,different,review});
  expect(review.hits).toBeGreaterThan(0);expect(review.skipped).toBeGreaterThan(0);expect(different,JSON.stringify({biome,age,zoom,width})).toBe(0);
  expect(await page.evaluate(()=>(window as any).__seedE2E.hash())).toBe(hash);
 }
 writeFileSync(`test-results/browser/v31-prepared-ground-native-${width}.json`,JSON.stringify({classification:'NATIVE_EXACT_PIXEL_PARITY_NOT_HUMAN_ART_PASS',build,rows},null,2));
});

test('retained ground rebuilds on mode, age and world changes and releases on restart',async({page})=>{
 await startRun(page,'EPOCH-GOLDEN-001');
 const frame=()=>page.evaluate(()=>new Promise<void>(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r()))));
 const reviews=[];
 for(const [age,contrast,reduced] of [[0,true,false],[3,true,false],[5,false,true],[5,true,false]]){
  await page.evaluate(({age,contrast,reduced})=>{const h=(window as any).__seedE2E;h.stageEvolution('hunters',age);h.streamingFixture(2048,1024,false,reduced,contrast);h.preparedGroundReview(true);},{age,contrast,reduced});
  await frame();const r=await page.evaluate(()=>(window as any).__seedE2E.preparedGroundReview());reviews.push(r);
  expect(r.overflow).toBe(false);if(contrast)expect(r.vertices).toBeGreaterThan(0);
 }
 expect(reviews[1].builds).toBeGreaterThan(reviews[0].builds);
 expect(reviews[2].builds).toBeGreaterThanOrEqual(reviews[1].builds); // normal floor can have no Graphics ink
 expect(reviews[3].builds).toBeGreaterThan(reviews[2].builds);
 await page.evaluate(()=>(window as any).__seedE2E.readyAscend());
 await page.getByRole('button',{name:'Enter a new world',exact:true}).click();
 await page.locator('#legacy-screen .card').first().click();await page.locator('#origin-screen .card').first().click();await page.locator('#child-intro-screen button').click();
 await page.evaluate(()=>{const h=(window as any).__seedE2E,p=JSON.parse(h.snapshot()).p;h.streamingFixture(p[0],p[1],false,false,true);h.preparedGroundReview(true);});await frame();
 expect(await page.evaluate(()=>(window as any).__seedE2E.preparedGroundReview().builds)).toBeGreaterThan(reviews.at(-1).builds);
 await page.keyboard.press('Escape'); // resume the staged pause
 const before=await page.evaluate(()=>(window as any).__seedE2E.canonicalStressState().elapsed);
 await page.waitForTimeout(150);expect(await page.evaluate(()=>(window as any).__seedE2E.canonicalStressState().elapsed)).toBeGreaterThan(before);
 await page.keyboard.press('Escape');await page.locator('#pause-restart-btn').click();await frame();
 expect(await page.evaluate(()=>(window as any).__seedE2E.preparedGroundReview().builds)).toBeLessThan(reviews.at(-1).builds);
});
