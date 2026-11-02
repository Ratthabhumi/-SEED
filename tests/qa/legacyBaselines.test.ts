import {describe,it,expect,afterEach} from 'vitest';
import {resolveBaseline,validateBaseline,resolveRequiredBaselines} from '../../scripts/resolve-legacy-baselines.mjs';
// Same Node-only runner pattern as sink.test.ts; no runtime dependency/@types/node.
declare const require:(name:string)=>any;
const {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync}=require('node:fs');
const {join,resolve}=require('node:path'),{tmpdir}=require('node:os');
const {execFileSync}=require('node:child_process'),{createHash}=require('node:crypto');

const owned:string[]=[];
afterEach(()=>{for(const p of owned.splice(0)){if(!resolve(p).startsWith(join(tmpdir(),'seed-baseline-test-')))throw Error('Unsafe cleanup');rmSync(p,{recursive:true,force:true});}});
const sha='a'.repeat(40),lock='b'.repeat(64),toolchain={node:'v24.fixture',npm:'11.fixture',platform:'fixture',arch:'fixture',recipe:2};
const hash=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex');
function fixture(){
 const root=mkdtempSync(join(tmpdir(),'seed-baseline-test-'));owned.push(root);
 const dist=join(root,'source-dist');mkdirSync(join(dist,'assets'),{recursive:true});
 writeFileSync(join(dist,'index.html'),'<script type="module" src="./assets/index.js"></script>');
 writeFileSync(join(dist,'assets/index.js'),`const build={buildSha:"${sha}",buildDirty:!1};`);
 const spec={id:'fixture',sourceSha:sha,lockSha256:lock,originalZipSha256:'c'.repeat(64)};
 const build=async()=>({sourceSha:sha,sourceDirty:false,lockSha256:lock,dist});
 return {root,dist,spec,build,options:{root:join(root,'resolved'),toolchain,build}};
}
function archive(f:ReturnType<typeof fixture>){
 const zip=join(f.root,'original.zip');
 execFileSync('python',['scripts/baseline-zip.py','pack',f.dist,zip]);return zip;
}
describe('version2 source-pinned historical baseline evidence',()=>{
 it('accepts an available original only against its historical ZIP anchor',async()=>{
  const f=fixture(),zip=archive(f);f.spec.originalZipSha256=hash(zip);
  const r=await resolveBaseline(f.spec,{...f.options,archive:zip});
  expect(r.classification).toBe('ORIGINAL_ARCHIVED');expect(r.zipSha256).toBe(f.spec.originalZipSha256);
 });
 it('reconstructs missing originals, retaining their historical hash separately',async()=>{
  const f=fixture(),r=await resolveBaseline(f.spec,f.options);
  expect(r.classification).toBe('RECONSTRUCTED_FROM_SOURCE');expect(r.expectedOriginalZipSha256).toBe(f.spec.originalZipSha256);
  expect(r.zipSha256).not.toBe(f.spec.originalZipSha256);expect(r.files).toHaveLength(2);
 });
 it('fails a required reconstruction and records UNAVAILABLE',async()=>{
  const f=fixture();await expect(resolveRequiredBaselines([f.spec],{...f.options,build:async()=>{throw Error('fixture failure');}})).rejects.toThrow('UNAVAILABLE');
  expect(JSON.parse(readFileSync(join(f.options.root,'index.json'),'utf8')).baselines[0].classification).toBe('UNAVAILABLE');
 });
 for(const [key,value,message] of [['sourceSha','d'.repeat(40),'source'],['sourceDirty',true,'dirty'],['lockSha256','e'.repeat(64),'lock']] as const){
  it(`rejects wrong ${key}`,async()=>{const f=fixture();await expect(resolveBaseline(f.spec,{...f.options,build:async()=>({...await f.build(),[key]:value})})).rejects.toThrow(message);});
 }
 it('rejects a forged embedded source stamp',async()=>{
  const f=fixture();writeFileSync(join(f.dist,'assets/index.js'),'const b={buildSha:"'+'d'.repeat(40)+'",buildDirty:!1}');
  await expect(resolveBaseline(f.spec,f.options)).rejects.toThrow('embedded');
 });
 it('rejects an embedded dirty stamp',async()=>{
  const f=fixture();writeFileSync(join(f.dist,'assets/index.js'),`const b={buildSha:"${sha}",buildDirty:!0}`);
  await expect(resolveBaseline(f.spec,f.options)).rejects.toThrow('embedded');
 });
 it('does not silently reconstruct after an explicitly supplied wrong original ZIP',async()=>{
  const f=fixture(),zip=archive(f);await expect(resolveBaseline(f.spec,{...f.options,archive:zip})).rejects.toThrow('original ZIP hash');
 });
 it('rejects archives without root index.html',async()=>{
  const f=fixture();rmSync(join(f.dist,'index.html'));const zip=archive(f);f.spec.originalZipSha256=hash(zip);
  await expect(resolveBaseline(f.spec,{...f.options,archive:zip})).rejects.toThrow('index.html');
 });
 it('accepts only a validated cache, rebuilds corrupt content and records rejection',async()=>{
  const f=fixture();let builds=0;const options={...f.options,build:async()=>{builds++;return f.build();}};
  await resolveBaseline(f.spec,options);await resolveBaseline(f.spec,options);expect(builds).toBe(1);
  writeFileSync(join(options.root,'fixture/dist/assets/index.js'),'CORRUPTION');
  expect(()=>validateBaseline(f.spec,join(options.root,'fixture'),toolchain)).toThrow();
  const repaired=await resolveBaseline(f.spec,options);expect(builds).toBe(2);expect(repaired.cacheRejection).toBeTruthy();
 });
 it('rejects mismatched lock/toolchain cache identity',async()=>{
  const f=fixture();await resolveBaseline(f.spec,f.options);
  expect(()=>validateBaseline(f.spec,join(f.options.root,'fixture'),{...toolchain,node:'v24.other'})).toThrow('toolchain');
  expect(()=>validateBaseline({...f.spec,lockSha256:'f'.repeat(64)},join(f.options.root,'fixture'),toolchain)).toThrow('lock');
  expect(()=>validateBaseline({...f.spec,originalContentTreeSha256:'f'.repeat(64)},join(f.options.root,'fixture'),toolchain)).toThrow('normalized');
 });
 it('propagates one missing baseline even when another resolves',async()=>{
  const f=fixture(),other={...f.spec,id:'missing'};
  await expect(resolveRequiredBaselines([f.spec,other],{...f.options,build:async(spec:any)=>{if(spec.id==='missing')throw Error('missing');return f.build();}})).rejects.toThrow('UNAVAILABLE');
  const r=JSON.parse(readFileSync(join(f.options.root,'index.json'),'utf8'));expect(r.complete).toBe(false);expect(r.baselines.map((x:any)=>x.classification)).toEqual(['RECONSTRUCTED_FROM_SOURCE','UNAVAILABLE']);
 });
});
