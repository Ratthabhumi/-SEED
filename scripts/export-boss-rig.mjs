import {chromium} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const source='assets/original/actors/boss-rig.svg';
const svg=readFileSync(source),sha256=createHash('sha256').update(svg).digest('hex');
const browser=await chromium.launch();
try{
 const page=await browser.newPage();
 const result=await page.evaluate(async data=>{
  const img=new Image();img.src='data:image/svg+xml;base64,'+data;await img.decode();
  const c=document.createElement('canvas');c.width=1024;c.height=768;const g=c.getContext('2d');g.drawImage(img,0,0);
  const cells=[];
  for(let n=0;n<9;n++){
   const p=g.getImageData(n%4*256,Math.floor(n/4)*256,256,256).data;let left=256,top=256,right=-1,bottom=-1,occupied=0;
   for(let y=0;y<256;y++)for(let x=0;x<256;x++)if(p[(y*256+x)*4+3]>8){occupied++;left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
   cells.push({frame:n,bounds:[left,top,right,bottom],occupied});
  }
  return {png:c.toDataURL('image/png').split(',')[1],cells};
 },svg.toString('base64'));
 writeFileSync('assets/original/actors/boss-rig-export.png',Buffer.from(result.png,'base64'));
 const report={source,sha256,runtimeRaster:[1024,768],rgbaBytes:1024*768*4,cell:256,pivot:[128,128],uniqueParts:9,maxImages:14,sourceType:'ORIGINAL_EDITABLE_VECTOR_NOT_PAINTED_OR_RASTER_UPSCALE',humanAcceptance:'PENDING',cells:result.cells};
 writeFileSync('assets/original/actors/boss-rig.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
}finally{await browser.close();}
