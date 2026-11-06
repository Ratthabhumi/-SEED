import {it,expect} from 'vitest';
import {defaultCollection,earnCollection,equipCollection,cleanCollection} from '../../src/core/progression/legacyCollection';
import {loadSave,SAVE_KEY} from '../../src/core/save/save';
it('earns a bounded first-three-run collection from real achievements without duplicates',()=>{
 let c=earnCollection(defaultCollection(),{type:'age',origin:'hunters',age:1});expect(c.owned).toEqual(['dawn']);
 c=earnCollection(c,{type:'defense'});c=earnCollection(c,{type:'age',origin:'engineers',age:1});
 c=earnCollection(c,{type:'boss'});c=earnCollection(c,{type:'ascend'});
 expect(c.owned).toEqual(['dawn','ward','prism','star','chronicle']);
 expect(earnCollection(c,{type:'boss'})).toEqual(c);
});
it('requires real progress for origin variety and validates equip/unequip and corrupt IDs',()=>{
 let c=earnCollection(defaultCollection(),{type:'age',origin:'hunters',age:0});expect(c.origins).toEqual([]);
 c=earnCollection(c,{type:'age',origin:'hunters',age:1});
 expect(equipCollection(c,'star')).toEqual(c);c=equipCollection(c,'dawn');expect(c.equipped.emblem).toBe('dawn');
 expect(equipCollection(c,'dawn').equipped.emblem).toBeUndefined();
 expect(cleanCollection({owned:['dawn','bad','dawn'],origins:['bad','hunters'],equipped:{emblem:'star',trail:'dawn'}})).toEqual({owned:['dawn'],origins:['hunters'],equipped:{}});
});
it('migrates schema2 without losing Insight, purchases, history or settings',()=>{
 const raw={schema:2,meta:{insight:8,purchased:['survival-kit'],nextAttempt:4,lastSettled:2},settings:{lang:'th'},history:['SEED'],best:{runs:3}};
 const s=loadSave({getItem:k=>k===SAVE_KEY?JSON.stringify(raw):null});
 expect(s.schema).toBe(4);expect(s.meta.insight).toBe(8);expect(s.meta.purchased).toEqual(['survival-kit']);expect(s.settings.lang).toBe('th');expect(s.history).toEqual(['SEED']);expect(s.collection).toEqual(defaultCollection());
});
it('roundtrips earned/equipped state and rejects future schema safely',()=>{
 const c=equipCollection(earnCollection(defaultCollection(),{type:'boss'}),'star');
 expect(loadSave({getItem:()=>JSON.stringify({schema:3,collection:c})}).collection).toEqual(c);
 expect(loadSave({getItem:()=>JSON.stringify({schema:99,collection:c})}).collection).toEqual(defaultCollection());
});
it('keeps equipped identity when Ascension earns another ornament without auto-equipping it',()=>{
 const before=equipCollection(earnCollection(defaultCollection(),{type:'boss'}),'star');const after=earnCollection(before,{type:'ascend'});
 expect(after.owned).toContain('chronicle');expect(after.equipped).toEqual(before.equipped);
});
