import {chromium} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const path='assets/seed/actors/boss-v2.png',data=readFileSync(path);
const browser=await chromium.launch();
try{
 const page=await browser.newPage();
 const frames=await page.evaluate(async data=>{
  const img=new Image();img.src='data:image/png;base64,'+data;await img.decode();const c=document.createElement('canvas');c.width=512;c.height=256;const g=c.getContext('2d');g.drawImage(img,0,0);const frames=[];
  for(let n=0;n<8;n++){const p=g.getImageData(n%4*128,Math.floor(n/4)*128,128,128).data;let l=128,t=128,r=-1,b=-1,count=0;for(let y=0;y<128;y++)for(let x=0;x<128;x++)if(p[(y*128+x)*4+3]>8){l=Math.min(l,x);t=Math.min(t,y);r=Math.max(r,x);b=Math.max(b,y);count++;}frames.push({frame:n,bounds:[l,t,r,b],occupiedPixels:count,occupiedDimensions:[r-l+1,b-t+1]});}return frames;
 },data.toString('base64'));
 const report={classification:'SOURCE_ALPHA_MEASUREMENT_NOT_HUMAN_QUALITY_PASS',old:{path,sha256:createHash('sha256').update(data).digest('hex'),cell:128,frames},new:JSON.parse(readFileSync('assets/original/actors/boss-rig.json','utf8')),display:[1,1.25].map(zoom=>({zoom,nominal240pxCellOnScreen:240*zoom,oldRasterMagnification:240*zoom/128,newRasterMagnification:240*zoom/256})),notes:'New original vector is independently rasterized at256px per joint cell, not resampled from old128px art. Runtime size also uses max(240,radius*3), so native joint rectangles are recorded per staged fixture. Empty alpha does not count as anatomy detail. Fourteen images from one3MiB atlas; original old512x256 RGBA0.5MiB remains loaded for legacy lab comparators.'};
 writeFileSync('assets/original/actors/boss-rig-density.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({oldOccupied:frames.map(f=>f.occupiedDimensions),newBytes:report.new.rgbaBytes}));
}finally{await browser.close();}
