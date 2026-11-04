import {it,expect} from 'vitest';
import {HeroActions} from '../../src/game/render/heroActions';
import {createWeaponRig,weaponTransform} from '../../src/core/combat/weaponGeometry';
it('floating primary release aims weapon without restarting body punch or walking cycle',()=>{
 const actions=new HeroActions();actions.sync('world');
 const pose=weaponTransform('hunters',0,0,0,createWeaponRig(),1);
 const event={type:'weapon_fired' as const,family:'kinetic' as const,x:pose.muzzleX,y:pose.muzzleY,tx:200,ty:0,release:{owner:'player-primary' as const,time:1,pose,heading:0,index:0,count:1}};
 actions.accept(event,1,0,0,'float');
 expect(actions.pose(1.05,false,false,false)).toBe('idle');expect(actions.pose(1.05,true,false,false)).toBe('walk');expect(actions.revision).toBe(0);
 expect(actions.facing(1.05)).toBe(0);
 actions.accept(event,1,0,0,'hand');expect(actions.pose(1.05,false,false,false)).toBe('attack');
});
