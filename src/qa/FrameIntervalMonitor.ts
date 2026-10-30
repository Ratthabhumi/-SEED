import {FrameIntervalHistogram} from './FrameIntervalHistogram';
type LoafEntry={duration:number;blockingDuration?:number};
type ObserverFactory=(emit:(entries:readonly LoafEntry[])=>void)=>{disconnect():void;discardPending?():void}|null;

/** Browser adapter. No extra RAF, buffered historical entries, URLs or stacks. */
function browserObserver(emit:(entries:readonly LoafEntry[])=>void){
  if(typeof PerformanceObserver==='undefined'||!PerformanceObserver.supportedEntryTypes?.includes('long-animation-frame'))return null;
  const observer=new PerformanceObserver(list=>emit(list.getEntries()));
  observer.observe({type:'long-animation-frame',buffered:false});
  return {discardPending:()=>{observer.takeRecords();},disconnect:()=>{emit(observer.takeRecords());observer.disconnect();}};
}

class FrameIntervalMonitor {
  private histogram=new FrameIntervalHistogram();
  private observer:ReturnType<ObserverFactory>=null;
  private loafStatus:'SUPPORTED'|'LOAF_UNSUPPORTED'|'LOAF_UNAVAILABLE'='LOAF_UNSUPPORTED';
  private loafCount=0;
  private maxDurationMs:number|null=null;
  private totalBlockingMs=0;
  private initial=true;
  private reentry=false;
  private lastPaused=false;
  private disposed=false;
  constructor(private hidden:boolean,factory:ObserverFactory){
    try {this.observer=factory(entries=>{
      if(this.disposed)return;
      for(const entry of entries){
        if(!Number.isFinite(entry.duration)||entry.duration<0)continue;
        this.loafCount++;this.maxDurationMs=Math.max(this.maxDurationMs??0,entry.duration);
        const blocking=entry.blockingDuration;
        if(blocking!==undefined&&Number.isFinite(blocking)&&blocking>=0)this.totalBlockingMs+=blocking;
      }
    });if(this.observer)this.loafStatus='SUPPORTED';}
    catch {this.loafStatus='LOAF_UNAVAILABLE';}
  }
  update(intervalMs:number|null,paused:boolean):void {
    if(this.disposed)return;
    // A pause boundary can straddle two callbacks; exclude it from active play.
    const phase=this.hidden?'hidden':this.reentry?'reentry':this.initial||intervalMs===null?'initial':paused||this.lastPaused?'paused':'active';
    this.histogram.record(intervalMs,phase);this.lastPaused=paused;
    if(!this.hidden){this.initial=false;this.reentry=false;}
  }
  setHidden(hidden:boolean):void {
    if(this.disposed||this.hidden===hidden)return;
    this.hidden=hidden;this.histogram.visibilityBoundary();
    if(!hidden)this.reentry=true;
  }
  snapshot(){return {schema:1,intervals:this.histogram.snapshot(),loaf:{status:this.loafStatus,
    coverage:'OBSERVER_SESSION_INCLUDING_PAUSED_OR_HIDDEN',count:this.loafStatus==='SUPPORTED'?this.loafCount:null,
    maxDurationMs:this.maxDurationMs,totalBlockingMs:this.loafStatus==='SUPPORTED'?this.totalBlockingMs:null}};}
  reset(hidden:boolean):void {
    this.observer?.discardPending?.();
    this.histogram.reset();this.hidden=hidden;this.initial=true;this.reentry=false;this.lastPaused=false;
    this.loafCount=0;this.maxDurationMs=null;this.totalBlockingMs=0;
  }
  dispose():void {if(this.disposed)return;this.observer?.disconnect();this.disposed=true;}
}
export function createFrameIntervalMonitor(enabled:boolean,hidden:boolean,factory:ObserverFactory=browserObserver){
  return enabled?new FrameIntervalMonitor(hidden,factory):null;
}
export type FrameIntervalEvidence=ReturnType<FrameIntervalMonitor['snapshot']>;
