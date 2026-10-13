// Explicit staged canonical combat/renderer capture; not human playtest evidence.
import {chromium} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
const url=process.argv[2]??'http://127.0.0.1:4173',out=process.argv[3]??'test-results/browser';mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true});
try{
 const context=await browser.newContext({viewport:{width:1600,height:900},recordVideo:{dir:out,size:{width:1280,height:720}}});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>localStorage.setItem('seed-game-save-v1',JSON.stringify({schema:1,settings:{lang:'en',tutorialCompleted:true,uiScale:1,volume:0},archive:[],history:[],best:{}})));
 await page.goto(url+'/?e2e');await page.locator('#seed-input').fill('EPOCH-GOLDEN-001');await page.locator('#start-btn').click();await page.waitForFunction(()=>window.__seedE2E);
 for(const origin of ['hunters','engineers','resonant','sentinels']){
  await page.evaluate(o=>window.__seedE2E.stageEvolution(o,3),origin);await page.waitForTimeout(4000);
 }
 const video=await page.video().path();await context.close();
 writeFileSync(out+'/combat-video.json',JSON.stringify({fixture:true,age:3,origins:['hunters','engineers','resonant','sentinels'],video:video.split(/[\\/]/).pop(),errors,limitations:'Staged high-HP arena; real canonical attacks and renderer, not human or hardware acceptance.'},null,2));
 if(errors.length)throw Error(errors.join('; '));console.log('Saved staged four-Origin encounter capture');
}finally{await browser.close();}
