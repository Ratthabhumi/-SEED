import {test,expect} from '@playwright/test';
import {startRun,prepareSave,openPause} from './helpers';
import {writeFileSync} from 'node:fs';
import {readPreviewBuild} from '../scripts/read-preview-build.mjs';
test('prebaked material pixels equal original runtime preparation and survive restart',async({page})=>{
 await startRun(page,'EPOCH-GOLDEN-001');
 const parity=await page.evaluate(()=>(window as any).__seedE2E.terrainSourceParity());
 expect(parity).toHaveLength(4);for(const row of parity){expect(row.different).toBe(0);expect(row.fallbackDifferent).toBe(0);expect(row.bytes).toBe(256*256*4);}
 expect(await page.evaluate(()=>(window as any).__seedE2E.content153Review().terrain.sourceMode)).toBe('offline-exact-rgba-canvas');
 await openPause(page);await page.locator('#pause-restart-btn').click();await page.waitForFunction(()=>(window as any).__seedE2E?.content153Review());
 const again=await page.evaluate(()=>(window as any).__seedE2E.terrainSourceParity());expect(again).toEqual(parity);
});
test('fallback remains complete without Worker and site bases use actual source feet',async({page})=>{
 await page.addInitScript(()=>{Object.defineProperty(window,'Worker',{value:undefined});});
 await startRun(page,'EPOCH-GOLDEN-001');
 const r=await page.evaluate(()=>{const h=(window as any).__seedE2E;h.teleportToPOI();const p=JSON.parse(h.snapshot()).p;h.streamingFixture(Math.floor(p[0]/512)*512+256,p[1]);return {target:[p[0],p[1]],sites:h.siteArtReview(),terrain:h.content153Review().terrain,arrivals:h.terrainArrivalReview()};});
 expect(r.terrain.mode).toBe('source-fallback');expect(r.terrain.tiles).toBeGreaterThan(0);expect(r.terrain.tiles).toBeLessThanOrEqual(64);expect(r.terrain.workerFailed).toBe(false);
 expect(r.sites.length).toBeGreaterThan(0);for(const s of r.sites)expect(s.originY).toBeGreaterThan(.5);
 expect(r.sites.some((s:any)=>Math.abs(s.x-r.target[0])<.01&&Math.abs(s.y-r.target[1]-8)<.01)).toBe(true);
 for(const a of r.arrivals){expect(a.fallbackSubmitMs).not.toBeNull();expect(a.preparedSubmitMs).toBeNull();}
 await page.screenshot({path:'test-results/browser/content161-fallback-site-grounding.png'});
});
test('runtime material control remains available for isolated source-preparation comparisons',async({page})=>{
 await prepareSave(page);await page.goto('/?e2e&terrainSource=runtime');await page.locator('#start-btn').click();await page.waitForFunction(()=>(window as any).__seedE2E?.content153Review());
 expect(await page.evaluate(()=>(window as any).__seedE2E.content153Review().terrain.sourceMode)).toBe('runtime-canvas');
});
test('rejected direct PNG path remains an explicit pixel-identical diagnostic control',async({page})=>{
 await prepareSave(page);await page.goto('/?e2e&terrainSource=prebaked-png');await page.locator('#start-btn').click();await page.waitForFunction(()=>(window as any).__seedE2E?.content153Review());
 expect(await page.evaluate(()=>(window as any).__seedE2E.content153Review().terrain.sourceMode)).toBe('offline-exact-rgba-png');
 const parity=await page.evaluate(()=>(window as any).__seedE2E.terrainSourceParity());
 expect(parity).toHaveLength(4);for(const row of parity){expect(row.different).toBe(0);expect(row.fallbackDifferent).toBe(0);}
});
test('real canonical site discovery receives a visible post-render observation without revealing hidden sites',async({page})=>{
 await startRun(page,'EPOCH-GOLDEN-001');
 await page.evaluate(()=>(window as any).__seedE2E.teleportToPOI());
 await page.waitForFunction(()=>(window as any).__seedE2E.siteArrivalReview().some((r:any)=>r.firstRenderFrame!==undefined));
 const rows=await page.evaluate(()=>(window as any).__seedE2E.siteArrivalReview());
 expect(rows.length).toBeGreaterThan(0);expect(rows.length).toBeLessThanOrEqual(64);
 for(const r of rows.filter((r:any)=>r.firstRenderFrame!==undefined)){expect(r.discoveryToRenderMs).toBeGreaterThanOrEqual(0);expect(r.discoveredSimTime).toBeGreaterThanOrEqual(0);}
 writeFileSync('test-results/browser/content161-site-arrival.json',JSON.stringify({classification:'STAGED_TELEPORT_REAL_CANONICAL_DISCOVERY_NOT_HUMAN_LATENCY',build:await readPreviewBuild(page.url()),rows},null,2));
 await page.screenshot({path:'test-results/browser/content161-real-discovery.png'});
});
