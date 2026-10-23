"""Recover real source detail, not upscale the old128px cells or invent poses."""
from PIL import Image
from pathlib import Path
import hashlib,json

manifest=Path('assets/ASSET_MANIFEST.json'); data=json.loads(manifest.read_text())
entry=next(a for a in data['assets'] if a['id']=='seed-boss-v2')
source=Path(entry['vendorSourcePath']); source_hash=hashlib.sha256(source.read_bytes()).hexdigest()
assert source_hash==entry['vendorSourceSha256'], 'Original source drift'
im=Image.open(source).convert('RGBA'); cells=[]
for i in range(8):
 x,y=i%4,i//4
 crop=im.crop((x*im.width//4,y*im.height//2,(x+1)*im.width//4,(y+1)*im.height//2))
 cells.append(crop.crop(crop.getchannel('A').getbbox()))
# Same uniform framing as normalize-hero-atlas.py, twice the retained detail.
scale=min(200/max(c.width for c in cells),220/max(c.height for c in cells))
assert scale<=1, 'Cannot recover more detail than the real source contains'
atlas=Image.new('RGBA',(1024,512)); frames=[]
for i,c in enumerate(cells):
 c=c.resize((round(c.width*scale),round(c.height*scale)),Image.Resampling.LANCZOS)
 frame=Image.new('RGBA',(256,256));frame.alpha_composite(c,((256-c.width)//2,236-c.height))
 box=frame.getchannel('A').point(lambda a:255 if a>64 else 0).getbbox()
 frames.append({'frame':i,'alphaBox':box,'footY':box[3]})
 atlas.alpha_composite(frame,((i%4)*256,(i//4)*256))
out=Path(entry['projectPath']);atlas.save(out,optimize=True)
entry.update(byteSize=out.stat().st_size,productionSha256=hashlib.sha256(out.read_bytes()).hexdigest(),
 modifications='Original generated atlas; alpha-preserving4x2 slicing, uniform resize and anchoring from1774x887 source to256px cells. No source repaint or old-cell upscaling.',
 presentationTransform='8 posed256px cells; same240u Boss and canonical warnings/fire/hurt; human acceptance pending')
manifest.write_text(json.dumps(data,indent=2)+'\n',encoding='utf-8')
Path('src/game/assets/boss-frame-detail.json').write_text(json.dumps({'cell':256,'sourceSha256':source_hash,'productionSha256':entry['productionSha256'],'frames':frames},indent=2)+'\n',encoding='utf-8')
print('Recovered source detail:',im.size,'->',atlas.size,'scale',round(scale,4),'footY',[f['footY'] for f in frames])
