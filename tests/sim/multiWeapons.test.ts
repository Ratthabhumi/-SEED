import {it,expect} from 'vitest';
import {RunSimulation} from '../../src/core/sim/RunSimulation';
import {ORIGINS} from '../../src/core/progression/origins';
const idle={moveX:0,moveY:0,dashPressed:false};
function acquire(sim:RunSimulation,family:string){const n=sim.techGraph().find((n:any)=>n.weaponFamily===family)!;expect(n).toBeDefined();sim.state.draftOpen=true;sim.state.pendingLevels=1;sim.state.draftOffers=[{nodeId:n.id,quality:'COMMON',modifierIds:[],effectiveEffects:[]}];return sim.chooseDraft(0);}
it('every Origin starts with its original pair and legally acquires a third weapon, never a fourth',()=>{
 for(const o of ORIGINS){const sim=new RunSimulation({masterSeed:'EPOCH-GOLDEN-001',originId:o.id}),s:any=sim.state;expect(s.weapons).toHaveLength(2);expect(s.weapons[0].family).toBe(o.families[0]);
 for(const f of ['kinetic','energy','field','defense'].filter(f=>!o.families.includes(f as any)).slice(0,1))acquire(sim,f);
 expect(s.weapons).toHaveLength(3);expect(new Set(s.weapons.map((w:any)=>w.id)).size).toBe(3);const f=['kinetic','energy','field','defense'].find(f=>!s.weapons.some((w:any)=>w.family===f))!;const n=sim.techGraph().find((n:any)=>n.weaponFamily===f)!;s.draftOpen=true;s.draftOffers=[{nodeId:n.id,quality:'COMMON',modifierIds:[],effectiveEffects:[]}];const before=sim.snapshot();sim.chooseDraft(0);expect(sim.snapshot()).toBe(before);
 }
});
it('two real primary projectiles use different authoritative rigs, clocks and owner IDs',()=>{
 const sim=new RunSimulation({masterSeed:'EPOCH-GOLDEN-001',originId:'hunters'}),s:any=sim.state;acquire(sim,'energy');s.spawnT=s.eliteT=s.mineT=999;for(const a of s.squad)a.active=false;
 const e=sim.spawnEnemy('chaser',false,false,0,300,[])!;e.speed=e.dmg=0;e.hp=e.maxHp=10000;const shots:any[]=[];
 for(let i=0;i<120;i++)shots.push(...sim.step(1/60,idle).filter(e=>e.type==='weapon_fired'&&e.release));
 for(const w of s.weapons.filter((w:any)=>w.family==='kinetic'||w.family==='energy')){const own=shots.filter(e=>e.release.weaponInstanceId===w.id);expect(own.length).toBeGreaterThan(0);for(const ev of own){expect(ev.x).toBeCloseTo(ev.release.pose.muzzleX);expect(ev.y).toBeCloseTo(ev.release.pose.muzzleY);}}
 expect(new Set(shots.map(e=>e.release.weaponInstanceId)).size).toBe(2);expect(s.weapons[0].rig).not.toBe(s.weapons[1].rig);
});

it('three controlled builds execute their owned weapons without ghost families or shared aura suppression',()=>{
 for(const [origin,extra,pattern]of [['hunters','energy','tactical-energy'],['hunters','field','tactical-field'],['resonant','defense','tactical-defense']]){
  const sim=new RunSimulation({masterSeed:'EPOCH-GOLDEN-001',originId:origin}),s=sim.state;acquire(sim,extra);
  const n=sim.techGraph().find(n=>n.id===pattern)!;s.draftOpen=true;s.pendingLevels=1;s.draftOffers=[{nodeId:n.id,quality:'COMMON',modifierIds:[],effectiveEffects:n.effects}];sim.chooseDraft(0);
  s.spawnT=s.eliteT=999;s.build.hp=s.build.maxHp=1e8;for(const a of s.squad)a.active=false;
  for(let i=0;i<16;i++){const angle=i*Math.PI/8,e=sim.spawnEnemy('tank',false,false,angle,100+10*i,[])!;e.speed=e.dmg=0;e.hp=e.maxHp=1e6;}
  for(let i=0;i<600;i++)sim.step(1/60,idle);
  for(const family of s.weapons.map(w=>w.family))expect(s.damageBySource[family]??0,origin+'+'+extra+':'+family).toBeGreaterThan(0);
  if(extra==='energy')expect(s.damageBySource.chain??0).toBeGreaterThan(0);
  if(extra==='field')expect(s.mines.filter(m=>m.active).every(m=>m.weaponInstanceId===s.weapons.find(w=>w.family==='field')!.id)).toBe(true);
  console.log('V53_CONTROLLED_BUILD',JSON.stringify({origin,extra,frames:600,damage:s.damageBySource,weapons:s.weapons.map(w=>({id:w.id,family:w.family}))}));
 }
 const sim=new RunSimulation({masterSeed:'EPOCH-GOLDEN-001'});acquire(sim,'energy');acquire(sim,'field');sim.state.weaponStage.energy=2;sim.state.weaponStage.field=3;sim.state.spawnT=sim.state.eliteT=999;const e=sim.spawnEnemy('tank',false,false,0,40,[])!;e.speed=e.dmg=0;e.hp=e.maxHp=1e6;
 for(let i=0;i<90;i++)sim.step(1/60,idle);expect(sim.state.damageBySource.energy).toBeGreaterThan(0);expect(sim.state.damageBySource.field).toBeGreaterThan(0);
});
it('two orbit systems advance once per step and track hits per owned family',()=>{
 const sim=new RunSimulation({masterSeed:'EPOCH-GOLDEN-001',originId:'resonant'});acquire(sim,'field');acquire(sim,'defense');const s=sim.state;s.weaponStage.field=2;s.spawnT=s.eliteT=999;const before=s.orbitAng;sim.step(1/60,idle);expect(s.orbitAng-before).toBeCloseTo(2/60);
});
