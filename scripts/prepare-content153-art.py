"""Normalize original generated sources; no synthetic animation frames.
Uses existing Pillow/offline manifest pipeline, not a runtime dependency.
"""
import json,hashlib,shutil
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[1]
original=root/'assets/original/content153';out=root/'assets/seed/content153'
original.mkdir(parents=True,exist_ok=True);out.mkdir(parents=True,exist_ok=True)
source=original/'hostile-attacks-v1.png'
image=Image.open(source).convert('RGBA');assert image.getchannel('A').getextrema()[0]==0
atlas=Image.new('RGBA',(512,128));bounds=[]
for i in range(4):
 cell=image.crop((i*image.width//4,0,(i+1)*image.width//4,image.height))
 box=cell.getchannel('A').getbbox();assert box
 sprite=cell.crop(box);sprite.thumbnail((112,100),Image.Resampling.LANCZOS)
 x=i*128+(128-sprite.width)//2;y=(128-sprite.height)//2
 atlas.alpha_composite(sprite,(x,y));bounds.append([x-i*128,y,sprite.width,sprite.height])
atlas.save(out/'hostile-attacks-v1.png')
motion=original/'hunters-motion-experiment-v2.png'
record={'tool':'image_gen built-in','date':'2026-10-15','license':'MIT (project original generated artwork)','hostile':{'source':str(source.name),'layout':'four horizontal sprites; normalized preserving alpha','bounds':bounds},'motion':{'source':motion.name,'status':'WALK_WITHHELD_CONTACT_CHRONOLOGY_UNVERIFIED','reference':'assets/original/content15-animation/hunters-reference-v1.png'},'humanArtAcceptance':'PENDING'}
(original/'GENERATION_RECORD.json').write_text(json.dumps(record,indent=2)+'\n')
manifest_path=root/'assets/ASSET_MANIFEST.json';manifest=json.loads(manifest_path.read_text())
template=next(a for a in manifest['assets'] if a['projectPath']=='assets/seed/content15-animation/hunters-reference-v1.png').copy()
template.update(id='seed-content15-v153-hostile-attacks-v1',projectPath='assets/seed/content153/hostile-attacks-v1.png',vendorSourcePath='assets/original/content153/hostile-attacks-v1.png',sourceFile='hostile-attacks-v1.png',sourcePack='Original -SEED hostile attacks',sourceRelease='content153-hostile-v1',downloadedAt='2026-10-15',modifications='Four equal cells, alpha crop, uniform resize and slicing into128px cells; no invented simulation categories',purpose='Original directional hostile projectile materials; human art approval pending',byteSize=(out/'hostile-attacks-v1.png').stat().st_size,vendorSourceSha256=hashlib.sha256((original/'hostile-attacks-v1.png').read_bytes()).hexdigest(),productionSha256=hashlib.sha256((out/'hostile-attacks-v1.png').read_bytes()).hexdigest())
manifest['assets']=[a for a in manifest['assets'] if a['projectPath']!=template['projectPath']]+[template]
manifest_path.write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n')
if (out/'hunters-attack-v2.png').exists():
 attack=template.copy();attack.update(id='seed-content15-v153-hunters-attack-v2',projectPath='assets/seed/content153/hunters-attack-v2.png',vendorSourcePath='assets/original/content153/hunters-motion-experiment-v2.png',sourceFile='hunters-motion-experiment-v2.png',sourcePack='Original -SEED generated motion experiment',sourceRelease='content153-attack-v2',purpose='Hunters Stone/Space front release and recovery only; walk withheld',modifications='Reviewed source rows1/3 columns3/5/6/7 slicing, uniform resize, locked scale and foot baseline; per-frame sockets, no synthetic frames',byteSize=(out/'hunters-attack-v2.png').stat().st_size,vendorSourceSha256=hashlib.sha256(motion.read_bytes()).hexdigest(),productionSha256=hashlib.sha256((out/'hunters-attack-v2.png').read_bytes()).hexdigest())
 attack['versionOrRelease']='v2'
 manifest['assets']=[a for a in manifest['assets'] if a['projectPath']!=attack['projectPath']]+[attack]
 manifest_path.write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n')
print('Packed four original hostile attack sprites; walk remains withheld')
