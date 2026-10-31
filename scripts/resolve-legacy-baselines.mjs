import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {existsSync,readFileSync,writeFileSync,mkdirSync,readdirSync,lstatSync,cpSync,rmSync,mkdtempSync} from 'node:fs';
import {join,resolve,dirname,relative,sep} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {isDeepStrictEqual} from 'node:util';

export const CONTRACT='SOURCE_PINNED_HISTORICAL_COMPARISON_V2';
const here=dirname(fileURLToPath(import.meta.url)),zipTool=join(here,'baseline-zip.py');
const hash=b=>createHash('sha256').update(b).digest('hex');
const json=p=>JSON.parse(readFileSync(p,'utf8'));
const write=(p,data)=>writeFileSync(p,JSON.stringify(data,null,2));
const git=(args,cwd)=>execFileSync('git',args,{cwd,encoding:'utf8',windowsHide:true}).trim();
const python=args=>execFileSync(process.env.SEED_PYTHON??'python', [zipTool,...args],{windowsHide:true,stdio:'pipe'});

function owned(root,path){
 const base=resolve(root),child=resolve(path);
 if(child===base||!child.startsWith(base+sep)||lstatSync(child).isSymbolicLink())throw Error('Unsafe owned baseline path');
 return child;
}
function inspectDist(dist,sha){
 const root=resolve(dist),files=[];
 function visit(dir){for(const name of readdirSync(dir).sort()){
  const path=join(dir,name),s=lstatSync(path);if(s.isSymbolicLink())throw Error('Baseline symlink');
  if(s.isDirectory())visit(path);else if(s.isFile())files.push({path:relative(root,path).split(sep).join('/'),bytes:s.size,sha256:hash(readFileSync(path))});
  else throw Error('Non-file baseline entry');
 }}visit(root);files.sort((a,b)=>a.path.localeCompare(b.path,'en'));
 const html=readFileSync(join(root,'index.html'),'utf8'),entry=html.match(/<script[^>]*src=["']([^"']+\.js)["']/)?.[1];
 if(!entry||entry.startsWith('/')||entry.includes('\\')||entry.includes(':')||entry.split('/').includes('..'))throw Error('Invalid root index.html entry');
 const bundle=readFileSync(join(root,entry),'utf8'),stamp=bundle.match(/buildSha:"([a-f0-9]+)",buildDirty:(![01])/);
 if(!stamp||stamp[1]!==sha||stamp[2]!=='!1')throw Error('Wrong embedded build provenance or dirty build');
 return {files,contentTreeSha256:hash(JSON.stringify(files))};
}
export function validateBaseline(spec,dir,toolchain){
 const r=json(join(dir,'receipt.json'));
 if(r.contract!==CONTRACT||r.sourceSha!==spec.sourceSha||r.sourceDirty!==false)throw Error('Wrong baseline source/contract/dirty identity');
 if(r.lockSha256!==spec.lockSha256)throw Error('Wrong lockfile identity');
 if(!isDeepStrictEqual(r.toolchain,toolchain))throw Error('Wrong toolchain identity');
 if(r.expectedOriginalZipSha256!==(spec.originalZipSha256??null))throw Error('Changed historical original anchor');
 if(!['ORIGINAL_ARCHIVED','RECONSTRUCTED_FROM_SOURCE'].includes(r.classification))throw Error('Baseline UNAVAILABLE');
 if(r.classification==='ORIGINAL_ARCHIVED'&&(!spec.originalZipSha256||r.zipSha256!==spec.originalZipSha256))throw Error('Wrong original ZIP hash');
 if(hash(readFileSync(join(dir,'baseline.zip')))!==r.zipSha256)throw Error('Cached ZIP content differs');
 const content=inspectDist(join(dir,'dist'),spec.sourceSha);
 if(!isDeepStrictEqual(content.files,r.files)||content.contentTreeSha256!==r.contentTreeSha256)throw Error('Cached extracted content differs');
 const parity=spec.originalContentTreeSha256?(content.contentTreeSha256===spec.originalContentTreeSha256?'MATCH':'DIFFERENT'):'NOT_VERIFIABLE';
 if(r.normalizedOriginalParity!==parity)throw Error('Changed normalized original reference');
 return r;
}
export async function resolveBaseline(spec,options){
 if(!/^[a-z0-9-]+$/.test(spec.id)||!/^[a-f0-9]{40}$/.test(spec.sourceSha))throw Error('Invalid baseline identity');
 const {root,toolchain,build,archive}=options,dir=join(resolve(root),spec.id);mkdirSync(root,{recursive:true});
 let cacheRejection=null;
 if(existsSync(dir)){
  try {const r=validateBaseline(spec,dir,toolchain);if(!archive||r.classification==='ORIGINAL_ARCHIVED')return r;throw Error('Original archive explicitly requested');}
  catch(e){cacheRejection=e.message;write(join(root,spec.id+'-cache-rejection.json'),{id:spec.id,error:cacheRejection});rmSync(owned(root,dir),{recursive:true,force:true});}
 }
 mkdirSync(dir);const dist=join(dir,'dist'),zip=join(dir,'baseline.zip');let classification;
 try{
  if(archive&&existsSync(archive)){
   if(!spec.originalZipSha256||hash(readFileSync(archive))!==spec.originalZipSha256)throw Error('Wrong original ZIP hash or missing historical anchor');
   cpSync(archive,zip);python(['unpack',zip,dist]);classification='ORIGINAL_ARCHIVED';
  }else{
   const result=await build(spec);
   if(result.sourceSha!==spec.sourceSha)throw Error('Wrong reconstructed source SHA');
   if(result.sourceDirty!==false)throw Error('Reconstructed source is dirty');
   if(result.lockSha256!==spec.lockSha256)throw Error('Wrong reconstructed lockfile identity');
   cpSync(result.dist,dist,{recursive:true});classification='RECONSTRUCTED_FROM_SOURCE';
   inspectDist(dist,spec.sourceSha);python(['pack',dist,zip]);
  }
  const content=inspectDist(dist,spec.sourceSha);
  const r={contract:CONTRACT,id:spec.id,classification,sourceSha:spec.sourceSha,sourceDirty:false,
   lockSha256:spec.lockSha256,toolchain,toolchainRole:classification==='ORIGINAL_ARCHIVED'?'ARCHIVE_VERIFIER_NOT_HISTORICAL_BUILD_TOOLCHAIN':'SOURCE_REBUILD',
   originalStatus:classification==='ORIGINAL_ARCHIVED'?'ORIGINAL_ARCHIVED':'ORIGINAL_BASELINE_NOT_USED',
   expectedOriginalZipSha256:spec.originalZipSha256??null,zipSha256:hash(readFileSync(zip)),...content,
   normalizedOriginalParity:spec.originalContentTreeSha256?(content.contentTreeSha256===spec.originalContentTreeSha256?'MATCH':'DIFFERENT'):'NOT_VERIFIABLE',cacheRejection};
  write(join(dir,'receipt.json'),r);return validateBaseline(spec,dir,toolchain);
 }catch(e){write(join(dir,'unavailable.json'),{contract:CONTRACT,id:spec.id,classification:'UNAVAILABLE',sourceSha:spec.sourceSha,error:e.message});throw e;}
}
export async function resolveRequiredBaselines(specs,options){
 const baselines=[];
 for(const spec of specs){try {baselines.push(await resolveBaseline(spec,{...options,archive:options.archives?.[spec.id]??options.archive}));}
  catch(e){baselines.push({id:spec.id,sourceSha:spec.sourceSha,classification:'UNAVAILABLE',error:e.message});}}
 const complete=baselines.every(r=>r.classification!=='UNAVAILABLE');write(join(options.root,'index.json'),{contract:CONTRACT,complete,baselines});
 if(!complete)throw Error('Required historical baseline UNAVAILABLE');return baselines;
}

export function readToolchain(){return {node:process.version,npm:execFileSync('npm',['--version'],{encoding:'utf8',shell:process.platform==='win32',windowsHide:true}).trim(),
 python:execFileSync(process.env.SEED_PYTHON??'python',['-c','import sys,zlib; print(sys.version.split()[0]+" / zlib "+zlib.ZLIB_VERSION)'],{encoding:'utf8',windowsHide:true}).trim(),
 git:git(['--version']),
 platform:process.platform,arch:process.arch,recipe:2,recipeHash:hash(Buffer.concat([readFileSync(fileURLToPath(import.meta.url)),readFileSync(zipTool)]))};}

export function loadResolvedBaseline(id,root=process.env.SEED_BASELINES??'scratch/legacy-baselines'){
 const manifest=json(resolve('docs/evidence/legacy-baselines/manifest.json')),spec=manifest.baselines.find(s=>s.id===id);
 if(!spec)throw Error('Unknown baseline '+id);
 const index=json(join(resolve(root),'index.json')),expected=index.baselines?.find(r=>r.id===id);
 if(index.contract!==CONTRACT||!index.complete||!expected)throw Error('Required comparison baseline UNAVAILABLE');
 // A consumer verifies the producer's identity, not its own possibly newer Git/Python.
 const dir=join(resolve(root),id),r=validateBaseline(spec,dir,expected.toolchain);
 if(!isDeepStrictEqual(r,expected))throw Error('Shared baseline index/receipt mismatch');
 const {files,cacheRejection,...evidence}=r;
 return {dist:join(dir,'dist'),evidence:{...evidence,originalBinaryComparison:r.classification==='ORIGINAL_ARCHIVED'?'ORIGINAL_ZIP_VERIFIED':'ORIGINAL_BINARY_NOT_USED_SOURCE_COMPARISON_ONLY'}};
}

async function main(){
 const args=process.argv.slice(2),value=(key,fallback)=>args.includes(key)?args[args.indexOf(key)+1]:fallback;
 const manifestPath=resolve('docs/evidence/legacy-baselines/manifest.json'),manifest=json(manifestPath),toolchain=readToolchain();
 if(args.includes('--identity')){console.log(hash(readFileSync(manifestPath)+JSON.stringify(toolchain)));return;}
 if(Number(process.versions.node.split('.')[0])!==24)throw Error('Documented reconstruction toolchain requires Node24');
 const selected=value('--only','').split(',').filter(Boolean),specs=manifest.baselines.filter(s=>!selected.length||selected.includes(s.id));
 if(!specs.length||selected.some(id=>!specs.some(s=>s.id===id)))throw Error('Unknown required baseline');
 for(const spec of specs){
  if(git(['rev-parse',spec.sourceSha+'^{commit}'],process.cwd())!==spec.sourceSha)throw Error('Missing pinned source');
  if(hash(execFileSync('git',['show',spec.sourceSha+':package-lock.json']))!==spec.lockSha256)throw Error('Pinned source lockfile mismatch');
 }
 const root=resolve(value('--output','scratch/legacy-baselines'));mkdirSync(root,{recursive:true});
 const archives=args.includes('--archives')?json(resolve(value('--archives'))):{};
 const temporary=mkdtempSync(join(tmpdir(),'seed-baseline-build-')),repository=process.cwd();
 const build=async spec=>{
  if(git(['rev-parse',spec.sourceSha+'^{commit}'],repository)!==spec.sourceSha)throw Error('Missing pinned source');
  const sourceLock=execFileSync('git',['show',spec.sourceSha+':package-lock.json'],{cwd:repository});
  if(hash(sourceLock)!==spec.lockSha256)throw Error('Pinned source lockfile mismatch');
  const source=join(temporary,spec.id);
  execFileSync('git',['clone','--shared','--no-checkout',repository,source],{windowsHide:true,stdio:'pipe'});
  git(['config','core.autocrlf','false'],source);git(['checkout','--detach',spec.sourceSha],source);
  const npm=arguments_=>execFileSync('npm',arguments_,{cwd:source,windowsHide:true,shell:process.platform==='win32',stdio:'inherit'});
  npm(['ci']);npm(['run','build']);
  const result={sourceSha:git(['rev-parse','HEAD'],source),sourceDirty:git(['status','--porcelain'],source).length>0,
   lockSha256:hash(readFileSync(join(source,'package-lock.json'))),dist:join(source,'dist')};
  return result;
 };
 try{const rows=await resolveRequiredBaselines(specs,{root,toolchain,archives,build});console.log(JSON.stringify(rows.map(r=>({id:r.id,classification:r.classification,zipSha256:r.zipSha256,contentTreeSha256:r.contentTreeSha256}))));}
 finally{rmSync(owned(tmpdir(),temporary),{recursive:true,force:true});}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)await main();
