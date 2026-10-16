import {test,expect} from '@playwright/test';
import {startRun} from './helpers';
import {writeFileSync} from 'node:fs';
test('locked slam warning remains visible when the boss body leaves the viewport',async({page})=>{
 await page.setViewportSize({width:1280,height:720});await startRun(page,'EPOCH-GOLDEN-001');
 await page.addStyleTag({content:'#ui { visibility:hidden !important; }'});
 await page.evaluate(()=>(window as any).__seedE2E.stageBossReview('slam'));
 const pictures=[];
 for(const warning of [false,true]){
  await page.evaluate(warning=>(window as any).__seedE2E.offscreenWarningFixture(warning),warning);
  await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()))));
  pictures.push((await page.screenshot({clip:{x:480,y:200,width:320,height:320},path:`test-results/browser/content18-offscreen-warning-${warning}.png`})).toString('base64'));
 }
 const changed=await page.evaluate(async pictures=>{
  const data=[];for(const png of pictures){const b=await createImageBitmap(await(await fetch('data:image/png;base64,'+png)).blob());const c=document.createElement('canvas');c.width=c.height=320;const ctx=c.getContext('2d')!;ctx.drawImage(b,0,0);data.push(ctx.getImageData(0,0,320,320).data);b.close();}
  let changed=0;for(let i=0;i<data[0]!.length;i+=4)if(Math.abs(data[0]![i]!-data[1]![i]!)>3)changed++;return changed;
 },pictures);
 expect(changed).toBeGreaterThan(1000);
 writeFileSync('test-results/browser/content18-offscreen-warning.json',JSON.stringify({classification:'NATIVE_WARNING_REGRESSION',changedPixels:changed,minimum:1000},null,2));
});
