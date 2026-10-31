// Pure aggregate of observed game-update intervals, never GPU presentations.
// Fixed storage: [0,1), ... [255,256), [256,infinity) milliseconds.
export type IntervalPhase='active'|'paused'|'hidden'|'reentry'|'initial';
export type IntervalQuantile={kind:'bucket'|'overflow';lowerMs:number;upperExclusiveMs:number|null};
export class FrameIntervalHistogram {
  private buckets=new Uint32Array(257);
  private coverage=0;
  private callbacks=0;
  private hiddenCallbacks=0;
  private pausedCallbacks=0;
  private reentryCallbacks=0;
  private initialCallbacks=0;
  private invalidIntervals=0;
  private maxMs:number|null=null;
  private over33ms=0;
  private over50ms=0;
  private over100ms=0;
  private visibilityTransitions=0;
  private saturated=false;

  visibilityBoundary():void {this.visibilityTransitions++;}
  record(ms:number|null,phase:IntervalPhase):void {
    this.callbacks++;
    if(phase==='hidden'){this.hiddenCallbacks++;return;}
    if(phase==='reentry'){this.reentryCallbacks++;return;}
    if(phase==='initial'){this.initialCallbacks++;return;}
    if(phase==='paused'){this.pausedCallbacks++;return;}
    if(ms===null||!Number.isFinite(ms)||ms<0){this.invalidIntervals++;return;}
    const bucket=Math.min(256,Math.floor(ms));
    // Never wrap a counter and silently falsify quantiles in a very long session.
    if(this.buckets[bucket]===0xffffffff){this.saturated=true;return;}
    this.buckets[bucket]!++;this.coverage++;
    this.maxMs=Math.max(this.maxMs??0,ms);
    if(ms>33)this.over33ms++;
    if(ms>50)this.over50ms++;
    if(ms>100)this.over100ms++;
  }
  private quantile(p:number):IntervalQuantile|null {
    if(!this.coverage||this.saturated)return null;
    const rank=Math.ceil(p*this.coverage);let count=0;
    for(let i=0;i<257;i++){
      count+=this.buckets[i]!;
      if(count>=rank)return {kind:i===256?'overflow':'bucket',lowerMs:i,upperExclusiveMs:i===256?null:i+1};
    }
    return null;
  }
  snapshot(){
    return {classification:'OBSERVED_GAME_UPDATE_INTERVALS' as const,
      status:this.saturated?'COUNTER_SATURATED':this.coverage?'MEASURED':'NOT_MEASURED',
      quantileMethod:'NEAREST_RANK_1MS_BUCKET_BOUNDS',coverage:this.coverage,callbacks:this.callbacks,
      hiddenCallbacks:this.hiddenCallbacks,pausedCallbacks:this.pausedCallbacks,reentryCallbacks:this.reentryCallbacks,
      initialCallbacks:this.initialCallbacks,invalidIntervals:this.invalidIntervals,visibilityTransitions:this.visibilityTransitions,
      maxMs:this.maxMs,over33ms:this.over33ms,over50ms:this.over50ms,over100ms:this.over100ms,
      p50:this.quantile(.5),p95:this.quantile(.95),p99:this.quantile(.99),buckets:Array.from(this.buckets)};
  }
  reset():void {
    this.buckets.fill(0);this.coverage=this.callbacks=this.hiddenCallbacks=this.pausedCallbacks=0;
    this.reentryCallbacks=this.initialCallbacks=this.invalidIntervals=this.visibilityTransitions=0;
    this.over33ms=this.over50ms=this.over100ms=0;this.maxMs=null;this.saturated=false;
  }
}
