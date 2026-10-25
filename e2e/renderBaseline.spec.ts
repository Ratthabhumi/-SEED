import {test,expect} from '@playwright/test';
import {assertComparisonBuilds,LEGACY_WORLD_BASELINE} from '../scripts/capture-content161.mjs';
const parent='a9d0af4460a9c38dd24d62e8075489ca6ee4d6fa';
const build=(sha:string,dirty=false)=>({sha,dirty});
test('visual comparison accepts only its explicit pinned parent, preserving legacy default',()=>{
 const builds={A:build(parent),B:build('f'.repeat(40))};
 expect(()=>assertComparisonBuilds(builds,parent)).not.toThrow();
 expect(()=>assertComparisonBuilds(builds)).toThrow('Expected exact baseline');
 expect(()=>assertComparisonBuilds({A:build(LEGACY_WORLD_BASELINE),B:builds.B})).not.toThrow();
});
test('visual comparison rejects wrong or dirty compiled builds before launching a browser',()=>{
 expect(()=>assertComparisonBuilds({A:build('0'.repeat(40)),B:build(parent)},parent)).toThrow('Expected exact baseline');
 expect(()=>assertComparisonBuilds({A:build(parent,true),B:build(parent)},parent)).toThrow('clean compiled');
 expect(()=>assertComparisonBuilds({A:build(parent),B:build(parent,true)},parent)).toThrow('clean compiled');
});
