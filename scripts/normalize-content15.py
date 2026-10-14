"""Reproduce Content15 packing from retained originals. Requires existing Pillow.
Technical extraction/resize only; semantic art changes must use imagegen.
Run from repository root. Manifest is updated for the five produced PNGs.
"""
from pathlib import Path
from PIL import Image
import hashlib,json
root=Path.cwd();raw=root/'assets/original/content15';out=root/'assets/seed/content15'
atlas=Image.new('RGBA',(768,1024));bounds=[]
for direction,name in enumerate(['heroes-neutral-v1.png','heroes-neutral-back-v1.png']):
    source=Image.open(raw/name).convert('RGBA')
    assert source.getchannel('A').getextrema()[0]==0
    for row in range(4):
        for col in range(6):
            cell=source.crop((col*source.width//6,row*source.height//4,(col+1)*source.width//6,(row+1)*source.height//4))
            sprite=cell.crop(cell.getchannel('A').getbbox());sprite.thumbnail((100,108),Image.Resampling.LANCZOS)
            atlas.alpha_composite(sprite,(col*128+(128-sprite.width)//2,(row+direction*4)*128+116-sprite.height))
            bounds.append(dict(origin=row,age=col,direction=direction,visibleWidth=sprite.width,visibleHeight=sprite.height,groundY=116))
atlas.save(out/'heroes-neutral-v1.png')
(root/'src/game/assets/heroVisibleBounds.json').write_text(json.dumps(bounds,indent=2)+'\n',encoding='utf-8')
source=Image.open(raw/'ground-v1.png').convert('RGBA')
for row,col,name in [(0,0,'verdant'),(0,1,'arid'),(1,0,'tundra'),(1,1,'badlands')]:
    source.crop((col*source.width//2,row*source.height//2,(col+1)*source.width//2,(row+1)*source.height//2)).resize((512,512),Image.Resampling.LANCZOS).save(out/(name+'-floor-v1.png'))
path=root/'assets/ASSET_MANIFEST.json';manifest=json.loads(path.read_text(encoding='utf-8'))
for entry in manifest['assets']:
    if not entry['id'].startswith('seed-content15-'):continue
    production=root/entry['projectPath'];entry['byteSize']=production.stat().st_size;entry['productionSha256']=hashlib.sha256(production.read_bytes()).hexdigest()
path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Reproduced48 neutral costume cells and4 quiet ground textures')
