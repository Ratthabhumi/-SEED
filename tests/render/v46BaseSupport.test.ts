import{test,expect}from'vitest';
import*as territory from'../../src/core/world/territory';
import{baseSupport}from'../../src/game/render/BaseSupport';
test('visible recovery boundary is shared with actual economy regen including the edge',()=>{
 expect(territory.ECONOMY_REGEN_RADIUS).toBe(800);
 const t:any={spec:'economy',tier:2,x:0,y:0,disabled:false,hp:100,maxHp:300};
 const s:any={px:800,py:0,build:{hp:50,maxHp:100},over:false};
 expect(baseSupport(t,s,1.25).regen).toBe(territory.economyRegenAt([t],800,0,()=>1.25));
 expect(baseSupport(t,s,1.25).healing).toBe(true);
 s.px=800.01;expect(baseSupport(t,s).healing).toBe(false);
 s.px=0;t.disabled=true;expect(baseSupport(t,s).regen).toBe(0);
 t.disabled=false;s.build.hp=100;expect(baseSupport(t,s).healing).toBe(false);
});
