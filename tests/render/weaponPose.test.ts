import {it,expect} from 'vitest';
import {playerRelease} from '../../src/game/render/weaponPose';
import {HeroActions} from '../../src/game/render/heroActions';
import {weaponTransform,createWeaponRig} from '../../src/core/combat/weaponGeometry';
it('tracks trusted distant primary releases, excluding nearby autonomous sources',()=>{
 const actions=new HeroActions();actions.sync('parent');
 const pose=weaponTransform('hunters',0,10,20,{...createWeaponRig(),heading:Math.PI},5);
 const shot={type:'beam_fired' as const,family:'energy' as const,tier:4,x1:pose.muzzleX,y1:pose.muzzleY,x2:-90,y2:20,
  release:{owner:'player-primary' as const,time:5,pose,heading:Math.PI,index:0,count:1}};
 expect(playerRelease(shot,10,20)?.heading).toBe(Math.PI);
 actions.accept(shot,5,10,20);expect(actions.facing(5.1)).toBe(Math.PI);expect(actions.facing(5.2)).toBeUndefined();
 actions.sync('child');expect(actions.facing(0)).toBeUndefined();
 expect(playerRelease({...shot,release:undefined,x1:10,y1:20},10,20)).toBeUndefined();
 for(const family of ['defense','field'] as const)expect(playerRelease({type:'weapon_fired',family,x:10,y:20,tx:-90,ty:20},10,20)).toBeUndefined();
});
