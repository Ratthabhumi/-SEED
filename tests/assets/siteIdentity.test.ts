import {it,expect} from 'vitest';
import {RunSimulation} from '../../src/core/sim/RunSimulation';
import {outpostVisual,drawSpecializedOutpost} from '../../src/game/render/OutpostVisualRegistry';
import {drawKnowledge} from '../../src/game/render/ProjectileRenderer';
import {drawPoi} from '../../src/game/render/WorldRenderer';
import {KNOWLEDGE_ICON} from '../../src/game/render/knowledgeIdentity';
const idle={moveX:0,moveY:0,dashPressed:false};
function recorder(){const calls:unknown[][]=[];return {calls,g:new Proxy({} as any,{get:(_t,key)=>(...args:unknown[])=>{calls.push([key,...args]);}})};}
it('all three specs retain different architecture across six Ages, tiers and damage states',()=>{
 for(let ageIndex=0;ageIndex<6;ageIndex++)for(const tier of [1,2] as const)for(const disabled of [false,true]){
  const silhouettes=new Set<string>(),geometry=new Set<string>();
  for(const spec of ['research','military','economy'] as const){
   const a={x:0,y:0,spec,ageIndex,tier,disabled},v=outpostVisual(a),r=recorder();
   silhouettes.add(v.silhouette);expect(v.annex).toBe(tier===2);expect(v.condition).toBe(disabled?'damaged':'active');
   drawSpecializedOutpost(r.g,a);geometry.add(JSON.stringify(r.calls.filter(c=>!['fillStyle','lineStyle'].includes(c[0] as string))));
  }expect(silhouettes.size).toBe(3);expect(geometry.size).toBe(3);
 }
 expect(outpostVisual({spec:'',ageIndex:0,tier:1,disabled:false}).silhouette).toBe('claim-pad');
 expect(outpostVisual({spec:'research',ageIndex:3,tier:1,disabled:true,repairing:true}).condition).toBe('repairing');
});
it('Age equipment changes actual geometry and destroyed state differs from active',()=>{
 const traces=[];for(let ageIndex=0;ageIndex<6;ageIndex++){const r=recorder();drawSpecializedOutpost(r.g,{x:0,y:0,spec:'military',ageIndex,tier:1,disabled:false});traces.push(JSON.stringify(r.calls.filter(c=>!['fillStyle','lineStyle'].includes(c[0] as string))));}
 expect(new Set(traces).size).toBe(6);
 const active=recorder(),broken=recorder();drawSpecializedOutpost(active.g,{x:0,y:0,spec:'research',ageIndex:3,tier:1,disabled:false});drawSpecializedOutpost(broken.g,{x:0,y:0,spec:'research',ageIndex:3,tier:1,disabled:true});expect(active.calls).not.toEqual(broken.calls);
});
it('free claimed land uses a neutral pad, not a functioning factory before specialization',()=>{
 const pad=recorder(),factory=recorder();
 drawSpecializedOutpost(pad.g,{x:0,y:0,spec:'',ageIndex:3,tier:1,disabled:false});
 drawSpecializedOutpost(factory.g,{x:0,y:0,spec:'economy',ageIndex:3,tier:1,disabled:false});
 expect(pad.calls.filter(c=>c[0]==='fillRect')).toHaveLength(0);
 expect(factory.calls.filter(c=>c[0]==='fillRect').length).toBeGreaterThan(0);
});
it('Knowledge uses the shared codex, cosmetic bob leaves canonical coordinates unchanged',()=>{
 const k={active:true,x:40,y:50,value:4},a=recorder(),b=recorder();
 drawKnowledge(a.g,k,1);drawKnowledge(b.g,k,2);expect(a.calls).not.toEqual(b.calls);expect(k).toEqual({active:true,x:40,y:50,value:4});
 const reduced1=recorder(),reduced2=recorder();drawKnowledge(reduced1.g,k,1,true);drawKnowledge(reduced2.g,k,2,true);expect(reduced1.calls).toEqual(reduced2.calls);
 expect(decodeURIComponent(KNOWLEDGE_ICON)).toContain('viewBox="0 0 24 24"');
});
it('collected event reports the actual canonical gain once, without changing reward or pickup motion',()=>{
 const sim=new RunSimulation({masterSeed:'EPOCH-GOLDEN-001'}),s=sim.state;
 s.spawnT=s.eliteT=s.mineT=999;const k=s.pickups[0]!;Object.assign(k,{active:true,x:s.px,y:s.py,value:7});
 const before=s.knowledgeTotal,ev=sim.step(1/60,idle);expect(k.active).toBe(false);
 expect(ev.find(e=>e.type==='knowledge_collected')).toMatchObject({gained:s.knowledgeTotal-before});
 expect(s.knowledgeTotal-before).toBeGreaterThan(0);expect(sim.step(1/60,idle).some(e=>e.type==='knowledge_collected')).toBe(false);
});
it('Signal architecture persists after discovery and differs from every other POI glyph',()=>{
 const base={wx:0,wy:0,time:0,highContrast:false},signal=recorder(),found=recorder(),other=recorder();
 drawPoi(signal.g,{...base,type:'signal',found:false});drawPoi(found.g,{...base,type:'signal',found:true});drawPoi(other.g,{...base,type:'ruin',found:true});
 expect(found.calls.length).toBeGreaterThan(other.calls.length);expect(signal.calls).not.toEqual(other.calls);
});
