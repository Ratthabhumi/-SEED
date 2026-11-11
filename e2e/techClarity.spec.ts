import{test,expect}from'@playwright/test';import{startRun,assertNoRawKeys,resolveDrafts}from'./helpers';
for(const lang of ['th','en']as const)for(const width of [1278,1280,1920])for(const uiScale of [1,2])test('technology clarity '+lang+' '+width+' '+uiScale,async({page})=>{
 await page.setViewportSize({width,height:width===1278?608:width===1280?720:1080});await startRun(page,'EPOCH-GOLDEN-001',{lang,uiScale});
 await page.evaluate(()=>(window as any).__seedE2E.grant(100));await expect(page.locator('.card')).toHaveCount(3);
 const techs=await page.evaluate(()=>JSON.parse((window as any).__seedE2E.snapshot()).tech);
 for(const card of await page.locator('.card').all()){
 const id=await card.getAttribute('data-node-id'),node=techs.find((n:any[])=>n[0]===id);
 if(node?.[6]?.[0]?.kind==='knowledgeMul'){await expect(card.locator('.technology-figure')).toHaveAttribute('data-meaning','knowledge');}
 if(await card.locator('.technology-figure img').count()){expect(node).toBeTruthy();await expect(card.locator('.technology-figure')).toHaveAttribute('data-domain',node[2]);await expect(card.locator('.technology-figure img')).toBeVisible();await expect.poll(()=>card.locator('.technology-figure img').evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBe(true);}await expect(card.locator('.card-front .quality')).toBeVisible();await expect(card.locator('.choice-category')).toBeVisible();expect(await card.evaluate(e=>e.scrollHeight<=e.clientHeight+2)).toBe(true);}
 await page.mouse.move(5,5);await expect.poll(()=>page.locator('.card-select').evaluateAll(nodes=>{const rows=nodes.map(n=>n.getBoundingClientRect().top);return Math.max(...rows)-Math.min(...rows);})).toBeLessThanOrEqual(2);
 if(uiScale===1&&width!==1278)for(const b of await page.locator('.card-select,.card-details,.card-reserve').all())await expect(b).toBeInViewport();
 await page.locator('.card-details').first().click();await expect(page.locator('.draft-detail-panel')).toBeVisible();await page.keyboard.press('Escape');await expect(page.locator('.card-details').first()).toBeFocused();await assertNoRawKeys(page);
 await page.screenshot({path:'test-results/browser/tech-clarity/cards-'+lang+'-'+width+'-'+uiScale+'.png'});
 await page.locator('.card-select').first().click();await resolveDrafts(page);await expect(page.locator('#draft-screen')).toHaveCount(0);await page.keyboard.press('t');await expect(page.locator('.techmap-branches button')).toHaveCount(4);
 await page.locator('.techmap-branches button').nth(1).click();await expect(page.locator('.techmap-branches button').nth(1)).toHaveAttribute('aria-pressed','true');
 const node=page.locator('.techmap-node.selected');await expect(node).toBeInViewport();await node.click();await expect(node).toHaveAttribute('aria-pressed','true');await expect(page.locator('.techmap-side .techmap-desc')).toBeVisible();
 for(const state of ['owned','available','future','locked'])expect(await page.locator('.techmap-node[data-state='+state+']').count()).toBeGreaterThan(0);
 await assertNoRawKeys(page);await page.screenshot({path:'test-results/browser/tech-clarity/tree-'+lang+'-'+width+'-'+uiScale+'.png'});
});

test('large text keeps all three decision rows aligned',async({page})=>{
 await page.setViewportSize({width:1280,height:720});await startRun(page,'EPOCH-GOLDEN-001',{lang:'en',uiScale:2});await page.evaluate(()=>(window as any).__seedE2E.grant(100));await expect(page.locator('.card-select')).toHaveCount(3);await page.mouse.move(5,5);
 await expect.poll(()=>page.locator('.card-select').evaluateAll(nodes=>{const rows=nodes.map(n=>n.getBoundingClientRect().top);return Math.max(...rows)-Math.min(...rows);})).toBeLessThanOrEqual(2);
});
