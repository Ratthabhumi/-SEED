import {it,expect} from 'vitest';
import {guardianCount} from '../../src/game/render/weaponPresentation';
import {ActorRenderer} from '../../src/game/render/ActorRenderer';
import {ActorMotion,facingPolicy} from '../../src/game/render/actorMotion';
import {projectileIdentity,projectileRole} from '../../src/game/render/ageVisualIdentity';
it('upright actor display stays level for four movement headings and six Ages; pools clear flip on reuse',()=>{
 const values:any={};const image:any={visible:true};for(const name of ['setDepth','setTexture','setPosition','setDisplaySize','setRotation','setFlipX','setTint','setVisible'])image[name]=(...args:any[])=>{values[name]=args;if(name==='setVisible')image.visible=args[0];return image;};
 const renderer=new ActorRenderer({add:{image:()=>image}} as any,1,4);
 for(const id of ['hunters','engineers','resonant','sentinels'] as const)for(let age=0;age<6;age++)for(const heading of [0,Math.PI/2,Math.PI,-Math.PI/2]){renderer.begin();renderer.draw(id,0,0,48,heading,1,true,0xffffff,age,{heading,moving:true,flip:heading===Math.PI,back:heading===-Math.PI/2});renderer.end();expect(values.setRotation).toEqual([0]);expect(values.setTexture[1]).toBe(age*3+1+(heading===-Math.PI/2?18:0));expect(values.setFlipX[0]).toBe(heading===Math.PI);}
 renderer.begin();renderer.draw('chaser',0,0,32,Math.PI,1,true);expect(values.setRotation[0]).toBeCloseTo(Math.PI*1.5);expect(values.setFlipX).toEqual([false]);expect(renderer.size).toBe(1);
 renderer.begin();renderer.end();expect(image.visible).toBe(false);expect(facingPolicy('boss')).toBe('upright');
});
it('squad pose comes from real displacement, freezes when paused, settles on hold and resets per world',()=>{
 const motion=new ActorMotion(),ally={};motion.sample(ally,0,0,0);let p=motion.sample(ally,-2,0,0.02);expect(p).toMatchObject({moving:true,flip:true,back:false});p=motion.sample(ally,-2,-4,0.04);expect(p).toMatchObject({moving:true,flip:true,back:true});motion.sample(ally,-2,-4,0.04);expect(p.moving).toBe(true);expect(motion.sample(ally,-2,-4,0.2).moving).toBe(false);motion.reset();expect(motion.sample(ally,999,999,0)).toMatchObject({moving:false,flip:false,back:false});
});
it('projectile identity reads source and spawn-tier rather than color or current Age',()=>{const p:any={src:'kinetic',visualTier:3,color:123};expect(projectileIdentity(p).form).toBe('bullet');p.color=999;expect(projectileIdentity(p).id).toBe('industrial');p.src='energy';expect(projectileRole(p)).toBe('energy');p.src='squad';expect(projectileRole(p)).toBe('squad');for(let tier=0;tier<6;tier++){p.visualTier=tier;expect(projectileIdentity(p)).toBeDefined();}});

it('guardian visibility follows actual defense enablement, stage and bound',()=>{const s:any={originId:'hunters',expansionFamily:'',weaponStage:{defense:3},build:{bonusGuardians:1}};expect(guardianCount(s)).toBe(0);s.originId='engineers';expect(guardianCount(s)).toBe(3);s.weaponStage.defense=0;expect(guardianCount(s)).toBe(1);s.build.bonusGuardians=99;expect(guardianCount(s)).toBe(8);});
