// Original MIT -SEED vector authoring. Keeps front18 source poses; adds authored back equipment.
import fs from 'node:fs';
import crypto from 'node:crypto';
const heads={hunters:'#507064',engineers:'#FFD166',resonant:'#B6A1FF',sentinels:'#BCCCD4'};
const ledger=JSON.parse(fs.readFileSync('assets/ASSET_MANIFEST.json','utf8'));
for(const [id,color] of Object.entries(heads)){
 const path='assets/original/actors/'+id+'.svg';const original=fs.readFileSync(path,'utf8');
 const frames=[...original.matchAll(/<g transform="translate\((\d+) 0\)"[^>]*>([\s\S]*?)<\/g>/g)].slice(0,18);
 if(frames.length!==18)throw Error('Invalid front poses '+id);
 const back=frames.map((m,i)=>'<g transform="translate('+((18+i)*64)+' 0)" stroke="#0B1218" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">'+m[2]+'<path d="M21 11L32 6 43 13 40 26 24 26 20 18Z" fill="'+color+'"/><path d="M25 13L32 10 39 15M23 28L40 28 38 39 26 39Z" fill="#22333E"/><path d="M29 30L35 30M29 34L35 34" stroke="'+(i>=12?'#53E0C8':'#637C89')+'"/></g>').join('');
 const front=frames.map(m=>m[0]).join('');const svg='<svg xmlns="http://www.w3.org/2000/svg" width="2304" height="64" viewBox="0 0 2304 64"><!-- Original -SEED contributors, MIT;18 front and18 authored back poses, six Ages. -->'+front+back+'</svg>\n';
 fs.writeFileSync(path,svg);fs.writeFileSync('assets/seed/actors/'+id+'.svg',svg);
 const entry=ledger.assets.find(a=>a.projectPath==='assets/seed/actors/'+id+'.svg');
 const hash=crypto.createHash('sha256').update(svg).digest('hex');Object.assign(entry,{versionOrRelease:'actors-2',presentationTransform:'Cached2304x64;18 front and18 authored back poses, horizontal flip; six Ages',byteSize:Buffer.byteLength(svg),vendorSourceSha256:hash,productionSha256:hash});
}
fs.writeFileSync('assets/ASSET_MANIFEST.json',JSON.stringify(ledger,null,2)+'\n');
