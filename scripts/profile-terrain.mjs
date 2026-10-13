// Reproducible staged renderer benchmark, not human or hardware acceptance.
// Usage: node scripts/profile-terrain.mjs URL OUTPUT [minutes]
import {chromium} from '@playwright/test';
import {mkdirSync,writeFileSync,openSync,writeSync,closeSync} from 'node:fs';
import {dirname,basename} from 'node:path';
const [url='http://127.0.0.1:4173',output='test-results/browser/terrain-profile.json',minutes='0']=process.argv.slice(2);
const browser=await chromium.launch({headless:true});
const startedAt=new Date().toISOString();
process.once('SIGINT',async()=>{await browser.close();process.exit(130);});
try{
 const diagnostic=await browser.newBrowserCDPSession(),system=(await diagnostic.send('SystemInfo.getInfo')).gpu;
 const page=await browser.newPage({viewport:{width:1280,height:720}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
  const counts={createdTextures:0,deletedTextures:0,fullTextureCalls:0,partialTextureCalls:0,rgbaEquivalentBytes:0,drawCalls:0,submittedElements:0};
  window.__terrainGL=counts;
  for(const ctor of [window.WebGLRenderingContext,window.WebGL2RenderingContext])if(ctor){
   const proto=ctor.prototype;
   for(const name of ['createTexture','deleteTexture','texImage2D','texSubImage2D','drawArrays','drawElements']){
    const original=proto[name];proto[name]=function(...args){
     if(name==='createTexture')counts.createdTextures++;else if(name==='deleteTexture')counts.deletedTextures++;
     else if(name==='drawArrays'||name==='drawElements'){counts.drawCalls++;counts.submittedElements+=name==='drawArrays'?args[2]:args[1];}
     else{
      const full=name==='texImage2D';if(full)counts.fullTextureCalls++;else counts.partialTextureCalls++;
      const source=args.at(-1),w=typeof source?.width==='number'?source.width:(full?args[3]:args[4]),h=typeof source?.height==='number'?source.height:(full?args[4]:args[5]);
      if(Number.isFinite(w)&&Number.isFinite(h))counts.rgbaEquivalentBytes+=w*h*4;
     }
     return original.apply(this,args);
    };
   }
  }
 });
 await page.addInitScript(()=>localStorage.setItem('seed-game-save-v1',JSON.stringify({schema:1,settings:{lang:'en',tutorialCompleted:true,uiScale:1,volume:0},archive:[],history:[],best:{}})));
 await page.goto(url+'/?e2e');await page.locator('#seed-input').fill('EPOCH-GOLDEN-001');await page.locator('#start-btn').click();await page.waitForFunction(()=>window.__seedE2E);
 const tracing=process.env.SEED_TRACE==='1'?await page.context().newCDPSession(page):null;
 if(tracing)await tracing.send('Tracing.start',{categories:'devtools.timeline,blink.user_timing,toplevel,v8',transferMode:'ReturnAsStream'});
 const rows=[];
 for(const [width,height] of [[1280,720],[1920,1080]]){
  await page.setViewportSize({width,height});
  for(const mode of ['normal','reduced','contrast']){
   const data=await page.evaluate(async({mode})=>{
    const h=window.__seedE2E,longTasks=[];
    const observer=new PerformanceObserver(list=>{for(const e of list.getEntries())if(longTasks.length<120)longTasks.push({start:e.startTime,duration:e.duration});});
    observer.observe({type:'longtask',buffered:false});
    h.streamingFixture(0,0,false,mode==='reduced',mode==='contrast');
    await new Promise(r=>setTimeout(r,1800));
    const samples=[];let previous=performance.now();
    for(let i=0;i<100;i++){
     const at=await new Promise(r=>requestAnimationFrame(r));
     const interval=at-previous;previous=at;
     const segment=Math.floor(i/20),n=i%20;
     const x=segment===0?0:segment===1?n*64:segment===2?1280+n*64:segment===3?2560+n*256:(19-n)*64;
     const y=segment===2?n*64:segment===3?1280+n*256:0;
     const state=h.streamingMove(x,y),perf=h.performanceSamples();samples.push({interval,segment,...state,rendererCpuApiMs:perf.rendererCpuSubmit.at(-1)??null,simStepMs:perf.sim.at(-1)??null,gl:{...window.__terrainGL}});
    }
    observer.disconnect();return {samples,longTasks};
   },{mode});
   rows.push({viewport:[width,height],mode,...data});
   mkdirSync(dirname(output),{recursive:true});await page.screenshot({path:output.replace(/\.json$/,'')+`-${width}-${mode}.png`});
   console.log(`sampled ${width} ${mode}`);
  }
 }
 // Representative 500-enemy/800-projectile render work. Canonical simulation is
 // deliberately paused; never label these timings sim-step or real-play pacing.
 const dense=await page.evaluate(async()=>{
  const h=window.__seedE2E;h.streamingFixture(0,0,true,false,false);const rows=[];let previous=performance.now();
  for(let i=0;i<40;i++){const at=await new Promise(r=>requestAnimationFrame(r));rows.push({interval:at-previous,...h.streamingMove(i*128,i*128)});previous=at;}
  h.streamingFixture(0,0);return rows;
 });
 let traceFile=null;
 if(tracing){
  const complete=new Promise(resolve=>tracing.once('Tracing.tracingComplete',resolve));await tracing.send('Tracing.end');const {stream}=await complete;
  traceFile=output.replace(/\.json$/,'')+'.trace.json';mkdirSync(dirname(traceFile),{recursive:true});const file=openSync(traceFile,'w');
  try{let eof=false;while(!eof){const block=await tracing.send('IO.read',{handle:stream});writeSync(file,Buffer.from(block.data,block.base64Encoded?'base64':'utf8'));eof=block.eof;}}
  finally{closeSync(file);await tracing.send('IO.close',{handle:stream});}
 }
 const stability=Number(minutes)>0?await page.evaluate(async mins=>{
  const h=window.__seedE2E,start=performance.now(),trend=[];let lap=0;
  while(performance.now()-start<mins*60000){
   h.streamingMove((lap%20)*512,Math.floor(lap/20)%2*512);
   await new Promise(r=>setTimeout(r,1000));
   if(lap%30===0)trend.push({seconds:(performance.now()-start)/1000,heap:performance.memory?.usedJSHeapSize??null,terrain:h.integratedReview().terrain,gl:{...window.__terrainGL}});lap++;
  }
  return {durationMs:performance.now()-start,trend};
 },Number(minutes)):null;
 const percentile=(values,p)=>{const a=[...values].sort((x,y)=>x-y);return a[Math.min(a.length-1,Math.floor(a.length*p/100))];};
 const summarize=a=>({samples:a.length,frameMs:[50,95,99].map(p=>percentile(a.map(s=>s.interval),p)),worstMs:Math.max(...a.map(s=>s.interval)),spikes:[16.7,33.3,50,100].map(t=>({aboveMs:t,frames:a.filter(s=>s.interval>t).length})),refreshGroundMs:[50,95,99].map(p=>percentile(a.map(s=>s.refreshGroundMs),p)),worstRefreshMs:Math.max(...a.map(s=>s.refreshGroundMs))});
 const report={scenario:'staged renderer, same seed/trajectory/workload; simulation paused',streamingBudget:{refreshP95Ms:4,refreshWorstMs:8,tilesUploadedPerFrame:1,bytesPerUpload:262144},gpu:{devices:system.devices.map(d=>({vendor:d.vendorString,device:d.deviceString})),renderer:system.auxAttributes?.glRenderer},limitations:'Wall RAF intervals include GPU/OS scheduling; upload-call CPU duration is not GPU completion. GL counters cover ALL context API calls, RGBA-equivalent upload volume is not retained GPU memory; submitted elements are not unique vertices. Sim-step samples precede this paused fixture. Hardware60FPS and human acceptance remain pending. Long-task events are not exclusive terrain/GC attribution.',rows:rows.map(r=>({...r,summary:summarize(r.samples)})),dense:{enemies:500,projectiles:800,summary:summarize(dense),samples:dense},stability,errors};
 report.startedAt=startedAt;report.completedAt=new Date().toISOString();report.traceFile=traceFile?basename(traceFile):null;
 mkdirSync(dirname(output),{recursive:true});writeFileSync(output,JSON.stringify(report,null,2));console.log(JSON.stringify(report.rows.map(r=>({viewport:r.viewport,mode:r.mode,...r.summary}))));
 if(errors.length)throw Error(errors.join('; '));
}finally{await browser.close();}
