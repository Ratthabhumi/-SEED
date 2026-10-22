import {describe,it,expect,vi} from 'vitest';
const engine=vi.hoisted(()=>({matrix:{a:1,b:0,c:0,d:1,e:0,f:0},draws:0,fail:false,large:false}));
vi.mock('phaser',()=>({default:{GameObjects:{GetCalcMatrix:()=>({calc:engine.matrix}),Graphics:{prototype:{renderWebGL(_renderer:unknown,src:any,context:unknown){
 engine.draws++;if(engine.fail)throw Error('native draw failed');
 const vertices=engine.large?new Array(131074).fill(0):[engine.matrix.e+1,engine.matrix.f+2,engine.matrix.e+3,engine.matrix.f+4,engine.matrix.e+5,engine.matrix.f+6];
 (src.customRenderNodes.Submitter??src.defaultRenderNodes.Submitter).batch(context,[0,1,2],vertices,[11,22,33],false);
}}}}}}));
import {PreparedGround} from '../../src/game/render/PreparedGround';
function fixture(){
 engine.draws=0;engine.fail=false;engine.large=false;Object.assign(engine.matrix,{a:1,b:0,c:0,d:1,e:0,f:0});
 const submissions:any[]=[];const submitter={batch:(_c:unknown,i:number[],v:number[],t:number[])=>submissions.push({i:[...i],v:[...v],t:[...t]})};
 const graphics:any={alpha:1,pathDetailThreshold:0,commandBuffer:[1],customRenderNodes:{},defaultRenderNodes:{Submitter:submitter},once:vi.fn(),addRenderStep(fn:unknown){this.step=fn;}};
 const prepared=new PreparedGround(graphics),context={camera:{x:0,y:0,width:1280,height:720,addToRenderList:vi.fn()},useCanvas:false,width:1280,height:720},renderer={config:{pathDetailThreshold:0}};
 return {prepared,graphics,submissions,draw:()=>graphics.step(renderer,graphics,context)};
}
describe('static native ground submission lifetime',()=>{
 it('reuses native geometry through translation but rebuilds for zoom and command revisions',()=>{
  const f=fixture();f.draw();engine.matrix.e=.375;engine.matrix.f=-.625;f.draw();
  expect(engine.draws).toBe(1);expect(f.submissions[1]).toEqual({i:[0,1,2],v:[1.375,1.375,3.375,3.375,5.375,5.375],t:[11,22,33]});
  engine.matrix.a=1.25;f.draw();expect(engine.draws).toBe(2);
  f.prepared.invalidate();f.draw();expect(engine.draws).toBe(3);
  expect(f.graphics.customRenderNodes).toEqual({});
 });
 it('retains native fallback and bounds memory for oversized or lit sources',()=>{
  const f=fixture();engine.large=true;f.draw();expect(f.prepared.review()).toMatchObject({overflow:true,vertices:0});f.draw();expect(engine.draws).toBe(2);
  engine.large=false;f.prepared.invalidate();f.draw();expect(f.prepared.review().overflow).toBe(false);
  f.graphics.lighting={};f.draw();expect(engine.draws).toBe(4);
 });
 it('restores a private submitter even when native preparation throws',()=>{
  const f=fixture();const existing=f.graphics.defaultRenderNodes.Submitter;f.graphics.customRenderNodes.Submitter=existing;engine.fail=true;
  expect(f.draw).toThrow('native draw failed');expect(f.graphics.customRenderNodes.Submitter).toBe(existing);expect(f.prepared.review().primitives).toBe(0);
 });
 it('clips only wholly offscreen cached primitives and restores them on camera return',()=>{
  const f=fixture();f.draw();engine.matrix.e=1400;f.draw();expect(f.submissions).toHaveLength(1);expect(f.prepared.review().skipped).toBe(1);
  engine.matrix.e=1275;f.draw();expect(f.submissions).toHaveLength(2); // partially visible, including guard
  engine.matrix.e=0;f.draw();expect(f.submissions).toHaveLength(3);expect(f.submissions[2]).toEqual(f.submissions[0]);
 });
});
