import {it,expect} from 'vitest';
import {RunSimulation} from '../../src/core/sim/RunSimulation';
function owned(sim:RunSimulation){sim.state.territories=[{poiId:'home',poiType:'ruin',x:300,y:400,spec:'research',tier:1,hp:300,maxHp:300,disabled:false,garrisoned:false,heldSince:0,repairT:0}];sim.state.px=300;sim.state.py=400;}
it('reveals a stable enemy approach near an actual active base without moving that base or generated terrain',()=>{
 const a=new RunSimulation({masterSeed:'LOCAL-DEFENSE'}),b=new RunSimulation({masterSeed:'LOCAL-DEFENSE'});owned(a);owned(b);
 const before={...a.state.territories[0]!};const av:any[]=[],bv:any[]=[];(a as any).revealStronghold(av);(b as any).revealStronghold(bv);
 expect(a.state.stronghold).toEqual(b.state.stronghold);expect(a.state.territories[0]).toEqual(before);
 const sh=a.state.stronghold!;expect(Math.hypot(sh.x-before.x,sh.y-before.y)).toBeLessThanOrEqual(900.8);expect(Math.hypot(sh.x-before.x,sh.y-before.y)).toBeGreaterThanOrEqual(399.2);
 const point={...sh};a.state.territories[0]!.x+=5000;(a as any).revealStronghold([]);expect(a.state.stronghold).toEqual(point);
});
it('does not invent a base when none is owned and does not use a disabled base as its anchor',()=>{
 const a=new RunSimulation({masterSeed:'NO-BASE'}),b=new RunSimulation({masterSeed:'NO-BASE'});owned(b);b.state.territories[0]!.disabled=true;
 (a as any).revealStronghold([]);(b as any).revealStronghold([]);expect(a.state.stronghold).toEqual(b.state.stronghold);expect(a.state.territories).toHaveLength(0);
});
