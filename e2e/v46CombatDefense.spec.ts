import{test,expect}from'@playwright/test';
import{startRun,assertNoRawKeys}from'./helpers';
for(const lang of ['en','th'] as const)for(const width of [1280,1920,2550])test(`actual recovery/loss/repair ${lang} ${width}`,async({page})=>{
 await page.setViewportSize({width,height:width===1280?720:width===1920?1080:1272});await startRun(page,'EPOCH-GOLDEN-001',{lang,contrast:width===2550?'high':'normal'});
 if(width===2550)await expect(page.locator('html')).toHaveAttribute('data-contrast','high');
 const id=await page.evaluate(()=>(window as any).__seedE2E.stageSpecRegression(false,false));await page.keyboard.press('Escape');
 await page.evaluate(id=>(window as any).__seedE2E.stageSupportReview(id),id);
 const read=()=>page.evaluate(()=>(window as any).__seedE2E.v46FeedbackReview());
 const before=await read();expect(before.posts.find((p:any)=>p.id===id).healing).toBe(true);
 await page.evaluate(()=>(window as any).__seedE2E.advanceEvolution(1));expect((await read()).hp).toBeGreaterThan(before.hp);
 await assertNoRawKeys(page);await page.screenshot({path:`test-results/v46-visible/economy-${lang}-${width}.png`});
 await page.evaluate(id=>(window as any).__seedE2E.stageSupportReview(id,true),id);const lost=await read();expect(lost.posts.find((p:any)=>p.id===id).disabled).toBe(true);expect(lost.beats).toBeGreaterThan(0);
 await page.evaluate(()=>(window as any).__seedE2E.advanceEvolution(1));const disabled=await read();expect(disabled.hp).toBe(lost.hp);expect(disabled.posts.find((p:any)=>p.id===id).healing).toBe(false);
 const recovery=await page.evaluate(()=>(window as any).__seedE2E.advanceFeedbackEvent('repair'));expect(recovery.event.type).toBe('outpost_repaired');expect(recovery.beats).toBeGreaterThan(0);
 await page.evaluate(()=>(window as any).__seedE2E.advanceEvolution(1));
 const repaired=await read();expect(repaired.posts.find((p:any)=>p.id===id).disabled).toBe(false);expect(repaired.hp).toBeGreaterThan(disabled.hp);
 expect(repaired.beats).toBeLessThanOrEqual(8);
 await page.evaluate(()=>(window as any).__seedE2E.advanceEvolution(2));expect((await read()).beats).toBe(0);
});
for(const reduced of [false,true])test(`actual hit feedback and family audio reduced=${reduced}`,async({page})=>{
 await page.addInitScript(()=>{const out:number[]=[];(window as any).__v46Tones=out;const original=AudioContext.prototype.createOscillator;AudioContext.prototype.createOscillator=function(){const o=original.call(this),set=o.frequency.setValueAtTime.bind(o.frequency);o.frequency.setValueAtTime=(v,t)=>{out.push(v);return set(v,t);};return o;};});
 // Prepare the setting before play; a natural Draft can legitimately own Esc.
 await startRun(page,'EPOCH-GOLDEN-001',{reducedEffects:reduced});
 await page.evaluate(()=>(window as any).__seedE2E.stageFamilyReview('kinetic'));await page.waitForTimeout(100);
 const hit=await page.evaluate(()=>{(window as any).__v46Tones.length=0;return(window as any).__seedE2E.advanceFeedbackEvent('impact');});expect(hit.feedback.impacts).toBeGreaterThan(0);expect(hit.event.hpDamage+hit.event.shieldDamage).toBeGreaterThan(0);
 expect(await page.evaluate(()=>(window as any).__seedE2E.v46FeedbackReview().feedbackDepth??0)).toBeGreaterThan(6);
 await expect.poll(()=>page.evaluate(()=>(window as any).__seedE2E.v46FeedbackReview().feedbackCommands)).toBeGreaterThan(0);
 const commands=await page.evaluate(()=>(window as any).__seedE2E.v46FeedbackReview().feedbackCommands);
 const frequency=hit.cue.shield?1080:({kinetic:185,energy:760,defense:410,field:115} as const)[hit.cue.family as 'kinetic'];
 expect(await page.evaluate(v=>(window as any).__v46Tones.includes(v),frequency)).toBe(true);
 const snapshot=await page.evaluate(()=>(window as any).__seedE2E.snapshot());await page.waitForTimeout(150);
 expect(await page.evaluate(()=>(window as any).__seedE2E.snapshot())).toBe(snapshot);
 expect(await page.evaluate(()=>(window as any).__seedE2E.v46FeedbackReview().feedbackCommands)).toBe(commands);
 await page.screenshot({path:`test-results/v46-visible/impact-${reduced?'reduced':'normal'}.png`});
});
