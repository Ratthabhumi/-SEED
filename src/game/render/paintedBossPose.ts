import type {BossEncounter} from "../../core/combat/bossEncounter";
import {bossRecoveryDuration,bossWarningDuration} from "../../core/combat/bossEncounter";
import bossDetail from "../assets/boss-frame-detail.json";

/** Whole-body authored cells, not an invented limb rig. Canonical seconds only. */
export function paintedBossPose(time:number,moving:boolean,a?:BossEncounter,flash=0,reduced=false,baseline=false){
  const phase=a?.phase,attack=a?.pattern==="fan"?5:4;
  let frame=flash>0?6:phase==="warning"||phase==="commit"||phase==="phase-transition"?3:
    phase==="attack"||phase==="recover"?attack:moving?1+Math.floor(time*4)%2:0;
  let lift=0,rotation=0;
  if(!baseline){
    // Show the impact pose briefly, then the relaxed painted cell throughout
    // the real punish window. Never hold a firing pose for the full recovery.
    if(flash<=0&&phase==="recover"&&a&&bossRecoveryDuration(a.pattern)-a.timer>.32)frame=0;
    if(!reduced){
      // Basalt stays planted at rest. Only authored stride cells may lift.
      lift=moving?Math.sin(time*2.4)*1.2:0;
      if((phase==="warning"||phase==="commit")&&a){
        const u=phase==="commit"?1:Math.max(0,Math.min(1,1-a.timer/bossWarningDuration(a.pattern)));
        rotation=-.045*u*u*(3-2*u);
      }else if(phase==="attack"){rotation=.035;}
      else if(phase==="recover"&&a){
        const since=bossRecoveryDuration(a.pattern)-a.timer;
        rotation=.035*Math.pow(Math.max(0,1-since/.32),2);
      }
      if(flash>0)rotation+=Math.sin(time*33)*Math.min(.025,flash*.2);
    }
  }
  return {frame,lift,rotation};
}

/** Measured alpha>64 bottoms, expressed in the original128px coordinate system.
 * Actual source-derived cells are256px. A foot pivot makes
 * anticipation/recoil lean about the floor instead of orbiting the belly. */
export const BOSS_FOOT_Y=bossDetail.frames.map(f=>f.footY/bossDetail.cell*128);
export function paintedBossGround(frame:number,size:number){
  return {originY:BOSS_FOOT_Y[frame]!/128,offsetY:size*(117/128-.65)};
}
