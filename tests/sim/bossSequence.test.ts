import {it,expect} from "vitest";
import {RunSimulation} from "../../src/core/sim/RunSimulation";
import {stepBossEncounter,bossWarningDuration,bossRecoveryDuration} from "../../src/core/combat/bossEncounter";
it("reference encounter commits to warning aim, releases once, recovers and transitions once",()=>{
 const sim=new RunSimulation({masterSeed:"BOSS-SEQ"}),e=sim.spawnEnemy("tank",false,true,0,230,[])!;
 const phases=new Set<string>(),targets:Array<[number,number]>=[];
 const fire=(_:unknown,x:number,y:number)=>targets.push([x,y]);
 for(let i=0;i<720;i++){stepBossEncounter(e,0,0,1/60,fire);phases.add(e.encounter!.phase);}
 for(const p of ["approach","warning","commit","attack","recover"])expect(phases.has(p)).toBe(true);
 expect(targets.length).toBe(2);expect(targets.every(p=>p[0]===0&&p[1]===0)).toBe(true);
 e.hp=e.maxHp*.4;let transitions=0,previous=e.encounter!.phase;
 for(let i=0;i<1800;i++){stepBossEncounter(e,0,0,1/60,fire);if(e.encounter!.phase==="phase-transition"&&previous!==e.encounter!.phase)transitions++;previous=e.encounter!.phase;}
 expect(transitions).toBe(1);
 for(const p of ["slam","fan","cross"] as const){expect(bossWarningDuration(p)).toBeGreaterThanOrEqual(1.15);expect(bossRecoveryDuration(p)).toBeGreaterThanOrEqual(1.4);}
});
it("elite family variation has real warned attacks with bounded projectile damage",()=>{
 const sim=new RunSimulation({masterSeed:"ELITE-SEQ"}),s=sim.state;
 s.spawnT=s.eliteT=999;s.build.hp=s.build.maxHp=1e8;s.weaponCd={kinetic:999,energy:999,field:999,defense:999};for(const a of s.squad)a.cd=999;
 const e=sim.spawnEnemy("ranged",true,false,0,240,[])!;expect(e.evolution?.id).toBe("burst");e.evolution!.timer=0;
 const events=[];for(let i=0;i<65;i++)events.push(...sim.step(1/60,{moveX:0,moveY:0,dashPressed:false}));
 expect(events.some(e=>e.type==="enemy_attack_warning")).toBe(true);expect(events.some(e=>e.type==="enemy_attack_fired")).toBe(true);
 const shots=s.projs.filter(p=>p.active&&p.src==="enemy-burst");expect(shots.length).toBeLessThanOrEqual(3);expect(shots.reduce((n,p)=>n+p.dmg,0)).toBeLessThanOrEqual(e.dmg+.001);
});
