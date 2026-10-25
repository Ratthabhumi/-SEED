// Read-only integration audit of a commit range. Never checks out, merges or rewrites.
// Usage: node scripts/audit-prerequisite.mjs <base> <tip> <out.json>
import {execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';import {dirname} from 'node:path';
const [base,tip,out='test-results/prerequisite-audit.json']=process.argv.slice(2);
const git=(...a)=>execFileSync('git',a,{encoding:'utf8',maxBuffer:1<<30}).trim();
const lines=s=>s?s.split('\n'):[];
const grep=(rev,pattern,...paths)=>{try{return lines(git('grep','-n','-I','-E',pattern,rev,'--',...paths)).map(l=>l.slice(rev.length+1));}catch{return [];}};
const AREAS=[
 ['runtime-core',/^src\/core\//],['game-presentation',/^src\/game\//],['qa-runtime',/^src\/qa\//],['ui-i18n',/^src\/(ui|i18n|theme)\//],['src-other',/^src\//],
 ['tests',/^(tests|e2e)\//],['art-original',/^assets\/(seed|original)\//],['art-vendor',/^assets\/vendor\//],['assets-other',/^assets\//],
 ['licenses',/^(public\/licenses|public\/THIRD_PARTY|LICENSE)/],['ci',/^\.github\//],['deps',/^package(-lock)?\.json$/],
 ['scripts',/^scripts\//],['agent-tooling',/^\.(agents|claude|cursor)\//],['docs',/^(docs\/|[A-Z_]+\.md$)/],['config',/\.(config\.ts|json)$/],
];
const area=f=>AREAS.find(([,r])=>r.test(f))?.[0]??'other';
const status=lines(git('diff','--name-status','--no-renames',base,tip)).map(l=>{const [s,f]=l.split('\t');return {s:s[0],f};});
const byArea={};for(const {s,f} of status){const a=byArea[area(f)]??={A:0,M:0,D:0,files:0};a[s]=(a[s]??0)+1;a.files++;}
const numstat=lines(git('diff','--numstat','--no-renames',base,tip)).map(l=>{const [a,d,f]=l.split('\t');return {a,d,f};});
const binaries=numstat.filter(x=>x.a==='-').map(x=>{let size=0;try{size=Number(git('cat-file','-s',`${tip}:${x.f}`));}catch{}return {file:x.f,bytes:size};}).sort((a,b)=>b.bytes-a.bytes);
const versions=r=>Object.fromEntries(['WORLDGEN_VERSION','CONTENT_VERSION','SAVE_SCHEMA_VERSION'].map(k=>[k,Number(git('show',`${r}:src/core/seed/versions.ts`).match(new RegExp(`export const ${k}\\s*=\\s*(\\d+)`))?.[1])]));
const pkg=r=>JSON.parse(git('show',`${r}:package.json`));
const [pb,pt]=[pkg(base),pkg(tip)];
const depDelta=k=>Object.keys(pt[k]??{}).filter(n=>(pb[k]??{})[n]!==pt[k][n]).map(n=>({name:n,from:(pb[k]??{})[n]??null,to:pt[k][n]}));
const diff=git('diff','-U0','--no-renames',base,tip);
const added=lines(diff).filter(l=>l.startsWith('+')&&!l.startsWith('+++'));
const result={
 classification:'READ_ONLY_PREREQUISITE_AUDIT_NOT_INTEGRATION_APPROVAL',base,tip,
 commits:Number(git('rev-list','--count',`${base}..${tip}`)),merges:Number(git('rev-list','--merges','--count',`${base}..${tip}`)),
 baseIsAncestor:(()=>{try{git('merge-base','--is-ancestor',base,tip);return true;}catch{return false;}})(),
 files:status.length,byArea,largestBinaries:binaries.slice(0,10),binaryCount:binaries.length,
 versions:{base:versions(base),tip:versions(tip)},
 dependencies:{runtime:depDelta('dependencies'),dev:depDelta('devDependencies'),engines:{from:pb.engines??null,to:pt.engines??null}},
 newDependencyMentions:Object.fromEntries(depDelta('dependencies').map(d=>[d.name,grep(tip,d.name.replace(/^@/,'').split('/').pop(),'docs/ADR','SESSION_HANDOFF.md','public/THIRD_PARTY_NOTICES.txt').map(l=>l.split(':')[0]).filter((v,i,a)=>a.indexOf(v)===i)])),
 rules:{
  mathRandomInCore:grep(tip,'Math\\.random','src/core'),
  presentationImportsInCore:grep(tip,"from ['\"]phaser|localStorage|\\bdocument\\.|\\bwindow\\.|navigator\\.",'src/core'),
  mathRandomInContent:grep(tip,'Math\\.random','src/content'),
 },
 addedSecretsLike:added.filter(l=>/(api[_-]?key|secret|password|token)\s*[:=]\s*['"][A-Za-z0-9_\-]{16,}|-----BEGIN [A-Z ]*PRIVATE|ghp_[A-Za-z0-9]{20}|AKIA[0-9A-Z]{16}/i.test(l)).slice(0,20),
 addedPersonalPaths:added.filter(l=>/[A-Z]:\\\\Users\\\\|\/Users\/[a-z]|file:\/\/\//i.test(l)).slice(0,20),
 addedDebugOnlyMarkers:added.filter(l=>/\bdebugger;|console\.log\(/.test(l)).length,
};
mkdirSync(dirname(out),{recursive:true});writeFileSync(out,JSON.stringify(result,null,2));
console.log(JSON.stringify({commits:result.commits,merges:result.merges,files:result.files,binaries:result.binaryCount,versions:result.versions,deps:result.dependencies,mentions:result.newDependencyMentions,rules:Object.fromEntries(Object.entries(result.rules).map(([k,v])=>[k,v.length])),secrets:result.addedSecretsLike.length,personal:result.addedPersonalPaths.length,consoleLog:result.addedDebugOnlyMarkers,areas:Object.fromEntries(Object.entries(byArea).map(([k,v])=>[k,v.files]))},null,1));
