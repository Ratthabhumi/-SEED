"""Read alpha extents only; never alter the original/normalized bitmap pixels."""
from PIL import Image
from pathlib import Path
import hashlib,json
output={}
for key,file,cols,rows,cell in [('shots','assets/seed/combat/projectiles-v1.png',4,4,96),('props','assets/seed/combat/world-props-v1.png',4,3,128),
 ('enemies','assets/seed/actors/enemies-v2.png',4,4,128),('boss','assets/seed/actors/boss-v2.png',4,2,256)]:
 image=Image.open(file);boxes=[]
 for y in range(rows):
  for x in range(cols):
   box=image.crop((x*cell,y*cell,(x+1)*cell,(y+1)*cell)).getchannel('A').getbbox()
   left=max(0,box[0]-2);top=max(0,box[1]-2);right=min(cell,box[2]+2);bottom=min(cell,box[3]+2)
   boxes.append({'x':left,'y':top,'w':right-left,'h':bottom-top,'cell':cell})
 output[key]=boxes;output[key+'Sha256']=hashlib.sha256(Path(file).read_bytes()).hexdigest()
Path('src/game/assets/combatFrameBounds.json').write_text(json.dumps(output,indent=2)+'\n',encoding='utf-8')
