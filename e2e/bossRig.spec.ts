import {test,expect} from '@playwright/test';
import {startRun} from './helpers';
import {writeFileSync} from 'node:fs';
test.use({video:{mode:'on',size:{width:1280,height:720}}});
const frame=async(page:any)=>page.evaluate(()=>new Promise<void>(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r()))));
for(const height of [720,1080])for(const lang of ['en','th'] as const)test(`articulated boss and separated HUD ${height} ${lang}`,async({page})=>{
 await page.setViewportSize({width:height===720?1280:1920,height});
 await startRun(page,'EPOCH-GOLDEN-001',{lang,uiScale:2,bossArt:'rig'});
 const observations=[];
 for(const graphics of ['normal','reduced','contrast']){
  await page.evaluate(mode=>{const h=(window as any).__seedE2E;h.streamingFixture(0,0,false,mode==='reduced',mode==='contrast');h.stageBossReview('slam');},graphics);
  await frame(page);await expect(page.locator('.boss-bar')).toBeVisible();
  const rects=await page.evaluate(()=>['.hud-stats','.boss-bar','#boss-encounter','.hud-top-left','.hud-top-right'].map(selector=>{
   const n=document.querySelector(selector)!;const b=n.getBoundingClientRect();return {selector,x:b.x,y:b.y,right:b.right,bottom:b.bottom,width:b.width,height:b.height};
  }));
  const [stats,bar,phase,left,right]=rects;
  expect(stats!.bottom).toBeLessThanOrEqual(bar!.y);expect(bar!.bottom).toBeLessThanOrEqual(phase!.y);
  expect(left!.right).toBeLessThanOrEqual(bar!.x);expect(bar!.right).toBeLessThanOrEqual(right!.x);
  expect(phase!.bottom).toBeLessThan(height);
  for(const pattern of ['slam','cross','fan']){
   await page.evaluate(p=>(window as any).__seedE2E.stageBossReview(p),pattern);await frame(page);
   const before=await page.evaluate(()=>(window as any).__seedE2E.bossReviewState().actors);
   expect(before).toHaveLength(14);
   await page.waitForTimeout(80);expect(await page.evaluate(()=>(window as any).__seedE2E.bossReviewState().actors)).toEqual(before); // canonical pause
   await page.evaluate(()=>(window as any).__seedE2E.advanceEvolution(.45));await frame(page);
   const after=await page.evaluate(()=>(window as any).__seedE2E.bossReviewState().actors);
   expect(after.filter((p:any)=>p.rotation!==0).length).toBeGreaterThan(4);
   expect(after).not.toEqual(before);
   await page.screenshot({path:`test-results/browser/overhaul-boss-${height}-${lang}-${graphics}-${pattern}.png`});
   observations.push({graphics,pattern,rects,joints:after});
  }
 }
 writeFileSync(`test-results/browser/overhaul-boss-${height}-${lang}.json`,JSON.stringify({classification:'STAGED_NATIVE_RIG_AND_LAYOUT_NOT_HUMAN_ART_APPROVAL',observations},null,2));
});

test('canonical discovery across unexplored chunk border displays its existing site art',async({page})=>{
 await page.setViewportSize({width:1280,height:720});await startRun(page,'EPOCH-GOLDEN-001');
 await page.evaluate(()=>(window as any).__seedE2E.stageEvolution('hunters',0));
 const site=await page.evaluate(()=>(window as any).__seedE2E.stagePoiEdge());await frame(page);
 const near=()=>page.evaluate(p=>(window as any).__seedE2E.siteArtReview().filter((a:any)=>Math.hypot(a.x-p.x,a.y-(p.y+8))<1),site);
 expect(site.known).toBe(false);expect(await near()).toHaveLength(0);
 await page.evaluate(()=>(window as any).__seedE2E.advanceEvolution(.05));await frame(page);
 const art=await near();expect(art).toHaveLength(1);
 const observation=await page.evaluate(id=>(window as any).__seedE2E.siteArrivalReview().find((p:any)=>p.poiId===id),site.id);
 expect(observation.firstRenderFrame).toBeGreaterThan(0);
 const visible=(await page.screenshot({path:'test-results/browser/overhaul-poi-border.png'})).toString('base64');
 const camera=await page.evaluate(()=>(window as any).__seedE2E.cameraGroundReview());
 await page.evaluate(()=>(window as any).__seedE2E.siteArtVisibilityReview(false));await frame(page);
 const hidden=(await page.screenshot()).toString('base64');
 const visiblePixels=await page.evaluate(async({visible,hidden,camera,art})=>{
  const arrays=[];
  for(const data of [visible,hidden]){const b=await createImageBitmap(await(await fetch('data:image/png;base64,'+data)).blob());const c=document.createElement('canvas');c.width=b.width;c.height=b.height;const g=c.getContext('2d')!;g.drawImage(b,0,0);arrays.push(g.getImageData(0,0,c.width,c.height).data);b.close();}
  const x=(art.x-camera.view.left)*camera.zoom,y=(art.y-camera.view.top)*camera.zoom;
  let count=0;
  for(let py=Math.max(0,Math.ceil(y-art.height*art.originY*camera.zoom));py<Math.min(720,y+art.height*(1-art.originY)*camera.zoom);py++)for(let px=Math.max(0,Math.ceil(x-art.width*.5*camera.zoom));px<Math.min(1280,x+art.width*.5*camera.zoom);px++){
   const i=(py*1280+px)*4;let diff=0;for(let channel=0;channel<3;channel++)diff+=Math.abs(arrays[0]![i+channel]!-arrays[1]![i+channel]!);if(diff>=15)count++;
  }return count;
 },{visible,hidden,camera,art:art[0]});
 expect(visiblePixels).toBeGreaterThan(100);
 await page.evaluate(()=>(window as any).__seedE2E.siteArtVisibilityReview(true));
 writeFileSync('test-results/browser/overhaul-poi-border.json',JSON.stringify({site,observation,visiblePixels,classification:'CANONICAL_DISCOVERY_NATIVE_SCREENSHOT_PIXEL_DIFFERENCE_NOT_GPU_PRESENT_TIMESTAMP'},null,2));
});

test('one floating primary mount compares with hand across origins and Stone/Space',async({page})=>{
 await startRun(page,'EPOCH-GOLDEN-001');
 for(const origin of ['hunters','engineers','resonant','sentinels'])for(const age of [0,5]){
  await page.evaluate(({origin,age})=>(window as any).__seedE2E.stageEvolution(origin,age),{origin,age});
  await page.evaluate(()=>{const h=(window as any).__seedE2E;const p=JSON.parse(h.snapshot()).p;h.streamingFixture(p[0],p[1]);});
  for(const mount of ['hand','float']){
   const before=await page.evaluate(()=>(window as any).__seedE2E.snapshot());
   await page.evaluate(m=>(window as any).__seedE2E.equipmentMountReview(m),mount);await frame(page);
   expect(await page.evaluate(()=>(window as any).__seedE2E.snapshot())).toBe(before);
   const art=await page.evaluate(()=>(window as any).__seedE2E.integratedReview().equipment);
   expect(art.texture).toBe('combat-equipment');
   await page.screenshot({path:`test-results/browser/overhaul-mount-${origin}-${age}-${mount}.png`});
  }
 }
});

test('articulated defeat, child world and restart leave no stale boss plates',async({page})=>{
 await startRun(page,'EPOCH-GOLDEN-001',{bossArt:'rig'});
 await page.evaluate(()=>(window as any).__seedE2E.stageBossReview('cross'));await frame(page);
 await page.evaluate(()=>(window as any).__seedE2E.bossDefeatArtReview());await frame(page);
 // Presentation-only death fixture: do not report it as a real boss victory.
 await page.evaluate(()=>(window as any).__seedE2E.advanceEvolution(.35));await frame(page);
 const falling=await page.evaluate(()=>(window as any).__seedE2E.bossReviewState().actors);
 expect(falling).toHaveLength(14);expect(falling.every((a:any)=>a.alpha>0&&a.alpha<1)).toBe(true);
 await page.screenshot({path:'test-results/browser/overhaul-boss-defeat.png'});
 await page.waitForTimeout(100);expect(await page.evaluate(()=>(window as any).__seedE2E.bossReviewState().actors)).toEqual(falling);
 await page.evaluate(()=>(window as any).__seedE2E.advanceEvolution(.5));await frame(page);
 expect(await page.evaluate(()=>(window as any).__seedE2E.bossReviewState().actors)).toHaveLength(0);
 await page.evaluate(()=>(window as any).__seedE2E.readyAscend());
 await page.getByRole('button',{name:'Enter a new world',exact:true}).click();
 await page.locator('#legacy-screen .card').first().click();
 await page.locator('#origin-screen .card').first().click();await page.locator('#child-intro-screen button').click();await frame(page);
 expect(await page.evaluate(()=>(window as any).__seedE2E.bossReviewState().actors)).toHaveLength(0);
 await page.evaluate(()=>(window as any).__seedE2E.stageBossReview('fan'));await frame(page);
 expect(await page.evaluate(()=>(window as any).__seedE2E.bossReviewState().actors)).toHaveLength(14);
 await page.keyboard.press('Escape');await frame(page); // leave staged pause
 await page.keyboard.press('Escape');await page.locator('#pause-restart-btn').click();await frame(page);
 expect(await page.evaluate(()=>(window as any).__seedE2E.bossReviewState().actors)).toHaveLength(0);
});
