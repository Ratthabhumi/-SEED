import {bossWarningDuration,bossRecoveryDuration,type BossEncounter} from "../../core/combat/bossEncounter";

export interface BossRigPose { stride:number; lift:number; shoulder:number; elbow:number; spread:number; lean:number; crown:number; pulse:number; fall:number; }
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const ease=(v:number)=>{v=clamp(v);return v*v*(3-2*v);};
/** Analytic joint tracks sampled from canonical seconds. No wall clock/tweens,
 * no accumulated state: pauses, skipped frames and resets cannot drift. */
export function bossRigPose(time:number,moving:boolean,a?:BossEncounter,flash=0,death=0):BossRigPose {
  const breath=Math.sin(time*2.4),gait=moving?Math.sin(time*7):0;
  let lift=0,shoulder=.06,elbow=.16,spread=0,lean=0,crown=0,pulse=1;
  if(a){
    const raised=a.pattern==="fan"?.65:a.pattern==="cross"?1.15:2.25;
    if(a.phase==="warning"||a.phase==="commit"){
      const u=a.phase==="commit"?1:ease(1-a.timer/bossWarningDuration(a.pattern));
      lift=-8*u;shoulder=.06+(raised-.06)*u;elbow=.16+.6*u;spread=(a.pattern==="cross"?.7:.12)*u;lean=-.08*u;pulse=1+.12*u;
    }else if(a.phase==="attack"){
      const u=ease(1-a.timer/.18);shoulder=raised*(1-u)+(a.pattern==="fan"?.5:-.35)*u;elbow=.76*(1-u)+.1*u;lift=-8+20*u;lean=-.08+.24*u;spread=a.pattern==="cross"?.7:.12*(1-u);pulse=1.12+.08*u;
    }else if(a.phase==="recover"){
      const u=1-ease(1-a.timer/bossRecoveryDuration(a.pattern));
      shoulder=.06+((a.pattern==="fan"?.5:-.35)-.06)*u;elbow=.16-.06*u;lift=12*u;lean=.16*u;spread=a.pattern==="cross"?.7*u:0;
    }else if(a.phase==="phase-transition"){
      const u=Math.sin(Math.PI*clamp(1-a.timer/.4));shoulder=.06+1.44*u;spread=.6*u;crown=-10*u;pulse=1+.3*u;
    }
  }
  return {stride:gait*.26,lift:lift+breath*1.3,shoulder,elbow,spread,lean:lean+Math.sin(time*33)*Math.min(.045,Math.max(0,flash)*.3),crown,pulse:pulse+breath*.025,fall:ease(death)};
}
