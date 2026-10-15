import {test,expect} from '@playwright/test';
import {startRun,openPause} from './helpers';
for(const lang of ['en','th'] as const)test(`pause scale labels remain inside their buttons at200% on720p ${lang}`,async({page})=>{
 await page.setViewportSize({width:1280,height:720});
 await startRun(page,'EPOCH-GOLDEN-001',{lang,uiScale:2});await openPause(page);
 await page.evaluate(()=>document.fonts.ready);
 const group=page.locator('#pause-screen .pause-display .lang-row').first();
 const overflow=await group.locator('button').evaluateAll(buttons=>buttons.flatMap(b=>{
  const range=document.createRange();range.selectNodeContents(b);const text=range.getBoundingClientRect(),box=b.getBoundingClientRect();
  return text.left<box.left+1||text.right>box.right-1?[{label:b.textContent,text:{left:text.left,right:text.right},button:{left:box.left,right:box.right}}]:[];
 }));expect(overflow).toEqual([]);
 expect(await group.evaluate(g=>g.scrollWidth<=g.clientWidth+1)).toBe(true);
 await group.getByRole('button',{name:'150%',exact:true}).focus();await page.keyboard.press('Enter');
 await expect(group.getByRole('button',{name:'150%',exact:true})).toHaveClass(/active/);
 await group.getByRole('button',{name:'200%',exact:true}).click();
 await page.screenshot({path:`test-results/browser/pause-scale-contained-${lang}.png`});
});
