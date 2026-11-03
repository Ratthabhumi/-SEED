import {afterEach,describe,expect,it,vi} from 'vitest';
import {NotificationManager} from '../../src/game/ui/NotificationManager';
class Node {
 children:Node[]=[];parent?:Node;dataset:Record<string,string>={};textContent='';id='';className='';
 append(...nodes:Node[]){for(const n of nodes){n.remove();this.children.push(n);n.parent=this;}}
 replaceChildren(){this.children=[];}setAttribute(){}
 remove(){if(this.parent)this.parent.children=this.parent.children.filter(n=>n!==this);this.parent=undefined;}
}
let managers:NotificationManager[]=[];
afterEach(()=>{managers.forEach(m=>m.dispose());managers=[];vi.useRealTimers();vi.unstubAllGlobals();});
function setup(){
 vi.useFakeTimers();let now=0;
 vi.stubGlobal('performance',{now:()=>now});vi.stubGlobal('document',{hidden:false,createElement:()=>new Node(),querySelector:()=>null});
 const root=new Node(),m=new NotificationManager(root as unknown as HTMLElement);managers.push(m);
 return {m,stack:root.children[0],tick:()=>{now+=1100;vi.advanceTimersByTime(1100);}};
}
describe('bounded encounter notification presentation',()=>{
 it('uses one encounter slot, preserves displaced messages, and restores normal capacity',()=>{
  const {m}=setup();for(let i=0;i<3;i++)m.push('Info'+i,undefined,1000,'info');
  expect(m.counts()).toEqual({visible:3,queued:0});
  m.setEncounterActive(true);expect(m.counts()).toEqual({visible:1,queued:2});
  m.push('Critical',undefined,1000,'critical');expect(m.counts()).toEqual({visible:1,queued:3});
  m.setEncounterActive(false);expect(m.counts()).toEqual({visible:3,queued:1});
 });
 it('never turns a queued critical warning into incoming routine text at capacity',()=>{
  const {m,stack,tick}=setup();
  for(let i=0;i<70;i++)m.push('CRITICAL '+i,undefined,1000,'critical');
  m.push('ROUTINE',undefined,1000,'info');
  const seen:string[]=[];for(let i=0;i<25;i++){seen.push(...stack.children.map(n=>n.children[0]?.textContent??''));tick();}
  expect(seen.some(s=>s.includes('ROUTINE'))).toBe(false);
 });
 it('evicts routine notices before an important queued notice',()=>{
  const {m,stack,tick}=setup();
  for(let i=0;i<3;i++)m.push('CRITICAL '+i,undefined,1000,'critical');
  m.push('IMPORTANT',undefined,1000,'important');
  for(let i=0;i<65;i++)m.push('INFO '+i,undefined,1000,'info');
  expect(m.counts().queued).toBe(64);tick();
  expect(stack.children.some(n=>n.children[0]?.textContent==='IMPORTANT')).toBe(true);
 });
});
