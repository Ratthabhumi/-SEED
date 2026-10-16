import {it,expect} from 'vitest';
import {WarningReaction,bossPolicyEvaluation,type ObservedWarning} from '../../scripts/bossWarningPolicy';
import {RunSimulation} from '../../src/core/sim/RunSimulation';
import {bossAreaHit} from '../../src/core/combat/bossEncounter';
const base={moveX:0,moveY:1,dashPressed:false};
const warning:ObservedWarning={id:'first',phase:'warning',pattern:'slam',x:-200,y:0,aimX:0,aimY:0};
it('uses no unobserved warning or anticipatory input during reaction delay',()=>{
 const policy=new WarningReaction(.3);
 expect(policy.input(0,0,0,true,base)).toBe(base);
 expect(policy.input(1,0,0,true,base,warning)).toBe(base);
 expect(policy.input(1.29,0,0,true,base,warning)).toBe(base);
 expect(policy.input(1.3,0,0,true,base,warning).dashPressed).toBe(true);
});
it('escapes both perpendicular cross bars with normalized movement and no unavailable dash',()=>{
 const policy=new WarningReaction(.15),w={...warning,pattern:'cross' as const};
 policy.input(0,0,0,false,base,w);
 const input=policy.input(.2,0,0,false,base,w);
 expect(Math.hypot(input.moveX,input.moveY)).toBeCloseTo(1);
 expect(input.dashPressed).toBe(false);
 expect(bossAreaHit('cross',w.x,w.y,w.aimX,w.aimY,input.moveX*80,input.moveY*80)).toBe(false);
});
it('resets reaction latency for each newly visible attack and ignores fan prediction',()=>{
 const policy=new WarningReaction(.3);policy.input(0,0,0,true,base,warning);
 expect(policy.input(2,0,0,true,base,{...warning,id:'second'})).toBe(base);
 expect(policy.input(3,0,0,true,base,{...warning,id:'second',pattern:'fan'})).toBe(base);
});
it('does not mutate real simulation or baseline inputs when nothing visible warrants intervention',()=>{
 const a=new RunSimulation({masterSeed:'EPOCH-GOLDEN-001'}),b=new RunSimulation({masterSeed:'EPOCH-GOLDEN-001'}),wrapped=bossPolicyEvaluation(b,.3);
 for(let i=0;i<120;i++){a.step(1/60,base);wrapped.simulation.step(1/60,base);}
 expect(a.snapshot()).toBe(b.snapshot());expect(wrapped.report.interventions).toBe(0);expect(base).toEqual({moveX:0,moveY:1,dashPressed:false});
});
