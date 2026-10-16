import {chromium} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
import {readPreviewBuild} from './read-preview-build.mjs';
/** Same Worldgen3 coordinates and supported presentation; staged visual review. */
export async function captureWorldComparison(before,after,out){
 mkdirSync(out,{recursive:true});const rows=[],errors=[],positions={},builds={A:await readPreviewBuild(before),B:await readPreviewBuild(after)};
 if(builds.A.dirty||builds.B.dirty)throw Error('Comparison requires clean compiled builds');
 if(builds.A.sha!=='b909802d5fa18e5bbef11ce7ff5ae38a30b1bb37')throw Error('Expected exact PR15 Push baseline');
 const browser=await chromium.launch({headless:true,...(process.platform==='win32'?{args:['--use-gl=angle','--use-angle=d3d11']}: {})});
 try{
  const cdp=await browser.newBrowserCDPSession(),gpu=(await cdp.send('SystemInfo.getInfo')).gpu.auxAttributes?.glRenderer;
  for(const [label,url] of [['A',before],['B',after]])for(const fallback of [true,false]){
   const context=await browser.newContext({viewport:{width:1920,height:1080}}),page=await context.newPage();page.on('pageerror',e=>errors.push({label,message:e.message}));
   await page.addInitScript(fallback=>{
    localStorage.setItem('seed-game-save-v1',JSON.stringify({schema:1,settings:{lang:'en',volume:0,uiScale:2,tutorialCompleted:true},archive:[],history:[],best:{}}));
    if(fallback)Object.defineProperty(window,'Worker',{value:undefined});
   },fallback);
   const begin=Date.now();await page.goto(url+'/?e2e');await page.locator('#seed-input').fill('EPOCH-GOLDEN-001');await page.locator('#start-btn').click();await page.waitForFunction(()=>window.__seedE2E?.content153Review);
   const playableMs=Date.now()-begin,initial=await page.evaluate(()=>window.__seedE2E.content153Review());
   for(const biome of ['verdant','arid','tundra','badlands']){
    const position=await page.evaluate(b=>window.__seedE2E.findTerrainBiome(b),biome);
    if(label==='A')positions[biome]=position;else if(JSON.stringify(positions[biome])!==JSON.stringify(position))throw Error('A/B world coordinates diverged');
    await page.evaluate(p=>{const h=window.__seedE2E;h.stageEvolution('hunters',3);h.streamingFixture(p.x,p.y);h.notificationReset();},position);
    if(!fallback)await page.waitForFunction(()=>window.__seedE2E.content153Review().terrain.pending===0,null,{timeout:60000});
    await page.waitForTimeout(200);
    const file=`${label}-${fallback?'fallback':'prepared'}-${biome}.png`;await page.screenshot({path:out+'/'+file});
    rows.push({label,fallback,biome,position,file,playableMs,initial,review:await page.evaluate(()=>{const h=window.__seedE2E;return {terrain:h.content153Review().terrain,sites:h.siteArtReview?.()??null,arrivals:h.terrainArrivalReview?.()??null,siteArrivals:h.siteArrivalReview?.()??null};})});
   }
   const site=await page.evaluate(()=>{const h=window.__seedE2E;h.teleportToPOI();const p=JSON.parse(h.snapshot()).p,cameraX=Math.floor(p[0]/512)*512+256;h.streamingFixture(cameraX,p[1]);return {x:p[0],y:p[1],cameraX};});
   if(label==='A')positions.site=site;else if(JSON.stringify(positions.site)!==JSON.stringify(site))throw Error('A/B site coordinates diverged');
   if(!fallback)await page.waitForFunction(()=>window.__seedE2E.content153Review().terrain.pending===0,null,{timeout:60000});
   await page.waitForTimeout(200);const siteFile=`${label}-${fallback?'fallback':'prepared'}-site-grounding.png`;await page.screenshot({path:out+'/'+siteFile});rows.push({label,fallback,site,file:siteFile,classification:'MATCHED_ORIGINAL_PAINTED_SITE_CONTACT'});
   if(!fallback)for(const viewport of [{width:1280,height:720},{width:2560,height:1305}])for(const lang of ['en','th'])for(const mode of ['normal','reduced','contrast']){
    await page.setViewportSize(viewport);await page.evaluate(([lang,mode])=>{const h=window.__seedE2E;h.setLang(lang);h.streamingFixture(0,0,true,mode==='reduced',mode==='contrast');},[lang,mode]);await page.waitForTimeout(250);
    const file=`${label}-${viewport.width}-${lang}-${mode}.png`;await page.screenshot({path:out+'/'+file});rows.push({label,viewport,lang,mode,file,classification:'STAGED_DENSE_500_800_HIGH_UI_SCALE'});
   }
   await context.close();
  }
  writeFileSync(out+'/index.json',JSON.stringify({classification:'MATCHED_WORLDGEN3_STAGED_PRESENTATION_NOT_HUMAN_ART_OR_FUN_PASS',builds,gpu,rows,errors,limitations:'Same seed/coordinates, age, zoom and graphics mode per A/B material pair. Worker-disabled fallbacks and fully prepared states are separate. CPU post-render observations do not certify photons/GPU execution. Source-art preference and animation production remain human gates.'},null,2));
  if(errors.length)throw Error(JSON.stringify(errors));
 }finally{await browser.close();}
}
