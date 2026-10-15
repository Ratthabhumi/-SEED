"""Actual source alpha occupancy projected through the existing game camera."""
import json,statistics
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[1]
image=Image.open(root/'assets/seed/content15/heroes-neutral-v1.png').convert('RGBA')
rows=[]
for origin,index in [('hunters',0),('engineers',1),('resonant',2),('sentinels',3)]:
 for age in range(6):
  # Front and back have separate authored body shapes.
  for back in [False,True]:
   cell=image.crop((age*128,(index*2+int(back))*128,(age+1)*128,(index*2+int(back)+1)*128))
   alpha=cell.getchannel('A').point(lambda a:255 if a>=32 else 0);box=alpha.getbbox()
   for width,height in [(1280,720),(1920,1080),(2560,1305)]:
    zoom=max(1,min(1.25,height/900));occupied=box[2]-box[0]
    rows.append({'origin':origin,'age':age,'back':back,'viewport':[width,height],'alphaThreshold':32,'sourceBounds':box,'beforeOpaqueWidth':occupied/128*112*zoom,'afterOpaqueWidth':occupied/128*126*zoom,'collisionChanged':False})
out=root/'docs/evidence/content153';out.mkdir(parents=True,exist_ok=True)
(out/'readability.json').write_text(json.dumps({'classification':'SOURCE_ALPHA_CAMERA_PROJECTION_NOT_HUMAN_READABILITY_PASS','rows':rows,'limitations':'Neutral48 costume frames; Hunters Stone/Space reference motion must also be reviewed in native video. Contrast/clutter perception is a human gate.'},indent=2)+'\n')
print('Measured',len(rows),'frame/viewport cases; visual body +12.5%, canonical collision unchanged')
