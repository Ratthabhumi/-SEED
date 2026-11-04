import {test,expect} from '@playwright/test';
import {startRun,prepareSave,assertNoRawKeys} from './helpers';
import {ORIGINS} from '../src/core/progression/origins';
async function child(page:any,lang:'en'|'th',width=1280,scale:1|2=1){
 await page.setViewportSize({width,height:width===1280?720:width===1920?1080:1272});
 await startRun(page,'EPOCH-GOLDEN-001',{lang,uiScale:scale});
 await page.evaluate(()=>(window as any).__seedE2E.readyAscend());await page.locator('.hud-ascend button').click();
 await page.locator('#legacy-screen .card').first().click();await page.locator('#origin-screen .card').first().click();
 await page.locator('#child-intro-screen button').click();
 return page.evaluate(()=>(window as any).__seedE2E.stageResearchChoice());
}
for(const lang of ['en','th']as const)for(const width of [1280,1920,2550])test(`research or real raid is an actual World2 decision ${lang} ${width}`,async({page})=>{
 const staged=await child(page,lang,width);await expect(page.locator('.research-tradeoff')).toBeVisible();
 await expect(page.locator('.research-threat')).toContainText('u');await assertNoRawKeys(page);
 const before=await page.evaluate(()=>(window as any).__seedE2E.world2DecisionReview());
 if(width===1280)await expect(page.locator('.research-defend-btn')).toBeInViewport();
 expect(before.knowledge).toBeCloseTo(staged.preview.knowledgeNow);expect(staged.preview.canResearch).toBe(true);
 await page.screenshot({path:`test-results/v51-visible/research-${lang}-${width}.png`});
 expect(await page.evaluate(()=>(window as any).__seedE2E.world2DecisionReview().hash)).toBe(before.hash);
 await page.locator('.research-defend-btn').click();await expect(page.locator('#spec-screen')).toHaveCount(0);
 const after=await page.evaluate(()=>(window as any).__seedE2E.world2DecisionReview());
 expect(after.tracked).toBe(staged.threat);expect(after.sites.find((s:any)=>s.id===staged.support).spec).toBe('');
 expect(after.logistics).toBe(before.logistics);expect(after.knowledge).toBe(before.knowledge);
 await expect.poll(()=>page.evaluate(()=>(window as any).__seedE2E.world2DecisionReview().elapsed)).toBeGreaterThan(before.elapsed);
});
test('choosing Research pays its real cost and produces the projected scarcity recovery',async({page})=>{
 const staged=await child(page,'en');const before=await page.evaluate(()=>(window as any).__seedE2E.world2DecisionReview());
 await page.locator('#spec-screen .terr-spec-btn').first().click();await expect(page.locator('#spec-screen')).toHaveCount(0);
 const after=await page.evaluate(()=>(window as any).__seedE2E.world2DecisionReview());
 expect(after.sites.find((s:any)=>s.id===staged.support).spec).toBe('research');
 expect(after.knowledge).toBeCloseTo(staged.preview.knowledgeAfter);expect(after.logistics-before.logistics).toBe(1);
});
test('Thai200% scarcity decision keeps Later reachable by real keyboard focus',async({page})=>{
 await child(page,'th',1280,2);await page.locator('.spec-later-btn').focus();await expect(page.locator('.spec-later-btn')).toBeInViewport();
 await page.keyboard.press('Enter');await expect(page.locator('#spec-screen')).toHaveCount(0);
});
for(const origin of ['hunters','engineers','resonant','sentinels'])test(`first real draft shows tactical and numerical alternatives ${origin}`,async({page})=>{
 await prepareSave(page);await page.goto('/?e2e');await page.locator('#seed-input').fill('EPOCH-GOLDEN-001');
 await page.locator('.origin-choice').nth(ORIGINS.findIndex(o=>o.id===origin)).click();await page.locator('#start-btn').click();await page.waitForFunction(()=>!!(window as any).__seedE2E);
 await page.evaluate(()=>(window as any).__seedE2E.grant(100));await expect(page.locator('#draft-screen')).toBeVisible();
 await expect(page.locator('#draft-screen .card')).toHaveCount(3);await assertNoRawKeys(page);
 await expect(page.locator('#draft-screen .tactical-choice-detail').first()).toBeVisible();
 for(const action of await page.locator('#draft-screen .card-select, #draft-screen .card-reserve').all())await expect(action).toBeInViewport();
 await page.screenshot({path:`test-results/v51-visible/draft-${origin}.png`});
});
