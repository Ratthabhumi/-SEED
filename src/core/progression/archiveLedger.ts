/** Bounded single-active-attempt archive economy. No browser or RNG dependency. */
export interface ArchiveLedger { insight:number; purchased:string[]; nextAttempt:number; lastSettled:number; energyStart:boolean }
export const ARCHIVE_REWARDS = [
 {id:'survival-kit',cost:3,titleKey:'meta.survival',descKey:'meta.survivalDesc'},
 {id:'energy-kit',cost:5,titleKey:'meta.energy',descKey:'meta.energyDesc'},
 {id:'choice-kit',cost:4,titleKey:'meta.choice',descKey:'meta.choiceDesc'},
] as const;
export function defaultLedger():ArchiveLedger {return {insight:0,purchased:[],nextAttempt:1,lastSettled:0,energyStart:false};}
export function cleanLedger(raw:unknown):ArchiveLedger {
 const d=defaultLedger(); if(!raw||typeof raw!=='object')return d;
 const r=raw as Partial<ArchiveLedger>;const valid=(n:unknown,fb:number)=>typeof n==='number'&&Number.isSafeInteger(n)&&n>=0&&n<=1000000?n:fb;
 d.insight=valid(r.insight,0);d.nextAttempt=Math.max(1,valid(r.nextAttempt,1));d.lastSettled=Math.min(d.nextAttempt-1,valid(r.lastSettled,0));
 d.purchased=Array.isArray(r.purchased)?ARCHIVE_REWARDS.filter(o=>r.purchased!.includes(o.id)).map(o=>o.id):[];
 d.energyStart=r.energyStart===true&&d.purchased.includes('energy-kit');return d;
}
export function beginAttempt(a:ArchiveLedger):{ledger:ArchiveLedger;id:number} {return {id:a.nextAttempt,ledger:{...a,nextAttempt:a.nextAttempt+1}};}
export function attemptReward(elapsed:number,highestAge:number,completed:boolean):number {
 if(!Number.isFinite(elapsed)||elapsed<0||!Number.isFinite(highestAge))return 0;
 return 1+Math.min(5,Math.floor(elapsed/60))+Math.max(0,Math.min(5,Math.floor(highestAge)))+(completed?2:0);
}
export function settleAttempt(a:ArchiveLedger,id:number,reward:number):{ledger:ArchiveLedger;earned:number} {
 if(!Number.isSafeInteger(id)||id<=a.lastSettled||id>=a.nextAttempt||!Number.isSafeInteger(reward)||reward<0||reward>13)return {ledger:a,earned:0};
 const earned=Math.min(reward,1000000-a.insight);return {ledger:{...a,lastSettled:id,insight:a.insight+earned},earned};
}
export function purchaseArchive(a:ArchiveLedger,id:string):ArchiveLedger {
 const item=ARCHIVE_REWARDS.find(o=>o.id===id);if(!item||a.purchased.includes(id)||a.insight<item.cost)return a;
 return {...a,insight:a.insight-item.cost,purchased:[...a.purchased,id]};
}
