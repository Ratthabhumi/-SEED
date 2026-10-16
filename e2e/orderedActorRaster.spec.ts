import {test,expect} from '@playwright/test';
import {startRun} from './helpers';
import {writeFileSync} from 'node:fs';

for(const [x,y,zoom] of [[0,0,1],[-16384.375,8128.125,1.2],[24576.125,-16800.375,1.25]])test(`native WebGL ordered enemy parity at ${x},${y},zoom${zoom}`,async({page})=>{
 await page.setViewportSize({width:1280,height:720});await startRun(page,'EPOCH-GOLDEN-001');
 // DOM HUD/toasts animate independently; this oracle compares native actor pixels.
 await page.addStyleTag({content:'#ui { visibility: hidden !important; }'});
 const samples=[];
 for(const ordered of [false,true,false]){
  const state=await page.evaluate(({ordered,x,y,zoom})=>(window as any).__seedE2E.actorRasterFixture(ordered,x,y,zoom),{ordered,x,y,zoom});
  await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()))));
  state.actors=await page.evaluate(()=>(window as any).__seedE2E.actorRasterState());
  const image=await page.locator('canvas').first().screenshot({path:`test-results/browser/content18-actors-${zoom}-${samples.length}-${ordered?'batch':'images'}.png`});
  samples.push({state,png:image.toString('base64')});
 }
 expect(samples[1]!.state.actors).toEqual(samples[0]!.state.actors);
 expect(samples[2]!.state.actors).toEqual(samples[0]!.state.actors);
 expect(samples[1]!.state.hash).toBe(samples[0]!.state.hash);
 expect(samples[2]!.state.hash).toBe(samples[0]!.state.hash);
 expect(samples[1]!.state.batch.actors).toBe(102);
 expect(samples[1]!.state.batch.bufferBytes).toBeLessThanOrEqual(650*16*80);
 const difference=await page.evaluate(async pngs=>{
  const arrays=[];
  for(const png of pngs){const bitmap=await createImageBitmap(await(await fetch('data:image/png;base64,'+png)).blob());const c=document.createElement('canvas');c.width=bitmap.width;c.height=bitmap.height;const ctx=c.getContext('2d')!;ctx.drawImage(bitmap,0,0);arrays.push(ctx.getImageData(0,0,c.width,c.height).data);bitmap.close();}
  return [1,2].map(index=>{let changed=0,max=0;for(let i=0;i<arrays[0]!.length;i++){const d=Math.abs(arrays[0]![i]!-arrays[index]![i]!);if(d)changed++;max=Math.max(max,d);}return {changed,max};});
 },samples.map(s=>s.png));
 // Mesh and Image use different numeric submission paths. At far fractional
 // zoom the physical oracle found11 channels differing by1/255; anchoring
 // did not change it. Bound that numeric difference, not silhouettes/danger.
 // Ground parity and repeated Images comparison remain exact.
 expect(difference[0]!.max).toBeLessThanOrEqual(1);
 expect(difference[0]!.changed).toBeLessThanOrEqual(Math.ceil(1280*720*4/10000));
 expect(difference[1]).toEqual({changed:0,max:0});
 writeFileSync(`test-results/browser/content18-actor-raster-${zoom}.json`,JSON.stringify({classification:'STAGED_NATIVE_WEBGL_ACTOR_PARITY_NOT_ART_APPROVAL',position:{x,y,zoom},difference,states:samples.map(s=>s.state)},null,2));
});
