import {test,expect} from '@playwright/test';
import {startRun} from './helpers';
test('language rebuild releases the previous boss HUD size observer',async({page})=>{
 await page.addInitScript(()=>{
  const Native=window.ResizeObserver,active=new Set<ResizeObserver>();
  window.ResizeObserver=class extends Native {
   observe(target:Element,options?:ResizeObserverOptions){super.observe(target,options);active.add(this);}
   disconnect(){super.disconnect();active.delete(this);}
  };
  (window as any).__activeResizeObservers=()=>active.size;
 });
 await startRun(page,'EPOCH-GOLDEN-001',{uiScale:2});
 await page.evaluate(()=>(window as any).__seedE2E.stageBossReview('fan'));
 const count=()=>page.evaluate(()=>(window as any).__activeResizeObservers());
 const initial=await count();expect(initial).toBeGreaterThan(0);
 for(const lang of ['th','en','th','en']){
  await page.evaluate(lang=>(window as any).__seedE2E.setLang(lang),lang);
  await expect.poll(count).toBe(initial);
 }
 await page.keyboard.press('Escape'); // resume from language-rebuilt pause
 await page.keyboard.press('Escape');
 await page.locator('#pause-restart-btn').click();
 await expect.poll(count).toBe(initial);
});
