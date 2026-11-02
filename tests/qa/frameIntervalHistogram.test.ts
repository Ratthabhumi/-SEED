import {describe, expect, it, vi} from 'vitest';
import {FrameIntervalHistogram} from '../../src/qa/FrameIntervalHistogram';
import {createFrameIntervalMonitor} from '../../src/qa/FrameIntervalMonitor';

describe('observed update intervals (not presented GPU frames)',()=>{
  it('distinguishes no measurement from measured zero',()=>{
    const h=new FrameIntervalHistogram();
    expect(h.snapshot()).toMatchObject({status:'NOT_MEASURED',coverage:0,p95:null,maxMs:null});
    h.record(0,'active');
    expect(h.snapshot()).toMatchObject({status:'MEASURED',coverage:1,maxMs:0,p95:{kind:'bucket',lowerMs:0,upperExclusiveMs:1}});
  });
  it('counts strict >33/50/100 boundaries',()=>{
    const h=new FrameIntervalHistogram();
    for(const ms of [33,33.1,50,50.1,100,100.1])h.record(ms,'active');
    expect(h.snapshot()).toMatchObject({coverage:6,over33ms:5,over50ms:3,over100ms:1,maxMs:100.1});
  });
  it('reports nearest-rank bucket bounds and explicit overflow',()=>{
    const h=new FrameIntervalHistogram();
    for(let i=0;i<100;i++)h.record(i+0.25,'active');
    expect(h.snapshot()).toMatchObject({p50:{lowerMs:49,upperExclusiveMs:50},p95:{lowerMs:94},p99:{lowerMs:98}});
    h.reset(); h.record(255.99,'active');h.record(700.5,'active');
    expect(h.snapshot()).toMatchObject({p50:{kind:'bucket',lowerMs:255,upperExclusiveMs:256},p95:{kind:'overflow',lowerMs:256,upperExclusiveMs:null},maxMs:700.5});
  });
  it('separates hidden, reentry and canonical pause from active stalls',()=>{
    const h=new FrameIntervalHistogram();
    h.record(5000,'hidden');h.record(null,'reentry');h.record(600,'paused');h.record(120,'active');
    expect(h.snapshot()).toMatchObject({callbacks:4,hiddenCallbacks:1,reentryCallbacks:1,pausedCallbacks:1,coverage:1,maxMs:120,over100ms:1});
  });
  it('rejects invalid intervals and resets bounded storage',()=>{
    const h=new FrameIntervalHistogram();
    for(const v of [-1,NaN,Infinity])h.record(v,'active');
    for(let i=0;i<100000;i++)h.record(16.7,'active');
    const s=h.snapshot();expect(s.buckets).toHaveLength(257);expect(s.coverage).toBe(100000);expect(s.invalidIntervals).toBe(3);
    s.buckets[16]=0;expect(h.snapshot().buckets[16]).toBe(100000);
    h.reset();expect(h.snapshot()).toMatchObject({coverage:0,callbacks:0,maxMs:null});
  });
});

describe('session integration and optional LoAF',()=>{
  it('disabled mode creates no observer or histogram',()=>{
    const factory=vi.fn();expect(createFrameIntervalMonitor(false,false,factory)).toBeNull();expect(factory).not.toHaveBeenCalled();
  });
  it('unsupported LoAF is not measured zero; first and return callbacks are excluded',()=>{
    const m=createFrameIntervalMonitor(true,false,()=>null)!;
    m.update(null,false);m.update(16,false);m.setHidden(true);m.update(4000,false);m.setHidden(false);m.update(5000,false);m.update(130,false);
    expect(m.snapshot()).toMatchObject({loaf:{status:'LOAF_UNSUPPORTED',count:null},intervals:{coverage:2,maxMs:130,hiddenCallbacks:1,reentryCallbacks:1,initialCallbacks:1,visibilityTransitions:2}});
  });
  it('keeps pause separate, resets restart state, disconnects and ignores late callbacks',()=>{
    let emit:(entries:readonly {duration:number;blockingDuration?:number}[])=>void=()=>{};
    const disconnect=vi.fn();
    const m=createFrameIntervalMonitor(true,false,cb=>{emit=cb;return {disconnect};})!;
    m.update(null,false);m.update(500,true);m.update(160,false); // pause-crossing interval excluded
    m.update(160,false);
    emit([{duration:70,blockingDuration:15},{duration:90,blockingDuration:20}]);
    expect(m.snapshot()).toMatchObject({loaf:{status:'SUPPORTED',count:2,maxDurationMs:90,totalBlockingMs:35},intervals:{coverage:1,pausedCallbacks:2}});
    expect(JSON.stringify(m.snapshot())).not.toMatch(/scripts|url|stack/i);
    m.reset(false);expect(m.snapshot()).toMatchObject({loaf:{count:0},intervals:{coverage:0}});
    m.dispose();emit([{duration:900}]);m.update(900,false);expect(disconnect).toHaveBeenCalledOnce();expect(m.snapshot().loaf.count).toBe(0);
  });
  it('isolates observer setup failure from gameplay',()=>{
    const m=createFrameIntervalMonitor(true,false,()=>{throw Error('unsupported host');})!;
    expect(m.snapshot().loaf.status).toBe('LOAF_UNAVAILABLE');
  });
  it('discards queued observer entries at a measurement reset boundary',()=>{
    const discardPending=vi.fn();
    const m=createFrameIntervalMonitor(true,false,()=>({disconnect:vi.fn(),discardPending}))!;
    m.reset(false);expect(discardPending).toHaveBeenCalledOnce();
  });
});
