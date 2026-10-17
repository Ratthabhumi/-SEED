import {describe,it,expect} from "vitest";
import {bossRigPose} from "../../src/game/render/bossRigMotion";
import {createBossEncounter,bossWarningDuration,bossRecoveryDuration} from "../../src/core/combat/bossEncounter";

describe("original articulated boss joint tracks",()=>{
  it("samples identically after pause, skipped frames and a new world",()=>{
    const a=createBossEncounter();a.phase="warning";a.timer=.4;
    const before=bossRigPose(43.123,true,a);
    bossRigPose(900,true,a);expect(bossRigPose(43.123,true,a)).toEqual(before);
    expect(bossRigPose(0,false)).toEqual(bossRigPose(0,false));
  });
  it("has continuous joint movement between former 4Hz frame boundaries",()=>{
    const samples=Array.from({length:15},(_,i)=>bossRigPose(1+i/60,true).stride);
    expect(new Set(samples).size).toBe(15);
    for(let i=1;i<samples.length;i++)expect(Math.abs(samples[i]!-samples[i-1]!)).toBeLessThan(.04);
  });
  for(const pattern of ["slam","cross","fan"] as const)it(`joins ${pattern} anticipation, release and recovery without pose jumps`,()=>{
    const a=createBossEncounter();a.pattern=pattern;a.phase="warning";a.timer=bossWarningDuration(pattern);
    const start=bossRigPose(0,false,a);a.timer=0;const raised=bossRigPose(0,false,a);
    expect(raised.shoulder).toBeGreaterThan(start.shoulder);
    a.phase="commit";a.timer=0;const commit=bossRigPose(0,false,a);
    a.phase="attack";a.timer=.18;const attack=bossRigPose(0,false,a);
    for(const key of ["shoulder","elbow","lift","lean","spread"] as const)expect(attack[key]).toBeCloseTo(commit[key]);
    a.timer=0;const hit=bossRigPose(0,false,a);a.phase="recover";a.timer=bossRecoveryDuration(pattern);
    const recover=bossRigPose(0,false,a);for(const key of ["shoulder","elbow","lift","lean","spread"] as const)expect(recover[key]).toBeCloseTo(hit[key]);
    a.timer=0;expect(bossRigPose(0,false,a).shoulder).toBeCloseTo(.06);
  });
  it("provides finite phase, hit and articulated defeat transforms",()=>{
    const a=createBossEncounter();a.phase="phase-transition";a.timer=.2;
    expect(bossRigPose(1,false,a).crown).toBeLessThan(0);
    expect(bossRigPose(1,false,a,.1).lean).not.toEqual(bossRigPose(1,false,a,0).lean);
    expect(bossRigPose(1,false,a,0,1).fall).toBe(1);
  });
});
