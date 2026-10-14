"""Controlled source-material comparison; never assumes equal seed topology."""
from pathlib import Path,PurePosixPath
from PIL import Image,ImageDraw
import subprocess,re,json,io
root=Path(__file__).resolve().parents[1];out=root/'docs/evidence/content153';out.mkdir(parents=True,exist_ok=True)
profiles=[('Content13','origin/feat/breakthrough-quality-closure-20261013'),('Content14','origin/feat/content14-stutter-art-consistency-20261013'),('Content15','origin/feat/content15-combat-world-ui-quality'),('15.2','ce63df35d52e8b3041d232f5e8e3438c087cecf8')]
biomes=['verdant','arid','tundra','badlands'];canvas=Image.new('RGB',(1040,1190),'#101820');draw=ImageDraw.Draw(canvas);records=[]
def git(*args):return subprocess.check_output(['git',*args],cwd=root)
for column,(name,ref) in enumerate(profiles):
 sha=git('rev-parse',ref).decode().strip();versions=git('show',sha+':src/core/seed/versions.ts').decode();w=int(re.search(r'WORLDGEN_VERSION\s*=\s*(\d+)',versions)[1])
 try:painter=git('show',sha+':src/game/render/TerrainPainter.ts').decode()
 except subprocess.CalledProcessError:painter=''
 draw.text((column*260+8,8),f'{name} {sha[:7]} / W{w}',fill='white')
 for row,biome in enumerate(biomes):
  found=re.search(r'import '+biome+r' from ["\']([^"\']+\.png)',painter)
  if found:
   import posixpath
   path=posixpath.normpath('src/game/render/'+found[1]);selection='verified TerrainPainter import'
  else:path=f'assets/seed/terrain/{biome}-'+('v2' if biome=='verdant' else 'v1')+'.png';selection='historic source inventory; runtime treatment not certified'
  y=40+row*284
  try:
   image=Image.open(io.BytesIO(git('show',sha+':'+path))).convert('RGB').resize((252,252),Image.Resampling.BILINEAR)
   canvas.paste(image,(column*260+4,y))
  except subprocess.CalledProcessError:
   selection='NO_RASTER_SOURCE_IN_THIS_BUILD; legacy treatment not reconstructed'
   draw.rectangle((column*260+4,y,column*260+256,y+252),fill='#27333b');draw.text((column*260+8,y+100),'No raster source in build',fill='white')
  draw.text((column*260+8,y+255),biome,fill='white')
  records.append({'profile':name,'sha':sha,'worldgen':w,'biome':biome,'sourcePath':path,'selection':selection})
draw.text((8,1180),'Materials only / identical 252px sample, no exposure change; topology and operator preference NOT inferred.',fill='white')
canvas.save(out/'historical-materials.png');(out/'historical-materials.json').write_text(json.dumps({'classification':'CONTROLLED_SOURCE_MATERIAL_INVENTORY_NOT_TOPOLOGY_OR_HUMAN_WINNER','records':records,'normalization':'Entire source image; same252px area/filter/exposure, source texture scale differs from runtime world-space warp.'},indent=2)+'\n')
print('Saved four-build/four-biome material comparison with exact provenance')
