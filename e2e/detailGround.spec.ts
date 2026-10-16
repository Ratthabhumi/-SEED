import {test,expect} from '@playwright/test';
import {startRun} from './helpers';
import {writeFileSync} from 'node:fs';
test('detail ink culling preserves native WebGL pixels and canonical state',async({page})=>{
 await page.setViewportSize({width:1280,height:720});await startRun(page,'EPOCH-GOLDEN-001');
 await page.addStyleTag({content:'#ui{visibility:hidden!important}'});
 const rows=[];
 for(const biome of ['verdant','arid','tundra','badlands'])for(const age of [0,5]){
  await page.evaluate(({biome,age})=>{const h=(window as any).__seedE2E,p=h.findTerrainBiome(biome);h.stageEvolution('hunters',age);h.streamingFixture(p.x+.375,p.y+.125,true,false,true);}, {biome,age});
  for(const zoom of [1,1.25]){
   await page.evaluate(zoom=>(window as any).__seedE2E.cameraReviewSet(zoom),zoom);
   const pictures=[],hashes=[];
   for(const enabled of [false,true]){
    hashes.push(await page.evaluate(enabled=>(window as any).__seedE2E.groundDetailReview(enabled),enabled));
    await page.evaluate(()=>new Promise<void>(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r()))));
    pictures.push((await page.screenshot()).toString('base64'));
   }
   const different=await page.evaluate(async pictures=>{
    const arrays=[];for(const p of pictures){const b=await createImageBitmap(await(await fetch('data:image/png;base64,'+p)).blob()),c=document.createElement('canvas');c.width=b.width;c.height=b.height;const ctx=c.getContext('2d')!;ctx.drawImage(b,0,0);arrays.push(ctx.getImageData(0,0,c.width,c.height).data);b.close();}
    let different=0;for(let i=0;i<arrays[0].length;i++)if(arrays[0][i]!==arrays[1][i])different++;return different;
   },pictures);
   expect(hashes[0]).toBe(hashes[1]);expect(different).toBe(0);rows.push({biome,age,zoom,different,hash:hashes[0]});
  }
 }
 writeFileSync('test-results/browser/content18-detail-native.json',JSON.stringify({classification:'NATIVE_WEBGL_FLOOR_ONLY_NOT_HUMAN_VISUAL_PASS',rows},null,2));
});
test('unique frame timing drains once while retaining legacy rolling metrics',async({page})=>{
 await startRun(page,'EPOCH-GOLDEN-001');
 await page.evaluate(()=>(window as any).__seedE2E.takeUniquePerformanceFrames());
 await page.waitForTimeout(300);
 const result=await page.evaluate(()=>{const h=(window as any).__seedE2E;return {first:h.takeUniquePerformanceFrames(),second:h.takeUniquePerformanceFrames(),legacy:h.performanceSamples()};});
 expect(result.first.length).toBeGreaterThan(1);expect(result.second).toEqual([]);
 expect(new Set(result.first.map((r:any)=>r.frame)).size).toBe(result.first.length);
 expect(result.first.every((r:any)=>r.rendererCpuSubmit>=0&&r.sim.every((n:number)=>n>=0))).toBe(true);
 expect(result.legacy.rendererCpuSubmit.length).toBeGreaterThan(0);
});
