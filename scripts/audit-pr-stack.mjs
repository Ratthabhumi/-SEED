// Read-only ancestry snapshot. Never merges, retargets or rewrites a branch.
import {execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';import {dirname} from 'node:path';
const out=process.argv[2]??'test-results/pr-stack.json';
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const prs=JSON.parse(execFileSync('gh',['pr','list','--state','open','--limit','100','--json','number,headRefName,headRefOid,baseRefName,isDraft,url'],{encoding:'utf8'})).sort((a,b)=>a.number-b.number);
const rows=prs.map(p=>{const base=git('rev-parse','origin/'+p.baseRefName),head=git('rev-parse','origin/'+p.headRefName);if(head!==p.headRefOid)throw Error('Fetch changed refs before repeating audit');let ancestor=true;try{git('merge-base','--is-ancestor',base,head);}catch{ancestor=false;}return {...p,baseSha:base,baseAncestor:ancestor,delta:git('rev-list','--left-right','--count',base+'...'+head)};});
const bottom=rows.find(p=>!rows.some(other=>other.headRefName===p.baseRefName));if(!bottom)throw Error('Missing bottom prerequisite');
const result={classification:'READ_ONLY_SNAPSHOT_NOT_INTEGRATION_APPROVAL',at:new Date().toISOString(),checkout:git('rev-parse','HEAD'),main:git('rev-parse','origin/main'),bottomMissingBranch:bottom.baseRefName,bottomMissingSha:bottom.baseSha,mainToBottom:git('rev-list','--left-right','--count','origin/main...'+bottom.baseSha),rows,reviewOrder:'Missing prerequisite, then PRs bottom-up; exact resulting-tree CI/provenance and human gates before separately authorized integration.'};mkdirSync(dirname(out),{recursive:true});writeFileSync(out,JSON.stringify(result,null,2));console.log(JSON.stringify({prs:rows.length,mainToBottom:result.mainToBottom,allBaseAncestors:rows.every(r=>r.baseAncestor)}));
