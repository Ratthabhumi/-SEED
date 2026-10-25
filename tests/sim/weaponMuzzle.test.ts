import {it,expect} from 'vitest';
import {RunSimulation} from '../../src/core/sim/RunSimulation';
import {WEAPON_SOCKETS} from '../../src/content/weaponSockets';
import {createWeaponRig,weaponTransform,socketWorld,aimFromPivot,angleDelta,sweptHit} from '../../src/core/combat/weaponGeometry';
import {CONTENT_VERSION,CHILD_LAWS_CONTENT_VERSION} from '../../src/core/seed/versions';
import {generateWorldLaws} from '../../src/core/emergence/worldLaws';
import {FixedAccumulator} from '../../src/core/sim/fixedStep';
const idle={moveX:0,moveY:0,dashPressed:false};
function fixture(origin='hunters',tier=0,mode:'hand'|'float'='float'){
 const sim=new RunSimulation({masterSeed:'MUZZLE-REGRESSION',originId:origin,weaponMount:mode}),s=sim.state;
 s.spawnT=s.eliteT=s.mineT=999;s.build.hp=s.build.maxHp=100000;
 s.weaponStage.kinetic=s.weaponStage.energy=tier;
 const enemy=sim.spawnEnemy('tank',false,false,0,450,[])!;enemy.hp=enemy.maxHp=100000;enemy.speed=0;
 return {sim,s,enemy};
}
it('calibrates all 24 source axes and exits in eight directions and both mounts',()=>{
 for(const origin of ['hunters','engineers','resonant','sentinels'])for(let tier=0;tier<6;tier++)for(let i=0;i<8;i++)for(const mode of ['hand','float'] as const)for(const flipY of [false,true]){
  const r=createWeaponRig(mode),target={x:Math.cos(i*Math.PI/4)*450,y:Math.sin(i*Math.PI/4)*450};
  r.flipY=flipY;r.heading=aimFromPivot(origin,tier,0,0,r,target.x,target.y).heading;
  const p=weaponTransform(origin,tier,0,0,r,0),m=WEAPON_SOCKETS[p.frame]!;
  const exit=socketWorld(p,m[2],m[3]),rear=socketWorld(p,m[4],m[5]);
  expect(exit.x).toBe(p.muzzleX);expect(exit.y).toBe(p.muzzleY);
  expect(angleDelta(Math.atan2(exit.y-rear.y,exit.x-rear.x),p.heading)).toBeCloseTo(0,9);
  expect(angleDelta(Math.atan2(target.y-exit.y,target.x-exit.x),p.heading)).toBeCloseTo(0,8);
 }
});
it('does not alternate mirrors or miss the target ray directly above/below an off-axis gun pivot',()=>{
 for(const flipY of [false,true])for(const direction of [-1,1]){
  const r={...createWeaponRig(),flipY},tx=r.x,ty=r.y+direction*450;
  r.heading=aimFromPivot('engineers',1,0,0,r,tx,ty).heading;
  const p=weaponTransform('engineers',1,0,0,r,0);
  expect(angleDelta(Math.atan2(ty-p.muzzleY,tx-p.muzzleX),r.heading)).toBeCloseTo(0,9);
  expect(p.flipY).toBe(flipY);
 }
});
it('spawns actual shots at the muzzle with actual spread velocities and first-step travel',()=>{
 for(const mode of ['hand','float'] as const)for(let i=0;i<8;i++){
  const {sim,s,enemy}=fixture('hunters',0,mode);s.build.bonusProjectiles=2;
  enemy.x=s.px+Math.cos(i*Math.PI/4)*450;enemy.y=s.py+Math.sin(i*Math.PI/4)*450;
  let shots:ReturnType<typeof sim.step>=[];
  for(let tick=0;tick<120&&!shots.length;tick++)shots=sim.step(1/60,idle).filter(e=>e.type==='weapon_fired'&&e.release);
  expect(shots.length).toBe(3);
  for(const e of shots){if(e.type!=='weapon_fired'||!e.release)throw Error('missing release');
   const p=s.projs[e.release.projectileIndex!]!,pose=e.release.pose;
   expect(e.x).toBe(pose.muzzleX);expect(e.y).toBe(pose.muzzleY);
   expect(Math.hypot(e.x-s.px,e.y-s.py)).toBeGreaterThan(1);
   expect(angleDelta(Math.atan2(p.vy,p.vx),e.release.heading)).toBeCloseTo(0,9);
   expect(p.x).toBeCloseTo(e.x+p.vx/60,7);expect(p.y).toBeCloseTo(e.y+p.vy/60,7);
  }
 }
});
it('emits energy projectiles and both beam families from the same canonical exit',()=>{
 for(const [origin,tier,type] of [['resonant',0,'weapon_fired'],['resonant',4,'beam_fired'],['hunters',5,'beam_fired']] as const){
  const {sim}=fixture(origin,tier);let found=false;
  for(let t=0;t<120&&!found;t++)for(const e of sim.step(1/60,idle))if(e.type===type&&e.release){
   const x=e.type==='beam_fired'?e.x1:e.x,y=e.type==='beam_fired'?e.y1:e.y;
   expect(x).toBe(e.release.pose.muzzleX);expect(y).toBe(e.release.pose.muzzleY);found=true;
  }expect(found).toBe(true);
 }
});
it('handles wrap, overlap, swept hits, pause and explicit mode changes without phantom travel',()=>{
 expect(angleDelta(-Math.PI+.01,Math.PI-.01)).toBeCloseTo(.02);
 expect(sweptHit(0,0,100,0,50,0,5)).toBeCloseTo(.45);
 expect(sweptHit(50,0,100,0,50,0,5)).toBe(0);
 expect(sweptHit(0,20,100,20,50,0,5)).toBeNull();
 const {sim,s}=fixture();const hash=sim.hash();sim.step(0,idle);expect(sim.hash()).toBe(hash);
 sim.step(0,{...idle,weaponMount:'hand'});expect(s.weaponRig.mode).toBe('hand');expect(sim.hash()).not.toBe(hash);
 expect(s.elapsed).toBe(0);expect(s.projs.some(p=>p.active)).toBe(false);
 expect(CONTENT_VERSION).toBe(19);expect(CHILD_LAWS_CONTENT_VERSION).toBe(18);
});
it('replays target reversals and close moving targets deterministically without tunnelling',()=>{
 const a=fixture(),b=fixture();let releases=0;
 for(let t=0;t<600;t++){
  for(const f of [a,b]){f.enemy.x=f.s.px+Math.cos(t/30)*((t%120)<60?30:200);f.enemy.y=f.s.py+Math.sin(t/30)*((t%120)<60?30:200);}
  const events=a.sim.step(1/60,idle);b.sim.step(1/60,idle);
  releases+=events.filter(e=>(e.type==='weapon_fired'||e.type==='beam_fired')&&e.release).length;
  expect(a.sim.hash()).toBe(b.sim.hash());
 }expect(releases).toBeGreaterThan(0);
});
it('hits an enemy crossed between fixed ticks and clears primary provenance on generic pool reuse',()=>{
 const {sim,s,enemy}=fixture();enemy.x=s.px+100;enemy.y=s.py;
 for(const f of ['kinetic','energy','defense','field'] as const)s.weaponCd[f]=999;
 const p=s.projs[0]!;Object.assign(p,{active:true,primary:true,friendly:true,x:s.px,y:s.py,vx:12000,vy:0,life:2,dmg:7,radius:4,src:'kinetic'});
 sim.step(1/60,idle);expect(enemy.hp).toBe(99993);expect(p.active).toBe(false);expect(p.x).toBeLessThan(s.px+100);
 sim['fireProjectile'](s.px,s.py,s.px+100,s.py,420,5,0,'defense',true);
 expect(p.active).toBe(true);expect(p.primary).toBe(false);expect(p.x).toBe(s.px);
});
it('finds an overlapping collider centered across a spatial-cell boundary',()=>{
 const {sim,s,enemy}=fixture();enemy.x=131;enemy.y=0;
 for(const f of ['kinetic','energy','defense','field'] as const)s.weaponCd[f]=999;
 Object.assign(s.projs[0]!,{active:true,primary:true,friendly:true,x:105,y:0,vx:600,vy:0,life:2,dmg:7,radius:4,src:'kinetic'});
 sim.step(1/60,idle);expect(enemy.hp).toBe(99993);expect(s.projs[0]!.active).toBe(false);
});
it('resets the child rig and projectiles, preserves mount preference and existing child law seed version',()=>{
 const {sim}=fixture('hunters',0,'hand');sim.state.ascendReady=true;sim.ascend('affinity-kinetic','engineers');
 const s=sim.state;expect(s.weaponRig).toEqual(createWeaponRig('hand'));expect(s.projs.some(p=>p.active)).toBe(false);
 expect(s.worldLaws).toEqual(generateWorldLaws(s.worldSeed,3,18));
});
it('can release toward overlapping and near-mount targets without granting a player-centered shot',()=>{
 for(const mode of ['hand','float'] as const)for(const [dx,dy] of [[0,0],[12,0],[84,-112],[-30,10]]){
  const {sim,s,enemy}=fixture('hunters',0,mode);enemy.x=s.px+dx!;enemy.y=s.py+dy!;let released=false;
  for(let t=0;t<180&&!released;t++)released=sim.step(1/60,idle).some(e=>e.type==='weapon_fired'&&!!e.release);
  expect(released,`${mode} ${dx},${dy}`).toBe(true);
 }
});
it('uses identical fixed-step releases at 20 FPS and 60 FPS',()=>{
 const a=fixture(),b=fixture(),acc=new FixedAccumulator();
 for(let frame=0;frame<120;frame++){
  for(let i=0;i<3;i++)a.sim.step(1/60,idle);
  for(let i=acc.steps(1/20);i>0;i--)b.sim.step(1/60,idle);
 }expect(a.sim.hash()).toBe(b.sim.hash());
});
it('uses the correct painted frame for actual releases across all four origins and applicable stages',()=>{
 const origins=['hunters','engineers','resonant','sentinels'];
 for(const origin of origins)for(let tier=0;tier<6;tier++){
  if((origin==='resonant'||origin==='sentinels')&&tier===2)continue;
  const {sim}=fixture(origin,tier);let release;
  for(let t=0;t<120&&!release;t++)for(const e of sim.step(1/60,idle))if((e.type==='weapon_fired'||e.type==='beam_fired')&&e.release)release=e.release;
  expect(release?.pose.frame,`${origin}@${tier}`).toBe(origins.indexOf(origin)*6+tier);
 }
});
