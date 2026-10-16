import {test,expect} from '@playwright/test';
import {startRun} from './helpers';
import {writeFileSync} from 'node:fs';

test('submitted ground covers native Phaser worldView and inverse-transform corners across zoom/follow/resize',async({page})=>{
 await startRun(page,'EPOCH-GOLDEN-001');
 const rows:unknown[]=[];
 for(const [width,height] of [[1280,720],[1920,1080],[2560,1305]]){
  writeFileSync('test-results/browser/content18-camera-progress.json',JSON.stringify({stage:'viewport',width,height,rows:rows.length}));
  await page.setViewportSize({width:width!,height:height!});
  for(const zoom of [...new Set([1,1.2,1.25,Math.max(1,Math.min(1.25,height!/900))])]){
   for(const [x,y] of [[0,0],[-513,-1],[511,512],[1500,-1500]]){
    await page.evaluate(({x,y,zoom})=>{const h=(window as any).__seedE2E;h.streamingFixture(x,y,false,false,true);h.cameraReviewSet(zoom,[x-2300,y+1700]);},{x,y,zoom});
    // Real engine render/follow stages, never call preRender manually or copy its formula.
    for(let frame=0;frame<3;frame++){
     await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>resolve())));
     const r=await page.evaluate(()=>(window as any).__seedE2E.cameraGroundReview());rows.push(r);
     expect(r.zoom).toBe(zoom);
     const [first,last]=r.corners;
     expect(first.x).toBeCloseTo(r.view.left,3);expect(first.y).toBeCloseTo(r.view.top,3);
     expect(last.x).toBeCloseTo(r.view.right,3);expect(last.y).toBeCloseTo(r.view.bottom,3);
     for(const p of r.corners){
      expect(r.bounds.left).toBeLessThanOrEqual(Math.floor(p.x/512));
      expect(r.bounds.right).toBeGreaterThanOrEqual(Math.floor(p.x/512));
      expect(r.bounds.top).toBeLessThanOrEqual(Math.floor(p.y/512));
      expect(r.bounds.bottom).toBeGreaterThanOrEqual(Math.floor(p.y/512));
     }
     const before=r.hash;
     await page.evaluate(()=>{const h=(window as any).__seedE2E;h.cameraReviewSet(h.cameraGroundReview().zoom);});
     expect(await page.evaluate(()=>(window as any).__seedE2E.hash())).toBe(before);
    }
   }
  }
  await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>resolve())));
  writeFileSync('test-results/browser/content18-camera-progress.json',JSON.stringify({stage:'raster',width,height,rows:rows.length}));
  const raster=await page.evaluate(()=>(window as any).__seedE2E.cameraGroundRaster());
  // Fractional native zoom gives Canvas antialiased chunk edges in BOTH paths.
  // Exact all-channel parity plus no empty pixels is the coverage contract;
  // opaque255 everywhere is only valid for the existing integer raster test.
  expect(raster.different).toBe(0);expect(raster.nonblank).toBe(width!*height!);rows.push({width,height,raster});
 }
 for(const biome of ['verdant','arid','tundra','badlands']){
  writeFileSync('test-results/browser/content18-camera-progress.json',JSON.stringify({stage:'biome',biome,rows:rows.length}));
  await page.evaluate(biome=>(window as any).__seedE2E.stageBiomeReview(biome),biome);
  await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>resolve())));
  const raster=await page.evaluate(()=>(window as any).__seedE2E.cameraGroundRaster());
  expect(raster.different).toBe(0);rows.push({biome,raster});
 }
 // Real UI Ascension from a distant location, followed by an actual main-thread gap.
 writeFileSync('test-results/browser/content18-camera-progress.json',JSON.stringify({stage:'world2',rows:rows.length}));
 await page.evaluate(()=>(window as any).__seedE2E.readyAscend());
 await page.locator('.hud-ascend button').click();await page.locator('#legacy-screen .card').first().click();
 await page.locator('#origin-screen .card').first().click();await page.locator('#child-intro-screen button').click();
 await page.evaluate(()=>{const until=performance.now()+160;while(performance.now()<until){/* test-only missed-frame fixture */}});
 for(let frame=0;frame<5;frame++){
  await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>resolve())));
  const r=await page.evaluate(()=>(window as any).__seedE2E.cameraGroundReview());rows.push({world2:true,...r});
  for(const p of [...r.corners,r.actor]){
   expect(r.bounds.left).toBeLessThanOrEqual(Math.floor(p.x/512));expect(r.bounds.right).toBeGreaterThanOrEqual(Math.floor(p.x/512));
   expect(r.bounds.top).toBeLessThanOrEqual(Math.floor(p.y/512));expect(r.bounds.bottom).toBeGreaterThanOrEqual(Math.floor(p.y/512));
  }
 }
 writeFileSync('test-results/browser/content18-camera-native.json',JSON.stringify({classification:'NATIVE_CAMERA_ORACLE_NOT_HUMAN_VISUAL_PASS',rows},null,2));
});
