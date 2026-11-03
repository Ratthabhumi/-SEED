/** Earned presentation identities only. Never consumed by combat or RNG. */
export const COLLECTIBLES=[
 {id:'dawn',slot:'emblem',glyph:'✦',color:'#ffd36b'},
 {id:'ward',slot:'emblem',glyph:'⬡',color:'#62e5cc'},
 {id:'prism',slot:'trail',glyph:'➶',color:'#b49cff'},
 {id:'star',slot:'ornament',glyph:'✧',color:'#80d9ff'},
 {id:'chronicle',slot:'ornament',glyph:'❖',color:'#ffd36b'},
] as const;
export type CollectibleId=typeof COLLECTIBLES[number]['id'];
export type CosmeticSlot=typeof COLLECTIBLES[number]['slot'];
export interface LegacyCollection {owned:CollectibleId[];origins:string[];equipped:Partial<Record<CosmeticSlot,CollectibleId>>}
export const defaultCollection=():LegacyCollection=>({owned:[],origins:[],equipped:{}});
const origins=['hunters','engineers','resonant','sentinels'];
export function cleanCollection(raw:unknown):LegacyCollection {
 const c=defaultCollection();if(!raw||typeof raw!=='object')return c;
 const r=raw as Partial<LegacyCollection>;
 c.owned=COLLECTIBLES.filter(x=>Array.isArray(r.owned)&&r.owned.includes(x.id)).map(x=>x.id);
 c.origins=origins.filter(x=>Array.isArray(r.origins)&&r.origins.includes(x));
 for(const x of COLLECTIBLES)if(c.owned.includes(x.id)&&r.equipped?.[x.slot]===x.id)c.equipped[x.slot]=x.id;
 return c;
}
export type CollectionAchievement={type:'age';origin:string;age:number}|{type:'defense'|'boss'|'ascend'};
export function earnCollection(c:LegacyCollection,a:CollectionAchievement):LegacyCollection {
 const next=cleanCollection(c),grant=(id:CollectibleId)=>{if(!next.owned.includes(id))next.owned.push(id);};
 if(a.type==='age'&&a.age>=1&&origins.includes(a.origin)){
  grant('dawn');if(!next.origins.includes(a.origin))next.origins.push(a.origin);if(next.origins.length>=2)grant('prism');
 }
 if(a.type==='defense')grant('ward');if(a.type==='boss')grant('star');if(a.type==='ascend')grant('chronicle');
 return next;
}
export function equipCollection(c:LegacyCollection,id:string):LegacyCollection {
 const x=COLLECTIBLES.find(x=>x.id===id);if(!x||!c.owned.includes(x.id))return c;
 const next=cleanCollection(c);if(next.equipped[x.slot]===x.id)delete next.equipped[x.slot];else next.equipped[x.slot]=x.id;return next;
}
