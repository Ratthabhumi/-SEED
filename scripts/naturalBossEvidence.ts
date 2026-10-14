import type {RunSimulation} from "../src/core/sim/RunSimulation";
import {progressionPolicy} from "./progressionPolicy";
/** Full actual progression/build selection: no state grants, teleports or HP writes. */
export function naturalBossEvidence(sim:RunSimulation,mode:"balanced"|"damage"|"survival",stopAtSpawn=false){
 let boss:RunSimulation["state"]["enemies"][number]|undefined,spawn:number|null=null,firstWarning:number|null=null,phase2:number|null=null,attacks=0,phase2Attacks=0,recoveries=0,last="",initialHp=0,lastSecond=-1,lastAt=0,damageReceived=0;
 const phaseDurations:Record<string,number>={};
 const trace:Array<{t:number;hp:number;playerHp:number;phase:string;enraged:boolean}>=[];
 const progression=progressionPolicy(sim,1200,{mode,onStep:(run,events)=>{
  const s=run.state;if(s.ageIndex<5)return false;
  if(!boss){const lethalSpawn=events.some(e=>e.type==='enemy_killed'&&e.boss);boss=s.enemies.find(e=>e.boss&&(e.active||lethalSpawn));if(boss){spawn=s.elapsed;initialHp=boss.maxHp;lastAt=s.elapsed;}}
  if(!boss||spawn===null)return false;
  const t=s.elapsed-spawn,a=boss.encounter!;
  if(stopAtSpawn)return true;
  phaseDurations[last||a.phase]=(phaseDurations[last||a.phase]??0)+s.elapsed-lastAt;lastAt=s.elapsed;
  for(const e of events){if(e.type==='boss_attack_fired'){attacks++;if(a.enraged)phase2Attacks++;}if(e.type==='boss_attack_warning'&&firstWarning===null)firstWarning=t;if(e.type==='player_hurt')damageReceived+=e.damage;}
  if(a.enraged&&phase2===null)phase2=t;
  if(a.phase!==last&&a.phase==='recover')recoveries++;
  if(Math.floor(t)!==lastSecond||a.phase!==last||!boss.active){trace.push({t,hp:Math.max(0,boss.hp),playerHp:s.build.hp,phase:a.phase,enraged:a.enraged});lastSecond=Math.floor(t);}last=a.phase;
  return !boss.active;
 }});
 const elapsed=spawn===null?0:sim.state.elapsed-spawn,finalBoss=boss as RunSimulation["state"]["enemies"][number]|undefined;
 const killed=!!finalBoss&&!finalBoss.active;
 return {classification:'SYNTHETIC_NATURAL_PROGRESSION_POLICY_NO_GRANTS',mode,progression,initialHp,spawn,firstWarning,phase2,phase2Exposure:phase2===null?0:elapsed-phase2,duration:elapsed,phaseDurations,attacks,phase2Attacks,recoveries,damageReceived,dodges:null,killed,censored:!killed,deathBeforePhase2:killed&&phase2===null,playerDead:sim.state.over,dps:elapsed&&finalBoss?(initialHp-Math.max(0,finalBoss.hp))/elapsed:null,trace,build:{owned:[...sim.state.owned],damageMul:sim.state.build.damageMul,maxHp:sim.state.build.maxHp,stages:{...sim.state.weaponStage}},limitations:'Automated route/build decisions through real simulation, not a human fun verdict. Unreached/dead cases retained; no HP/phase forcing. Damage received includes adds; successful dodges not separately identifiable.'};
}
