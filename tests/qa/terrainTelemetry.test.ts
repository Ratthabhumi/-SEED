import {it,expect} from "vitest";
import {PerformanceSampler,type PerfSampleInput} from "../../src/qa/PerformanceSampler";
it("optional terrain diagnostics retain independent historical values and cannot invent old report timings",()=>{
 const sampler=new PerformanceSampler();
 const sample:PerfSampleInput={fps:60,frameMs:16,simMs:1,enemies:2,projs:3,pickups:1,mines:0,enemyPoolUsed:2,projPoolUsed:3,pickupPoolUsed:1,queries:2,buckets:2,chunkHits:10,chunkMisses:1};
 sampler.push(sample);expect(sampler.snapshot("old",0,0)).not.toHaveProperty("terrain");
 const terrain={refreshMaxMs:3,chunkReadMaxMs:.7,uploadMaxMs:2,workerPaintMaxMs:8,uploads:10,uploadBytes:2621440,misses:11,pending:1,workerFailed:false};
 sampler.push({...sample,terrain});terrain.uploadMaxMs=999;terrain.workerFailed=true;
 const checkpoint=sampler.snapshot("measured",1,1)!;
 expect(checkpoint.terrain?.uploadMaxMs).toBe(2);expect(checkpoint.terrain?.workerFailed).toBe(false);expect(checkpoint.terrain?.uploadBytes).toBe(2621440);
 expect(checkpoint.simP95).toBe(1);expect(checkpoint.frameP95).toBe(16);
});
