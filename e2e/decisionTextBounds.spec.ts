import {test,expect,type Locator} from '@playwright/test';
import {startRun} from './helpers';

async function textFits(locator:Locator){
 expect(await locator.count()).toBeGreaterThan(0);
 const errors=await locator.evaluateAll(elements=>elements.flatMap(element=>{
  const range=document.createRange();range.selectNodeContents(element);const text=range.getBoundingClientRect(),box=element.getBoundingClientRect();
  return text.width&&(text.left<box.left-1||text.right>box.right+1||element.scrollWidth>element.clientWidth+1)?[{label:element.textContent,text:[text.left,text.right],box:[box.left,box.right]}]:[];
 }));expect(errors).toEqual([]);
}
for(const lang of ['en','th'] as const)test(`draft and boss decisions contain real glyph bounds at720p/200% ${lang}`,async({page})=>{
 await page.setViewportSize({width:1280,height:720});await startRun(page,'EPOCH-GOLDEN-001',{lang,uiScale:2});
 await page.evaluate(()=>(window as any).__seedE2E.grant(100));await page.evaluate(()=>document.fonts.ready);
 await expect(page.locator('#draft-screen .card')).toHaveCount(3);
 await textFits(page.locator('#draft-screen .card button'));
 await textFits(page.locator('#draft-screen .card h3'));
 await textFits(page.locator('#draft-screen .draft-agency button'));
 await page.screenshot({path:`test-results/browser/content18-draft-glyphs-${lang}.png`});
 await page.evaluate(()=>{const h=(window as any).__seedE2E;h.stageBossReview('cross');h.bossPhaseReview();h.notificationReset();});
 await textFits(page.locator('#boss-encounter strong, #boss-encounter span'));
 if(lang==='th')expect(await page.locator('#boss-encounter').evaluate(e=>parseFloat(getComputedStyle(e).lineHeight)/parseFloat(getComputedStyle(e).fontSize))).toBeGreaterThanOrEqual(1.7);
 await page.screenshot({path:`test-results/browser/content18-boss-glyphs-${lang}.png`});
});
