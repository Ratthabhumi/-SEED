"""Reproduce Content15 packing from retained originals. Requires existing Pillow.
Technical extraction/resize only; semantic art changes must use imagegen.
Run from repository root. Manifest is updated for the five produced PNGs.
"""
from pathlib import Path
from PIL import Image
import hashlib,json,sys
root=Path.cwd();raw=root/'assets/original/content15';out=root/'assets/seed/content15'
cell_size = int(sys.argv[sys.argv.index('--hero-cell')+1]) if '--hero-cell' in sys.argv else 256
if cell_size not in (128,256): raise SystemExit('Supported cells:128 or256')
heroes_only = '--heroes-only' in sys.argv
ratio = cell_size / 128
old_bounds = json.loads((root/'src/game/assets/heroVisibleBounds.json').read_text(encoding='utf-8'))
atlas=Image.new('RGBA',(cell_size*6,cell_size*8));bounds=[]
for direction,name in enumerate(['heroes-neutral-v1.png','heroes-neutral-back-v1.png']):
    source=Image.open(raw/name).convert('RGBA')
    assert source.getchannel('A').getextrema()[0]==0
    for row in range(4):
        for col in range(6):
            cell=source.crop((col*source.width//6,row*source.height//4,(col+1)*source.width//6,(row+1)*source.height//4))
            sprite=cell.crop(cell.getchannel('A').getbbox())
            logical = old_bounds[direction*24+row*6+col]
            target = (round(logical['visibleWidth']*ratio),round(logical['visibleHeight']*ratio))
            if target[0]>sprite.width or target[1]>sprite.height: raise SystemExit('Insufficient original source: refusing upscale')
            sprite=sprite.resize(target,Image.Resampling.LANCZOS)
            atlas.alpha_composite(sprite,(col*cell_size+(cell_size-sprite.width)//2,(row+direction*4)*cell_size+round(116*ratio)-sprite.height))
            bounds.append(logical) # Existing128-unit projection/pivot contract is unchanged.
atlas.save(out/'heroes-neutral-v1.png')
(root/'src/game/assets/heroVisibleBounds.json').write_text(json.dumps(bounds,indent=2)+'\n',encoding='utf-8')
if not heroes_only:
    source=Image.open(raw/'ground-v1.png').convert('RGBA')
    for row,col,name in [(0,0,'verdant'),(0,1,'arid'),(1,0,'tundra'),(1,1,'badlands')]:
        source.crop((col*source.width//2,row*source.height//2,(col+1)*source.width//2,(row+1)*source.height//2)).resize((512,512),Image.Resampling.LANCZOS).save(out/(name+'-floor-v1.png'))
path=root/'assets/ASSET_MANIFEST.json';manifest=json.loads(path.read_text(encoding='utf-8'))
for entry in manifest['assets']:
    if not entry['id'].startswith('seed-content15-'):continue
    if heroes_only and entry['id']!='seed-content15-heroes-neutral-v1':continue
    if entry['id']=='seed-content15-heroes-neutral-v1':
        entry['versionOrRelease']=f'content15-heroes-native{cell_size}'
        entry['modifications']=f'Deterministic slicing and resize of retained original front/back RGBA into48 cells at{cell_size}px; no source enlargement. Existing128-unit silhouettes,116/128 foot and world size retained. No new poses or animation frames.'
        entry['presentationTransform']=f'6 columns x8 rows, native{cell_size}px cells;48 existing Origin/Age/direction costumes; not continuous animation.'
        entry['additionalSources']=[{'path':'assets/original/content15/heroes-neutral-back-v1.png','sha256':hashlib.sha256((raw/'heroes-neutral-back-v1.png').read_bytes()).hexdigest()}]
    production=root/entry['projectPath'];entry['byteSize']=production.stat().st_size;entry['productionSha256']=hashlib.sha256(production.read_bytes()).hexdigest()
path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Reproduced48 native',cell_size,'neutral costume cells; terrain touched:',not heroes_only)
