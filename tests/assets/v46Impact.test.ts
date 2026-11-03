import{test,expect}from'vitest';
import{CombatFeedback}from'../../src/game/render/CombatFeedback';
test('reduced effects retains essential actual hit confirmation',()=>{const fx=new CombatFeedback();fx.accept({type:'weapon_impact',family:'kinetic',x:10,y:20,hpDamage:12,shieldDamage:0},1,true);expect(fx.counts(1).impacts).toBe(1);expect(fx.counts(1.3).impacts).toBe(0);});
test('zero resolved damage never falsely confirms a hit',()=>{const fx=new CombatFeedback();fx.accept({type:'energy_impact',x:0,y:0,hpDamage:0,shieldDamage:0,source:'energy'},1,false);expect(fx.counts(1).impacts).toBe(0);});
test('switching reduced effects during a detonation never invents hit confirmation',()=>{const fx=new CombatFeedback();fx.accept({type:'mine_detonated',x:0,y:0,radius:60},1,false);let calls=0;const g:any=new Proxy({},{get:()=>()=>{calls++;}});fx.draw(g,1,true,()=>true);expect(calls).toBe(0);});
test('actual upgraded weapon stage changes impact silhouette without changing the event',()=>{
 const e:any={type:'weapon_impact',family:'kinetic',x:0,y:0,hpDamage:20,shieldDamage:0},before=JSON.stringify(e);
 const draw=(tier:number)=>{const methods:string[]=[];const g:any=new Proxy({},{get:(_,name)=>()=>{methods.push(String(name));return g;}});const f=new CombatFeedback();f.accept(e,1,false,'hunters',{kinetic:tier,energy:0,defense:0,field:0});f.draw(g,1.1,false,()=>true);return methods;};
 expect(draw(0)).not.toContain('strokeRect');expect(draw(5)).toContain('strokeRect');expect(JSON.stringify(e)).toBe(before);
});
