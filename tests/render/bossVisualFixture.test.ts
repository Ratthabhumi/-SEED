import {it,expect} from 'vitest';
import {bossVisualSignature} from '../../scripts/bossVisualFixture.mjs';
const boss={x:0,y:250,hp:100,maxHp:100,radius:40,encounter:{phase:'warning',timer:1.35,cycle:0,pattern:'fan',aimX:0,aimY:0,enraged:false}};
it('matches historical absent and current empty outpost targets without dropping encounter fields',()=>{
 expect(bossVisualSignature({...boss,encounter:{...boss.encounter,outpostId:''}})).toBe(bossVisualSignature(boss));
});
it('still rejects real target, pose, timer, position and HP mismatches',()=>{
 for(const change of [{outpostId:'real-base'},{phase:'attack'},{timer:1.2},{aimX:5},{extraContractField:true}])
  expect(bossVisualSignature({...boss,encounter:{...boss.encounter,...change}})).not.toBe(bossVisualSignature(boss));
 for(const change of [{x:1},{hp:99},{radius:41}])expect(bossVisualSignature({...boss,...change})).not.toBe(bossVisualSignature(boss));
});
