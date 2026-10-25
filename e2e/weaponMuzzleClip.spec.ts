import {test} from '@playwright/test';
import {startRun} from './helpers';
const frame=async(page:any)=>page.evaluate(()=>new Promise<void>(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r()))));

 test.use({video:{mode:'on',size:{width:1280,height:720}}});
 test('staged actual firing while strafing, followed by paused overlay',async({page})=>{
  await page.setViewportSize({width:1280,height:720});await startRun(page,'EPOCH-GOLDEN-001');
  await page.evaluate(()=>(window as any).__seedE2E.stageEvolution('hunters',2));
  await page.keyboard.down('d');await page.waitForTimeout(1500);await page.keyboard.up('d');
  await page.evaluate(()=>{const h=(window as any).__seedE2E;h.primeSignature();h.aimReleaseReview(-450,0);h.weaponOverlayReview(true);});
  await frame(page);await page.screenshot({path:'test-results/browser/v35-moving-final-overlay.png'});
 });
