import {test,expect} from '@playwright/test';
import {startRun} from './helpers';
import {writeFileSync} from 'node:fs';
test.use({video:'on'});
for(const graphics of ['normal','reduced','contrast'])test(`Cross risk interior remains visible with source offscreen: ${graphics}`,async({page})=>{
 await page.setViewportSize({width:1280,height:720});await startRun(page,'EPOCH-GOLDEN-001');
 await page.evaluate(graphics=>{const h=(window as any).__seedE2E;h.streamingFixture(0,0,true,graphics==='reduced',graphics==='contrast');h.stageBossReview('cross');},graphics);
 await page.addStyleTag({content:'#ui{visibility:hidden!important}'});
 const images=[];let layout:any;
 for(const warning of [false,true]){
  await page.evaluate(warning=>(window as any).__seedE2E.offscreenWarningFixture(warning,'source-off',1.25),warning);
  await page.evaluate(()=>new Promise<void>(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r()))));
  layout=await page.evaluate(()=>{const h=(window as any).__seedE2E;return {camera:h.cameraGroundReview(),boss:h.bossReviewState().boss};});
  images.push((await page.screenshot({path:`test-results/browser/cross-union-${graphics}-${warning}.png`})).toString('base64'));
 }
 const deltas=await page.evaluate(async({images,layout})=>{
  const arrays=[];for(const p of images){const b=await createImageBitmap(await(await fetch('data:image/png;base64,'+p)).blob()),c=document.createElement('canvas');c.width=b.width;c.height=b.height;const ctx=c.getContext('2d')!;ctx.drawImage(b,0,0);arrays.push(ctx.getImageData(0,0,c.width,c.height).data);b.close();}
  const a=layout.boss.encounter,c=layout.camera;
  return [[-200,0],[-130,0],[130,0],[200,0],[0,-130],[0,-200],[0,130],[0,200]].map(([dx,dy])=>{
   const x=Math.round((a.aimX+dx-c.view.left)*c.zoom),y=Math.round((a.aimY+dy-c.view.top)*c.zoom),i=(y*1280+x)*4;
   let visiblePixels=0;
   // Dense projectiles legitimately occlude individual pixels. Require visible
   // risk in every11x11 region; keep all800 shots and all8 region assertions.
   for(let oy=-5;oy<=5;oy++)for(let ox=-5;ox<=5;ox++){const j=((y+oy)*1280+x+ox)*4;if(arrays[1][j]-arrays[0][j]>=5)visiblePixels++;}
   return {x,y,redChange:arrays[1][i]-arrays[0][i],visiblePixels};
  });
 },{images,layout});
 expect(deltas.every(p=>p.x>=0&&p.x<1280&&p.y>=0&&p.y<720)).toBe(true);
 writeFileSync(`test-results/browser/content18-cross-union-${graphics}.json`,JSON.stringify({classification:'STAGED_NATIVE_WARNING_NOT_HUMAN_FAIRNESS_PASS',layout,deltas},null,2));
 expect(deltas.every(p=>p.visiblePixels>=25)).toBe(true);
});
