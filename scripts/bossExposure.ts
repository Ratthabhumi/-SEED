import type {RunSimulation} from "../src/core/sim/RunSimulation";
/** Canonical arena controller: no HP writes, fake damage or phase-state forcing. */
export async function bossExposure(sim:RunSimulation,tier:number,seconds=180){
 const s=sim.state;s.ageIndex=5;s.elapsed=900;s.spawnT=s.eliteT=s.mineT=99999;
 for(const f of ["kinetic","energy","defense","field"] as const)s.weaponStage[f]=tier;
 for(const a of s.squad)a.active=false;
 const e=sim.spawnEnemy("tank",false,true,0,300,[])!;
 const hp=e.hp,playerHp=s.build.hp,trace:Array<{t:number;hp:number;playerHp:number;phase:string;enraged:boolean}>=[];
 let firstWarning:number|null=null,phase2:number|null=null,attacks=0,recoveries=0,last="",t=0;
 for(let tick=0;tick<seconds*60&&e.active&&!s.over;tick++){
  // Flush worker IPC during long arenas without changing canonical dt/inputs.
  if(tick%300===0)await new Promise<void>(resolve=>setTimeout(resolve,0));
  const angle=tick/60*.8,tx=e.x+Math.cos(angle)*260,ty=e.y+Math.sin(angle)*260;
  const dx=tx-s.px,dy=ty-s.py,n=Math.hypot(dx,dy)||1;
  if(s.draftOpen)sim.skipDraft();
  sim.step(1/60,{moveX:dx/n,moveY:dy/n,dashPressed:false});t=(tick+1)/60;
  const a=e.encounter!;
  if(a.phase!==last){if(a.phase==="warning"&&firstWarning===null)firstWarning=t;if(a.phase==="attack")attacks++;if(a.phase==="recover")recoveries++;last=a.phase;}
  if(a.enraged&&phase2===null)phase2=t;
  if(tick%60===0||!e.active)trace.push({t,hp:Math.max(0,e.hp),playerHp:s.build.hp,phase:a.phase,enraged:a.enraged});
 }
 return {tier,initialHp:hp,remainingHp:Math.max(0,e.hp),duration:t,firstWarning,phase2,phase2Exposure:phase2===null?0:t-phase2,attacks,recoveries,damageReceived:Math.max(0,playerHp-s.build.hp),dps:t?(hp-Math.max(0,e.hp))/t:0,killed:!e.active,playerDead:s.over,hash:sim.hash(),trace};
}
