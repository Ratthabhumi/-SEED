// Offline bake using the SAME browser Canvas decoding and production preparation.
// No new art, worldgen or resampling algorithm. Run after changing source materials.
import {createServer} from 'vite';
import {chromium} from '@playwright/test';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const ids=['verdant','arid','tundra','badlands'],names=['verdant-v2','arid-v1','tundra-v1','badlands-v1'];
const hash=b=>createHash('sha256').update(b).digest('hex');
const server=await createServer({server:{host:'127.0.0.1',port:4189,strictPort:true},plugins:[{name:'material-authoring',configureServer(s){s.middlewares.use('/__material-authoring',(_q,r)=>{r.setHeader('Content-Type','text/html');r.end('<!doctype html><title>Offline original material bake</title>');});}}]});
await server.listen();const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage();await page.goto('http://127.0.0.1:4189/__material-authoring');
 const materials=[],buffers=[],dir='assets/seed/terrain/periodic';mkdirSync(dir,{recursive:true});
 for(let i=0;i<ids.length;i++){
  const source=`assets/seed/terrain/${names[i]}.png`;
  const r=await page.evaluate(async source=>{
   const {periodicTerrainSource}=await import('/src/game/render/naturalTerrain.ts');
   const image=new Image();image.src='/'+source;await image.decode();
   const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0,256,256);
   const pixels=periodicTerrainSource(ctx.getImageData(0,0,256,256).data);ctx.putImageData(new ImageData(pixels,256,256),0,0);
   return {rgba:Array.from(pixels),png:c.toDataURL('image/png').split(',')[1]};
  },source);
  const png=Buffer.from(r.png,'base64'),rgba=Buffer.from(r.rgba),path=`${dir}/${ids[i]}.png`;
  writeFileSync(path,png);buffers.push(rgba);materials.push({id:ids[i],source,sourceSha256:hash(readFileSync(source)),path,pngSha256:hash(png),rgbaSha256:hash(rgba),offset:i*256*256*4});
 }
 const packed=Buffer.concat(buffers);writeFileSync(`${dir}/materials.rgba`,packed);
 const metadata='assets/original/terrain-periodic/manifest.json';mkdirSync('assets/original/terrain-periodic',{recursive:true});
 writeFileSync(metadata,JSON.stringify({method:'Browser Canvas decode -> periodicTerrainSource -> exact RGBA8 / PNG',license:'MIT',width:256,height:256,browser:browser.version(),packedSha256:hash(packed),materials},null,2)+'\n');
 const file='assets/ASSET_MANIFEST.json',manifest=JSON.parse(readFileSync(file,'utf8'));
 for(const material of materials){
  const parent=manifest.assets.find(a=>a.projectPath===material.source);if(!parent)throw Error('Missing original provenance '+material.source);
  const id=`seed-terrain-periodic-${material.id}`,entry={...parent,id,projectPath:material.path,byteSize:readFileSync(material.path).length,productionSha256:material.pngSha256,additionalSources:[{path:material.source,sha256:material.sourceSha256}],modified:true,modifications:'Offline exact periodic preparation after original source resize; no new artwork',purpose:'Prebaked periodic terrain fallback and Worker source; human art review pending'};
  manifest.assets=manifest.assets.filter(a=>a.id!==id&&a.id!==`seed-periodic-${material.id}`);manifest.assets.push(entry);
 }
 const id='seed-terrain-periodic-packed';manifest.assets=manifest.assets.filter(a=>a.id!==id&&a.id!=='seed-periodic-packed');manifest.assets.push({...manifest.assets.find(a=>a.id==='seed-terrain-periodic-verdant'),id,projectPath:`${dir}/materials.rgba`,vendorSourcePath:metadata,byteSize:packed.length,vendorSourceSha256:hash(readFileSync(metadata)),productionSha256:hash(packed),additionalSources:materials.map(m=>({path:m.path,sha256:m.pngSha256})),modifications:'Concatenated RGBA8 slicing after exact periodic preparation of resized original sources',purpose:'Avoid startup Canvas readback/conversion before Worker transfer'});
 manifest.totalAssets=manifest.assets.length;writeFileSync(file,JSON.stringify(manifest,null,2)+'\n');console.log(JSON.stringify({materials:materials.length,bytes:packed.length,sha256:hash(packed)}));
}finally{await browser.close();await server.close();}
