import type {RunSimulation} from "../src/core/sim/RunSimulation";
import {progressionPolicy} from "./progressionPolicy";
/** Full actual progression/build selection: no state grants, teleports or HP writes. */
export function naturalBossEvidence(sim:RunSimulation,mode:"balanced"|"damage"|"survival",stopAtSpawn=false){
 let boss:RunSimulation["state"]["enemies"][number]|undefined,spawn:number|null=null,firstWarning:number|null=null,phase2:number|null=null,attacks=0,phase2Attacks=0,recoveries=0,last="",initialHp=0,lastSecond=-1,lastAt=0,damageReceived=0;
 const phaseDurations:Record<string,number>={},attacksByPhase:Record<string,number>={};let previousBossHp:number|null=null,maxDamageStep=0,lethalStepFromHp:number|null=null;
 const trace:Array<{t:number;hp:number;playerHp:number;phase:string;enraged:boolean}>=[];
 let entry:{playerHp:number;maxHp:number;adds:number}|null=null;
 const damageBySource:Record<string,number>={},damageTrace:Array<{t:number;source:string;damage:number;playerHp:number;phase:string}>=[];
 const progression=progressionPolicy(sim,1200,{mode,onStep:(run,events)=>{
  const s=run.state;if(s.ageIndex<5)return false;
  if(!boss){const lethalSpawn=events.some(e=>e.type==='enemy_killed'&&e.boss);boss=s.enemies.find(e=>e.boss&&(e.active||lethalSpawn));if(boss){spawn=s.elapsed;initialHp=boss.maxHp;previousBossHp=initialHp;lastAt=s.elapsed;entry={playerHp:s.build.hp,maxHp:s.build.maxHp,adds:s.enemies.filter(e=>e.active&&!e.boss).length};}}
  if(!boss||spawn===null)return false;
  const t=s.elapsed-spawn,a=boss.encounter!;
  const loss=previousBossHp===null?0:Math.max(0,previousBossHp-Math.max(0,boss.hp));maxDamageStep=Math.max(maxDamageStep,loss);if(!boss.active)lethalStepFromHp=previousBossHp;previousBossHp=Math.max(0,boss.hp);
  if(stopAtSpawn)return true;
  phaseDurations[last||a.phase]=(phaseDurations[last||a.phase]??0)+s.elapsed-lastAt;lastAt=s.elapsed;
  for(const e of events){if(e.type==='boss_attack_fired'){attacks++;const phase=a.enraged?'phase2':'phase1';attacksByPhase[phase]=(attacksByPhase[phase]??0)+1;if(a.enraged)phase2Attacks++;}if(e.type==='boss_attack_warning'&&firstWarning===null)firstWarning=t;if(e.type==='player_hurt')damageReceived+=e.damage;}
  for(const e of events)if(e.type==='player_hurt'){
   const source=e.source??'historical-unattributed';damageBySource[source]=(damageBySource[source]??0)+e.damage;
   damageTrace.push({t,source,damage:e.damage,playerHp:s.build.hp,phase:a.phase});
  }
  if(a.enraged&&phase2===null)phase2=t;
  if(a.phase!==last&&a.phase==='recover')recoveries++;
  if(Math.floor(t)!==lastSecond||a.phase!==last||!boss.active){trace.push({t,hp:Math.max(0,boss.hp),playerHp:s.build.hp,phase:a.phase,enraged:a.enraged});lastSecond=Math.floor(t);}last=a.phase;
  return !boss.active;
 }});
 const elapsed=spawn===null?0:sim.state.elapsed-spawn,finalBoss=boss as RunSimulation["state"]["enemies"][number]|undefined;
 const killed=!!finalBoss&&!finalBoss.active;
 const unreachedCause=spawn!==null?null:sim.state.over?'player-defeat':sim.state.ageIndex<5?'time-limit-before-space':sim.state.stronghold?.revealed?'time-limit-after-stronghold-revealed':'time-limit-before-stronghold-reveal';
 return {classification:'SYNTHETIC_NATURAL_PROGRESSION_POLICY_NO_GRANTS',mode,progression,unreachedCause,initialHp,spawn,entry,damageBySource,damageTrace,firstWarning,phase2,phase2Exposure:phase2===null?0:elapsed-phase2,duration:elapsed,phaseDurations,attacksByPhase,maxDamageStep,lethalStepFromHp,attacks,phase2Attacks,recoveries,damageReceived,dodges:null,killed,censored:!killed,deathBeforePhase2:killed&&phase2===null,playerDead:sim.state.over,dps:elapsed&&finalBoss?(initialHp-Math.max(0,finalBoss.hp))/elapsed:null,trace,build:{owned:[...sim.state.owned],damageMul:sim.state.build.damageMul,maxHp:sim.state.build.maxHp,stages:{...sim.state.weaponStage}},limitations:'Automated route/build decisions through real simulation, not a human fun verdict. Unreached/dead cases retained; no HP/phase forcing. Damage source is descriptive only; historical builds lack attribution. Events report accepted raw damage (final overkill may exceed remaining HP); regen is separate. Successful dodges not separately identifiable.'};
}
