import {it,expect} from 'vitest';
import {SiteArrival} from '../../src/game/render/siteArrival';
it('separates discovery, fog eligibility and actual visible render observation with bounded lifecycle',()=>{
 const a=new SiteArrival();a.discover('one',['known'],12,100);
 a.afterRender(()=>true,1,110);expect(a.review()[0].firstRenderFrame).toBeUndefined();
 a.drawn('hidden',0,0);expect(a.review()).toHaveLength(1);
 a.drawn('known',30,40);a.afterRender(()=>false,2,120);expect(a.review()[0].firstRenderFrame).toBeUndefined();
 a.afterRender(()=>true,3,135);expect(a.review()[0].discoveryToRenderMs).toBe(35);
 a.afterRender(()=>true,4,200);expect(a.review()[0].firstRenderFrame).toBe(3);
 a.discover('two',Array.from({length:80},(_,i)=>String(i)),0,300);expect(a.review()).toHaveLength(64);expect(a.review().some(r=>r.poiId==='known')).toBe(false);
 a.reset();expect(a.review()).toEqual([]);
});
