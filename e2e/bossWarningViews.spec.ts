import {test,expect} from '@playwright/test';
import {startRun} from './helpers';
test.use({video:'on'});
for(const graphics of ['contrast','reduced'])for(const [pattern,layout,zoom] of [['slam','source-off',1],['cross','partial',1.25],['slam','edge',1.2],['cross','hazard-off',1.25]] as const){
 test(`${graphics} ${pattern} ${layout} warning renders at zoom${zoom}`,async({page})=>{
  await page.setViewportSize({width:1280,height:720});await startRun(page,'EPOCH-GOLDEN-001');
  await page.evaluate(({graphics,pattern})=>{const h=(window as any).__seedE2E;h.streamingFixture(0,0,true,graphics==='reduced',graphics==='contrast');h.stageBossReview(pattern);},{graphics,pattern});
  await page.addStyleTag({content:'#ui{visibility:hidden!important}'});
  const pictures=[];
  for(const warning of [false,true]){
   await page.evaluate(({warning,layout,zoom})=>(window as any).__seedE2E.offscreenWarningFixture(warning,layout,zoom),{warning,layout,zoom});
   await page.evaluate(()=>new Promise<void>(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r()))));
   pictures.push((await page.screenshot({path:`test-results/browser/warning-${graphics}-${pattern}-${layout}-${warning}.png`})).toString('base64'));
  }
  const changed=await page.evaluate(async pictures=>{const arrays=[];for(const p of pictures){const b=await createImageBitmap(await(await fetch('data:image/png;base64,'+p)).blob()),c=document.createElement('canvas');c.width=b.width;c.height=b.height;const ctx=c.getContext('2d')!;ctx.drawImage(b,0,0);arrays.push(ctx.getImageData(0,0,c.width,c.height).data);b.close();}let n=0;for(let i=0;i<arrays[0].length;i+=4)if(Math.abs(arrays[0][i]-arrays[1][i])>3)n++;return n;},pictures);
  if(layout!=='hazard-off')expect(changed).toBeGreaterThan(500);
  // Source-onscreen/hazard-off still exercises actual rendering without inventing
  // on-screen danger pixels; Boss pose may change even when warning ink is offscreen.
  expect(await page.evaluate(()=>(window as any).__seedE2E.bossReviewState().boss.encounter.pattern)).toBe(pattern);
 });
}
